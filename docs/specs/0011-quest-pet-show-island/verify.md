# Verify 0011: Unit 3 pet show island

Run on 2026-10-17 in headless Chromium (Python Playwright) against a local server, with Firebase blocked and a fake pupil.

| # | Check | Result |
|---|---|---|
| 1 | `node tools/check-quests.mjs`: u3 and u9 islands and the island list (AC-2, AC-3, AC-6) | pass |
| 2 | `quest/?unit=u3&seed=3` opens; start on the pier at 32.5, 7, 55.5 facing north; no page errors (AC-1) | pass |
| 3 | All 12 spots are placed; every puzzle has 2 choices and none is a gold chest (Year 1) (AC-2) | pass |
| 4 | Every chest opens and pays 10 coins; after the 12th the ending says "+20 bonus for finishing! You found 140 coins and 3 stars." (AC-2) | pass |
| 5 | All 13 word things (lizard, cat, dog, spider, snake, butterfly, tiger, giraffe, crocodile, frog, duck, rat, bag) show "word · click or E", then show and say "a …" (AC-4) | pass |
| 6 | Screenshots of the start, tent, hill, jungle, pond and school: the tiles and places read as the pet show park (AC-1, AC-4, AC-5) | pass |
| 7 | Word Island Unit 3: four games done shows "06 Treasure Quest · Finish all five games first."; five done shows Play and opens `quest/?unit=u3`; `?open=all` opens `quest/?unit=u3&open=all`; Unit 4 shows no sixth card (AC-6) | pass |
| 8 | Unit 9 still plays: 12 chests with 3 choices, 140 coins and 3 stars (AC-7) | pass |

Still owed (as for the Unit 9 island): a real iPhone and budget Android check.
