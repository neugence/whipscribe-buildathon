# Demo recordings

These two recordings were supplied by Raagan U for this buildathon prototype
and are intentionally bundled so a reviewer can try the pitch timeline without
finding a WAV first.

- `speech-and-strum.wav` is a 50.8-second mixed example. The UI preselects the
  guitar-only interval from 25 to 35 seconds.
- `c-major-scale-tutorial.wav` is a 36-second tutorial example analyzed over
  its full duration by default.

Loading a recording is free and local to this server. Selecting **Analyze
lesson** always runs the local YIN estimator. When the server has a
`WHIPSCRIBE_API_KEY`, the same action also submits the WAV to WhipScribe and
uses API credit; without a key, the notes timeline still works.
