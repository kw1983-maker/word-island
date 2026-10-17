# 0012. Build the Unit 7 clothes town island the same way as the Unit 3 and Unit 9 islands

**Date**: 2026-10-17
**Status**: In Progress

## Summary

Unit 7 (Super Minds pp. 82-93, Get dressed!) gets its own Treasure Quest island, played exactly like the Unit 9 and Unit 3 islands: 12 chests, coins, the finish screen, mining and placing. Only the content changes. The island is a clothes town: a clothes shop, a washing line of clothes, a hat stall, a stage for the cool cat song, a clothes rail by the houses, the park bench where Gary's cap sits, the big tree on the hill with the bird from the story, stairs with six spiders (the sp / st phonics), and a small farm with a sheep, a cow and a cotton field for the materials lesson. Unit 7 is Year 2, so the Year 2 rules apply: 3 choices per question, up to 2 gold challenge chests, spelling words up to 8 letters, and 3 to 6 sentences for the word blocks.

## Teacher's picks (2026-10-17)

- Look: **Clothes town** (shop, washing line, cool cat stage, story park, spider stairs, small farm).
- Going live: **push live straight away** once the checks pass, and rebuild and deploy the quiz copy.

## Acceptance criteria

- **AC-1**: `quest/?unit=u7` opens the clothes town island built from `quest/islands/u7-map.js` (64 by 64 at most, sea level 6), with the pupil starting on the pier in the south, facing north up the path.
- **AC-2**: `quest/islands/u7.js` is a Year 2 island (`year: 2`, `bonus: 20`) with 12 spots (6 chest, 2 riddle, 2 find, 2 blocks) at the anchors `pier-end`, `clothes-shop`, `washing-line`, `cat-stage`, `bird-tree`, `stairs`, `sheep`, `cotton-field`, `cow`, `hat-stall`, `park-bench`, `wardrobe`, with 4 to 6 Unit 7 riddles and 3 to 6 sentences; questions come from `units/u7.js`. Until Release 4, every spot plays as a chest (as on the other islands).
- **AC-3**: `node tools/check-quests.mjs` passes for all three islands (reachability on foot, no traps, path joined and 150 to 350 blocks, near every anchor, word things in the Unit 7 questions and away from anchors, villagers off the path).
- **AC-4**: New pixel tiles in BlockWords' 16 pixel style (our own art): `tshirt`, `jeans`, `socks`, `shoes`, `boots`, `cap`, `hat`, `jacket`, `sweater`, `skirt`, `gloves`, `sheep`, `cow`, `cotton_plant`, `bird`, `cool_cat`. Clothes and animals are word things that show and say their word (no coins).
- **AC-5**: `shared/quest.js` lists `u7`, so Word Island's Unit 7 page shows the locked "06 Treasure Quest" card, opened by finishing the five Unit 7 games or by `?open=all`.
- **AC-6**: The Unit 3 and Unit 9 islands play as before.

## Build plan

1. Island file `quest/islands/u7.js` with spots, riddles and sentences, AC-2
2. New tiles and blocks, AC-4
3. Map file `quest/islands/u7-map.js` using the existing helpers, AC-1, AC-3
4. Turn the island on in `shared/quest.js`, AC-5
5. Checker and browser checks (Units 7, 3 and 9), AC-3, AC-6
