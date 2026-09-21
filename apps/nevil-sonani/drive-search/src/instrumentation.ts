// Runs once when the server starts: start the queue.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startWorker } = await import('./lib/worker');
    startWorker();
  }
}
