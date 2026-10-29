# Track 1: how I worked, and what AI did

I used Claude Code (Claude Opus) as an assistant for Track 1. This note is so it's clear what I did, what the AI did, and what I changed or threw away.

## What I filed

Phone (iPhone 16 Plus, iOS 26.6.1, Chrome):
- #305 Deleted recording still shows its AI summary in Chat (High)
- #306 Upload progress shows three different numbers at the same time (High)
- #307 Hard to find Home in the ☰ menu on a recording page (High)
- #308 Paste links window stays blank until I tap the screen (High)
- #309 Tapping Upload files opens two pop-ups on top of each other (Medium)

Laptop (MacBook Air M1, macOS 26.2, Chrome 155):
- #310 Pasting a YouTube link loads, then goes back to empty with no message (High)
- #311 "Following" next to the player doesn't do anything (Low)
- #312 Deleted recording still opens from the recording switcher (High)
- #313 Says "0 min left" the whole time I was on the free trial (Medium)
- #314 Same recording shows 1m 03s, "2 min" and "1 more minute" (Medium)
- #315 Home floats in the middle of the screen with a lot of empty space (Medium)
- #316 Delete says "permanently, no undo" but Trash says deleted recordings can be recovered (High)

Both:
- #317 Recordings are named with UTC time, not my local time (Medium)

Proposals, with mockups:
- #318 Home on a phone feels cramped, give each part its own look
- #319 Make the ☰ menu easier to find your way in (fixes #307)
- #320 Laptop Home, attach it to the screen and show the free trial (fixes #315, #313)

## What I did

- Used whipscribe.com myself on my phone (iPhone 16 Plus, Chrome) and my laptop (MacBook Air M1, Chrome), on a new account, with my own short voice recordings.
- Signed up, recorded, uploaded, pasted links, opened transcripts, deleted recordings, checked Trash and the balance.
- Took the screen recordings and screenshots myself, and said what felt wrong as I went: Home feeling cramped and all white, Audio tools hiding under the bar, not being able to find my way back to Home, Paste links staying blank, two pop-ups on Upload, the YouTube link resetting on the laptop, "Following" doing nothing, the deleted recording still opening, Delete and Trash contradicting each other, "0 min left" during the free trial, the floating layout on the laptop.
- Tested things when I wasn't sure. For example, I clicked "Following" to see if it did anything, and recorded again with the Mac clock on screen to prove the file-name time was wrong.
- Decided what to keep, what to drop, how serious each bug is, and what the fixes should be.

## What the AI did

- Read the challenge files (README, AGENTS.md, CHECKLIST, the issue templates) and kept track of the plan.
- Pulled frames out of my screen recordings and pointed out things in them I hadn't mentioned. I checked each one before keeping it. Things it spotted first: the upload bar not matching the percentage, the recording being named in UTC time, the deleted recording's summary still showing in Chat, and the three different lengths on the preview page.
- Checked the ~220 existing issues in the repo for duplicates, so I didn't file things others had already reported.
- Blurred my personal stuff in screenshots: what I said in my recordings, my email, my bookmarks.
- Wrote the first drafts of the issues and proposals from what I told it.
- Built the HTML mockups for my proposals (phone Home, phone menu, laptop Home) from my direction, and took screenshots of them.
- Rewrote the issues in a plainer voice when I asked, using my own phrases where I had said them.
- Filed the 16 issues on GitHub from my account when I asked it to, and filled in the bug numbers in the proposals.

## What I changed or threw away from the AI's output

