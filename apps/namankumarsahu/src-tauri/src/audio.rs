//! Native, crash-safe meeting capture.
//!
//! * Microphone  -> default input device (cpal / WASAPI capture)
//! * System audio -> default output device opened as a *loopback* input (Windows / WASAPI only)
//! * Both are downmixed to mono, resampled to 16 kHz, mixed on a wall-clock so a silent
//!   loopback (nothing playing) never stalls the file, and appended to a WAV file every 100 ms.
//!
//! The WAV header is rewritten on stop, and `repair_wav` can rebuild it from the file length, so
//! a crash / power loss / force-quit loses at most the last fraction of a second.

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{FromSample, Sample, SampleFormat, SizedSample};
use serde::Serialize;
use std::collections::VecDeque;
use std::fs::{File, OpenOptions};
use std::io::{Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

pub const RATE: u32 = 16_000;
const HEADER_LEN: u64 = 44;
const TICK: Duration = Duration::from_millis(100);

#[derive(Clone, Copy, Serialize, Default, Debug)]
pub struct Levels {
    pub mic: f32,
    pub system: f32,
    pub seconds: f32,
}

#[derive(Clone, Serialize, Debug)]
pub struct Info {
    pub mic: bool,
    pub system: bool,
    pub warnings: Vec<String>,
}

#[derive(Clone, Serialize, Debug)]
pub struct Summary {
    pub seconds: f64,
    pub mic_on: bool,
    pub system_on: bool,
    pub mic_peak: f32,
    pub system_peak: f32,
}

/// Keeps a quiet voice from being drowned by loud system audio: the mic is levelled up
/// (never amplifying plain silence/noise) and the system audio ducks while the mic is speaking.
struct Mixer {
    mic_gain: f32,
    sys_gain: f32,
}

impl Mixer {
    fn new() -> Self {
        Self { mic_gain: 1.0, sys_gain: 1.0 }
    }

    fn soft(v: f32) -> f32 {
        let a = v.abs();
        if a <= 0.8 {
            v
        } else {
            v.signum() * (0.8 + 0.2 * ((a - 0.8) / 0.2).tanh())
        }
    }

    /// Mix one chunk. `m` / `y` are mono 16 kHz samples (same length), either may be absent.
    fn mix(&mut self, m: Option<&[f32]>, y: Option<&[f32]>, n: usize) -> Vec<f32> {
        let mic_rms = m.map_or(0.0, |v| rms(v));
        let sys_rms = y.map_or(0.0, |v| rms(v));

        // Target ~0.12 RMS for speech, up to 12x, but only when something is actually being said.
        let mic_target = if mic_rms > 0.002 { (0.12 / mic_rms).clamp(1.0, 12.0) } else { self.mic_gain };
        let mic_next = self.mic_gain + (mic_target - self.mic_gain) * if mic_target < self.mic_gain { 0.6 } else { 0.25 };

        // Duck the system audio while the (levelled) mic is clearly speaking.
        let speaking = mic_rms * mic_next > 0.03;
        let sys_target = if m.is_some() && speaking { 0.4 } else { 1.0 };
        let sys_next = self.sys_gain + (sys_target - self.sys_gain) * if sys_target < self.sys_gain { 0.7 } else { 0.1 };
        let _ = sys_rms;

        let mut out = Vec::with_capacity(n);
        for i in 0..n {
            // Ramp the gains across the chunk so there are no clicks at chunk edges.
            let k = (i + 1) as f32 / n as f32;
            let gm = self.mic_gain + (mic_next - self.mic_gain) * k;
            let gs = self.sys_gain + (sys_next - self.sys_gain) * k;
            let v = m.map_or(0.0, |v| v[i]) * gm + y.map_or(0.0, |v| v[i]) * gs;
            out.push(Self::soft(v));
        }
        self.mic_gain = mic_next;
        self.sys_gain = sys_next;
        out
    }
}

pub struct Handle {
    stop: Arc<AtomicBool>,
    paused: Arc<AtomicBool>,
    join: JoinHandle<Result<Summary, String>>,
    pub info: Info,
}

impl Handle {
    pub fn set_paused(&self, p: bool) {
        self.paused.store(p, Ordering::SeqCst);
    }
    pub fn is_paused(&self) -> bool {
        self.paused.load(Ordering::SeqCst)
    }
    pub fn finish(self) -> Result<Summary, String> {
        self.stop.store(true, Ordering::SeqCst);
        self.join.join().map_err(|_| "recorder thread panicked".to_string())?
    }
}

pub fn start(
    path: PathBuf,
    want_mic: bool,
    want_system: bool,
    on_levels: Box<dyn Fn(Levels) + Send + 'static>,
) -> Result<Handle, String> {
    if !want_mic && !want_system {
        return Err("Choose at least one audio source.".into());
    }
    let stop = Arc::new(AtomicBool::new(false));
    let paused = Arc::new(AtomicBool::new(false));
    let (tx, rx) = std::sync::mpsc::sync_channel::<Result<Info, String>>(1);
    let (s2, p2) = (stop.clone(), paused.clone());
    let join = thread::Builder::new()
        .name("ws-recorder".into())
        .spawn(move || run(path, want_mic, want_system, s2, p2, tx, on_levels))
        .map_err(|e| e.to_string())?;
    match rx.recv_timeout(Duration::from_secs(10)) {
        Ok(Ok(info)) => Ok(Handle { stop, paused, join, info }),
        Ok(Err(e)) => {
            let _ = join.join();
            Err(e)
        }
        Err(_) => {
            stop.store(true, Ordering::SeqCst);
            Err("The audio devices did not respond. Check Windows sound settings and microphone privacy permissions.".into())
        }
    }
}

type Buf = Arc<Mutex<VecDeque<f32>>>;

struct Source {
    buf: Buf,
    _stream: cpal::Stream, // kept alive; cpal streams are !Send so they live on the recorder thread
}

fn run(
    path: PathBuf,
    want_mic: bool,
    want_system: bool,
    stop: Arc<AtomicBool>,
    paused: Arc<AtomicBool>,
    ready: std::sync::mpsc::SyncSender<Result<Info, String>>,
    on_levels: Box<dyn Fn(Levels) + Send + 'static>,
) -> Result<Summary, String> {
    let host = cpal::default_host();
    let mut warnings = vec![];

    let mic = if want_mic {
        match open_mic(&host, paused.clone()) {
            Ok(s) => Some(s),
            Err(e) => {
                warnings.push(format!("Microphone unavailable: {e}"));
                None
            }
        }
    } else {
        None
    };
    let system = if want_system {
        match open_system(&host, paused.clone()) {
            Ok(s) => Some(s),
            Err(e) => {
                warnings.push(format!("System audio unavailable: {e}"));
                None
            }
        }
    } else {
        None
    };

    if mic.is_none() && system.is_none() {
        let msg = warnings.join(" ");
        let _ = ready.send(Err(msg.clone()));
        return Err(msg);
    }

    let mut file = match File::create(&path) {
        Ok(f) => f,
        Err(e) => {
            let msg = format!("Could not create recording file: {e}");
            let _ = ready.send(Err(msg.clone()));
            return Err(msg);
        }
    };
    write_header(&mut file, 0).map_err(|e| e.to_string())?;
    let _ = ready.send(Ok(Info { mic: mic.is_some(), system: system.is_some(), warnings }));

    let mut written: u64 = 0; // samples
    let mut active = Duration::ZERO;
    let mut last = Instant::now();
    let mut ticks: u32 = 0;
    let mut bytes: Vec<u8> = Vec::new();
    let mut mixer = Mixer::new();
    let (mut mic_peak, mut sys_peak) = (0.0f32, 0.0f32);

    while !stop.load(Ordering::SeqCst) {
        thread::sleep(TICK);
        let now = Instant::now();
        let dt = now - last;
        last = now;

        if paused.load(Ordering::SeqCst) {
            for s in [&mic, &system].into_iter().flatten() {
                if let Ok(mut b) = s.buf.lock() {
                    b.clear();
                }
            }
            continue;
        }
        active += dt;
        let target = (active.as_secs_f64() * RATE as f64) as u64;
        if target <= written {
            continue;
        }
        let n = (target - written) as usize;
        let m = mic.as_ref().map(|s| take(&s.buf, n));
        let y = system.as_ref().map(|s| take(&s.buf, n));
        if let Some(v) = &m {
            mic_peak = v.iter().fold(mic_peak, |a, x| a.max(x.abs()));
        }
        if let Some(v) = &y {
            sys_peak = v.iter().fold(sys_peak, |a, x| a.max(x.abs()));
        }

        let mixed = mixer.mix(m.as_deref(), y.as_deref(), n);
        bytes.clear();
        bytes.reserve(n * 2);
        for v in &mixed {
            let s = (v.clamp(-1.0, 1.0) * 32767.0) as i16;
            bytes.extend_from_slice(&s.to_le_bytes());
        }
        if let Err(e) = file.write_all(&bytes) {
            // Disk full etc. Keep what we have; surface the error when finishing.
            let _ = repair_wav(&path);
            return Err(format!("Disk write failed: {e}"));
        }
        written += n as u64;
        ticks += 1;
        if ticks % 50 == 0 {
            let _ = file.sync_data();
        }
        on_levels(Levels {
            mic: m.as_ref().map_or(0.0, |v| rms(v)),
            system: y.as_ref().map_or(0.0, |v| rms(v)),
            seconds: written as f32 / RATE as f32,
        });
    }

    drop(file);
    repair_wav(&path).map_err(|e| format!("Could not finalize WAV: {e}"))?;
    Ok(Summary { seconds: written as f64 / RATE as f64, mic_on: mic.is_some(), system_on: system.is_some(), mic_peak, system_peak: sys_peak })
}

fn take(buf: &Buf, n: usize) -> Vec<f32> {
    let mut out = Vec::with_capacity(n);
    if let Ok(mut b) = buf.lock() {
        // Clock drift guard: if a device runs ahead, drop the oldest audio instead of lagging.
        let keep = n + (RATE as usize / 10);
        if b.len() > keep + RATE as usize / 2 {
            let drop_n = b.len() - keep;
            b.drain(..drop_n);
        }
        let k = n.min(b.len());
        out.extend(b.drain(..k));
    }
    out.resize(n, 0.0); // pad with silence (e.g. loopback while nothing is playing)
    out
}

fn rms(v: &[f32]) -> f32 {
    if v.is_empty() {
        return 0.0;
    }
    (v.iter().map(|x| x * x).sum::<f32>() / v.len() as f32).sqrt()
}

fn open_mic(host: &cpal::Host, paused: Arc<AtomicBool>) -> Result<Source, String> {
    let dev = host.default_input_device().ok_or("no input device found")?;
    let cfg = dev.default_input_config().map_err(|e| e.to_string())?;
    build_source(&dev, cfg, paused)
}

#[cfg(target_os = "windows")]
fn open_system(host: &cpal::Host, paused: Arc<AtomicBool>) -> Result<Source, String> {
    // On WASAPI, opening an *output* device as an input stream enables loopback capture.
    let dev = host.default_output_device().ok_or("no output device found")?;
    let cfg = dev.default_output_config().map_err(|e| e.to_string())?;
    build_source(&dev, cfg, paused)
}

#[cfg(not(target_os = "windows"))]
fn open_system(_host: &cpal::Host, _paused: Arc<AtomicBool>) -> Result<Source, String> {
    Err("system-audio capture is only implemented on Windows in this build".into())
}

fn build_source(
    device: &cpal::Device,
    supported: cpal::SupportedStreamConfig,
    paused: Arc<AtomicBool>,
) -> Result<Source, String> {
    let buf: Buf = Arc::new(Mutex::new(VecDeque::new()));
    let config: cpal::StreamConfig = supported.clone().into();
    let stream = match supported.sample_format() {
        SampleFormat::F32 => make::<f32>(device, &config, buf.clone(), paused),
        SampleFormat::I16 => make::<i16>(device, &config, buf.clone(), paused),
        SampleFormat::U16 => make::<u16>(device, &config, buf.clone(), paused),
        SampleFormat::I32 => make::<i32>(device, &config, buf.clone(), paused),
        other => Err(format!("unsupported sample format {other:?}")),
    }?;
    stream.play().map_err(|e| e.to_string())?;
    Ok(Source { buf, _stream: stream })
}

fn make<T>(
    device: &cpal::Device,
    config: &cpal::StreamConfig,
    buf: Buf,
    paused: Arc<AtomicBool>,
) -> Result<cpal::Stream, String>
where
    T: SizedSample,
    f32: FromSample<T>,
{
    let channels = config.channels.max(1) as usize;
    let mut rs = Resampler::new(config.sample_rate.0 as f64 / RATE as f64);
    let mut mono: Vec<f32> = Vec::new();
    let mut out: Vec<f32> = Vec::new();
    device
        .build_input_stream(
            config,
            move |data: &[T], _| {
                if paused.load(Ordering::Relaxed) {
                    return;
                }
                mono.clear();
                for frame in data.chunks(channels) {
                    let mut sum = 0.0f32;
                    for &x in frame {
                        sum += f32::from_sample(x);
                    }
                    mono.push(sum / frame.len() as f32);
                }
                out.clear();
                rs.push(&mono, &mut out);
                if let Ok(mut b) = buf.lock() {
                    b.extend(out.iter().copied());
                    let cap = RATE as usize * 3;
                    while b.len() > cap {
                        b.pop_front();
                    }
                }
            },
            |e| eprintln!("audio stream error: {e}"),
            None,
        )
        .map_err(|e| e.to_string())
}

/// Streaming linear resampler (input rate / output rate = ratio).
pub struct Resampler {
    ratio: f64,
    pos: f64,
    prev: f32,
}

impl Resampler {
    pub fn new(ratio: f64) -> Self {
        Self { ratio, pos: 0.0, prev: 0.0 }
    }
    pub fn push(&mut self, input: &[f32], out: &mut Vec<f32>) {
        for &s in input {
            while self.pos < 1.0 {
                out.push(self.prev + (s - self.prev) * self.pos as f32);
                self.pos += self.ratio;
            }
            self.pos -= 1.0;
            self.prev = s;
        }
    }
}

// ---------------------------------------------------------------- WAV helpers

fn write_header(f: &mut File, data_len: u32) -> std::io::Result<()> {
    f.seek(SeekFrom::Start(0))?;
    let mut h = Vec::with_capacity(44);
    h.extend_from_slice(b"RIFF");
    h.extend_from_slice(&(36u32.saturating_add(data_len)).to_le_bytes());
    h.extend_from_slice(b"WAVEfmt ");
    h.extend_from_slice(&16u32.to_le_bytes());
    h.extend_from_slice(&1u16.to_le_bytes()); // PCM
    h.extend_from_slice(&1u16.to_le_bytes()); // mono
    h.extend_from_slice(&RATE.to_le_bytes());
    h.extend_from_slice(&(RATE * 2).to_le_bytes());
    h.extend_from_slice(&2u16.to_le_bytes());
    h.extend_from_slice(&16u16.to_le_bytes());
    h.extend_from_slice(b"data");
    h.extend_from_slice(&data_len.to_le_bytes());
    f.write_all(&h)
}

/// Rebuild the WAV header from the actual file length. Safe to call on a finished file,
/// and is what makes a file left behind by a crash playable/uploadable.
pub fn repair_wav(path: &Path) -> std::io::Result<f64> {
    let mut f = OpenOptions::new().read(true).write(true).open(path)?;
    let len = f.metadata()?.len();
    if len < HEADER_LEN {
        write_header(&mut f, 0)?;
        f.set_len(HEADER_LEN)?;
        return Ok(0.0);
    }
    let data = ((len - HEADER_LEN) / 2 * 2) as u32; // whole 16-bit samples only
    f.set_len(HEADER_LEN + data as u64)?;
    write_header(&mut f, data)?;
    f.sync_all()?;
    Ok(data as f64 / 2.0 / RATE as f64)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn resample_48k_to_16k_keeps_length_and_tone() {
        let mut rs = Resampler::new(3.0);
        let input: Vec<f32> = (0..4800).map(|i| (i as f32 * 2.0 * std::f32::consts::PI * 440.0 / 48000.0).sin()).collect();
        let mut out = vec![];
        rs.push(&input, &mut out);
        assert!((out.len() as i64 - 1600).abs() <= 2, "len {}", out.len());
        assert!(out.iter().cloned().fold(0.0, f32::max) > 0.9);
    }
    #[test]
    fn repair_truncated_file_after_crash() {
        let p = std::env::temp_dir().join("ws_crash_test.wav");
        let mut f = File::create(&p).unwrap();
        write_header(&mut f, 0).unwrap(); // header says 0 bytes, as after a crash
        f.write_all(&vec![0u8; 32000 * 3 + 1]).unwrap(); // 3 s + a torn half-sample
        drop(f);
        let secs = repair_wav(&p).unwrap();
        assert!((secs - 3.0).abs() < 1e-6);
        let b = std::fs::read(&p).unwrap();
        assert_eq!(u32::from_le_bytes(b[40..44].try_into().unwrap()), 96000);
        assert_eq!(b.len(), 44 + 96000);
    }
}
