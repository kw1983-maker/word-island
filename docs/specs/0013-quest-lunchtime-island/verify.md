# Verify 0013: Unit 4 lunchtime town island

Run on 2026-10-17 in headless Chromium (Python Playwright) against a local server, with Firebase blocked and a fake pupil.

| # | Check | Result |
|---|---|---|
| 1 | `node tools/check-quests.mjs`: u3, u4, u7 and u9 islands and the island list (AC-2, AC-3, AC-5) | pass |
| 2 | `quest/?unit=u4&seed=3` opens; start on the pier at 32.5, 7, 55.5 facing north; no page errors (AC-1) | pass |
| 3 | All 12 spots are placed; every puzzle has 2 choices and none is a gold chest (Year 1) (AC-2) | pass |
| 4 | Every chest opens and pays 10 coins; after the 12th the ending says "+20 bonus for finishing! You found 140 coins and 3 stars." (AC-2) | pass |
| 5 | All 16 word things (pizza, cheese, two sandwiches, banana, corn, onion, two coconuts, two apples, bananas, orange, carrots, hot dog, juice, lunchbox), looked at from the side a pupil walks up to, show "word · click or E", then show and say it (AC-4) | pass |
| 6 | Screenshots of the canteen, fruit stall, garden, pizza oven and kitchen read as the lunchtime town (AC-1, AC-4) | pass |
| 7 | Word Island Unit 4: four games done shows "06 Treasure Quest · Finish all five games first."; five done shows Play and opens `quest/?unit=u4`; `?open=all` opens `quest/?unit=u4&open=all`; Unit 5 shows no sixth card (AC-5) | pass |
| 8 | Units 3, 7 and 9 still play: 12 chests each, 140 coins and 3 stars (AC-6) | pass |

Notes: standing right at the end of the lunch table, its top hides the lunchbox (eye height is below the table top's edge); from the path two blocks away, or from the side, it shows. The sausage tile was redrawn with round ends after the first preview looked like planks.

Still owed (as for the other islands): a real iPhone and budget Android check.
