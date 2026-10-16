# 0003. Make Treasure Quest's look and sound in code: pixel blocks, wooden panels, a synth and the browser voice

**Date**: 2026-10-16
**Status**: In Progress

## Summary

Everything Treasure Quest looks and sounds like is made by our own code, with almost nothing to download. Block pictures are 16×16 pixel art drawn by a script, the world is drawn at about half resolution for a chunky retro screen, and puzzles pop up on wooden sign panels made of plain HTML (web page parts), so text stays sharp and screen readers work. Sound effects and a quiet chiptune tune come from a small Web Audio synth (the browser's built in sound maker), and the browser voice reads every question, with a different pitch for each series character. A big Play button starts the island, because phones only allow sound after a tap.

## Requirements

**User stories**:
- As a pupil, I want the island to look and sound like a blocky retro game, so that practising English feels like playing.
- As a pupil who is 7, I want big buttons, clear words and every question read aloud, so that I can play without help.
- As a pupil at home during an online lesson, I want to switch the music off but keep the voice, so that I can still hear my teacher.
- As the person building the islands, I want one kit of blocks, panels, sounds and voices, so that every later feature (chests, riddles, finds, word blocks, movement) uses the same parts.

**Acceptance criteria**:
- **AC-1**: When the island is ready, the loading card shows a big **Play** button instead of "Getting the island ready…". No sound, music or speech happens before Play. One tap, click, or Enter or Space on Play starts the island (the game loop runs, the Back button shows) and switches on sound and voice for the visit, on phones (including iPhone Safari) and laptops.
- **AC-2**: The block set has exactly 12 blocks: `sand`, `wetsand`, `water`, `grass`, `dirt`, `stone`, `cobble`, `planks`, `log`, `leaves`, `wool`, `glass`. Their 16×16 pixel pictures are drawn by code into one 64×64 picture sheet when the quest opens, so no texture file is downloaded, and the pictures are identical on every load. Pixels stay square and sharp (no smoothing).
- **AC-3**: Blocks look like a blocky voxel game: the top face is brightest, side faces darker and the bottom darkest; `grass` has a grass top, grass edged sides and a dirt bottom; `log` has rings on top and bottom and bark on the sides; `leaves` and `glass` are see through where their picture is empty; `wool` takes the colour the island asks for (white when none); `water` drifts slowly (still when the device asks for reduced motion).
- **AC-4**: The 3D world is drawn with chunky pixels: one drawn pixel covers `clamp(screen height in CSS pixels ÷ 240, 1, 2)` CSS pixels on each side, and spec 0001's quality steps (1, 0.75, 0.5) shrink it further. On a 844×390 phone the world is about 520×240 drawn pixels; on a 1366×768 laptop about 683×384. The `&debug` view shows the drawn size.
- **AC-5**: A puzzle panel (a wooden sign style overlay) shows: a label (the speaker's name for a riddle, else "Treasure chest" or "Listen and find"), the question text, the picture when the puzzle has one, 2 or 3 choice buttons (with the picture and its label when the choices are pictures or icons), and a **Hear it** button. It fits without scrolling at 844×390 and at 1366×768; choice buttons are at least 56 CSS pixels tall; question text is at least 20 CSS pixels.
- **AC-6**: The panel works with touch, mouse and keyboard: keys 1, 2, 3 pick a choice, H plays Hear it, Tab moves between buttons, and focus starts on the first choice. It is announced as a dialog, and right, wrong and answer messages are read by screen readers.
- **AC-7**: The panel shows three result states that the calling feature fills in: right (a cheerful line and the coins won), wrong (a "Try again" line and the hint), and shown (the right answer marked and the explanation). Each state plays its own sound. The panel can also show a plain message with buttons (for the island finish and other features).
- **AC-8**: A top bar shows the coins (like `35 / 140`), the puzzles left (like `9 left`), a **Music** button and a **Sound** button, next to the existing Back button. It fits on one row at 844×390, and each button shows whether it is on.
- **AC-9**: Fourteen sound effects play from a Web Audio synth, with no audio files: `click`, `open`, `close`, `chest`, `coin`, `right`, `wrong`, `hint`, `win`, `fanfare`, `step`, `jump`, `break`, `place`. Each sounds different. While the voice is speaking, effects and music play at a quarter of their volume.
- **AC-10**: A quiet looping chiptune tune starts after Play when Sound and Music are both on. **Music** turns only the tune off and on. **Sound** off silences effects, music and automatic reading. The tune stops when the game pauses (teacher Pause, hidden tab, turn your phone, Leave box, a lost picture) and carries on when play resumes.
- **AC-11**: Sound and Music on or off are saved on the device under `treasure-quest-audio` as `{ "sound": true|false, "music": true|false }`. On the first visit Sound starts from Word Island's `word-island-pupil` sound choice and Music starts on. The quest never writes `word-island-pupil`. If storage is blocked (a private window), the buttons still work for that visit.
- **AC-12**: When a puzzle panel opens and Sound is on, the voice reads the puzzle's spoken text once. **Hear it** reads it again at any time, even with Sound off. The voice prefers an `en-GB` voice, else any English voice. Riddles spoken by a series character use that character's pitch and speed; everything else uses Word Island's narrator settings. Speech stops when the panel closes and when the game pauses. The words are always on screen too.
- **AC-13**: Titles, buttons, the coin counter and the top bar use the pixel font Pixelify Sans, kept in the repo (no Google Fonts call) with its licence. Questions, choices, hints and explanations use the device's own clear font. If the pixel font fails to load, the device font is used and nothing breaks.
- **AC-14**: Adding `&kit` to the quest address (with `&debug` or on its own) shows the kit: the test island rebuilt from the 12 blocks with one row showing every block, a sample puzzle panel holding a real Unit 9 puzzle from spec 0002's draw (open each kind: chest, riddle, find), a sound board with a button for every effect and the tune, and a voice board that reads one line in each cast voice. It works at 844×390 and at 1366×768.
- **AC-15**: The kit adds no more than 60 KB to the first visit (compressed), so spec 0001's 2 MB limit still holds, and the rebuilt test island still runs at 30 frames a second or better on the device floor phone (spec 0001 AC-6).
- **AC-16**: If the browser has no Web Audio, the game runs silently with no error. If it has no speech, or no English voice, Hear it shows "Read the words on the screen." and the game carries on.

## Decision

**Chosen option**: Option 1: everything made in code: pixel textures drawn on a canvas, a Web Audio synth, the browser voice, and HTML overlay panels.

Treasure Quest's blocks, panels, top bar, sound effects, music and voices are built by small quest modules (`blocks.js`, `panel.js`, `hud.js`, `sound.js`, `voice.js`) with one self hosted pixel font as the only new download.

**Implementation skills**: `threejs-textures` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-textures/`) · `threejs-materials` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-materials/`) · `threejs-geometry` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-geometry/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Style** (decided with you, build to this):
- Blocks: 16×16 pixel art, our own drawings in a Minecraft like style, never Minecraft's textures or name. Each tile is a seeded pattern (a fixed random pattern, the same every time) over 3 to 5 colours from the kit palette.
- Screen: chunky pixels as in AC-4, sharp scaling (`image-rendering: pixelated`, already on the canvas).
- Panels: blocky wooden signs: a light plank colour background with a pixel grain, a 4 px dark brown border with square corners, and a dark ink text colour (contrast at least 4.5:1). Buttons look like chunky grass or stone blocks with a darker bottom edge, and press down 3 px when tapped (no movement with reduced motion).
- Fonts: Pixelify Sans for titles, buttons, numbers and the top bar; the device font stack from spec 0001 (`--font`) for questions, choices, hints and explanations.
- Sound: square and triangle wave chiptune, short and soft. The tune is quiet under everything else.

**Kit palette** (CSS custom properties in `quest/quest.css`, the same hex values used by `blocks.js`):

| Name | Hex | Used for |
|---|---|---|
| `--plank` | `#c8a165` | panel background |
| `--plank-dark` | `#8b6a3e` | panel grain |
| `--frame` | `#4a3220` | panel and button borders |
| `--ink` | `#14213d` | text (already defined) |
| `--grass` | `#5cb85c` | primary buttons |
| `--grass-dark` | `#3d8b3d` | button bottom edge |
| `--stone` | `#9a9a9a` | secondary buttons |
| `--stone-dark` | `#6e6e6e` | button bottom edge |
| `--gold` | `#ffe14a` | coins, right answer mark (already defined) |
| `--coral` | `#c0392b` | wrong answer edge |

**Data model sketch** (nothing stored online):

| Entity | Where | Fields | Rules |
|---|---|---|---|
| Audio settings | localStorage `treasure-quest-audio` | `sound` (boolean, required), `music` (boolean, required) | Read with try/catch and type checks; missing or invalid → `sound` from `word-island-pupil.sound` (true unless `false`), `music: true`. Written only when the pupil taps Sound or Music. |
| Block kind | `BLOCKS` in `quest/js/blocks.js` | `id` (one of the 12), `top`, `side`, `bottom` (tile names in the sheet), `cutout` (boolean: see through pixels), `tint` (boolean: takes a colour) | Fixed in code; islands refer to blocks by `id`. |
| Placed block | island scene data (feature 7 onwards) | `x`, `y`, `z` (integers), `kind` (a block `id`), `tint` (hex number, optional, `wool` only) | Unknown `kind` → skipped with a `Treasure Quest:` warning. |
| Cast voice | `CAST` in `quest/js/voice.js` | name → `{ rate, pitch }` | See the table below. |
| Sound effect | `EFFECTS` in `quest/js/sound.js` | name → a list of notes (wave, frequency, start, length, volume) | The 14 names in AC-9. |
| Tune | `TUNE` in `quest/js/sound.js` | tempo, and note rows for a lead and a bass voice | 8 to 16 bars, loops. Plus `win` and `fanfare` as effects. |

**Tile sheet** (64×64, 4×4 tiles of 16×16, `NearestFilter`, no mipmaps): `sand`, `wetsand`, `water`, `grass_top`, `grass_side`, `dirt`, `stone`, `cobble`, `planks`, `log_top`, `log_side`, `leaves`, `wool`, `glass` (14 tiles, 2 spare). `water` also gets its own 16×16 repeating texture so it can drift.

**Cast voices** (narrator = Word Island's settings; pitch and speed only, same English voice):

| Speaker (`by`) | Rate | Pitch |
|---|---|---|
| none (narrator) | 0.9 | 1.15 |
| Robo | 0.85 | 0.6 |
| Ming | 0.95 | 1.0 |
| Mei | 0.95 | 1.4 |
| Jie | 1.0 | 1.2 |
| Flash | 1.05 | 1.35 |

An unknown speaker name uses the narrator settings.

**State transitions** (the quest's base screen, extending spec 0001):
`loading` → `ready` (island built, Play shown) → `running` (Play pressed). The end screens and the hush, turn and leave layers work as in spec 0001; `ready` counts as covered, so the engine stays paused until Play.

**Interface surface** (ES modules in `quest/js/` unless named):

| Interface | Inputs | Outputs | Notes |
|---|---|---|---|
| `screens.setBase("ready")` and the `ready` card | none | card "Treasure Quest" / "The island is ready." with a gold **Play** button (`act: "play"`) | `screens.onPlay(fn)` registers the Play handler; Play calls `sound.unlock()` and `voice.unlock()` inside the tap, then `setBase("running")` |
| `BLOCKS`, `buildBlocks(list)` in `blocks.js` | Placed block[] | a `THREE.Group` of one `InstancedMesh` per block kind | Shared tile sheet `CanvasTexture`; `MeshBasicMaterial` with baked face shading in vertex colours (top 1.0, east and west 0.8, north and south 0.65, bottom 0.5), `alphaTest: 0.5` for cutout kinds, instance colour for `wool` tint |
| `blockTiles()` in `blocks.js` | none | the 64×64 canvas | Used by the `&kit` view and tests |
| Pixel size in `engine.js` | canvas CSS height | `pixelRatio = min(devicePixelRatio, 1) × qualityScale ÷ clamp(height ÷ 240, 1, 2)` | Replaces spec 0001's pixel ratio formula; `engine.stats()` adds `drawn: [w, h]` |
| `panel.open(puzzle, { unit, onChoose, onClose })` in `panel.js` | a Puzzle from spec 0002 (`show`, `say`, `by`, `look`, `choices`, `pic`, `playAs`), the unit id | shows the panel, reads `say` if Sound is on | `onChoose(choice)` gets the clicked `{ value, label, ok }`; the panel does not decide right or wrong |
| `panel.result(kind, { text, coins, answer })` | `kind`: `right`, `wrong` or `shown` | shows the line, marks the answer for `shown`, plays `right`, `wrong` or `hint` | `wrong` keeps the choices open; `right` and `shown` show a **Carry on** button that calls `onClose` |
| `panel.message({ title, text, buttons })` | strings, buttons `{ label, act }` | a plain wooden panel | For finish screens and other features |
| `panel.close()` | none | hides the panel, plays `close`, stops speech | |
| `hud.show()`, `hud.setCoins(n, max)`, `hud.setLeft(n)` in `hud.js` | numbers | the top bar | Music and Sound buttons live inside and call `sound.setMusic` / `sound.setSound` |
| `sound.unlock()`, `sound.play(name)`, `sound.setSound(on)`, `sound.setMusic(on)`, `sound.state()` in `sound.js` | effect name, booleans | plays, saves `treasure-quest-audio` | `play` ignores unknown names with a warning; everything is a no op without Web Audio |
| `voice.unlock()`, `voice.say(text, { by, fromButton })`, `voice.stop()`, `voice.available()` in `voice.js` | text, speaker, whether a button asked | speaks | `say` without `fromButton` does nothing when Sound is off; with no voice and `fromButton`, it returns false so the panel can show "Read the words on the screen." |
| `quest/fonts/pixelify-sans.woff2` + `quest/fonts/OFL.txt` | none | the pixel font, Basic Latin plus the symbols the kit shows (`/ · ★ … “ ” ’`) | `@font-face` in `quest.css` with `font-display: swap` |
| `&kit` address parameter | none | the kit view (AC-14) | Loaded with `import()` only when asked, like `&debug` |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Ready card | when Play appears | `main.js` after the island scene is built and the class check passes (spec 0001 boot) |
| Play | sound and voice allowed | the Play tap itself (`sound.unlock()`, `voice.unlock()` speaks an empty line inside the tap) |
| Blocks | each tile's pixels | palette hex values and the per tile seed in `blocks.js` (drawn with spec 0002's `mulberry32`) |
| Blocks | which block goes where | the placed block list (test island now, island scenes from feature 7) |
| Blocks | wool colour | the placed block's `tint`, else white |
| Blocks | face brightness | the fixed shading values above |
| Water drift | speed | a constant (one tile every 8 seconds); 0 when `prefers-reduced-motion: reduce` |
| Pixel screen | drawn size | the canvas CSS size, `devicePixelRatio`, and the engine's quality step |
| Panel | label | `puzzle.by` when set, else "Treasure chest" for `playAs` chest, "Listen and find" for find, "Riddle" for a riddle with no speaker |
| Panel | question text | `puzzle.show` |
| Panel | main picture | `picture(puzzle.pic, false, "../img/")` from `shared/picture.js` when `puzzle.pic` exists |
| Panel | choice labels | `choice.label` |
| Panel | choice pictures | `look: "pic"` → `../img/<unit>/<choice.value>.webp` with `<unit>` from `panel.open`'s `unit` (`quest.unit.id`); `look: "icon"` → `icon(choice.value)` from `shared/picture.js`; `look: "text"` → none |
| Panel result | right line | the kit's words "Well done!" plus "+N coins" with N from `options.coins` (the caller uses spec 0002's `coinsFor`) |
| Panel result | wrong line | "Try again." plus `options.text` (the caller passes `puzzle.hint`) |
| Panel result | shown line | "The answer is: " plus `options.answer` (the caller passes `puzzle.answer`), then `options.text` (the caller passes `puzzle.why`) |
| Top bar | coins and maximum | `hud.setCoins(n, max)`: the caller's total and spec 0002's `islandMax(island)`; the `&kit` view shows `0 / 140` |
| Top bar | puzzles left | `hud.setLeft(n)`: the caller's count; the `&kit` view shows `island.spots.length` (12) |
| Sound and Music buttons | on or off | `treasure-quest-audio`, else `word-island-pupil.sound` (Sound) and `true` (Music) |
| Voice | text spoken | `puzzle.say` (panel), or the line passed to `voice.say` |
| Voice | which voice | the first `speechSynthesis` voice whose `lang` matches `en-GB`, else `/^en/`, checked again on `voiceschanged` |
| Voice | pitch and speed | `CAST[by]`, else the narrator row |
| Sound | volume while speaking | 0.25 × normal while `speechSynthesis.speaking` |
| Music | which tune | `TUNE` in `sound.js` |
| Reduced motion | on or off | `matchMedia("(prefers-reduced-motion: reduce)")` |
| `&kit` sample puzzles | the puzzles shown | `drawIsland(quest.island, quest.unit, quest.seed, TYPES)` from spec 0002, first chest, first riddle and first find |
| Debug | audio line | `sound.state()` (context state, sound, music) and the chosen voice name |

**Key invariants**:
- Nothing plays or speaks before Play, and nothing plays or speaks while the engine is paused.
- The quest never writes `word-island-pupil`; `treasure-quest-audio` is the only new storage key.
- No audio files and no texture files are downloaded; the only new download is the font.
- Words are always on screen; the voice is extra, never the only way to get the question.
- `panel.js` never decides right or wrong and never adds coins; the calling feature does, through `panel.result`.
- Every kit module works on its own with no Web Audio, no speech, or blocked storage, without throwing.

**Security model**: no new data leaves the device and nothing is read from Firebase in this feature. The only stored value is `treasure-quest-audio` (two booleans, no personal data). The pixel font is SIL Open Font License 1.1, which allows self hosting and changing it; the licence file ships next to it. All panel text is set with `textContent` or escaped through `esc()`, so a bank question can never inject HTML.

**Configuration required**: none (no environment variables or accounts).

**Critical test scenarios**:
- Happy path: open `/quest/?unit=u9&kit` on a phone, tap Play, the tune starts, open the sample chest panel, the voice reads it, pick a wrong answer (wrong sound, hint line), then the right one (right sound, coins line), verifies **AC-1**, **AC-5**, **AC-7**, **AC-9**, **AC-10**, **AC-12**
- Blocks: the block row shows all 12 blocks with sharp pixels, grass and log faces differ, leaves and glass are see through, a red `wool` block is red, verifies **AC-2**, **AC-3**
- Pixel screen: `&debug` at 844×390 shows drawn about 520×240, at 1366×768 about 683×384, verifies **AC-4**
- Keyboard: press 2 to choose, H to hear, Tab between buttons, verifies **AC-6**
- Settings: switch Music off, reload, Music is still off and Sound is unchanged; `word-island-pupil` is unchanged, verifies **AC-10**, **AC-11**
- Pause: with the tune playing, fake the teacher Pause, the tune and speech stop; resume and the tune carries on, verifies **AC-10**
- Cast: the voice board reads Robo low and Mei high, verifies **AC-12**
- No audio: block `AudioContext` and `speechSynthesis`, tap Play and Hear it, no error, "Read the words on the screen." shows, verifies **AC-16**
- Budget: cold load of `/quest/?unit=u9` stays under 2 MB, the kit files add under 60 KB, verifies **AC-15**
- Font: block the font file, the panels still render in the device font, verifies **AC-13**

## Build plan

Skateboard order: first the smallest piece pupils feel (Play, the voice and a real puzzle on a panel), then the world's look, then the extras that round it off.

1. Add the `ready` base screen with the Play button to `screens.js` and `main.js`; write `sound.js` (unlock, settings in `treasure-quest-audio`, the 14 effects, ducking, no op without Web Audio) and `voice.js` (voice choice, cast table, unlock, Hear it rules); stop both on `engine.onPause`, satisfies **AC-1**, **AC-9**, **AC-11**, **AC-12**, **AC-16**
2. Download Pixelify Sans from the official Google Fonts GitHub repository, subset it to Basic Latin plus the kit symbols as `quest/fonts/pixelify-sans.woff2` (with Python `fonttools`), add `OFL.txt` and the `@font-face` rule, satisfies **AC-13**
3. Write `panel.js`, `hud.js` and the wooden sign styles in `quest.css` (palette, panel, buttons, top bar, phone landscape layout with the picture beside the choices); add the `&kit` view with the sample chest, riddle and find panels from spec 0002's draw, satisfies **AC-5**, **AC-6**, **AC-7**, **AC-8**, **AC-14**
4. Write `blocks.js` (seeded tile drawing, the 64×64 sheet, `BLOCKS`, face UVs, baked shading, cutouts, wool tint, drifting water) and rebuild `testscene.js` from the 12 blocks with a row showing each one, satisfies **AC-2**, **AC-3**, **AC-14**
5. Change the pixel ratio in `engine.js` to the chunky pixel formula and add the drawn size to `engine.stats()` and the debug view, satisfies **AC-4**
6. Add the tune (`TUNE`, the music loop, the Music button, pause and resume) and the `&kit` sound board and voice board, satisfies **AC-10**, **AC-14**
7. Measure the cold load and the frame rate (spec 0001's method), add the audio line to the debug view, and check each failure path (no Web Audio, no speech, blocked storage, missing font), satisfies **AC-15**, **AC-16**

## Consequences

**Positive**:
- Almost nothing new to download: the kit stays inside spec 0001's 2 MB budget and works on blocked school networks.
- Every look and sound is our own work, so there is no licence risk beyond the font's open licence.
- One panel, one top bar and one sound and voice module serve chests, riddles, finds, word blocks and the finish, so later features stay small.
- Questions stay sharp and readable at full resolution even though the world is drawn chunky.

**Negative / tradeoffs**:
- Code drawn textures and a code synth take more care to make beautiful than hand made art; expect a round of tweaking colours and notes after you see and hear them.
- The browser voice sounds different on every phone, and some cheap phones have no English voice at all; cast pitches only help so much.
- A Play tap is one more step before playing.
- The quest's voice code copies Word Island's few lines for choosing a voice rather than sharing them, so a change to the voice choice must be made in both places.
- The chunky screen makes small far away details (like pictures in item frames) harder to see; features that show pictures in the world must make them big enough.

**Neutral**:
- The engine's pixel ratio formula from spec 0001 changes (quality steps still work the same way).
- The `ready` screen is added to spec 0001's screen states.
- `--ink`, `--gold` and `--card` stay; the new palette names are added to `quest.css`.

## Follow-up

- [ ] Features 6 (movement), 8 (chests), 11 (riddles), 12 (finds) and 13 (word blocks) use `panel`, `hud`, `sound` and `voice` from this kit rather than making their own.
- [ ] Listen to the cast voices and the tune with you on a real phone and laptop, and adjust the pitches and notes.
- [ ] Feature 7 (beach island) lists its placed blocks with `kind` and `tint`, and adds any new block kind to `BLOCKS` and the tile sheet (2 spare tiles).
- [ ] Consider moving Word Island's `pickVoice` and the quest's voice choice into one shared file later, if the voice choice ever changes.
