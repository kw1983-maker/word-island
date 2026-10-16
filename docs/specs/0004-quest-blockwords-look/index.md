# 0004. Give Treasure Quest the BlockWords look and sound by reusing BlockWords' own code

**Date**: 2026-10-16
**Status**: In Progress
**Supersedes**: [0003](../0003-quest-look-sound-kit/index.md)

## Summary

Treasure Quest will look, sound and feel like your BlockWords game, because we copy BlockWords' own code for it: its block textures, its world drawing with soft corner shadows, its sunny sky and clouds, its dark grey talk boxes, hotbar and sounds. Pupils see the island in first person (through their own eyes) at full screen sharpness, holding the selected block in a blocky hand. It stays a separate, simpler island game inside Word Island: no endless world, no hearts or hunger, and only puzzles give coins. This replaces spec 0003 (chunky pixels and wooden signs), which you turned down; its Play tap, voice, saved Sound and Music, and the talk box's answer rules carry over.

## Requirements

**User stories**:
- As a pupil, I want the treasure island to look and sound like BlockWords, so that it feels like a real block game I want to explore.
- As a pupil who is 7, I want big clear buttons and every question read aloud, so that I can play without help.
- As a pupil at home during an online lesson, I want to switch the music off but keep the voice, so that I can still hear my teacher.
- As the person building the islands, I want one world engine, one talk box, one hotbar and one sound and voice module, so that walking, chests, riddles, finds, word blocks, mining and crafting all use the same parts.