- **Dropped** a bug about the Intelligence tab calling a finished transcript a "preview", and one about the library count saying "0 recordings". I didn't think they were worth filing.
- **Dropped** Paste links staying blank at first, because the AI only saw it in one recording. I **brought it back** after it happened to me again and I took screenshots.
- **Corrected** the "0 min left" bug. The AI added my recordings up to 76 seconds, "more than a minute". That was wrong: they were under a minute. I changed the bug to what I actually meant: the free trial should show the seconds left from the start.
- **Reworded** the menu bug. The first draft said there was "no way back to Home". Home does exist; my point is that it doesn't stand out from the other items.
- **Changed priorities:** I made the upload progress bug and the Delete/Trash bug High.
- **Asked for** phone and laptop bugs to be kept separate, screenshots under every bug, and my voice content blurred.
- **Pushed back on the first Home mockup.** It felt blank and underwhelming, so I asked for real distinction between the areas. I also added the menu proposal and the laptop mockup myself.
- **The Trash fix is my idea:** keep deleted recordings for at least 10 days instead of deleting them permanently, and change the text to match.
- **Did not file** the difference in punctuation between phone and laptop transcripts, because I couldn't confirm it was the same recording on both. **Did not add** the camera icon on audio files or "Ready" on a preview-only recording, to keep the list focused.
- **Did not file duplicates** of bugs others had already reported (#146/#147, #39, #159, #294, #84/#83, #279, #192). I noted them separately instead.

## Redesigning Home on a laptop

After filing the issues I wanted to redesign the product, not only the transcript page, and starting with Home. I chose to finish the laptop version first and do the phone after. The design is in [design/home-laptop-c.html](design/home-laptop-c.html), and the options I picked from are in [design/home-laptop.html](design/home-laptop.html).

What I decided:
- Compared four versions side by side: today's Home, my own #320, a search-first one and one with a drop zone and cards. **I picked the drop zone and cards (C).**
- Asked for C to be optimised, then for **everything to resize to the screen**, from a phone to a wide laptop.
- Asked to **see the phone layout** inside the page, and to **add dark mode**.
- Said it was **too cluttered**. That pass took out the extra search buttons, the trial meter, the icons and tags on every card, and the Folders section, so only the Record button stands out.
- Noticed the **light/dark button had disappeared** in that pass and had it put back. The AI had removed it without asking me.
- Decided when the design was final.

What the AI did:
- Built the options and every version of C as HTML from my direction, using my own three recordings' names. It didn't make up any of their content.
- Added the states a real page needs: a new account with nothing in it, and a file uploading. The upload shows one percentage and one bar, which is the fix for my #306.
- Checked each version in a browser at phone, tablet and laptop widths, in light and dark, and fixed what didn't fit. For example, the search box on a phone was 22 px wider than the screen.
- Took out two things it couldn't back up: a "57 s" cost on the Finish transcript button (I only had 34 s left) and a "Safe to leave this page" line, because we don't know how WhipScribe handles either.

## What I learned

- Check the existing issues before filing. Several things I found were already reported, and a comment with my screenshot is more useful than a duplicate.
- Proof beats memory. A screenshot with the clock and the wrong file name in it is much stronger than "I recorded it at about 5".
- If I get lost in an app, it's not just me being careless. If I couldn't find Home, other normal users won't either.
- A good proposal removes more than it adds: 5 boxes become 1 panel, 22 menu rows become 12.
- Write down only what I saw, not why I think it happens. I don't know how WhipScribe counts free minutes, so I described what the screen showed.
- Seeing options side by side made choosing easy. Saying "less cluttered" and then looking at what got removed taught me what I actually wanted to keep, like the light/dark button.

## My process, step by step

1. Read the challenge and decided to do Track 1 on both the phone and the laptop.
2. Made a new account and used the product like a normal user, recording my screen and taking screenshots of anything odd.
3. Sent each finding to Claude with the screenshot or recording, plus what I thought was wrong.
4. Claude pulled stills from the recordings, checked them against existing issues, and drafted each bug. I read each draft and kept, changed or dropped it.
5. Tested again when something was unclear, and sent new screenshots as proof.
6. Sorted everything into phone and laptop, set the priorities, and listed bugs others had already reported separately.
7. Turned my biggest complaints (cramped Home, hard-to-use menu, floating laptop layout) into three proposals, directing the mockups until they looked right to me.
8. Had the issues rewritten in my own plain words and read through them. Then I asked Claude to file them from my GitHub account through my Chrome, with the screenshots attached: bugs #305–#317, proposals #318–#320.
9. Moved on to redesigning Home, laptop first. Picked one of four options, then shaped it over several rounds (optimise, resize to any screen, dark mode, less clutter, bring the light/dark button back) until I called it final.
