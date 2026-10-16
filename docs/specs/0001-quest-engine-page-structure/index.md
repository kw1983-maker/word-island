# 0001. Build Treasure Quest on Three.js in its own quest/ page that shares Word Island's data

**Date**: 2026-10-16
**Status**: Proposed

## Summary

Treasure Quest will be its own page at `/quest/` inside the Word Island site, drawn with Three.js (a widely used, free 3D library for web pages). We copy one fixed version of Three.js into the repo and load it without any build step, the same no build way Word Island works today. Word Island's question helpers, Firebase code and class rules move into small shared files, so the quest and the old games read one copy of each. This step builds only the empty, safe frame of the game: a test scene of blocks that opens, checks the pupil and class, obeys Pause, has a way back, and copes with slow or unsupported devices.

## Requirements

**User stories**:
- As a pupil, I want the quest to open quickly and run smoothly on my family's cheap phone, so that I can play during an online lesson.
- As the teacher, I want the quest to obey my class settings and my Pause button, so that pupils only play the unit I opened and stop when I need them.
- As the person building the islands, I want one stable frame (engine, loop, checks, shared data) so that every later feature plugs into it instead of reinventing it.

**Acceptance criteria**:
- **AC-1**: Opening `/quest/?unit=u9` shows a blocky Three.js test scene (ground blocks, sky colour, light) that fills the screen, crisp and not blurry, in phone landscape and on a laptop.
- **AC-2**: The quest loads only the requested unit's bank through `shared/bank.js` and reads its questions (the debug view shows the count per bank). Every unit, `u1` to `u9`, loads in the quest without an error.
- **AC-3**: The quest reads the pupil's name and class from the device (`word-island-pupil`, falling back to the old `word-island-u1-v2` record as Word Island does). With no saved name or class, or a class that is not in the teacher's class list, it shows the "Start in Word Island first" screen with a button to `../`.
- **AC-4**: A missing or unknown `unit`, a unit the pupil's class may not open, or a unit file that fails or takes over 8 seconds to load shows the "This island is not open" screen with a button back to Word Island. If the class settings have not arrived within 8 seconds or fail, every unit is allowed (the same rule Word Island uses).
- **AC-5**: When the teacher pauses the pupil's class, the quest shows the "Stop and listen" screen within a few seconds on any quest screen, stops the game loop, sound and speech, ignores keys, and carries on untouched when resumed.
- **AC-6**: The test scene runs at 30 frames a second or better on the device floor (a 2 to 3 year old budget Android phone), and the game loop stops while the tab is hidden.
- **AC-7**: The quality watch lowers the render scale one step at a time (1, 0.75, 0.5) when the average frame rate over a full 3 second window is under 24, never counting the first second of play, frames over 250 ms, or time just after a pause or a scale change. If a full window at 0.5 still averages under 15, or the browser lacks WebGL 2 or import maps, or Three.js fails to load, or the WebGL context is lost and not restored within 5 seconds, the pupil sees the matching kind message with a button to the other Word Island games. Quality never steps back up during a visit.
- **AC-8**: On a touch device held upright, the "Turn your phone sideways" screen covers the game and the game pauses until the device is turned.
- **AC-9**: The first visit to `/quest/?unit=u9` transfers under 2 MB in total as served (compressed), counting Three.js, the Firebase SDK files, the unit file and the test scene.
- **AC-10**: After the shared files are lifted out of `index.html`, Word Island behaves exactly as before: all five games in every unit, sending results, leaderboards, class list, Pause, and the teacher explain page.
- **AC-11**: The quest also works on the quiz copy (`https://english-pdpr-quiz.web.app/word-island/quest/?unit=u9`), for a pupil who has entered their name on that address.
- **AC-12**: Adding `&debug` to the address shows frames per second, the render scale step, the unit and the question count per bank.
- **AC-13**: A Back button in the corner of the running quest asks "Leave the quest?"; "Yes, leave" goes to Word Island (`../`), "No, keep playing" closes the box. The game is paused while the box is open.

## Decision

**Chosen option**: Option 1: Three.js, copied into the repo, ES modules with no build step, in its own `quest/` page with shared files.

