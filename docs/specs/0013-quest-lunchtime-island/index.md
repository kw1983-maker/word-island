# 0013. Build the Unit 4 lunchtime town island the same way as the other islands

**Date**: 2026-10-17
**Status**: In Progress

## Summary

Unit 4 (Super Minds pp. 46-57, Lunchtime) gets its own Treasure Quest island, played exactly like the Unit 9, 3 and 7 islands: 12 chests, coins, the finish screen, mining and placing. Only the content changes. The island is a lunchtime town: the school canteen with the pizza from the story, a juice stall, Tommy's kitchen with the fridge, a picnic table, a fruit stall, a pizza oven, Polly's shop with hot dogs, a lunch table with lunchboxes, a vegetable garden where corn, beans and onions grow, a coconut palm, and an apple tree on the hill. Unit 4 is Year 1, so the Year 1 rules apply: 2 choices per question, no gold chests, short spelling words, no sentences.

## Choices (2026-10-17)

The teacher asked for "the same game for unit 4" and, when the look question came up, said to continue without it, so the recommended choices from Units 3 and 7 were used:
- Look: **Lunchtime town** (canteen, kitchen, picnic, fruit stall, shop, garden, coconut palm, apple tree).
- Going live: **push live straight away** once the checks pass, and rebuild and deploy the quiz copy.

## Acceptance criteria

- **AC-1**: `quest/?unit=u4` opens the lunchtime town built from `quest/islands/u4-map.js` (64 by 64 at most, sea level 6), with the pupil starting on the pier in the south, facing north up the path.
- **AC-2**: `quest/islands/u4.js` is a Year 1 island (`year: 1`, `bonus: 20`) with 12 spots (6 chest, 2 riddle, 2 find, 2 blocks) at the anchors `pier-end`, `canteen`, `kitchen`, `apple-tree`, `pizza-oven`, `fruit-stall`, `shop`, `garden`, `juice-stall`, `coconut-palm`, `picnic`, `lunch-table`, with 4 to 6 Unit 4 riddles; questions come from `units/u4.js`. Until Release 4, every spot plays as a chest.
- **AC-3**: `node tools/check-quests.mjs` passes for all four islands.
- **AC-4**: New pixel tiles in BlockWords' 16 pixel style (our own art): `pizza`, `sandwich`, `apple`, `banana`, `orange`, `cheese`, `cake`, `milk`, `juice`, `sausage`, `chicken`, `carrot`, `peas`, `hot_dog`, `corn_plant`, `bean_plant`, `onion`, `coconut`, `lunchbox`. Food things are word things that show and say their word (no coins); each talking thing stands where nothing hides it.
- **AC-5**: `shared/quest.js` lists `u4`, so Word Island's Unit 4 page shows the locked "06 Treasure Quest" card, opened by finishing the five Unit 4 games or by `?open=all`.
- **AC-6**: The Unit 3, 7 and 9 islands play as before.

## Build plan

1. Island file `quest/islands/u4.js` with spots and riddles, AC-2
2. New tiles and blocks, AC-4
3. Map file `quest/islands/u4-map.js` on the shared park layout of specs 0011 and 0012, AC-1, AC-3
4. Turn the island on in `shared/quest.js`, AC-5
5. Checker and browser checks (all four islands), AC-3, AC-6
