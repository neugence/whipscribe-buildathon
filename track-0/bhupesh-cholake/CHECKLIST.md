# Checklist

What we look for. Tick what is true of your entry and paste the list into
your **Introduction** issue or your pull request — the boxes stay tickable
there. Be honest; an unticked box with a sentence next to it is worth more
than a ticked one that is not true.

### UI and UX

- [ ] Every screen has designed empty, loading, error and done states
- [ ] Works on a phone-sized screen, or has a clear reason not to
- [ ] Keyboard reachable, readable contrast, labelled controls
- [ ] Copy is in the user's words, not the system's
- [ ] The first run is designed: what a new user sees before any data
- [ ] Before/after screenshots or a short recording attached

### Shipped apps

- [ ] At least one app of mine is live in the App Store or Play Store today
- [ ] It has real users and reviews, and I have answered some
- [ ] I shipped an update that fixed a crash or a review complaint
- [ ] I handled store review, signing and release myself
- [ ] I can say what I would do differently next time

Store links:

### Building with AI

- [x] The README explains the decisions, not just the features
- [x] Commits are small and named for the change
- [x] I removed or rewrote something the tool produced, and say what and why
- [ ] No invented API behaviour: every call matches the docs or a real response

### Finishing

- [ ] One full flow works end to end from a clean install
- [ ] Someone other than me used it and I changed something because of it
- [x] The README says exactly what does not work yet
- [ ] Install and run instructions work on a machine that is not mine

### Ownership and teamwork

- [ ] My LinkedIn is in my introduction and on my GitHub profile
- [x] I linked repos where the commit history is mine, not a fork's
- [ ] One of them is a complex project I owned from start to finish
- [x] I have reviewed others' pull requests or answered their issues, and can point to it
- [ ] I have shipped work alongside a team, and can say what I did and what they did
- [ ] I have won a hackathon (link the entry and the result)
- [ ] I have led a team, and can say what I decided and what I delegated

### Workflows (Track 4)

- [ ] The problem page names one specific person and what it costs them today
- [ ] I spoke to at least one such person and wrote down what they said
- [ ] The workflow is drawn: steps, what the API or MCP does, what the person sees
- [ ] One flow runs end to end on real API calls and my own recordings
- [ ] A two-minute recording shows the workflow doing its job
- [ ] The vision says who else it serves, what it needs, and what comes next

### Self-drive

- [ ] I opened my Track 0 pull request with my current work and repos before being asked
- [ ] I kept moving between reviews instead of waiting to be told the next step
- [x] I chose my own scope and said why

### Learning

- [ ] I name something that was new to me and how I learned it
- [x] I describe a thing that went wrong and how I found and fixed it
- [ ] I asked a question in an issue early instead of guessing late

Track 0 is the pull request with your track record; Track 1 is required.
Track 1 entries (bug reports and proposals) are read for UI and UX, whether
the fix is small, correct and complete, and learning; shipped apps and AI use
count where you show them.

## Evidence and reasons for unchecked items

The list above is copied from the upstream `CHECKLIST.md`; wording and order are preserved, with only the evidenced boxes ticked. These checks concern this Track 0 entry and specifically linked examples, not every repository in the inventory.

- **UI/UX:** no WhipScribe UI is shipped here. Device, state, accessibility and before/after evidence belong to Track 1. Existing portfolio UIs were not exhaustively validated.
- **Shipped apps:** no verified App Store/Play Store listing, user reviews, crash update or personal store-release evidence. Spa for Cars is a live website. Store-specific retrospective is not claimed.
- **Building with AI:** README decisions and explicit limitations are documented; the submission commits are scoped and named. The Cursor-attributed Cloudflare change was corrected after review and regression-tested. “Every call matches the docs or a real response” stays unchecked: no WhipScribe integration is submitted, and this audit did not validate every portfolio API call.
- **Finishing:** passing local tests/builds and a reachable website do not prove a full flow from a clean install, an independent user's feedback loop, or installation on someone else's machine. Those boxes remain unchecked. The README does state what was not verified and what remains incomplete.
- **Ownership/teamwork:** public account-linked commits and upstream merges are linked. The issue-response box is supported by the Cloudflare response in `EVIDENCE.md`; it is not a claim of reviewing another person's PR. The stronger “complex project ... from start to finish” box remains unchecked because the public evidence does not establish the complete delivery lifecycle. Another contributor on AI Fitness Coach and private collaboration are not enough to establish each person's shipped scope publicly. No leadership or hackathon win is claimed. LinkedIn consistency could not be established.
- **Track 4:** every box remains unchecked; it is an optional next investigation, not completed work.
- **Self-drive:** Neugence contacted me about the challenge after I emailed about the role. The “before being asked” box is intentionally unchecked. There is no buildathon review cycle yet to demonstrate continued progress between reviews. My chosen scope is Track 0, required Track 1 next, and evaluation of Track 4 afterward.
- **Learning:** the Faro failure/review/fix is concrete. I do not infer when a technology was first new to me from commit dates. No early buildathon Question issue has been filed.
