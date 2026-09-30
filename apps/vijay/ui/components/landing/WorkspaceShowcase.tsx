"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { getGsap } from "@/lib/gsap";

export function WorkspaceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeTimestamp, setActiveTimestamp] = useState<string>("01:28");

  // Hover preview state for progress bar
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  useEffect(() => {
    const { gsap } = getGsap();
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        workspaceRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      )
        .fromTo(
          transcriptRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          briefRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.6 },
          "-=0.4"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Format seconds to mm:ss string
  const formatTime = (sec: number): string => {
    if (isNaN(sec) || sec <= 0) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Audio playback error:", err));
    }
  };

  // Jump audio playback to specific timestamp
  const seekToTimestamp = (timestampLabel: string, seconds: number) => {
    setActiveTimestamp(timestampLabel);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play().catch((err) => console.error("Audio seek error:", err));
    }
  };

  // Hover over scrub bar -> show preview tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = mouseX / rect.width;
    setHoverTime(pct * duration);
    setHoverPos(mouseX);

    if (isScrubbing && audioRef.current) {
      const newTime = pct * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    setIsScrubbing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleScrub(e);
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
  };

  // Seek bar click/drag handler
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = clickX / rect.width;
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      ref={containerRef}
      id="workspace"
      className="relative min-h-screen flex flex-col justify-center items-center px-6 py-24 max-w-6xl mx-auto border-b border-border/40"
    >
      {/* Hidden underlying HTML5 Audio element */}
      <audio
        ref={audioRef}
        src="/assets/demo.mp3"
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current && !isScrubbing) {
            const cur = audioRef.current.currentTime;
            setCurrentTime(cur);
            // Auto-update active speech timestamp based on playback position
            if (cur >= 80) setActiveTimestamp("01:28");
            else if (cur >= 60) setActiveTimestamp("01:12");
            else if (cur >= 30) setActiveTimestamp("00:42");
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="w-full space-y-12">
        {/* Section Headline */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
            One call. One clear brief.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Review audio transcripts synchronized directly with generated
            project requirements and estimates.
          </p>
        </div>

        {/* Application Interface Wrapper */}
        <div
          ref={workspaceRef}
          className="rounded-xl border border-border bg-card/90 shadow-2xl overflow-hidden backdrop-blur-md"
        >
          {/* Top Bar / Window Controls */}
          <div className="h-11 px-4 bg-secondary/60 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-border" />
              <span className="w-3 h-3 rounded-full bg-border" />
              <span className="w-3 h-3 rounded-full bg-border" />
            </div>
            <div className="text-xs font-mono text-muted-foreground font-medium">
              CallBrief Workspace — Client Call #042
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              STATUS: REVIEWING
            </div>
          </div>

          {/* Main Dual Pane View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
            {/* Left Pane: Transcript (5 columns) */}
            <div
              ref={transcriptRef}
              className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-border space-y-4"
            >
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
                <span>TRANSCRIPT</span>
                <span>3 SPEECHES</span>
              </div>

              <div className="space-y-4 text-sm">
                {/* Speech 1 */}
                <div
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    activeTimestamp === "00:42"
                      ? "bg-secondary border-foreground/30"
                      : "border-transparent hover:bg-secondary/40"
                  }`}
                  onClick={() => seekToTimestamp("00:42", 42)}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">Client</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        seekToTimestamp("00:42", 42);
                      }}
                      className="hover:text-foreground underline underline-offset-2"
                    >
                      00:42
                    </button>
                  </div>
                  <p className="text-foreground/90 font-sans">
                    &ldquo;We need a new website for our business...&rdquo;
                  </p>
                </div>

                {/* Speech 2 */}
                <div
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    activeTimestamp === "01:12"
                      ? "bg-secondary border-foreground/30"
                      : "border-transparent hover:bg-secondary/40"
                  }`}
                  onClick={() => seekToTimestamp("01:12", 72)}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">Freelancer</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        seekToTimestamp("01:12", 72);
                      }}
                      className="hover:text-foreground underline underline-offset-2"
                    >
                      01:12
                    </button>
                  </div>
                  <p className="text-foreground/90 font-sans">
                    &ldquo;Do you need online payments integrated?&rdquo;
                  </p>
                </div>

                {/* Speech 3 — Highlighted */}
                <div
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    activeTimestamp === "01:28"
                      ? "bg-secondary border-foreground/40 ring-1 ring-border"
                      : "border-transparent hover:bg-secondary/40"
                  }`}
                  onClick={() => seekToTimestamp("01:28", 88)}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Client
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        seekToTimestamp("01:28", 88);
                      }}
                      className="text-foreground font-semibold underline underline-offset-2"
                    >
                      01:28
                    </button>
                  </div>
                  <p className="text-foreground font-sans">
                    &ldquo;Yes, definitely. Online payments are a must.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Right Pane: Project Brief Output (7 columns) */}
            <div
              ref={briefRef}
              className="lg:col-span-7 p-6 space-y-6 bg-card/40"
            >
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
                <span>PROJECT BRIEF</span>
                <span className="text-accent-foreground font-semibold">
                  SYNCED TO AUDIO
                </span>
              </div>

              {/* Requirements List */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Requirements
                </span>
                <div className="space-y-2 font-sans text-sm">
                  <div
                    onClick={() => seekToTimestamp("00:42", 42)}
                    className="p-3 rounded-lg border border-border/60 bg-card text-foreground flex items-center justify-between cursor-pointer hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                      Website redesign
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">00:42</span>
                  </div>

                  <div
                    onClick={() => seekToTimestamp("01:28", 88)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      activeTimestamp === "01:28"
                        ? "bg-secondary border-foreground/40 ring-1 ring-border"
                        : "border-border/60 bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Online payments
                    </div>
                    <span className="text-xs font-mono text-muted-foreground font-medium">
                      01:28
                    </span>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Tasks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="p-3 rounded-lg border border-border/60 bg-card text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                    Design new pages
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-card text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                    Integrate checkout
                  </div>
                </div>
              </div>

              {/* Estimate Summary */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                    Estimated Effort
                  </span>
                  <span className="text-lg font-semibold font-mono text-foreground">
                    32 hours
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                    Project Quote
                  </span>
                  <span className="text-lg font-semibold font-mono text-foreground">
                    $4,500
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Player / Timeline Bar (Fully Interactive Audio Scrubber) */}
          <div className="h-12 px-6 bg-secondary/80 border-t border-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title={isPlaying ? "Pause audio" : "Play demo audio"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
              <span className="text-muted-foreground font-mono">
                {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : "04:15"}
              </span>
            </div>

            {/* Interactive Progress Scrub Bar with Hover Tooltip & Handle */}
            <div
              ref={progressRef}
              onClick={handleScrub}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="flex-1 max-w-md mx-6 h-4 flex items-center cursor-pointer group relative select-none"
              title="Click or drag to seek audio"
            >
              {/* Tooltip on Hover */}
              {hoverTime !== null && (
                <div
                  className="absolute bottom-full mb-2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-mono bg-foreground text-background rounded shadow-md pointer-events-none z-20 whitespace-nowrap"
                  style={{ left: `${hoverPos}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              {/* Background Track */}
              <div className="w-full h-1.5 bg-border/80 group-hover:h-2 rounded-full overflow-hidden transition-all relative">
                {/* Progress Fill */}
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-75 relative"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Scrubber Handle Thumb */}
              <div
                className="w-3 h-3 rounded-full bg-foreground shadow-md absolute top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            <span className="text-muted-foreground hidden sm:inline">
              TIMESTAMP LINKED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
