# Verify 0014: Unit 8 robot town island

Run on 2026-10-17 in headless Chromium (Python Playwright) against a local server, with Firebase blocked and a fake pupil.

| # | Check | Result |
|---|---|---|
| 1 | `node tools/check-quests.mjs`: u3, u4, u7, u8 and u9 islands and the island list (AC-2, AC-3, AC-5) | pass |
| 2 | `quest/?unit=u8&seed=3` opens; start on the pier at 32.5, 7, 55.5 facing north; no page errors (AC-1) | pass |
| 3 | All 12 spots are placed; every puzzle has 3 choices; 2 of them are gold chests (Year 2) (AC-2) | pass |
| 4 | Every chest opens and pays 10 coins; after the 12th the ending says "+20 bonus for finishing! You found 140 coins and 3 stars." (AC-2) | pass |
| 5 | All 14 word things (robot, horse, tennis, cheetah, kangaroo, bike, monkey, piano, guitar, dolphin, crocodile, skeleton, go-kart, bag), looked at from the side a pupil walks up to, show "word · click or E", then show and say it (AC-4) | pass |
| 6 | Screenshots of the workshop, dolphin pool, animal park and music stage read as the robot town (AC-1, AC-4) | pass |
| 7 | Word Island Unit 8: four games done shows "06 Treasure Quest · Finish all five games first."; five done shows Play and opens `quest/?unit=u8`; `?open=all` opens `quest/?unit=u8&open=all`; Unit 6 shows no sixth card (AC-5) | pass |
| 8 | Units 3, 4, 7 and 9 still play: 12 chests each, 140 coins and 3 stars (AC-6) | pass |

Still owed (as for the other islands): a real iPhone and budget Android check.