Treasure Quest is a separate static page at `quest/index.html` that renders with a pinned, vendored Three.js r184 loaded through an import map, and shares Word Island's question helpers, Firebase module and class rules through files in `shared/`.

**Implementation skills**: `threejs-fundamentals` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-fundamentals/`) · `threejs-geometry` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-geometry/`) · `threejs-textures` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-textures/`) · `threejs-materials` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-materials/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Page | `quest/index.html`, a separate static page in the Word Island repo | Keeps the 3D download off normal Word Island visits and out of the 113 KB `index.html`. |
| 3D engine | Three.js r184 (npm `three@0.184.x`), `WebGLRenderer` (WebGL 2 only since r163) | Most used web 3D library, small enough for phones, many blocky world examples; r184 is six months old so its issues are known. |
| Engine delivery | Vendored in `quest/vendor/`: `three.module` and `three.core` from the same build (minified if r184 ships it), plus only the addons actually used, mapped by an import map | Works when a school network blocks CDNs and never changes under us. |
| Code style | ES modules in `quest/js/`; `shared/bank.js` and `shared/settings.js` stay classic scripts | Tidy imports for the game; unit banks are classic scripts that need globals. |
| Shared data | `shared/bank.js`, `shared/settings.js`, `shared/firebase.js` used by both pages | One copy of each rule (questions, classes, Pause, Firebase). |
| Backend | Existing Firestore project `english-pdpr-quiz`, read only in this feature (`settings/wordIsland`) | No new data or rules needed yet; saved scores are feature 10. |
| Fonts | The device's own font stack in the quest (no Google Fonts) | No outside font download, fits the 2 MB budget and blocked networks; the retro font is decided in feature 4. |
| Hosting | Vercel (`word-island`), plus the quiz site copy on Firebase Hosting | Same deploy path as today; one Treasure Quest button works on both addresses. |
| Observability | `&debug` overlay, `console.warn` lines starting `Treasure Quest:` | Enough to see frame rate and quality steps on a real phone; no new service. |

## Feature design

**Data model sketch**: no new stored data. Reads only:
- localStorage `word-island-pupil` → `{ name: string, cls: string, sound: boolean }`, else the old `word-island-u1-v2` record (both written by Word Island; the quest never renames or rewrites them in this feature). Reads are wrapped in try/catch (private windows throw) and types are checked: `name` and `cls` must be strings, `sound` is `true` unless stored as `false`.
- Firestore `settings/wordIsland` → `classes: { [className]: unitId[] }`, `paused: { [className]: true }`.
- `WORD_ISLAND_UNITS[unitId]` → `{ id, number, title, topics, hints, notes, banks: { maze, moles, hangman, runner, planes } }` from `units/uN.js`.

**State transitions** (quest boot):
`probe → (no-3d) | loading → checking → (needs-pupil | not-open | no-3d) | running`. While running, pause reasons stack: `loading`, `hidden`, `hush`, `portrait`, `ask`, `context`; the loop runs only when none is left. `running → no-3d` when quality cannot recover or the context is not restored. Pausing keeps all game state; resuming continues where it was.

**Overlay screens** (one shown at a time; priority hush, then portrait, then ask, then loading). Exact text:
| Screen | Title | Body | Button(s) |
|---|---|---|---|
| Loading | Treasure Quest | Getting the island ready… | none |
| Needs pupil | Start in Word Island first | Open Word Island, type your name and tap your class. Then come back to the quest. | Go to Word Island |
| Not open | This island is not open | Your teacher has not opened this island for your class yet. | Back to Word Island |
| No 3D, unsupported | This device can't run the quest | Try the other Word Island games, or ask a grown up to update the browser. | Play other games |
| No 3D, too slow | The quest is too slow on this device | Try the other Word Island games instead. | Play other games |
| No 3D, lost | The quest stopped | Something went wrong with the picture. | Try again (reload) · Play other games |
| Turn your phone | Turn your phone sideways | The island needs a wide screen. | none |
| Leave box | Leave the quest? | (none) | Yes, leave · No, keep playing |
| Stop and listen | Copied from Word Island's `#hush` screen: same text, markup, focus and `inert` behaviour | | none |

