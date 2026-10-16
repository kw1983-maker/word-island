# 0005. Walk the island in first person with BlockWords' player, plus phone controls and a use action

**Date**: 2026-10-17
**Status**: Proposed

## Summary

Pupils walk around the island the way they do in BlockWords, because we reuse BlockWords' own player code: the same walking speed, jump, collisions and automatic step up onto one block ledges. On a laptop the mouse turns the view (it is captured after a click, like BlockWords), WASD walks, the arrow keys walk and turn, Space jumps and E uses things; on a phone a joystick appears under the left thumb, dragging on the right turns the view, and there are Jump and Use buttons. Nothing can hurt you: paddling in shallow water is fine, and deep water puts you back on the beach. One shared "use" action (look at a chest or villager and click, press E or tap it) is what chests, riddles, finds and mining will all use.

## Requirements

**User stories**:
- As a pupil who is 7, I want to walk, look and jump around the island on my phone or laptop without help, so that exploring feels like playing BlockWords.
- As a pupil without a mouse (or who finds the mouse hard), I want to walk and turn with the arrow keys alone, so that I can still play.
- As a pupil, I want to be put back on the beach when I wander into deep water, so that I can never get lost or stuck.
- As the person building chests, riddles, finds and mining, I want one way for pupils to use the thing in front of them, so that every feature works the same.

