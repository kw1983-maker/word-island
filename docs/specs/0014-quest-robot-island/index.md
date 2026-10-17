# 0014. Build the Unit 8 robot town island the same way as the other islands

**Date**: 2026-10-17
**Status**: In Progress

## Summary

Unit 8 (Super Minds pp. 94-105, The robot) gets its own Treasure Quest island, played exactly like the Unit 3, 4, 7 and 9 islands: 12 chests, coins, the finish screen, mining and placing. Only the content changes. The island is a robot town: the robot workshop with the robot from the story on the workbench, a battery stall, a horse field and a tennis court ("Can you …?"), an animal park with Charlie Cheetah and Kate Kangaroo, a bike by the path, a music stage with a piano and a guitar, the big tree with a monkey, Dan Dolphin's pool, a museum with a skeleton, Greg's green go-kart and big bag, and a crocodile on the north beach. Unit 8 is Year 2, so the Year 2 rules apply: 3 choices per question, up to 2 gold challenge chests, spelling words up to 8 letters, and 3 to 6 sentences.

## Choices (2026-10-17)

The teacher asked to "do unit 8, same thing", so the recommended choices used for Units 3, 4 and 7 apply: the recommended look for the unit (robot town) and **push live straight away** once the checks pass, with the quiz copy rebuilt and deployed.

## Acceptance criteria

- **AC-1**: `quest/?unit=u8` opens the robot town built from `quest/islands/u8-map.js` (64 by 64 at most, sea level 6), with the pupil starting on the pier in the south, facing north up the path.
- **AC-2**: `quest/islands/u8.js` is a Year 2 island (`year: 2`, `bonus: 20`) with 12 spots (6 chest, 2 riddle, 2 find, 2 blocks) at the anchors `pier-end`, `workshop`, `music-stage`, `monkey-tree`, `pool`, `museum`, `animal-park`, `horse`, `battery-stall`, `bike`, `tennis`, `go-kart`, with 4 to 6 Unit 8 riddles and 3 to 6 sentences; questions come from `units/u8.js`. Until Release 4, every spot plays as a chest.
- **AC-3**: `node tools/check-quests.mjs` passes for all five islands.
- **AC-4**: New pixel tiles in BlockWords' 16 pixel style (our own art): `robot` with `robot_head` above it, `battery`, `horse`, `tennis`, `bike`, `piano`, `guitar`, `dolphin`, `kangaroo`, `cheetah`, `ladybird`, `monkey`, `skeleton`, `go_kart`. Talking things show and say their word (no coins) and stand where nothing hides them.
- **AC-5**: `shared/quest.js` lists `u8`, so Word Island's Unit 8 page shows the locked "06 Treasure Quest" card, opened by finishing the five Unit 8 games or by `?open=all`.
- **AC-6**: The other islands play as before.

## Build plan

1. Island file `quest/islands/u8.js` with spots, riddles and sentences, AC-2
2. New tiles and blocks, AC-4
3. Map file `quest/islands/u8-map.js` on the shared layout of specs 0011 to 0013, AC-1, AC-3
4. Turn the island on in `shared/quest.js`, AC-5
5. Checker and browser checks (all five islands), AC-3, AC-6
