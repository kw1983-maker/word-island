# 0006. Rationale: the Unit 9 beach island

## Context

Treasure Quest can now be walked (spec 0005), but only on a small test beach built in `quest/js/testscene.js` to judge the look. The Unit 9 island file (`quest/islands/u9.js`, spec 0002) already names 12 puzzle spots by anchor (`pier-end`, `hut`, `rock-pool` and so on), and those anchors point at places no map defines yet. Feature 8 (chests) cannot place anything until they exist.

The island has to work for 7 year olds on budget phones and laptops. It must fit the copied BlockWords world (at most 64 by 64 blocks, 32 high, sea level 6), look like the Unit 9 pages, and take about 10 minutes with its puzzles. A child using only the phone joystick must reach every puzzle, and nobody may end up stuck in a pit or lost on a featureless beach. The look must stay BlockWords' own style; Minecraft's art and name are never used.

Eight more islands follow (features 15 to 22). Whatever shape the first map takes is the shape all of them will copy, so its format matters more than one island's worth of work. The teacher cannot easily playtest every corner of every island, so mistakes in level design need catching before an island goes live, the way `tools/check-quests.mjs` already catches mistakes in the island content.

Without a decision, the test beach would keep growing by hand with no checks, and every later island would repeat the same unchecked work.

## Options considered

### Option 1: Grow the test beach builder into the Unit 9 island

Keep one hand written builder function like `testscene.js`, rename it, and add the Unit 9 landmarks inline.

**Pros**:
- The least new code; the test beach already builds land, a house, a tree and a chest this way.

**Cons**:
- The builder imports Three.js and the world, so the checker cannot run it in Node to prove spots are reachable.
- Nothing is shared with the next eight islands; each would copy and edit the whole file.
- Anchors would be loose numbers in code, not data feature 8 can look up.

### Option 2: A map data module per island with shared shape helpers (chosen)

`quest/islands/u9-map.js` exports the island as data (sea level, start, anchors, word things, villagers) plus a pure `blocks()` function that builds the land by calling helpers in `quest/js/mapkit.js` (land, hill, path, palm tree, house, pier, lighthouse). One generic `quest/js/island.js` turns any map into the scene. The checker imports the same map in Node and walks it.

**Pros**:
- The checker can prove every anchor is reachable on foot and that no place traps a pupil, before the island goes live.
- The helpers make later islands short map files.
- Anchors are named data that feature 8 and the checker both read.

**Cons**:
- More files than option 1 (a helper module, a map file, an island builder).
- The helpers must stay free of Three.js and the page, a rule the build has to keep.

### Option 3: Text picture layers

Draw the island as rows of letters, one grid per height level, and turn each letter into a block.

**Pros**:
- You can see the island's shape by looking at the file.

**Cons**:
- A 64 by 64 island with a 6 block hill and a lighthouse needs many layers of 64 rows each; the file becomes long and easy to break by one wrong letter.
- Small objects (a sandcastle, an umbrella) repeat across many layers and are hard to move.

### Option 4: Land shaped from a seed, landmarks placed by hand

Generate the land from noise (as BlockWords does) and drop the landmarks on it.

**Pros**:
- Each island, or each play, could look different.

**Cons**:
- Hard to promise every spot is reachable and the path makes sense on land nobody designed.
- The look of each island is less controlled, and it drifts from the Unit 9 pages.

## Rationale

The forces that decide this are the checker and the eight islands still to come. Only a map whose blocks come from pure code can be walked by the checker in Node, and the reachability proof (walk only, no traps) is what makes the "every spot can be reached" promise true without the teacher playtesting every island on a phone. Option 1 ties the land to Three.js and loses that proof; option 4 makes the proof hard to satisfy at all.

Option 2 also turns the first island's work into tools for the next ones: a hill, a path, a palm tree and a house are the same on every island, and a new island becomes a map file plus a few new helpers. Option 3 is the most visual, but at this size it trades one clear problem (reading code) for a worse one (editing thousands of letters), and small objects do not fit layers well.

Your choices shaped the rest: a round island with a gentle 6 block hill keeps a landmark in view from everywhere; a path loop past every spot is the simplest way for a 7 year old to find all 12; walk only reachability keeps the island fair for joystick pupils; about 12 new pixel tiles in BlockWords' style make it look like a beach without the cost of models; and keeping motion to the sky, sea and villagers' heads keeps budget phones fast. Word things reuse spec 0005's use targets and spec 0003's voice, so the extra word practice costs almost nothing.

Two calls were mine. The anchor stores the empty block where the puzzle object will sit plus the direction it faces, because feature 8 needs both and the checker can find standing places around it (runner up: store where the pupil stands, which ties the anchor to one approach). The fish sit one block under shallow water in the rock pool, seen through the water, because a block cell holds only one thing and a fish in a water cell would punch a hole in the water surface (runner up: fish in a bucket on the pier, which loses the fun of spotting them).
