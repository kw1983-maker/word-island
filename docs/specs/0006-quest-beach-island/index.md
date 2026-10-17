# 0006. Build the Unit 9 beach island from a map file with shared shape helpers, checked so every spot can be walked to

**Date**: 2026-10-17
**Status**: In Progress

## Summary

The test beach is replaced by the real Unit 9 island: one round sandy island with a gentle grassy hill in the middle, a lighthouse on a rocky point, a pier, a small village with three villagers, and Unit 9 beach things (shells, sandcastles, fish, a football, kites, flags, a koala) drawn in BlockWords' pixel style. A sandy path loops past all 12 puzzle spots, so a 7 year old who follows it finds everything, and every spot can be reached by walking alone. The island lives in its own map file (`quest/islands/u9-map.js`) built with shared helpers (hill, path, palm tree, house, pier) that later islands reuse, and the island checker proves every spot is reachable before the island goes live. Beach things you look at and use say their word aloud, for extra word practice with no coins.

## Requirements

**User stories**:
- As a pupil who is 7, I want a beach island that looks like the Unit 9 pages, so that I recognise the words I learn while I explore.
- As a pupil, I want a path that takes me past every puzzle, so that I never get lost or miss one.
- As a pupil on a phone, I want to reach every puzzle by walking with the joystick, so that I never need a tricky jump.
- As the teacher, I want the island checked before it goes live, so that no pupil meets a spot they cannot reach.