**File layout**:
| Path | Kind | Owns |
|---|---|---|
| `shared/bank.js` | classic script | `WORD_ISLAND_UNITS = {}`, `NUM`, `COLOURS`, `cap`, and the helpers `look`, `ask`, `spell`, `hear`, moved verbatim from `index.html` and deleted there in the same edit (units 1 and 4 use `NUM`, `COLOURS` and `cap` at load). `HEX`, `THING` and `CAPTION` stay in `index.html`. |
| `shared/settings.js` | classic script | `wiCleanClasses(raw, units)` (from `cleanClasses`, with the unit list now a parameter) and `wiPausedClasses(data)` (the parsing inside `watchHush`) |
| `shared/firebase.js` | ES module | The whole Firebase module at the end of `index.html`, moved verbatim: `wiSend`, `wiClasses`, `wiWatchSettings`, score functions, and the `wi-send-ready` event |
| `quest/index.html` | page | Inline classic probe script (import map and WebGL 2 support, the no 3D screen markup), the import map, CSS link, canvas, overlay markup, then `../shared/bank.js`, `../shared/settings.js`, `../shared/firebase.js` and `js/main.js` |
| `quest/quest.css` | stylesheet | Overlay screens, Back button, debug panel; canvas at `100vw` × `100dvh` with safe area insets and `image-rendering: pixelated` |
| `quest/vendor/three.module*.js`, `quest/vendor/three.core*.js`, `quest/vendor/LICENSE` | vendored | Three.js r184 core files from one build, with its MIT licence |
| `quest/js/main.js` | module | Boot: pupil and unit checks, unit file load, settings watch, choose the screen; exports `quest = { unit, pupil }`. No static Three.js import |
| `quest/js/engine.js` | module | Singleton `engine`: renderer, camera, resize, fixed step loop, pause reasons, render scale steps, frame rate watch, context loss |
| `quest/js/screens.js` | module | The overlay screens and the Back button with its leave box |
| `quest/js/testscene.js` | module | Temporary test blocks; replaced by the island from features 3 and 7 |
| `quest/js/debug.js` | module | The `&debug` overlay |

**Boot order**:
1. The inline probe runs first: if `HTMLScriptElement.supports` is missing or `supports("importmap")` is false, or a test canvas gives no `webgl2` context, it shows "No 3D, unsupported" and stops.
2. If the path does not end in `/`, redirect to the same path plus `/` (keeps `../` paths right on both hosts).
3. `main.js` reads the pupil and the `unit` parameter (first value, trimmed, lowercased, must match `u1` to `u9`). Any failure shows its screen; Three.js is never downloaded on these screens.
4. In parallel: add the `units/<unit>.js` script tag (resolved with `new URL("../units/<unit>.js", document.baseURI)`, with `onerror` and an 8 s timeout), start `import("./engine.js")` (which loads Three.js), and start the settings watch.
5. The settings watch uses one `wiWatchSettings` snapshot for both classes and Pause. It waits for `wi-send-ready` only if `window.wiWatchSettings` is not already defined. The first snapshot, or 8 s with none, settles the class check once; later class list changes are ignored, and later Pause changes always apply. An empty classes object means every unit is allowed.
6. When the unit, engine and class check are all ready, the test scene starts behind any active overlay.

