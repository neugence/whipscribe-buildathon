# Mobile transcript reader - next pass

This is my proposed next version of the WhipScribe phone transcript reader.
It is a static HTML prototype so it can be opened directly in a browser and
reviewed on a phone-sized viewport.

## How to view

Open `index.html` in this folder, or run a static server from
`challenges/01-mobile-transcript/` so the current screenshots in `after/`
also load:

```bash
cd challenges/01-mobile-transcript
python -m http.server 4177
```

Then open `http://localhost:4177/next/`.

To review one proposed state directly, add `?state=<state-name>`, for example
`http://localhost:4177/next/?state=auth-signup`.

## What changed

- The reader stays primary. The preview prompt, audio progress, play controls,
  and audio error copy are grouped into one bottom dock instead of stacking as
  separate bars.
- Search, export, settings, and more use one consistent bottom-sheet pattern.
- Export options include follow-up screens for text, timed text, JSON, SRT, VTT,
  translated subtitles, Google Drive, and share link so the menu does not end in
  vague choices.
- More menu options include follow-up screens for Home, File details, Quiz me,
  Rename, Sign in, and Delete recording so each action has a clear next step.
- The preview-gate sign-up step now opens a complete auth sheet with Sign in /
  Sign up modes, Google, email, password, and no-card-needed copy.
- The More menu is grouped by intent, with the destructive action separated.
- Text selection has contextual phone actions: copy, play from here, ask AI,
  and make clip.
- A missing processing state is added for recordings that are uploaded but not
  ready to read.
- A four-speaker meeting state is included for 320 px class phones.
- The load-failure state gives recovery actions instead of only explaining the
  failure.
- The "not on this account" state shows the signed-in account and gives clear
  recovery actions instead of a dead-end message.

## What I deliberately kept

- The large transcript typography stays because the current design is already
  readable.
- Timestamps stay in the left gutter because they support scanning and playback.
- The three main tabs stay visible because Transcript, Summary, and AI Chat are
  core WhipScribe modes.
- The player remains reachable at the bottom because playback is part of reading
  and correction.
- The desktop reader is deliberately unchanged in this prototype; the phone
  changes are isolated to the mobile layout and should not force the laptop
  experience to absorb phone-only constraints.

## Questions answered from the prompt

- The main phone job is reading a transcript while staying close to playback.
  The proposed reader keeps the transcript first, with search, export, and playback one tap away.
- The Keep reading prompt and player are combined into one bottom dock so they
  do not fight each other or hide as much transcript content.
- The More menu is grouped by intent: navigation, creation, account, and danger.
  Delete stays separated; export and search stay outside the More menu because
  they are primary reader actions.
- Search, export, settings, and more now use one bottom-sheet language so the
  controls feel consistent on a phone.
- A processing state is designed for uploaded recordings that are not ready yet,
  with progress, steps, and reassurance that the user can leave the page.
- A four-speaker meeting state is included for 320 px phones, using compact
  speaker chips above each turn instead of a wide speaker gutter.
- Text selection opens a compact contextual toolbar with Copy, Play, Ask, and
  Clip actions.
- The desktop page should stay unchanged for this pass. These are phone-specific
  improvements, and the prototype avoids pushing mobile constraints onto the
  laptop reader.

## What is not implemented

- This is not wired to the WhipScribe backend.
- Buttons do not perform real export, playback, search, account, or delete
  actions.
- The prototype focuses on layout, hierarchy, states, copy, and flow rather than
  production routing.
