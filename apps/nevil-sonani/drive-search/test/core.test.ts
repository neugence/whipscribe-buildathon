// node --test test/   (Node 22.13+; TypeScript runs as-is by type stripping)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Everything below writes to a throwaway folder, never to ./data.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-search-test-'));
process.env.DATA_DIR = path.join(tmp, 'data');
process.env.DEMO_FOLDER = path.join(tmp, 'demo');
fs.mkdirSync(path.join(tmp, 'demo', 'study', 'week 2'), { recursive: true });

const { toFtsQuery, search } = await import('../src/lib/search.ts');
const { normaliseProgress } = await import('../src/lib/whipscribe.ts');
const { classify } = await import('../src/lib/sources/types.ts');
const { addFolder, scanFolder } = await import('../src/lib/scan.ts');
const { db } = await import('../src/lib/db.ts');

test('search input becomes a safe FTS5 query', () => {
  assert.equal(toFtsQuery('onboarding'), '"onboarding"*');
  assert.equal(toFtsQuery('price plan'), '"price" "plan"*');
  assert.equal(toFtsQuery('"drive folder"'), '"drive folder"');
  // Operators and quotes can't escape into FTS5 syntax.
  assert.equal(toFtsQuery('foo" OR bar*'), '"foo" "OR" "bar"*');
  assert.equal(toFtsQuery('NEAR(a b)'), '"NEAR a" "b"*');
  assert.equal(toFtsQuery('  ***  "" '), null);
});

test('progress reads the documented 0–1 and the observed 0–100', () => {
  assert.equal(normaliseProgress(0.42), 42);
  assert.equal(normaliseProgress(5), 5);
  assert.equal(normaliseProgress(100), 100);
  assert.equal(normaliseProgress(250), 100);
  assert.equal(normaliseProgress(undefined), 0);
  assert.equal(normaliseProgress('50'), 0);
});

test('only the formats the API docs list are sent', () => {
  assert.deepEqual(classify('call.m4a', 'audio/mp4', 1000), { ok: true });
  assert.deepEqual(classify('clip.MOV', 'video/quicktime', 1000), { ok: true });
  assert.equal((classify('notes.txt', 'text/plain', 10) as { reason: string }).reason, 'Not audio or video');
  assert.match((classify('talk.mkv', 'video/x-matroska', 10) as { reason: string }).reason, /\.mkv is not a format/);
  assert.match((classify('huge.mp4', 'video/mp4', 6 * 1024 ** 3) as { reason: string }).reason, /5 GB/);
});

test('scanning queues new files, re-queues changed ones and keeps removed transcripts', async () => {
  const demo = path.join(tmp, 'demo', 'study');
  fs.writeFileSync(path.join(demo, 'a.wav'), 'x');
  fs.writeFileSync(path.join(demo, 'week 2', 'b.mp3'), 'y');
  fs.writeFileSync(path.join(demo, 'readme.txt'), 'z');

  const { folderId, scan } = await addFolder('local', 'local:study');
  assert.deepEqual(scan, { added: 2, changed: 0, removed: 0, skipped: 1 });
  const b = db().prepare("SELECT subpath, status FROM files WHERE name = 'b.mp3'").get() as { subpath: string; status: string };
  assert.deepEqual({ ...b }, { subpath: 'week 2', status: 'queued' });

  // Pretend a.wav was transcribed, then it changes on disk.
  db().prepare("UPDATE files SET status = 'done' WHERE name = 'a.wav'").run();
  const later = new Date(Date.now() + 5000);
  fs.writeFileSync(path.join(demo, 'a.wav'), 'x2');
  fs.utimesSync(path.join(demo, 'a.wav'), later, later);
  fs.writeFileSync(path.join(demo, 'c.ogg'), 'new');
  fs.rmSync(path.join(demo, 'week 2', 'b.mp3'));
  const second = await scanFolder(folderId);
  assert.equal(second.added, 1); // c.ogg
  assert.equal(second.changed, 1); // a.wav
  assert.equal(second.removed, 1); // b.mp3 was only queued, so it is simply dropped
  const a = db().prepare("SELECT status FROM files WHERE name = 'a.wav'").get() as { status: string };
  assert.equal(a.status, 'queued');
});

test('search is stemmed, grouped by file and ordered by time inside a file', () => {
  const fileId = (db().prepare("SELECT id FROM files WHERE name = 'c.ogg'").get() as { id: string }).id;
  const ins = db().prepare('INSERT INTO segments (file_id, idx, start, end, speaker, text) VALUES (?, ?, ?, ?, ?, ?)');
  ins.run(fileId, 0, 12.5, 15, null, 'Pricing per minute made sense.');
  ins.run(fileId, 1, 3.2, 6, 'SPEAKER_01', 'We talked about prices first.');
  ins.run(fileId, 2, 20, 22, null, 'Nothing to see here.');
  const res = search('price');
  assert.equal(res.files.length, 1);
  assert.deepEqual(res.files[0].hits.map((h) => h.start), [3.2, 12.5]);
  assert.match(res.files[0].hits[1].snippet, /\u0001Pricing\u0002/);
  assert.equal(search('nothing at all zzz').files.length, 0);
  // A deleted file takes its segments out of the index with it.
  db().prepare('DELETE FROM files WHERE id = ?').run(fileId);
  assert.equal(search('price').files.length, 0);
});
