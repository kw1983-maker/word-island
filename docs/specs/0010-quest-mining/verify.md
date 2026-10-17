# Verify: Mining · spec 0010 · updated 2026-10-17
_Steps derived from spec 0010 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. Quest tests block Firebase, save a test pupil and mark the five Unit 9 games done (`tq.py` and `minelib.py` in the session scratchpad); `minelib.aim` stands the pupil at a spot and looks at a block's centre, `hold` holds the left button._

## UI / manual
- [ ] Laptop: hold the left button on beach sand 0.4 s and let go → it cracks, then the crack goes away and the sand stays; hold about 1 s → it breaks with the dig then break sounds and the hand swinging → AC-1 (value sourcing: time, crack stage)
- [ ] The first sand → "Sand" shows above the hotbar for 2 s, is read aloud, and slot 1 holds Sand × 1; a second sand → "Sand" shows, not read, Sand × 2 → AC-2 (value sourcing: kind and name, read aloud or not)
- [ ] A plain shell (21, 8, 51) breaks at once and goes into the hotbar as Shell; a flower on top of a broken block comes too → AC-1, AC-2
- [ ] Fill all nine slots with 64 of different blocks, hold on sand → it does not break; "Your hotbar is full" → AC-3 (value sourcing: room)
- [ ] Hold the left button on a chest → the talk box opens (use wins) and the chest never cracks; the same for a word thing → AC-6
- [ ] Hold on a flag post, the block under a chest, a sandcastle keep, the koala, bedrock, sand under shallow water → no crack; "You can't break this." (not more than every 2 s) → AC-7 (value sourcing: allowed)
- [ ] Break the grass top on flat grass (42, 8, 38), then hold on the dirt under it → refused with "You can't break this."; on the hill (40, 9, 30) the grass breaks and (40, 8, 30) does not; house walls, floors, the lighthouse, a palm trunk and pier planks do break → AC-8 (value sourcing: starting ground)
- [ ] Right click with planks selected, looking at sand two blocks away → planks appear on top, the count drops, the place sound plays; looking at shallow water → the water cell becomes planks; with the slot emptied, right click places nothing → AC-4 (value sourcing: which block, where)
- [ ] Right click straight down at the block under your feet, or into the protected air under the koala → nothing placed, the count stays → AC-4 (value sourcing: allowed)
- [ ] Phone: looking at grass → the Use button shows; a quick tap does not break it; holding Use about 1.6 s breaks it into the hotbar → AC-5
- [ ] Phone: with a block selected → a Place button shows left of Jump; tapping it places the block; it hides when the slot empties → AC-4
- [ ] Phone: a quick tap on Use at a chest → the talk box opens → AC-5, AC-6
- [ ] Reload → the island is back as designed and the hotbar is empty; all 12 chests still open and the island finish still shows → AC-9
- [ ] Opening the browser's menu with right click never happens over the island → AC-4

## Commands
- [ ] `node tools/check-quests.mjs` → `u9.js: OK`, `island list: OK` (mining changes only the running island) → AC-9
- [ ] Time `world.setBlock` + `world.rebuildDirty` for a break and a place → under 50 ms (measured 2026-10-17: 3.6 to 4.8 ms headless) → AC-10
- [ ] Compressed size of `quest/js/mining.js` plus the lines added to other `quest/` files since commit `1152eb9` → 8 KB or less (measured 2026-10-17: 5.5 KB) → AC-10

## Acceptance-criteria coverage
- AC-1 UI steps 1, 3 · AC-2 UI steps 2, 3 · AC-3 UI step 4 · AC-4 UI steps 8, 9, 11, 14 · AC-5 UI steps 10, 12 · AC-6 UI steps 5, 12 · AC-7 UI step 6 · AC-8 UI step 7 · AC-9 UI step 13, command 1 · AC-10 commands 2, 3

_Self check on 2026-10-17 (headless Chromium, `t_mine1.py` to `t_mine4.py` in the session scratchpad): every step above passed during the build._