**Interface surface** (what later features plug into):
| Interface | Inputs | Outputs | Notes |
|---|---|---|---|
| `/quest/?unit=<id>[&debug]` | `unit` (`u1` to `u9`), optional `debug` (presence only) | the running quest or a kind screen | Feature 5 adds the hub button; it always links `quest/?unit=<id>` with the slash |
| `engine.start(scene, update)` | a Three.js scene, `update(dt)` | starts the loop | Fixed step of 1/60 s with an accumulator, at most 5 steps per frame, the accumulator clamped, and reset on every resume so no catch up runs after a pause |
| `engine.pause(reason)` / `engine.resume(reason)` | reason: `loading`, `hidden`, `hush`, `portrait`, `ask`, `context` | stops or restarts the loop | Works before `start`; stored reasons apply when it starts |
| `engine.onPause(fn)` / `engine.onResume(fn)` | listener | called when the loop stops or restarts | Later features suspend their AudioContext and call `speechSynthesis.cancel()` here |
| `engine.onQuality(fn)` | listener | called with the new render scale | Lets the look kit adjust |
| `quest` (export of `main.js`) | none | `{ unit, pupil }`: the loaded bank object and `{ name, cls, sound }` | Read by puzzle features |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Boot | unit id | `unit` URL parameter, normalized as in boot step 3 |
| Boot | unit bank | `units/<unit>.js` script tag after `shared/bank.js`, then `WORD_ISLAND_UNITS[unit]` (a bare global name, not `window.WORD_ISLAND_UNITS`) |
| Boot | pupil name, class, sound | localStorage `word-island-pupil`, else `word-island-u1-v2` |
| Class check | units allowed for the class | first `settings/wordIsland` snapshot `classes`, cleaned by `wiCleanClasses(raw, WORD_ISLAND_UNITS)`; none within 8 s or an error means all allowed; class absent from a present list means needs pupil |
| Pause | paused or not | `paused[cls] === true` from every snapshot, via `wiPausedClasses` |
| Turn your phone | device upright | `matchMedia("(orientation: portrait) and (pointer: coarse)")` (touch devices only, tablets included, by choice) |
| Resize | canvas size | `resize` and `orientationchange`, debounced 150 ms |
| Quality steps | frame rate | rolling 3 s average in `engine.js`, checked each second, rules in AC-7 |
| No 3D screens | which variant | the probe result, the Three.js import result, the quality watch, or `webglcontextlost` (with `preventDefault()`) and no `webglcontextrestored` within 5 s |
| Screen text | titles, bodies, buttons | the Overlay screens table above |
| Debug view | question count per bank | `quest.unit.banks[name].length` |
| Back buttons | Word Island address | relative `../`, so it works on Vercel and the quiz copy alike |

**Key invariants**:
- `index.html` keeps its exact behaviour. All moves are verbatim except two named edits: `cleanClasses` becomes `wiCleanClasses(raw, units)` with the call site `.then((raw) => wiCleanClasses(raw, UNITS))`, and `watchHush` calls `wiPausedClasses`. No top level name is defined twice (check with a before and after list of top level names).
- In `index.html`, the `shared/firebase.js` module tag sits after the main classic script, so `wi-send-ready` still fires after the listeners exist.
- Shared classic scripts load before any `units/uN.js`; the quest loads exactly one unit file.
- Render pixel ratio is `min(devicePixelRatio, 1)` times the current render scale; antialias off.
- No game logic runs while any pause reason is active; no keys reach the game while hushed.
- Every path in the quest is relative to the page, so the same files work at both addresses.

**Failure behaviour**:
- Firebase fails to load: Pause never arrives (fails open, as in Word Island today) and the class check allows all units after 8 s.
- `index.html` opened from `file://` stops loading Firebase once it is an external module; use a local server (as AGENTS.md says).
- On Firebase Hosting a missing file returns `index.html` with status 200 (the `**` rewrite), which shows up as a module type error; a failed Three.js import shows "No 3D, unsupported".

**Security model**: no new writes and no Firestore rule changes. The quest reads `settings/wordIsland` exactly as Word Island already does. Pupils are identified only by the name and class they typed; no personal data is added.

**Configuration required**: none (no new env vars or keys; the Firebase web config stays in `shared/firebase.js`, public by design).

**Critical test scenarios**:
- Happy path: saved pupil in an allowed class opens `/quest/?unit=u9` on a phone in landscape and a laptop; the crisp test scene renders and `&debug` shows about 30 or more frames a second and Unit 9 counts, verifies **AC-1**, **AC-2**, **AC-6**, **AC-12**
- Every unit: open the quest with `u1` to `u9` and see no console errors, verifies **AC-2**
- No pupil: clear storage, open the quest, see "Start in Word Island first"; same for a class missing from the list, verifies **AC-3**
- Wrong unit: `?unit=u12`, `?unit=U9 ` (works), a unit not set for the class, and a blocked unit file; Firebase blocked shows the scene after 8 s, verifies **AC-4**
- Pause: on the emulator, set `paused.2B = true` while on the scene and on the "not open" screen; the quest freezes and ignores keys, then resumes untouched, verifies **AC-5**
- Slow device: throttle the CPU; render scale drops step by step, then "too slow"; switching tabs and back does not drop quality, verifies **AC-7**
- No support: disable WebGL in the browser; "can't run" shows and no Three.js file is downloaded, verifies **AC-7**
- Upright phone: portrait touch viewport shows the turn screen and pauses, verifies **AC-8**
- Download: devtools network total on a cold load, including the gstatic Firebase files, under 2 MB, verifies **AC-9**
- Regression: play all five Word Island games in units 1, 4 and 9, send a result on the emulator, check leaderboards, class list and Pause, open the teacher explain page, verifies **AC-10**
- Quiz copy: enter a name on the quiz address, then open the quest there, verifies **AC-11**
- Back: tap Back, choose No (game continues), then Yes (Word Island opens), verifies **AC-13**

