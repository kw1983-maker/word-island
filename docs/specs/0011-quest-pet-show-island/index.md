# 0011. Build the Unit 3 pet show island the same way as the Unit 9 beach island

**Date**: 2026-10-17
**Status**: Accepted

## Summary

Unit 3 (Super Minds pp. 34-45, Pet show) gets its own Treasure Quest island, played exactly like the Unit 9 beach island (specs 0006 to 0010): 12 chests, coins, the finish screen, mining and placing. Only the content changes. The island is a round grassy pet show park: a striped pet show tent with a stage, animal pens, a prize stall, a big story tree on the hill with spiders and a table under it, a frog and duck pond, a small school with a desk outdoors (a bag on it, a rat under it), a jungle corner with tall grass, logs, leaves and wild animals for the camouflage lesson, and a crocodile on the north shore. About 12 Unit 3 animals stand around the island as new pixel pictures that say their word when used. Unit 3 is Year 1, so the existing Year 1 rules apply: 2 choices per question, no gold chests, short spelling words, no sentences.

## Teacher's picks (2026-10-17)

- Look: **Pet show park** (tent and pens, story tree with spiders, pond, school, jungle corner).
- Animals: **about 10 or more new pixel pictures** that say their word, like the koala on the beach island.
- Going live: **push live straight away** once the checks pass, and rebuild and deploy the quiz copy (this also ships the mining work of spec 0010).

## Acceptance criteria

- **AC-1**: `quest/?unit=u3` opens the pet show island built from `quest/islands/u3-map.js` (64 by 64 at most, sea level 6), with the pupil starting on the pier in the south, facing north up the path.
- **AC-2**: `quest/islands/u3.js` is a Year 1 island (`year: 1`, `bonus: 20`) with 12 spots (6 chest, 2 riddle, 2 find, 2 blocks) at the anchors `pier-end`, `pet-show`, `dog-pen`, `big-tree`, `pond`, `crocodile`, `school`, `prize-stall`, `log`, `tall-grass`, `desk`, `cat-pen`, and 4 to 6 Unit 3 riddles; questions come from `units/u3.js`. Until Release 4, every spot plays as a chest (as on Unit 9).
- **AC-3**: `node tools/check-quests.mjs` passes for both islands: every anchor reachable on foot without jumping, no traps, the path joined from the start, 150 to 350 blocks long and within 3 blocks of every anchor, word things in the Unit 3 questions and away from anchors, villagers off the path.
- **AC-4**: New pixel tiles in BlockWords' 16 pixel style (our own art): `cat`, `dog`, `rat`, `frog`, `duck`, `lizard`, `spider`, `snake`, `butterfly`, `tiger`, `giraffe` with `giraffe_neck` above it, `crocodile`, `spider_web`, `school_bag`, `pencil_case`. The animals are word things that show and say their word (no coins).
- **AC-5**: Shared helpers added to `quest/js/mapkit.js` for this and later islands: `tree`, `tent`, `pen`, `table`, `log` (the pond reuses `rockPool`).
- **AC-6**: `shared/quest.js` lists `u3`, so Word Island's Unit 3 page shows the locked "06 Treasure Quest" card, opened by finishing the five Unit 3 games or by `?open=all`.
- **AC-7**: The Unit 9 island plays as before.

## Build plan

1. Island file `quest/islands/u3.js` with spots and riddles, AC-2
2. New tiles and blocks, AC-4
3. Map helpers, AC-5
4. Map file `quest/islands/u3-map.js`, AC-1, AC-3
5. Turn the island on in `shared/quest.js`, AC-6
6. Checker and browser checks (Unit 3 and Unit 9), AC-3, AC-7
