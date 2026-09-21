import Link from 'next/link';
import { Icon } from './Icon';
import type { AppStatus } from '@/lib/api-types';

// The first run: before there is any data, say what this is and get the two
// connections made, in the order they are needed.
export function Setup({ status, driveNote }: { status: AppStatus; driveNote: string | null }) {
  const { drive, whipscribe, sources } = status;
  const local = sources.find((s) => s.kind === 'local');
  return (
    <main className="page">
      <section className="hero">
        <h1>Search the words inside your recordings.</h1>
        <p className="lede">
          Pick a Google Drive folder. Every recording in it becomes a transcript you can search, and each result opens at the
          second it was said. New recordings are picked up on their own.
        </p>
      </section>

      {driveNote && (
        <div className="banner warn" role="alert" style={{ marginTop: 20, maxWidth: 760 }}>
          <Icon name="alert" />
          <span className="grow">{driveNote}</span>
        </div>
      )}

      <ol className="steps" style={{ listStyle: 'none', padding: 0 }}>
        <li className="card step">
          <span className={`step-n${drive.connected ? ' done' : ''}`}>{drive.connected ? <Icon name="check" size="sm" /> : 1}</span>
          <div>
            <h2>Choose where your recordings are</h2>
            {drive.connected ? (
              <>
                <p>Google Drive is connected{drive.email ? ` as ${drive.email}` : ''}. Pick the folders you want transcribed.</p>
                <div className="row">
                  <Link className="btn primary" href="/pick?source=drive"><Icon name="folder" /> Pick a folder</Link>
                </div>
              </>
            ) : drive.configured ? (
              <>
                <p>Read-only access: nothing in your Drive is changed, moved or shared.</p>
                <div className="row">
                  <a className="btn primary" href="/api/google/connect"><Icon name="drive" /> Connect Google Drive</a>
                </div>
              </>
            ) : (
              <p>
                Google Drive is not set up on this computer yet. Add <span className="kbd">GOOGLE_CLIENT_ID</span> and{' '}
                <span className="kbd">GOOGLE_CLIENT_SECRET</span> to <span className="kbd">.env.local</span> and restart; the README
                walks through it in five minutes.
              </p>
            )}
            {local && (
              <div className="row" style={{ marginTop: 12 }}>
                <span className="muted" style={{ fontSize: 15 }}>No Drive to hand?</span>
                <Link className="btn" href="/pick?source=local"><Icon name="computer" /> Use the demo folder</Link>
              </div>
            )}
          </div>
        </li>

        <li className="card step">
          <span className={`step-n${whipscribe.hasKey ? ' done' : ''}`}>{whipscribe.hasKey ? <Icon name="check" size="sm" /> : 2}</span>
          <div>
            <h2>WhipScribe does the transcribing</h2>
            {whipscribe.hasKey ? (
              <p>Using your WhipScribe API key. Your credit pays for the minutes, and the transcripts are on your account too.</p>
            ) : (
              <p>
                There is no API key yet, so this uses WhipScribe’s free guest tier. It works, with a daily limit, and the
                transcripts are not saved to a WhipScribe account. Add <span className="kbd">WHIPSCRIBE_API_KEY</span> to{' '}
                <span className="kbd">.env.local</span> to use yours.
              </p>
            )}
          </div>
        </li>

        <li className="card step">
          <span className="step-n">3</span>
          <div>
            <h2>Search what was said</h2>
            <p style={{ marginBottom: 0 }}>
              Type a word or a “quoted phrase” to search every folder at once. Each result shows the line around it; click it to
              hear that moment.
            </p>
          </div>
        </li>
      </ol>
    </main>
  );
}