## Build plan

Skateboard order: first make the shared ground safe, then the smallest quest frame a pupil can open, then the safety screens, then ship it to both addresses.

1. Lift `WORD_ISLAND_UNITS`, `NUM`, `COLOURS`, `cap` and the four helpers into `shared/bank.js`, the class and Pause parsing into `shared/settings.js`, and the Firebase module into `shared/firebase.js`; update the two call sites; list top level names before and after; retest Word Island, satisfies **AC-10**
2. Vendor Three.js r184 (`three.module` and `three.core` from one build, record served sizes), add `quest/index.html` with the probe, import map and slash redirect, `engine.js` with the fixed step loop, resize and pause reasons, and `testscene.js`, satisfies **AC-1**, **AC-6**, **AC-9**
3. Boot checks in `main.js` and `screens.js`: pupil and unit checks, the unit file load with its timeout, the single settings watch with the 8 s class fallback, the dynamic engine import, and every overlay screen with its text, satisfies **AC-2**, **AC-3**, **AC-4**
4. Pause from the teacher, hidden tab and portrait, the Back button and leave box, the quality watch and context loss, and the `&debug` overlay, satisfies **AC-5**, **AC-7**, **AC-8**, **AC-12**, **AC-13**
5. Add `quest` and `shared` to `../quiz/scripts/copy-word-island.mjs` with a `cpSync` filter that skips `AGENTS.md` and `CLAUDE.md` everywhere; add `docs/`, `.agents/`, `.claude/`, `AGENTS.md`, `CLAUDE.md`, `units/AGENTS.md`, `units/CLAUDE.md` and `skills-lock.json` to `.vercelignore`; deploy a Vercel preview and the quiz copy; measure the cold load, satisfies **AC-9**, **AC-11**

## Consequences

**Positive**:
- Every later feature (movement, islands, puzzles, scores) plugs into one engine loop, one set of pause rules and one data path.
- Normal Word Island visits download nothing extra, and pupils on a "not open" screen never download Three.js.
- Fixing a class or Firebase rule fixes it for both pages.

**Negative / tradeoffs**:
- Step 1 touches the live Word Island page; a slip (for example a name defined twice) blanks pupils' games, so it needs a full regression pass on a preview before promoting.
- Without a bundler, the vendored engine is shipped whole (no tree shaking), and Firebase adds about 300 KB, so islands must keep textures and sounds small.
- iPhones older than iOS 16.4 and browsers without WebGL 2 get the kind message instead of the game.
- Upgrading Three.js is a manual file swap and a retest.
- Each address keeps its own saved name, so a pupil switching addresses types their name again.

**Neutral**:
- `index.html` gains three script tags; its inline Firebase module disappears.
- The quiz copy script and `.vercelignore` change.
- Classic scripts and modules live side by side in `shared/`, by design (unit banks need globals).
- Repeat visits recheck about ten files with quick "not changed" replies; that is fine.

## Follow-up

- [ ] Feature 5 adds the Treasure Quest button to the Word Island hub; until then the quest is opened by its address.
- [ ] Three.js conventions (`cloudai-x/threejs-skills`) are not yet in AGENTS.md; they apply to the `quest/` area only, so they belong in a nested `quest/AGENTS.md` (run `/sync` after this feature is built).
- [ ] Ask a pupil family or the teacher to try the preview on a real budget Android phone; devtools throttling only approximates AC-6 and AC-7 (a phone in battery saver may cap at 30 frames a second, close to the 24 threshold).