**Acceptance criteria**:
- **AC-1**: Normal play and `&kit` open the Unit 9 beach island built from `quest/islands/u9-map.js` (at most 64 by 64 blocks, sea level 6): one round island with sand all round and shallow water at its edge, a gentle grassy hill in the middle whose top is about 6 blocks above the beach, a rocky point with a lighthouse, a wooden pier, a small village (the riddle hut plus 2 or 3 small beach houses) and an ice cream cart. The test beach (`quest/js/testscene.js`) is deleted; the `&kit` sample chest and villager stand on the real island.
- **AC-2**: The map defines all 12 anchors that `quest/islands/u9.js` names (`pier-end`, `palm-tree`, `boat`, `big-rock`, `hill-top`, `lighthouse`, `hut`, `ice-cream-cart`, `rock-pool`, `beach-towel`, `bench`, `sandcastle`), each at the landmark its name says. The lighthouse anchor is at the lighthouse door (the lighthouse cannot be entered).
- **AC-3**: A path (BlockWords' path block) loops round the island and passes within 3 blocks of every anchor. It starts at the pupil's feet and comes back there. Walking the whole loop is 150 to 350 blocks (about 35 to 80 seconds at walking speed), so the island with its puzzles takes about 10 minutes.
- **AC-4**: The pupil starts on the beach by the pier, standing on the path, facing the hill (the map's `start`).
- **AC-5**: Every anchor can be reached from the start by walking and stepping up one block at a time, never needing a jump; and from every place a pupil can walk to, they can walk back to the start the same way (no pits or ledges that trap them; deep water still rescues them as in spec 0005). `tools/check-quests.mjs` checks both and fails, naming the place, when either breaks.
- **AC-6**: Unit 9 beach things stand around the island as decoration: shells and small sandcastles with flags; a fishing spot on the pier with a fishing rod, fish in the rock pool, and a second small boat; a football, kites, beach umbrellas, towels, and a bucket and spade; the flags of the UK, Canada and Australia; and a koala in a palm tree. They are drawn with about 12 new tiles in BlockWords' own pixel style (never Minecraft's art or name).
- **AC-7**: Some beach things are word things. Looking at one within reach shows its label (`<word> · click or E` on a laptop, `<word> · tap` on a phone, as spec 0005 targets do); using it shows the word in the hint bar for 2 seconds and the voice reads it aloud. It gives no coins and changes no score. Every word thing's word appears in the Unit 9 bank (`units/u9.js`), checked by the island checker.
- **AC-8**: Three BlockWords villagers stand still in the village, off the path and away from every anchor. Each turns its head to look at the pupil while the pupil is within 8 blocks (the head turns at most 70 degrees either way, then stops).
- **AC-9**: Only the sky, the sea and the villagers' heads move. The sound stays BlockWords' music and the existing step sounds; nothing new is added.
- **AC-10**: With `&debug`, a floating label (`s1 pier-end` … `s12 sandcastle`) shows above every anchor, and the debug view adds a line naming the nearest anchor and its distance.
- **AC-11**: If an anchor named in `u9.js` is missing from the map, the island checker fails and names it. If one still slips through, that spot is left out with a console warning, the island still plays, and the coin total and "N left" count only the spots that were placed.
- **AC-12**: The island builds in under 400 ms in the test browser, and at phone size (844 by 390) with the processor slowed 6 times, walking round it stays at 30 fps or better (the quality step may drop to 0.75, as in specs 0004 and 0005). The map file, the shape helpers, the island builder and the new tiles add no more than 15 KB compressed.

## Decision

**Chosen option**: Option 2: a map data module per island (`quest/islands/u9-map.js`) built with shared shape helpers (`quest/js/mapkit.js`), loaded by one generic island builder (`quest/js/island.js`), and checked in Node by `tools/check-quests.mjs`.

The map file describes the island (land, landmarks, beach things, anchors, word things, villagers) by calling small helpers; the same helpers will build the eight later islands. The checker runs the same map code in Node and walks it to prove AC-2, AC-3, AC-5, AC-7 and AC-11 before the island goes live.

**Implementation skills**: `threejs-fundamentals` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-fundamentals/`) · `threejs-textures` (`cloudai-x/threejs-skills`, `.agents/skills/threejs-textures/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (nothing is stored on the device or online; confirmed with you):

| Entity | Where | Fields | Rules |
|---|---|---|---|
| IslandMap (one per island) | default export of `quest/islands/u9-map.js` | `unit` ("u9"), `seaLevel` (whole number, 6), `start` {`x`, `y`, `z` feet, `yaw`}, `blocks()` (returns the placed block list, spec 0004 form), `anchors`, `things`, `villagers`, `kit` (optional) | `start` stands on the path by the pier, facing the hill; `blocks()` is pure (no Three.js, no browser), so Node can run it |
| Anchor (12 per map) | `IslandMap.anchors` | `name` (string, required), `at` {`x`, `y`, `z`} (the empty block where a puzzle object will sit, required), `face` (yaw the object faces, toward the path, required) | `name` unique in the map; `at` is air with a solid block under it; at least one standing place within 2 blocks of `at` |
| WordThing (many per map) | `IslandMap.things` | `at` {`x`, `y`, `z`} (the block the thing occupies, required), `word` (shown text, required, e.g. "shells"), `say` (read aloud text, optional, defaults to `word`) | `word` appears in the unit bank's text; `at` is at least 3 blocks from every anchor, so a word thing never sits in front of a puzzle |
| Villager (3 per map) | `IslandMap.villagers` | `at` {`x`, `y`, `z`} feet, `yaw` (facing) | not on a path block, at least 3 blocks from every anchor, standing on solid ground |
| Kit places (optional) | `IslandMap.kit` | `chest` {`x`, `y`, `z`}, `villager` {`x`, `y`, `z`} | used only by `&kit`; free ground near the start, off the path |
| Placed block | returned by `blocks()` | `{ x, y, z, kind }` or a `fill` box `{ x0, x1, y0, y1, z0, z1, kind }` | as spec 0004: unknown `kind` skipped with a warning; later entries replace earlier ones |

Links: each `u9.js` Spot `anchor` names exactly one Anchor `name`; an Anchor is used by at most one Spot. Word things and villagers link to nothing.

**New blocks** (added to `quest/js/bw/blocks.js` and `atlas.js` like `wet_sand`, each tile drawn in BlockWords' 16 pixel style; the koala is the first to drop if time runs short):

| Block | Render | Solid | Notes |
|---|---|---|---|
| `palm_leaves` | cube, see through like `oak_leaves` | yes | palm tree tops (trunks are `oak_log`) |
| `shell` | cross | no | on sand |
| `fish` | cross | no | placed one block under the water in the rock pool, seen through the water |
| `football` | cross | no | |
| `kite` | cross | no | the top cell of a kite |
| `kite_string` | cross | no | the cells under a kite, down to the ground |
| `bucket_spade` | cross | no | one tile showing both |
| `flag_uk`, `flag_ca`, `flag_au` | cross | no | a small flag on a stick, on posts and sandcastles |
| `towel` | low cube, height 1/16 | no (walk over it) | striped beach towel |
| `koala` | cross | no | sits in a palm tree |

Umbrellas are coloured wool canopies on an `oak_log` pole; boats, the pier, the bench and the ice cream cart are built from `oak_planks`, `oak_log` and wool; the lighthouse from white and red wool with glass at the top; the big rock and the rocky point from `stone`, `cobblestone` and `gravel`.

**Shape helpers** (`quest/js/mapkit.js`, pure functions that add placed blocks to a list; no Three.js):

| Helper | Makes |
|---|---|
| `land(list, { size, seaLevel, radius, beach, shallow })` | the round island: bedrock, stone, sand beach ring, grass inside, a ring of shallow water (one block of water over sand) at the edge, deep sea beyond |
| `hill(list, { x, z, radius, height })` | a gentle grassy hill in terraces of one block, so it can be walked up |
| `path(list, points)` | path blocks along straight runs between points, following the ground height, steps of at most one block |
| `palm(list, { x, z, height, koala })` | an `oak_log` trunk with a `palm_leaves` crown, optionally a koala |
| `house(list, { x, z, w, d, door })` | a small beach house (plank walls, log corners, glass windows, a doorway, a roof) |
| `pier(list, { x, z, length, dir })` | a plank pier on log posts out over the water |
| `lighthouse(list, { x, z })` | a white and red tower with a glass top on the rocky point, door facing the path, no way in |
| `boat`, `sandcastle`, `umbrella`, `towel`, `kite`, `flagPost`, `cart`, `bench`, `rock`, `rockPool` | the small landmarks and beach things |

**Interface surface** (ES modules unless named):

| Function | Inputs | Outputs | Notes |
|---|---|---|---|
| `blocks()` in `quest/islands/u9-map.js` | none | the placed block list | calls `mapkit.js` helpers; also imported by the checker in Node |
| `buildIsland(camera, map)` in `quest/js/island.js` | the camera, the IslandMap | `{ scene, update, world, start, anchors, villagers }`, where `anchors` maps name → `{ at, face }` | replaces `buildTestScene`; builds the world, sea and sky as the test beach did, adds villagers (spec 0004 model) and registers each word thing as a use target |
| `targets.add({ at, label, onUse })` (spec 0005) | a word thing | a use target | `label` is the word; `onUse` shows `notice(word)` and calls `voice.say(say)` |
| `loadMap(id)` in `main.js` | unit id | the IslandMap or null | loaded alongside `quest/islands/<id>.js`; a map that does not load is handled like a missing island file (the "not open" screen, as today) |
| `quest.anchors` in `main.js` | | name → `{ at, face }` | what feature 8 (chests) reads to place each spot's object |
| `checkMap(island, map, unit)` in `tools/check-quests.mjs` | the island file, its map, the unit bank | problem lines | anchors present and unique, reachable on foot, no traps, path near every anchor and its length, words in the bank, villagers and word things away from anchors and off the path |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Build the island | every block | `u9-map.js` `blocks()`, built with `mapkit.js` helpers |
| Build the island | sea height, sea plane | `map.seaLevel` |
| Start | feet position and facing | `map.start` |
| Place a puzzle (feature 8) | where and which way | `map.anchors[name].at` and `.face`, looked up by the spot's `anchor` in `u9.js` |
| Coins total, "N left" | how many spots | the spots whose anchor exists in the map (`islandMax` over placed spots) |
| Word thing label | the word | `thing.word` |
| Word thing reading | the text read aloud | `thing.say`, else `thing.word`; voice from spec 0003 (`voice.say`) |
| Word thing hint bar | the line and how long | `thing.word`, 2 seconds (`notice` default, spec 0005) |
| Villager head turn | angle | from the villager's position, its `yaw` and the pupil's eye position each frame, limited to 70 degrees either way, only within 8 blocks |
| Debug anchor labels | text and place | spot `id` from `u9.js` plus anchor `name`, drawn 1.5 blocks above `at` |
| Debug nearest anchor | name and distance | the anchor nearest the pupil's feet, measured flat (x and z) |
| Reachability check | standing places | a block is a standing place when it is not solid, the block above is not solid, and the block under it is solid or shallow water over solid; moves go to the four neighbours, up at most one block, down any height; deep water and outside the island are not standing places |
| Path length check | blocks | the count of path blocks on the loop from the start back to the start |
| Word in bank check | the unit text | every string in `units/u9.js` questions and answers, matched without caring about capitals |
| `&kit` chest and villager | where | `map.kit` |

**Key invariants**:
- Every anchor named in the island file exists in its map, and no two anchors share a name.
- Every anchor has a standing place within 2 blocks that the start can reach without jumping.
- Every standing place the start can reach can reach the start again without jumping.
- The path passes within 3 blocks of every anchor, and starts and ends at the start.
- No word thing or villager is within 3 blocks of an anchor; no villager stands on the path.
- `u9-map.js` and `mapkit.js` never import Three.js or touch the page, so the checker can run them in Node.
- Puzzles still change every play (spec 0002); the map itself is the same every play.

**Security model**: nothing new is stored or sent. The map and its words are static files in the repository; the voice reads only words written in the map file.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: open the quest, start by the pier facing the hill, follow the path all the way round, pass all 12 anchors, come back to the start, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**
- Phone, joystick only: reach every anchor without pressing Jump, verifies **AC-5**
- Failure case: rename an anchor in a copy of the map, run the checker: it fails naming the anchor; open the quest with the broken copy: the island plays with 11 spots and the counts say 11, verifies **AC-11**
- Failure case: add a two block deep pit to a copy of the map: the checker fails naming the place, verifies **AC-5**
- Word thing: look at the shells, press E: "shells" shows for 2 seconds and is read aloud; the coins do not change, verifies **AC-7**
- Villagers: walk past the village: each villager's head follows you within 8 blocks and stops at 70 degrees, verifies **AC-8**
- Debug: `&debug` shows 12 floating labels and the nearest anchor line, verifies **AC-10**
- Speed: build time and the slowed phone size walk, verifies **AC-12**

## Build plan

Skateboard: the first step already gives pupils a whole island to walk round; each later step makes it richer.

1. Write `quest/js/mapkit.js` (`land`, `hill`, `path`, `palm`, `house`, `pier`), `quest/islands/u9-map.js` with the land, the hill, the path loop and the `start`, and `quest/js/island.js` (`buildIsland`) in place of `testscene.js`; load the map in `main.js` alongside the island file; move the `&kit` chest and villager to `map.kit`; delete `testscene.js`, satisfies **AC-1**, **AC-3**, **AC-4**
2. Add the landmarks and the 12 anchors (lighthouse on the rocky point, pier end, boat, big rock, hill top, hut and beach houses, ice cream cart, rock pool, beach towel, bench, sandcastle, palm tree), expose `quest.anchors`, and draw the `&debug` anchor labels and nearest anchor line, satisfies **AC-1**, **AC-2**, **AC-10**
3. Add `checkMap` to `tools/check-quests.mjs` (anchors, reachability on foot, no traps, path near anchors and its length, villagers and word things away from anchors) and leave out missing anchors at runtime with the counts following, satisfies **AC-3**, **AC-5**, **AC-11**
4. Add the new blocks and tiles to `bw/blocks.js` and `bw/atlas.js`, and place the beach things (shells, sandcastles with flags, fishing spot and rod, fish in the rock pool, second boat, football, kites, umbrellas, towels, bucket and spade, flag posts, koala), satisfies **AC-6**, **AC-9**
5. Register the word things as use targets (hint bar plus voice, no coins) and add the word in bank check; place the 3 villagers with the head turn, satisfies **AC-7**, **AC-8**
6. Measure build time, the slowed phone size walk and the compressed size, satisfies **AC-12**

## Consequences

**Positive**:
- Pupils get a real Unit 9 island to explore, with book words in the scenery and a path that guides them.
- The checker proves reachability, so a level design slip cannot strand a pupil or hide a spot.
- `mapkit.js` makes the next eight islands mostly a matter of writing a map file.
- Feature 8 (chests) only needs `quest.anchors` to place every spot.

**Negative / tradeoffs**:
- About 12 new tiles must be drawn by hand in code in BlockWords' style; this is the slowest part to get looking right.
- Cross sprites (flags, kites, koala) look flat from some angles, as BlockWords' flowers do.
- The map is fixed: replaying the island shows the same land (only the puzzles change).
- The reachability check models walking, not the exact player physics; a narrow gap that the 0.6 wide body cannot pass would still need a real walk to catch (the build keeps paths at least 1 block wide and 2 high).
- Mining (feature 23) will change the land at runtime; the checker only proves the island as built, so mining must protect anchors and avoid traps itself.

**Neutral**:
- `testscene.js` is deleted; `&kit` keeps working on the real island.
- `villager.js` gains a pointer to the head so it can turn (a small change to copied code, noted in its header).
- `units/u9.js` and `quest/islands/u9.js` are unchanged.

## Follow-up

- [ ] Feature 8 (chests): place each spot's chest at `quest.anchors[spot.anchor].at`, facing `.face`.
- [ ] Feature 23 (mining): anchors, the path under them and word things must not be breakable away; avoid digging traps or add an unstick for pits.
- [ ] Feature 24 (crafting): reuse the `bucket_spade` and `flag` art for crafted items where it fits.
- [ ] The real phone check owed by specs 0004 and 0005 should run on this island (it is the heaviest scene so far).
- [ ] Later islands (features 15 to 22): each adds a `uN-map.js` with the shape helpers; new helpers go in `mapkit.js`.
