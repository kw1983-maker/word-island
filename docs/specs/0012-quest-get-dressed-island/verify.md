# Verify 0012: Unit 7 clothes town island

Run on 2026-10-17 in headless Chromium (Python Playwright) against a local server, with Firebase blocked and a fake pupil.

| # | Check | Result |
|---|---|---|
| 1 | `node tools/check-quests.mjs`: u3, u7 and u9 islands and the island list (AC-2, AC-3, AC-5) | pass |
| 2 | `quest/?unit=u7&seed=3` opens; start on the pier at 32.5, 7, 55.5 facing north; no page errors (AC-1) | pass |
| 3 | All 12 spots are placed; every puzzle has 3 choices; 2 of them are gold chests (Year 2) (AC-2) | pass |
| 4 | Every chest opens and pays 10 coins; after the 12th the ending says "+20 bonus for finishing! You found 140 coins and 3 stars." (AC-2) | pass |
| 5 | All 17 word things (cool cat, sheep, cow, two cotton plants, cap, bird, T-shirt, socks, jeans, sweater, skirt, spiders, shoes, hat, jacket, boots), looked at from the side a pupil walks up to, show "word · click or E", then show and say it (AC-4) | pass |
| 6 | Screenshots of the start, stage, farm, washing line, cotton field, stairs, shop and clothes rail read as the clothes town (AC-1, AC-4) | pass |
| 7 | Word Island Unit 7: four games done shows "06 Treasure Quest · Finish all five games first."; five done shows Play and opens `quest/?unit=u7`; `?open=all` opens `quest/?unit=u7&open=all`; Unit 6 shows no sixth card (AC-5) | pass |
| 8 | Unit 3 and Unit 9 still play: 12 chests each (2 and 3 choices), 140 coins and 3 stars (AC-6) | pass |

Found and fixed while checking: the first cotton field stood mostly on sand and path, with its one talking plant hidden in the middle; and a T-shirt on the shop floor hid the shoes from the door.

Still owed (as for the other islands): a real iPhone and budget Android check.
