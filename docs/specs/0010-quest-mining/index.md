# 0010. Break, collect and place blocks like BlockWords, in about a second, with the puzzles and the island floor kept safe

**Date**: 2026-10-17
**Status**: In Progress

## Summary

Pupils can now dig and build on the island. Holding the left mouse button (or holding the Use button on a phone) on a block cracks it, BlockWords style, and after about a second it breaks and goes into the hotbar; its name shows above the hotbar and is read aloud the first time that kind is collected. Right click (or a Place button on a phone) puts the selected block back into the world, even on water, for bridges and towers. Chests, the word things, the bottom of the world and anything deeper than one block below the ground can't be broken, so every puzzle stays reachable and nobody gets stuck in a pit. Nothing is saved: each play starts with the island as designed and an empty hotbar.

## Requirements

**User stories**:
- As a pupil who is 7, I want to break blocks and collect them, like in BlockWords, so that exploring the island is more fun.
- As a pupil, I want to hear the name of each new block I collect, so that I learn new words while I dig.
- As a pupil, I want to place the blocks I collected, so that I can build towers, bridges and houses.
- As the teacher, I want the chests and word things to stay safe, so that every pupil can still finish the island.

**Acceptance criteria**:
- **AC-1**: On a laptop, holding the left button on a block within reach (4 blocks) cracks it in BlockWords' ten crack stages over about 1 second, with BlockWords' dig sound and the hand swinging, then it breaks with the break sound. Plants, flowers and other sprites break at once. Letting go or looking away resets the crack.
- **AC-2**: A broken block goes into the hotbar as the same kind (a wet sand block gives Wet Sand): onto a stack of that kind with room (up to 64), else into the first empty slot. Its name (the block's label, such as "Wet Sand") shows in the hint bar for 2 seconds, and the voice reads it the first time that kind is collected in this play. A sprite resting on the broken block (a flower, a shell) is collected with it.
- **AC-3**: When the block can't go into the hotbar (no room), it does not break, and the hint bar says "Your hotbar is full".
- **AC-4**: Right click on a laptop, or the phone's Place button (shown only while the selected slot holds a block), places one of the selected block against the face of the block you look at, within reach, with the place sound; the slot's count goes down and an emptied slot clears. A block can be placed into air or water, never inside the pupil, outside the island (x and z 0 to 63, y below 31) or into a protected block.
- **AC-5**: On a phone, holding the Use button for about a third of a second or more breaks the block in the middle of the screen the same way; a quick tap still uses what is in front (spec 0005).
- **AC-6**: Use wins: while a chest or word thing is in front, a click, E, or the Use button uses it, and holding never cracks it.
- **AC-7**: Protected blocks never crack or break, and the hint bar says "You can't break this." (at most once every 2 seconds): every chest (closed or open) and the block under it; every word thing and the blocks holding it up, down to and including the ground under it; bedrock; water; and any block with water directly above it.
- **AC-8**: Only blocks at or above the island's starting ground in their column can break (the top ground block and anything built or placed on it), so a dug dip is never deeper than one block. Blocks below it say "You can't break this." as in AC-7.
- **AC-9**: Each play starts with the island as the map builds it and an empty hotbar; nothing is stored, and a reload or Play again resets both. Chests, the counter and the island finish (specs 0007 and 0008) work as before; mining gives no coins.
- **AC-10**: Breaking or placing a block takes under 50 ms in the test browser, and mining adds no more than 8 KB compressed.

## Decision

**Chosen option**: Option 2: a new `quest/js/mining.js` that copies BlockWords' crack textures, timing loop and break and place rules, but sends blocks straight into the existing hotbar, works out protected blocks and the starting ground from the map when the island is built, and shares the use input with spec 0005's targets.

**Implementation skills**: `threejs-textures` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-textures/`) for the crack overlay.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (nothing stored; confirmed with you):

| Piece | Where | Fields | Rules |
|---|---|---|---|
| Hotbar slots (existing) | `hud.js` | 9 × (`{ item, count }` or null), the selected slot | `count` 1 to 64; starts empty on normal play (`&kit` keeps its sample hotbar) |
| Mining | `mining.js` | `target` ("x,y,z" or null), `progress` (seconds), `stage` (0 to 9) | `BREAK = 1.0` s for solid blocks, 0 for sprites (`render: 'cross'`); resets when the target changes or the hold ends |
| Starting ground | `mining.js`, from the map at build | per column (64 × 64), `groundY` | the highest block in the column, in the map as built, whose kind is a ground kind: `grass_block`, `dirt`, `dirt_path`, `sand`, `wet_sand`, `stone`, `gravel`, `clay`, `cobblestone`; a block may break only when `y >= groundY` |
| Protected | `mining.js`, from the map and chests at build | a set of "x,y,z" | each anchor block and the block under it; each word thing block and every block under it down to and including its column's `groundY`; plus the live rules: bedrock, water, a block with water above |
| Collected kinds | `mining.js` | a set of block names | the voice reads a name only when its kind is new to the set |

**State transitions** (one hold): idle → holding on a breakable block (crack stages 0 to 9 over 1 s) → broken (collected) → idle; looking at another block restarts at stage 0; letting go returns to idle.

**Interface surface** (ES modules in `quest/js/`):

| Function | Inputs | Outputs | Notes |
|---|---|---|---|
| `mining.start({ quest, world, scene, camera })` in `mining.js` | the quest (map, anchors), the world, scene, camera | the crack mesh, protected set, starting ground | after `chests.start`, so chest blocks exist |
| `mining.update(dt)` | step time | crack progress, breaks | from the main update loop, after `targets.update()` |
| `controls.input.mine` (boolean) in `controls.js` | left button held (laptop, captured or not dragging) | | set false when a pause, screen or talk box covers the game (spec 0005's clear) |
| `controls.onPlace(fn)` in `controls.js` | right click | | the context menu is blocked on the island canvas |
| `touchpad` Use button in `touchpad.js` | hold of 0.3 s or more | sets `input.mine` while held; a shorter tap stays "use" | the Place button shows while `hud.selected()` holds a block |
| `hud.add(name)` / `hud.take()` in `hud.js` | a block name / none | true when it fitted / the block placed | stacks to 64; `take` lowers the selected slot's count |
| `world.setBlock` + `world.rebuildDirty` (spec 0004) | | the change | existing |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Break | which block | `world.raycast` from the camera within 4 blocks (the same reach as targets, spec 0005) |
| Break | allowed | not a target in front (AC-6), not in the protected set, not bedrock or water, no water above, `y >= groundY[x][z]` |
| Break | time | 1.0 s, or 0 for `render: 'cross'` blocks |
| Crack | stage | `floor(progress / BREAK × 10)`, BlockWords' crack textures |
| Collect | kind and name | the block's `name` and `label` from `bw/blocks.js` |
| Collect | read aloud or not | whether the kind is already in Collected kinds |
| Collect | room | `hud.add(name)` (a stack below 64 of that kind, or an empty slot) |
| Hint bar | messages | the label; "Your hotbar is full"; "You can't break this." |
| Place | which block | the selected hotbar slot (`hud.selected()`) |
| Place | where | the empty cell on the hit face (`hit` + face normal) |
| Place | allowed | the cell is air or water, inside the island, not protected, and not overlapping the player's body box |
| Sounds | effects | `dig` while cracking, `break` on breaking, `place` on placing, each with the block's material (spec 0004 quest sounds) |
| Starting ground | per column | the map's placed blocks at build time (the ground kinds rule) |
| Protected | blocks | the map's anchors and word things (spec 0006) |

**Key invariants**:
- A chest or word thing never loses its block or the blocks holding it up.
- No dip is ever deeper than one block below the starting ground, so a pupil can always step or jump out.
- The hotbar never holds more than 64 of a kind in a slot, and a break never loses a block.
- Placing never puts a block inside the pupil or into a protected block.
- Nothing about mining is stored; every play starts from the map.

**Security model**: nothing new is stored or sent.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path (laptop): hold on sand for 1 s: cracks, breaks, "Sand" shows and is read; hold on another sand: shown, not read again; right click on the ground: a sand block appears and the count drops, verifies **AC-1**, **AC-2**, **AC-4**
- Phone: hold Use on grass for a second: it breaks; tap Use on a chest: the talk box opens; select sand: Place appears and places, verifies **AC-4**, **AC-5**, **AC-6**
- Protected: hold on a chest, the block under it, a flag post, bedrock and a block under shallow water: none crack; "You can't break this.", verifies **AC-7**
- Depth: break the grass top, then try the dirt under it: refused, verifies **AC-8**
- Full: fill all 9 slots with 64: the next break is refused with "Your hotbar is full", verifies **AC-3**
- Placing limits: right click so the new block would be inside the pupil, outside the island or on a chest: nothing placed; on shallow water: placed, verifies **AC-4**
- Reload: the island and the empty hotbar are back; all chests still open and the finish still works, verifies **AC-9**

## Build plan

Skateboard: first a pupil can break and collect on a laptop, then the safety rules, then building, then phones, then the checks.

1. Write `mining.js` with BlockWords' crack textures and the hold to break loop (1 s, sprites at once), sounds and swing, collect into `hud.add` with the name line and first time reading, "Your hotbar is full", and use wins over a target; add `input.mine` to `controls.js` and call `mining.update` from `main.js`, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-6**, **AC-9**
2. Work out the starting ground and the protected set from the map and chests when the island is built, and refuse breaking them with "You can't break this.", satisfies **AC-7**, **AC-8**
3. Add placing on right click with `hud.take`, the place rules and the place sound, satisfies **AC-4**
4. Add the phone hold on Use to break and the Place button, satisfies **AC-4**, **AC-5**
5. Measure the break and place time and the size, satisfies **AC-10**

## Consequences

**Positive**:
- The island becomes a BlockWords style sandbox while the puzzles stay safe.
- Every block kind is a new word to hear.
- Feature 24 (crafting) can take its materials from the hotbar.

**Negative / tradeoffs**:
- Pupils can make a mess of the island for the rest of a play (walls across the path, holes in the beach); a reload fixes it.
- One block deep digging is less freedom than BlockWords.
- Holding Use on a phone does two jobs (tap to use, hold to break), which some children may take a moment to learn.
- The island checker proves the island as built, not after mining; the protection and depth rules are what keep it fair.

**Neutral**:
- Water does not flow (the world has no water movement), so a hole next to the sea stays dry.
- Breaking a palm trunk can leave leaves or the koala floating, as in BlockWords.

## Follow-up

- [ ] Feature 24 (crafting): use the hotbar's blocks as materials.
- [ ] Consider a "Back to the path" button in the pause menu if pupils manage to wall themselves in with placed blocks.