**Acceptance criteria**:
- **AC-1**: On a laptop (a fine pointer such as a mouse), the Play tap captures the mouse, and clicking the island captures it again whenever it is free. While captured, moving the mouse turns the view at BlockWords' speed (0.0022 radians per pixel), looking up and down stops just short of straight up and down, and a white cross (BlockWords' crosshair) shows in the middle. Esc frees the mouse and opens the pause menu; Carry on captures it again. If the browser refuses capture, holding the mouse button and dragging turns the view instead. While the mouse is free and no screen covers the island, a hint "Click to look around" shows.
- **AC-2**: On a laptop, W and the Up arrow walk forward, S and the Down arrow walk back, A and D step sideways, Left and Right arrows turn (2.4 radians a second), and Space jumps. Walking diagonally is no faster than walking straight. The arrows alone are enough to reach every part of the island.
- **AC-3**: On a touch device (a coarse pointer), there is no crosshair and no capture. Touching the left half of the screen places a joystick under the thumb; pushing it walks in that direction relative to the view, at a speed that grows with the push up to full walking speed, and lifting the thumb stops. Dragging on the right half turns the view. A round **Jump** button sits at the bottom right and a **Use** button above it shows only while something usable is in front. Walking and looking work at the same time with two thumbs. A touch that starts on the hotbar, Pause, Jump, Use or any other button never walks or turns.
- **AC-4**: Movement is BlockWords' `Player`: a body 0.6 blocks wide and 1.8 tall with the eye at 1.62, walking at 4.4 blocks a second, gravity 30 and a jump of about 1.25 blocks, solid blocks stop you, and you step up onto a one block ledge automatically. There is no running and no crouching.
- **AC-5**: Nothing can hurt you: no health, hunger, breath or fall damage exists. If you end up inside blocks you are lifted to the nearest free space (BlockWords' unstick). You may walk into water that is one block deep (solid ground under it). When your feet are in water with more water under it (deep water), or you leave the island's 64×64 area, you are put back at your last safe spot (the last place you stood on solid ground that was not under water), with BlockWords' splash sound and the message "Back to the beach!" for 2 seconds.
- **AC-6**: A usable thing (added by a feature: a chest, a villager, later a find or a block) within 4 blocks and in front of you (under the crosshair on a laptop, near the middle of the view on a phone) gets a white outline and its label shows above the hotbar with how to use it ("Open the chest · click or E" on a laptop, "Open the chest · tap" on a phone). Clicking (while captured), pressing E, tapping the thing itself on a phone, or tapping Use calls that thing's use action once, and the hand swings. Tapping a usable thing that is farther than 4 blocks shows "Walk closer."
- **AC-7**: When a talk box opens from a use, walking stops, every held key and thumb is cleared and the mouse is freed so answers can be clicked; when Carry on closes it, the mouse is captured again (that click allows it). Any pause (the pause menu, the teacher's Stop and listen, a hidden tab, turn your phone) also stops movement and clears the controls, so nothing keeps walking after play resumes.
- **AC-8**: Walking on the ground plays BlockWords' step sound for the block under your feet about every 0.4 seconds, jumping plays the jump sound, and the view bobs gently while walking (no bob when the device asks for reduced motion).
- **AC-9**: The pupil starts at the island's start point, facing its start direction (the test beach's path for now). The slow automatic turn and drag only look from spec 0004 (`look.js`) are gone.
- **AC-10**: The `&debug` view adds the feet position, on ground, in water, the last safe spot and the current usable thing. In `&kit`, the test beach's chest and villager are usable (they open the sample chest and riddle), and the K key opens the kit sheet (freeing the mouse).
- **AC-11**: Movement runs in the engine's fixed 60 steps a second; the test beach still runs at 30 frames a second or better on the device floor phone, and the new code adds no more than 15 KB compressed.

## Decision

**Chosen option**: Option 2: copy BlockWords' `Player` into `quest/js/bw/player.js` (trimmed of survival code), and add the quest's own controls for laptop and phone, a sea rescue, and a shared use target system.

Movement physics are BlockWords' tested code; the input layer, phone controls, safety rules and use targets are new quest modules (`controls.js`, `touchpad.js`, `walk.js`, `targets.js`).

**Implementation skills**: `threejs-interaction` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-interaction/`) · `threejs-fundamentals` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-fundamentals/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (nothing stored on the device or online; confirmed with you):

| Entity | Where | Fields | Rules |
|---|---|---|---|
| Player | `Player` in `quest/js/bw/player.js` | `pos` (feet), `vel`, `yaw`, `pitch`, `onGround`, `inWater` | BlockWords' constants (`WIDTH` 0.6, `HEIGHT` 1.8, `EYE` 1.62, `GRAVITY` 30, `JUMP_V` 9.2, `WALK` 4.4). Pitch limited to ±(π/2 − 0.001). No health, hunger, breath, sprint or sneak fields. |
| Safety state | `walk.js` | `lastSafe` (a feet position), `rescueUntil` | `lastSafe` starts at the island start; set each step while on ground and the block under the feet is solid and not water. |
| Controls state | `controls.input` in `controls.js` | `forward` (−1..1), `strafe` (−1..1), `turn` (−1..1), `jump` (boolean), `use` (one shot) | `controls.clear()` zeroes all of it. Keyboard gives ±1; the joystick gives fractions. |
| Use target | `targets.js` | `at` (a block `{ x, y, z }` or a `THREE.Object3D`), `label` (text), `onUse` (function) | Added with `targets.add(target)`, which returns a remove function. Usable within 4 blocks and in front. |
| Island start | island data (the test beach's `start`, feature 7's islands next) | `x`, `y`, `z` (feet), `yaw` | Required for every island. |

**State transitions** (the player, while the base screen is `running`):
`walking` ⇄ `wading` (feet in shallow water) → `rescued` (deep water or off the island: moved to `lastSafe`, message 2 s) → `walking`. Any pause or an open talk box: `stopped` (controls cleared) → back to `walking` on resume.

**Interface surface** (ES modules in `quest/js/` unless named):

| Interface | Inputs | Outputs | Notes |
|---|---|---|---|
| `new Player(world)`, `.update(dt, input)`, `.look(dx, dy)`, `.eye()`, `.forward()` in `bw/player.js` | the `IslandWorld`, `{ forward, strafe, jump }` | position, velocity, on ground | Copied from BlockWords `js/player.js` (commit `31a2bf4`): `boxHits`, `groundUnder`, `liquidAt`, `moveAxis` (with the step up), `unstick`; removed: `updateStats`, `damage`, `eat`, `respawn`, sprint, sneak, swim tuning beyond BlockWords' water speed, the void check |
| `controls.attach(canvas)`, `controls.input`, `controls.clear()`, `controls.capture()`, `controls.release()`, `controls.captured()`, `controls.onLook(fn)` in `controls.js` | keyboard, mouse, pointer lock | the controls state and look deltas | Keys from `event.code` (layout independent); ignores keys while a talk box, pause menu or screen is open |
| `touchpad.attach(root)` in `touchpad.js` | touch pointer events | joystick → `forward`/`strafe`, right half drag → look deltas, Jump and Use buttons | Only when `matchMedia("(pointer: coarse)")`; tracks each `pointerId` |
| `walk.start(world, island, camera)`, `walk.update(dt)` in `walk.js` | the world, island start, camera | moves the player, rescues from deep water, sets the camera from `player.eye()` and yaw and pitch, plays step and jump sounds, head bob | Called from the scene's `update(dt)` |
| `targets.add({ at, label, onUse })`, `targets.update(camera, player)`, `targets.current()`, `targets.useCurrent()`, `targets.tapAt(x, y)` in `targets.js` | targets, the camera, a tap position | the outline mesh, the label line, calls `onUse` | Ray from the camera (crosshair) or from the tap; 4 block reach; blocks in the way stop the ray (`IslandWorld.raycast`) |
| `sound.play("splash")` in `sound.js` | none | BlockWords' `Sfx.splash` | Added to `QuestSfx` in `bw/audio.js` |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Start | feet position and facing | the island's `start` (`testscene.js` now, feature 7 next) |
| Look (laptop) | turn amount | `event.movementX/Y` × 0.0022 while captured, or while dragging with the button held |
| Look (arrows) | turn amount | ±2.4 radians a second × the step time |
| Look (phone) | turn amount | right half drag distance × 0.005 radians per pixel (spec 0004's drag speed) |
| Walk | direction and speed | `controls.input.forward`/`strafe` (keys ±1, joystick −1..1 with a dead zone of 0.15), turned by `player.yaw`, times `WALK`; diagonal input normalised |
| Jump | when | Space, or the Jump button, while on the ground |
| Safety | deep water | the block at the feet is water and the block below it is water, or the feet are outside 0..63 in x or z |
| Safety | where you go back to | `lastSafe` |
| Use | which thing | the nearest target hit by the ray from the camera through the crosshair (laptop) or through the tap point (phone), within 4 blocks, not behind a solid block; on a phone without a tap, the ray through the middle of the view |
| Use | label shown | `target.label` plus "click or E" (fine pointer) or "tap" (coarse pointer) |
| Device kind | laptop or phone controls | `matchMedia("(pointer: fine)")` / `("(pointer: coarse)")` |
| Steps | which sound | `sound.play("step", { block })` with the block under the feet (BlockWords' `materialOf`) |
| Bob | on or off | `prefers-reduced-motion: reduce` turns it off |
| Rescue message | text and length | "Back to the beach!" for 2 seconds, in BlockWords' hint bar style |
| Debug | position, ground, water, safe spot, target | the player, `walk.js` and `targets.current()` |

**Key invariants**:
- Nothing ever lowers a value the pupil can lose: there is no health, hunger or breath.
- The player is never left inside solid blocks, in deep water or outside the island.
- The controls state is empty whenever the game is paused or a talk box is open.
- A use action fires at most once per click, key press or tap.
- `targets.js` never decides what using does; each feature's `onUse` does.

**Security model**: nothing new is stored or sent; controls only read local input. Pointer lock is requested only from a pupil's click or tap, as browsers require.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path, laptop: Play, the mouse is captured, walk the path with WASD, turn with the mouse, jump onto the chest, step up a one block ledge, verifies **AC-1**, **AC-2**, **AC-4**
- Happy path, phone: thumb on the left walks, right thumb turns at the same time, Jump jumps, verifies **AC-3**
- Arrows only: reach the far side of the island with arrows and Space, verifies **AC-2**
- Sea: wade in the shallows, then walk into deep water, put back on the sand with "Back to the beach!", verifies **AC-5**
- Use: in `&kit`, look at the chest within 4 blocks, it glows, press E, the sample chest opens, the mouse is freed; Carry on captures it again; tap the villager from far away, "Walk closer.", verifies **AC-6**, **AC-7**, **AC-10**
- Pause: hold W, press Esc, carry on, the player does not walk on, verifies **AC-7**
- Feel: steps sound on grass and sand differently; no bob with reduced motion, verifies **AC-8**
- Budget: the new files add under 15 KB; 30 fps on the floor phone, verifies **AC-11**

## Build plan

Skateboard order: first a pupil can walk the test beach with the keys, then the laptop mouse, then phones, then the safety net, then using things, then the polish.

1. Copy and trim BlockWords' `Player` into `quest/js/bw/player.js`; write `walk.js` (player from the island start, camera from the eye, fixed step update) and the keyboard part of `controls.js` (WASD, arrows walk and turn, Space); add `start` to the test beach; remove `look.js`, satisfies **AC-2**, **AC-4**, **AC-9**
2. Add mouse capture, the drag fallback, Esc to the pause menu, the "Click to look around" hint and BlockWords' crosshair (laptop only), satisfies **AC-1**
3. Write `touchpad.js`: the floating joystick, right half drag to look, Jump and Use buttons, two thumbs at once, and touches on buttons ignored, satisfies **AC-3**
4. Add the safety net in `walk.js`: `lastSafe`, deep water and off island rescue, the splash sound (`Sfx.splash` into `bw/audio.js`) and "Back to the beach!", satisfies **AC-5**
5. Write `targets.js` (ray, 4 block reach, outline, label line, E, click, tap, Use button, "Walk closer.", hand swing) and make the `&kit` chest and villager usable, satisfies **AC-6**, **AC-10**
6. Clear the controls on every pause and talk box, free and recapture the mouse round the talk box, add step and jump sounds and the head bob, satisfies **AC-7**, **AC-8**
7. Add the debug lines and the kit K key; measure the size and the frame rate, satisfies **AC-10**, **AC-11**

## Consequences

**Positive**:
- Walking feels like BlockWords because it is BlockWords' code, including its tested collisions and step up.
- One use action serves chests (feature 8), riddles (11), finds (12), word blocks (13) and mining (23).
- Pupils can play with the arrow keys alone, which helps children who find the mouse hard.
- The sea rescue means a pupil can never be lost or stuck.

**Negative / tradeoffs**:
- Mouse capture confuses some children the first time (the pointer disappears); the hint and Esc to the pause menu soften it.
- Phone controls are new code that BlockWords never tested; they need a real phone check.
- Left click is the use action now; mining (feature 23) must share the click with it (use wins when a usable thing is in front).
- Another copied BlockWords file (`player.js`) to keep in step by hand.

**Neutral**:
- `look.js` from spec 0004 is deleted.
- The pause menu now also frees the mouse.
- `bw/audio.js` gains BlockWords' splash sound.

## Follow-up

- [ ] Feature 7 (beach island): every island gives a `start` point and facing.
- [ ] Features 8, 11, 12 and 13 add their chests, villagers, finds and word blocks with `targets.add`.
- [ ] Feature 23 (mining): share the click with use (use wins on a target) and add hold to break on phones.
- [ ] Try walking on a real budget Android phone and an iPhone (together with spec 0004's owed phone check).
