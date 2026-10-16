# Verify: Game engine & page structure · spec 0001 · updated 2026-10-16
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Never test write to the real Firebase: for Pause and class checks, serve a fake `shared/firebase.js` (a page route) or use the emulators._

## UI / manual
- [ ] Saved pupil in an allowed class opens `/quest/?unit=u9` at 844×390 and at a laptop size → blocky test island fills the screen, crisp, Back button top left → AC-1
- [ ] `/quest/?unit=u9&debug` in a foreground tab → debug shows about 60 fps on a laptop, `scale 1`, `unit u9`, and the counts maze 41 · moles 25 · hangman 22 · runner 17 · planes 23 → AC-2, AC-12
- [ ] Open the quest with each of `u1` to `u9` → no page errors; debug counts match Word Island's banks (u1 maze 51, u4 maze 39, …) → AC-2
- [ ] Clear storage, open the quest → "Start in Word Island first" with a Go to Word Island link to `../` → AC-3
- [ ] Only the old `word-island-u1-v2` record holds the name and class → the quest still recognises the pupil → AC-3 (value sourcing: pupil)
- [ ] Pupil class missing from the teacher's class list → "Start in Word Island first" → AC-3 (value sourcing: class check)
- [ ] `?unit=u12`, no `unit`, and a unit not set for the class → "This island is not open"; `?unit=%20U9%20` opens Unit 9 → AC-4 (value sourcing: unit id)
- [ ] Block `units/u9.js` → "This island is not open" → AC-4 (value sourcing: unit bank)
- [ ] Block Firebase entirely → after 8 s the island opens anyway; an empty class list opens every unit → AC-4 (value sourcing: class check fallback)
- [ ] Fake settings with `paused: { "2B": true }` on the running island and on the "not open" screen → "Stop and listen" shows, debug says `paused: hush`, arrow keys never reach the page; set it back → the island carries on → AC-5 (value sourcing: Pause)
- [ ] Real budget Android phone (2 to 3 years old), landscape → about 30 fps or better in `&debug`, quality stays at `scale 1` or `0.75` → AC-6
- [ ] Hide the tab (switch tabs) and come back → debug shows `paused: hidden` while away; quality does not drop after returning → AC-6, AC-7
- [ ] Slow the CPU (devtools throttling, or a background window) → scale steps 1 → 0.75 → 0.5 about every 4 s, then "The quest is too slow on this device" with Play other games → AC-7 (value sourcing: quality steps)
- [ ] Remove WebGL 2 (`getContext("webgl2")` returns null) → "This device can't run the quest", and no Three.js file is downloaded → AC-7 (value sourcing: no 3D screens)
- [ ] Block `vendor/three.core.min.js` → "This device can't run the quest" → AC-7
- [ ] Lose the WebGL context and restore it within 5 s → pauses (`paused: context`) then carries on; lose it for good → "The quest stopped" with Try again and Play other games → AC-7
- [ ] Touch device held upright → "Turn your phone sideways" and `paused: portrait`; turn it → the island carries on. A laptop window that is taller than wide shows no turn screen → AC-8 (value sourcing: turn your phone)
- [ ] Tap Back → "Leave the quest?" and `paused: ask`; No, keep playing → back to the island; Yes, leave → Word Island opens → AC-13
- [ ] On the Vercel preview: play all five games in units 1, 4 and 9 (stop before the end of a round), check the class list, leaderboard and teacher explain page still load → AC-10
- [ ] Quiz copy: enter a name on `english-pdpr-quiz.web.app/word-island/`, then open `/word-island/quest?unit=u9` (no slash) → redirects to `/quest/` and the island opens → AC-11

## Commands
- [ ] Sum of compressed sizes on a cold load (quest files, `units/u9.js`, Three.js, the three gstatic Firebase files) → under 2 MB (measured 2026-10-16: about 394 KB) → AC-9
- [ ] `cd ../quiz && npm run build` → `dist/word-island/` has `quest/` and `shared/`, and no `AGENTS.md` or `CLAUDE.md` → AC-11
- [ ] List top level names in `index.html` + `shared/bank.js` + `shared/settings.js` → no name defined twice → AC-10

## Acceptance-criteria coverage
- AC-1 step 1 · AC-2 steps 2 to 3 · AC-3 steps 4 to 6 · AC-4 steps 7 to 9 · AC-5 step 10 · AC-6 steps 11 to 12 · AC-7 steps 12 to 16 · AC-8 step 17 · AC-9 command 1 · AC-10 step 19 and command 3 · AC-11 step 20 and command 2 · AC-12 step 2 · AC-13 step 18