**Acceptance criteria**:
- **AC-1**: When the island is ready, a BlockWords style card (dark panel, title "Treasure Quest", "The island is ready.") shows a big green **Play** button. No sound, music or speech happens before Play. One tap, click, or Enter or Space on Play starts the island and switches on sound and voice for the visit, on phones (including iPhone Safari) and laptops.
- **AC-2**: The reused BlockWords code lives in `quest/js/bw/`. Each copied file starts with a comment naming the BlockWords file and commit (`31a2bf4`) it came from. Nothing is loaded from the BlockWords site at run time. No ElevenLabs, Firebase or teacher config code or keys are copied. Code an island never uses is cut: endless terrain, caves, ores, villages search, furnace, farming, beds, health, hunger, breath, mobs other than the villager model, crafting recipes and saves.
- **AC-3**: Block pictures come from BlockWords' code drawn texture atlas (no texture files downloaded), with sharp pixels (no smoothing). Every tile shared with BlockWords looks the same as in BlockWords. The kept block set is exactly the list in the data model below; a new tile (such as wet sand) is drawn the same way.
- **AC-4**: The island world is built from placed blocks into 4×4 chunks of 16×32×16 blocks (up to 64×64 blocks, 32 high), drawn with BlockWords' mesher: hidden faces skipped, soft corner shadows (ambient occlusion) and sky light. Leaves and glass show through where their picture is empty, and water is see through. Beyond the island the sea carries on to the horizon and fades into the sky fog. A placed block with an unknown kind is skipped with a `Treasure Quest:` warning.
- **AC-5**: The sky is always sunny daytime, using BlockWords' sky colour, square sun and blocky clouds. The clouds drift slowly, and stay still when the device asks for reduced motion. It never gets dark.
- **AC-6**: The view is first person: the camera sits at BlockWords' eye height (1.62 blocks above the feet) with BlockWords' field of view (72°). The world is drawn at one drawn pixel per CSS pixel (screen size sharpness; device pixel ratio capped at 1), and spec 0001's quality steps (1, 0.75, 0.5) still lower it on slow devices. The `&debug` view shows the drawn size (for example `844×390` on a 844×390 phone at full quality).
- **AC-7**: A blocky arm at the bottom right holds the selected hotbar item, drawn as BlockWords draws its held item, in a second scene drawn on top of the world. An empty slot shows the arm alone. The arm uses a default sleeve and skin colour until feature 14 (pick your hero) sets them.
- **AC-8**: The bottom of the screen shows BlockWords' hotbar (9 slots) and, just above it in BlockWords' counter style, the coins (like `35 / 140` with a coin icon) and the puzzles left (like `9 left`). There are no hearts or hunger bars. It fits at 844×390. Keys 1 to 9 and the mouse wheel select a slot on a laptop; tapping a slot selects it on a phone. (What goes in the slots comes from feature 23, mining.)
- **AC-9**: Puzzles show in a BlockWords style talk box: dark grey panel, a speaker line at the top (the villager's name for a riddle, else "Treasure chest" or "Listen and find") with a speaker button (**Hear it**), the question picture big in the middle when the puzzle has one, the question in big bold white text, then the answers. Word answers are full width grey BlockWords buttons with their number key; picture answers are 2 or 3 picture cards side by side with their labels. It fits without scrolling at 844×390 and 1366×768; answer buttons are at least 56 CSS pixels tall and question text at least 20 CSS pixels.
- **AC-10**: The talk box keeps spec 0003's behaviour: keys 1, 2, 3 pick an answer, H plays Hear it, Tab stays inside the box, focus starts on the first answer, it is announced as a dialog, and the result lines are read by screen readers. It shows right (a cheerful line and the coins won), wrong (a "Try again" line and the hint, answers stay open) and shown (the right answer marked and the explanation) states that the calling feature fills in, each with its own sound, and plain messages with buttons. It never decides right or wrong itself. While it is open, number keys pick answers and never change the hotbar.
- **AC-11**: The Back button becomes a BlockWords style **Pause** button at the top left. It (and Esc on a laptop) opens a BlockWords pause panel: "Paused", a green **Carry on**, **Music: on/off**, **Sound: on/off**, and **Leave the quest** (back to Word Island). The game is paused while it is open. The teacher's Stop and listen screen works as before.
- **AC-12**: Every spec 0001 screen (loading, not open, start in Word Island, can't run, too slow, stopped, turn your phone) uses the BlockWords panel style with the same words as today.
- **AC-13**: Sounds are BlockWords' synthesised sounds (no audio files): its dig, place and step sounds per block material, pick up, craft, right, wrong, open and villager sounds, and its ambient music, played through the quest's `sound.js`. The quest's effect names (`click`, `open`, `close`, `chest`, `coin`, `right`, `wrong`, `hint`, `win`, `fanfare`, `step`, `jump`, `break`, `place`) each play a BlockWords style sound. Effects and music drop to a quarter of their volume while the voice speaks. Nothing plays before Play or while the game is paused.
- **AC-14**: **Music** turns only the music off and on; **Sound** off silences effects, music and automatic reading. Both are saved under `treasure-quest-audio` exactly as in spec 0003 (first visit: Sound from Word Island's choice, Music on; `word-island-pupil` is never written; blocked storage still works for the visit).
- **AC-15**: The voice works as in spec 0003: a puzzle is read once as its talk box opens when Sound is on, Hear it reads it again at any time, an `en-GB` voice is preferred, series characters use their own pitch and speed, and speech stops when the box closes or the game pauses.
- **AC-16**: Titles, buttons and counters use BlockWords' font stack (`'Trebuchet MS', 'Segoe UI', system-ui, sans-serif`) with its text shadows; questions and answers use the same stack at their sizes. No font file is downloaded.
- **AC-17**: Until feature 7 builds the beach island, the quest opens a small BlockWords style test beach: sand, sea, grass, an oak tree, a small village house, a chest, one villager standing still with BlockWords' floating "!", and one row showing every kept block. The pupil stands on it in first person; the view turns slowly by itself, and dragging (touch or mouse) looks around. There is no walking yet.
- **AC-18**: Adding `&kit` to the address shows the kit: the test beach, sample chest, riddle and find talk boxes holding real Unit 9 puzzles from spec 0002's draw, a sound board with a button for every effect and the music, a voice board reading one line in each cast voice, and the hotbar filled with sample blocks (the hand shows the selected one). It works at 844×390 and 1366×768.
- **AC-19**: The first visit to `/quest/?unit=u9` stays under spec 0001's 2 MB (compressed), and the reused code and styles add no more than 60 KB compressed. The test beach builds (light and mesh) in under 1 second on a laptop (shown in `&debug`) and runs at 30 frames a second or better on the device floor phone (spec 0001 AC-6).
- **AC-20**: The parts spec 0003 built that this design replaces are gone: the code drawn `quest/js/blocks.js` tile set, the top bar in `hud.js`, the wooden sign styles, the chunky pixel formula in `engine.js`, `quest/fonts/` (Pixelify Sans) and `tools/make-pixel-font.py`. Nothing in `quest/` refers to them.
- **AC-21**: With no Web Audio the game runs silently with no error; with no speech or no English voice, Hear it shows "Read the words on the screen." and the game carries on (as spec 0003 AC-16).

## Decision

**Chosen option**: Option 2: copy and trim BlockWords' modules into `quest/js/bw/`, and dress the quest's existing engine, sound, voice and talk box in BlockWords' look.

Treasure Quest keeps spec 0001's engine (pause rules, quality steps, lost picture handling) and spec 0003's tested sound, voice and talk box logic, and takes its look from copied BlockWords code: `blocks.js` (trimmed registry), `atlas.js`, `chunk.js` (mesher, light, shader), a fixed island version of `world.js`, `sky.js` (day only), the held item and hotbar parts of `main.js` and `ui.js`, the villager model from `entities.js`, the sounds from `audio.js`, and the matching rules from `style.css`.

**Implementation skills**: `threejs-textures` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-textures/`) · `threejs-geometry` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-geometry/`) · `threejs-shaders` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-shaders/`) · `threejs-fundamentals` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-fundamentals/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Style** (build to this, matching BlockWords):
- Panels: BlockWords `.panel` (background `#23232b`, 4 px `#14141a` border, inset `#4a4a56` ring, 6 px corners), titles with `3px 3px 0 #000` text shadow, white text.
- Buttons: BlockWords `.btn-big` (green `#4b8a3f`, `#12200f` border, `#78bd68` inset ring, `#2d5626` bottom edge, presses down 3 px; no movement with reduced motion) for the main action, `.btn-small` grey (`#4a4a56`) for the others and for word answers.
- Hotbar and counter: BlockWords `#hotbar`, `.slot`, `.slot.sel` and `.emeralds` rules, with a coin icon in place of the emerald.
- Screens: BlockWords `.overlay` backdrop (`rgba(6, 8, 14, .82)`); the Play card uses BlockWords' title gradient.

**Data model sketch** (nothing stored online; confirmed with you):

| Entity | Where | Fields | Rules |
|---|---|---|---|
| Block kind | `B` / `BLOCKS` in `quest/js/bw/blocks.js` | `name`, `tiles` (top, side, bottom), `render`, `solid`, `opaque`, `liquid`, `hardness`, `drops` | Kept set: `air`, `bedrock` (bottom layer, can't be broken), `stone`, `cobblestone`, `dirt`, `grass`, `path`, `sand`, `sandstone`, `gravel`, `clay`, `water`, `glass`, `oak_log`, `oak_planks`, `oak_leaves`, every wool colour, `rose`, `dandelion`, `tall_grass`, `sugar_cane`, `bricks`, `bookshelf`, `chest`, `crafting_table`, `sign`, plus `wet_sand` (new tile). Never hardcode numeric ids; use `B.NAME`. |
| Texture atlas | `quest/js/bw/atlas.js` | one 16×16 tile per name | Only tiles the kept blocks use; `validateTiles()` warns about a missing tile. |
| Island world | `IslandWorld` in `quest/js/bw/world.js` | 4×4 `Chunk`s of 16×32×16 (block id and light per cell) | Island coordinates `x` and `z` 0 to 63, `y` 0 to 31; outside is air above the sea level and water below it for lighting and faces. Built once when the island opens. `getBlock`, `setBlock` (marks the chunk and its neighbours to rebuild), `raycast` kept for features 6, 23 and 24. |
| Placed block | island data (the test beach now, feature 7 next) | `x`, `y`, `z` (whole numbers), `kind` (a block name) | Unknown `kind` → skipped with a warning. A `fill` box form (`x0..x1`, `y0..y1`, `z0..z1`, `kind`) for large areas. |
| Hotbar slot | `hotbar` in `quest/js/hud.js` | `item` (a block name or empty), `count` | 9 slots, display and selection only in this feature; feature 23 fills them. |
| Sound settings | localStorage `treasure-quest-audio` | `sound`, `music` (booleans) | Unchanged from spec 0003. |
| Cast voice | `CAST` in `quest/js/voice.js` | name → `{ rate, pitch }` | Unchanged from spec 0003. |

**State transitions** (the quest's base screen, unchanged from spec 0003 plus the pause panel):
`loading` → `ready` (island built, Play card) → `running` (Play pressed). While running: Pause button or Esc → pause panel (engine paused as `ask`) → Carry on → running, or Leave → Word Island. Hush, turn your phone and the end screens work as in spec 0001.

**Interface surface** (ES modules in `quest/js/` unless named):

| Interface | Inputs | Outputs | Notes |
|---|---|---|---|
| `buildAtlas()`, `tileUV(name)`, `atlasCanvas` in `bw/atlas.js` | none, tile name | the atlas canvas, UV rectangle | Copied; trimmed to the kept tiles plus `wet_sand` |
| `B`, `BLOCKS`, `tileFor(def, dir)` in `bw/blocks.js` | block name, face direction | block id, definition, tile name | Copied, trimmed to the kept set |
| `computeLight(chunk, world)`, `buildGeometry(chunk, world)`, `makeMaterials(texture)` in `bw/chunk.js` | a chunk, the world, the atlas texture | light values, geometry buffers, the `solid` and `water` shader materials with `sync(name, value)` | Copied; chunk height constant 32 |
| `new IslandWorld(scene, materials)`, `.build(placed)`, `.getBlock`, `.setBlock`, `.raycast` in `bw/world.js` | placed blocks | meshes in the scene | Replaces BlockWords' streaming with one build of all 16 chunks; outside cells answer air or sea water |
| `buildSea(materials, seaLevel)` in `bw/world.js` | materials, sea level | a large water plane around the island at the water block's surface height | Uses the water tile and the same shader, so it joins the island's water |
| `new Sky(scene, materials)`, `.update(dt, camera, renderer)` in `bw/sky.js` | time step | sky colour, sun, clouds, fog | Fixed at midday (`setPhase` to noon, the cycle never advances); clouds still drift |
| `villagerModel()` in `bw/villager.js` | none | a `THREE.Group` with the floating "!" | BlockWords' villager boxes only, no movement code |
| `engine.start(scene, update, { overlay })` in `engine.js` | the world scene, the update function, an overlay scene and camera | draws the world, then the overlay on top (`autoClear` off, depth cleared between) | For the held item; quality steps and pause rules unchanged |
| `hand.setItem(name)` in `hand.js` | a block name or empty | the arm and held item in the overlay scene | Uses BlockWords' item icon drawing for the held sprite |
| `hud.show()`, `hud.setCoins(n, max)`, `hud.setLeft(n)`, `hud.setHotbar(slots)`, `hud.select(i)`, `hud.onSelect(fn)` in `hud.js` | numbers, slots, index | the hotbar and the counter | Keys 1 to 9 and the wheel are ignored while a talk box, the pause panel or a screen is open |
| `panel.open`, `panel.result`, `panel.message`, `panel.close` in `panel.js` | as spec 0003 | the BlockWords talk box | Same calls and rules as spec 0003; only the markup and styles change |
| `pause.open()`, `pause.close()` in `pause.js` | none | the pause panel | Music and Sound call `sound.setMusic` and `sound.setSound`; Leave goes to `../` |
| `sound.unlock`, `sound.play(name)`, `sound.setSound`, `sound.setMusic`, `sound.pause`, `sound.resume`, `sound.state` in `sound.js` | as spec 0003 | sounds | `EFFECTS` and `TUNE` are replaced by BlockWords' tone and noise sounds and its ambient music; `sound.play("dig", { material })` and `"step"` take a material from `materialOf(blockName)` |
| `voice.*` in `voice.js` | as spec 0003 | speech | Unchanged |
| `look.attach(camera, canvas)` in `look.js` | the camera, the canvas | drag to look and the slow automatic turn | Test beach only; feature 6 replaces it with real controls |
| `&kit` address parameter | none | the kit view (AC-18) | Loaded with `import()` only when asked |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Ready card | when Play appears | `main.js` after the island world is built and the class check passes (spec 0001 boot) |
| Play | sound and voice allowed | the Play tap itself (`sound.unlock()`, `voice.unlock()`) |
| Atlas | each tile's pixels | BlockWords' tile drawing code in `bw/atlas.js` (seeded, so the same every load) |
| World | which block is where | the placed block list (test beach now, `quest/islands/uN` scene data from feature 7) |
| World | face brightness and corner shadows | BlockWords' `computeLight` and `buildGeometry` from the placed blocks |
| World | what lies outside the island | air above the sea level, water below it (constants in `bw/world.js`) |
| Sea | the sea level | the test beach's (and later each island's) `seaLevel` value |
| Sky | time of day | fixed at noon in `sky.js`; cloud drift a constant, 0 with `prefers-reduced-motion: reduce` |
| Camera | eye height and field of view | BlockWords' `EYE` (1.62) and 72° |
| Camera | starting position and direction | the test beach's `start` point (later each island's start, feature 7) |
| Screen | drawn size | canvas CSS size × `min(devicePixelRatio, 1)` × the engine's quality step |
| Hand | item shown | the selected hotbar slot's `item` |
| Hand | arm colours | a default sleeve and skin colour in `hand.js` until feature 14 |
| Hotbar | slot contents | `hud.setHotbar(slots)`: the kit's sample blocks now, feature 23 later |
| Counter | coins and maximum | `hud.setCoins(n, max)`: the caller's total and spec 0002's `islandMax(island)`; the kit shows `0 / 140` |
| Counter | puzzles left | `hud.setLeft(n)`: the caller's count; the kit shows `island.spots.length` (12) |
| Talk box | speaker line, question, picture, answers, result lines | as spec 0003's value sourcing table (`puzzle.by`, `puzzle.show`, `picture(puzzle.pic, …)`, `choice.label`, `../img/<unit>/<value>.webp`, `icon(value)`, "Well done!", "Try again.", "The answer is: ") |
| Pause panel | Music and Sound shown on or off | `sound.state()` |
| Sounds | which sound each quest effect name plays | the mapping table in `sound.js` (BlockWords' `Sfx` shapes) |
| Sounds | material for dig, place, step | BlockWords' `materialOf(blockName)` |
| Sounds | volume while speaking | 0.25 × normal while `speechSynthesis.speaking` |
| Voice | text, voice, pitch and speed | as spec 0003 |
| `&kit` sample puzzles | the puzzles shown | `drawIsland(quest.island, quest.unit, quest.seed, TYPES)`, first chest, riddle and find |
| Debug | drawn size, build time, audio line | `engine.stats().drawn`, the time `IslandWorld.build` took, `sound.state()` and `voice.name()` |

**Key invariants**:
- Nothing plays or speaks before Play, and nothing plays or speaks while the game is paused.
- The quest never writes `word-island-pupil`; `treasure-quest-audio` is the only quest storage key.
- No texture, audio or font files are downloaded; no file is fetched from the BlockWords site.
- No secret or config from BlockWords (ElevenLabs key, Firebase config, teacher config) is ever copied.
- Words are always on screen; the voice is extra.
- `panel.js` never decides right or wrong and never adds coins.
- Nothing can hurt the pupil: no health, hunger, breath or fall damage code is copied.
- Every module works without Web Audio, speech or storage, without throwing.

**Security model**: no data leaves the device and nothing new is read from Firebase. The only stored value is `treasure-quest-audio`. BlockWords is your own MIT licensed code; each copied file keeps a header naming its source. All talk box text is set with `textContent` or escaped, as in spec 0003.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: open `/quest/?unit=u9&kit` on a phone, tap Play, look around the test beach by dragging, open the sample chest, hear it read, pick a wrong then the right answer, verifies **AC-1**, **AC-9**, **AC-10**, **AC-13**, **AC-15**, **AC-17**, **AC-18**
- Look: side by side with BlockWords, the grass, sand, oak, leaves, water, sky, clouds, talk box and hotbar look the same; leaves and glass show through, verifies **AC-3**, **AC-4**, **AC-5**, **AC-8**, **AC-16**
- Sharpness: `&debug` at 844×390 shows drawn `844×390`; slow the CPU until the quality step drops and the drawn size shrinks, verifies **AC-6**
- Hand: pick hotbar slots with 1 to 9, the wheel and taps; the hand shows each block, and an empty slot shows the arm alone, verifies **AC-7**, **AC-8**
- Pause: press Esc, turn Music off, carry on, reload; Music stays off and `word-island-pupil` is unchanged, verifies **AC-11**, **AC-14**
- Keys: with a talk box open, press 2; it picks the second answer and the hotbar does not change, verifies **AC-10**
- No audio: block `AudioContext` and `speechSynthesis`, tap Play and Hear it, no error and "Read the words on the screen.", verifies **AC-21**
- Clean copy: search `quest/` for `elevenlabs`, `firebase-config`, `teacher-config`, `hunger`, `health`; none found; every `bw/` file has its source header, verifies **AC-2**
- Budget: cold load stays under 2 MB, the reused files add under 60 KB; the beach builds under 1 second on a laptop, verifies **AC-19**
- Removal: `quest/fonts/`, `tools/make-pixel-font.py` and the chunky pixel code are gone, verifies **AC-20**

## Build plan

Skateboard order: first the smallest thing you can look at and judge (the BlockWords world in first person), then the parts pupils touch (talk box, hotbar, pause), then sound and the kit, then the clean up.

1. Copy and trim BlockWords' `blocks.js`, `atlas.js`, `noise.js` (only `mulberry32` and what the atlas needs), `chunk.js` and `world.js` into `quest/js/bw/` with source headers; set the chunk height to 32; write `IslandWorld` (build once from placed blocks, outside cells as air or sea water) and `buildSea`; add the `wet_sand` tile, satisfies **AC-2**, **AC-3**, **AC-4**
2. Copy `sky.js` fixed at noon, set the engine's camera to BlockWords' 72° and the pixel ratio back to `min(devicePixelRatio, 1)` × quality step, add `drawn` and the build time to the debug view, satisfies **AC-5**, **AC-6**
3. Rebuild `testscene.js` as the BlockWords test beach (sand, sea, grass, oak tree, village house, chest, villager from `bw/villager.js`, the block row) with a `start` point, and add `look.js` (drag to look, slow automatic turn); show the island in first person, satisfies **AC-4**, **AC-17**
4. Add the overlay scene to `engine.start`, write `hand.js` (arm plus BlockWords' held item sprite), and rewrite `hud.js` as BlockWords' hotbar and coin counter with slot selection, satisfies **AC-7**, **AC-8**
5. Restyle `panel.js` and `quest.css` as BlockWords' talk box (speaker line, big picture, word buttons, picture cards), keep its spec 0003 behaviour, and block hotbar keys while it is open; restyle every spec 0001 screen and the Play card with BlockWords' panel, buttons and font, satisfies **AC-1**, **AC-9**, **AC-10**, **AC-12**, **AC-16**
6. Write `pause.js` (Pause button and Esc, Carry on, Music, Sound, Leave) and move the leave box into it, satisfies **AC-11**, **AC-14**
7. Replace `sound.js`'s `EFFECTS` and `TUNE` with BlockWords' sounds and ambient music behind the same API (map the 14 quest effect names, add the material sounds), keeping unlock, ducking, settings and pause rules, satisfies **AC-13**, **AC-14**, **AC-15**, **AC-21**
8. Update `kit.js` (sample talk boxes, sound board with every effect and the music, voice board, hotbar with sample blocks), satisfies **AC-18**
9. Remove spec 0003's own block tiles, top bar, wooden sign styles, chunky pixel code, `quest/fonts/` and `tools/make-pixel-font.py`; search that nothing refers to them; measure the cold load, the reused size, the build time and the frame rate, and check each failure path, satisfies **AC-19**, **AC-20**, **AC-21**

## Consequences

**Positive**:
- The quest looks like the game you already know works for your pupils, from the first build.
- BlockWords' world code (chunks, `setBlock`, `raycast`) already supports breaking and placing blocks, so mining (feature 23) and walking (feature 6) build on tested code.
- Still no texture, sound or font downloads, so the 2 MB budget and blocked school networks are fine.
- The quest's tested parts (Play tap, voice, settings, talk box rules, pause rules) are kept, not rewritten.

**Negative / tradeoffs**:
- Two copies of the same code now exist; a fix made in BlockWords must be copied to `quest/js/bw/` by hand (the source headers say where from).
- BlockWords was built for laptops; its shader with corner shadows and full screen sharpness has never run on a budget phone. If the floor phone falls below 30 frames a second, the quality steps lower the sharpness, and a further fix may be needed.
- BlockWords has no touch controls; drag to look here is only for the test beach, and feature 6 must design real phone controls.
- A first person view hides the pupil's hero; it only shows on the pick screen and the finish screen (feature 14), and as the arm.
- Most of spec 0003's look work (tiles, wooden signs, top bar, pixel font) is thrown away.

**Neutral**:
- `engine.js` changes: 72° field of view, the pixel ratio formula back to spec 0001's, and an overlay scene.
- The Back button and leave box from spec 0001 become the Pause button and pause panel.
- The project gains a new folder, `quest/js/bw/`, for copied code, and a convention that copied files carry source headers.

## Migration plan

**Strategy**: replace directly (nothing is live yet: the quest is unlinked from Word Island and only on a private preview).
**Phases**:
1. Build steps 1 to 8 replace the look in place on `main`, one local commit per step.
2. Build step 9 removes the spec 0003 parts once nothing refers to them.
**Rollback**: revert the local commits for the step that failed; spec 0003's build is commit `ce9ee9c`.
**Risks**: the phone frame rate (measure on the floor phone before features 6 and 7 build on it); the chunk height change to 32 must be applied everywhere `chunk.js` and `world.js` use it.

## Follow-up

- [ ] Feature 6 (movement & controls): design touch controls for phones (BlockWords has none) and laptop pointer lock, replacing `look.js`.
- [ ] Feature 7 (beach island): write the real map in the placed block form, with its `start` point and `seaLevel`.
- [ ] Features 23 (mining) and 24 (crafting unit things): build on `IslandWorld.setBlock`, `raycast`, the hotbar and BlockWords' break times, trimmed to the kept blocks.
- [ ] Feature 14 (pick your hero): set the arm's colours and show the hero on the pick and finish screens; it is first person while walking.
- [ ] Try the test beach on a real budget Android phone and an iPhone before feature 6 builds on it.
- [ ] Add a line to root `AGENTS.md` that `quest/js/bw/` holds copied BlockWords code with source headers (for `/sync`).
