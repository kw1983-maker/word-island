# Verify: Island finish & score · spec 0008 · updated 2026-10-17
_Steps derived from spec 0008 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. A saved pupil (`word-island-pupil` with a name and class) is needed; blocking the gstatic Firebase files makes every island open after 8 seconds. Scripted checks used Python Playwright (headless Chromium) with Firebase blocked; `chestlib.py` and `t_finish.py` in the session scratchpad open every chest by clicking its answers._

## UI / manual
- [x] Open all 12 chests, right first time → about 1.5 seconds after the last chest opens, a talk box "Island finished!" appears (measured 1.52 s) → AC-1 (value sourcing: when)
- [x] Press Esc just after the last chest opens and wait → no ending while paused; Carry on → the ending opens about 1.5 seconds of play later → AC-1
- [x] The ending says "+20 bonus for finishing!", and the counter shows chest coins plus 20 at once with the coin pop (140 / 140 for a perfect island, never above it) → AC-2 (value sourcing: bonus, counter)
- [x] A perfect island → "You found 140 coins and 3 stars." and three gold stars; with three hints (125 coins) → 2 stars, one gold row of two and one grey; with five answers shown (90 coins) → "You found 90 coins and 1 star." and one gold, two grey → AC-3 (value sourcing: stars, star icons, coins and stars line)
- [x] The fanfare plays as the ending opens, and the narrator says "Island finished! You found N coins and S stars." → AC-4 (value sourcing: voice, sound)
- [x] The ending has only Play again and Back to Word Island; Esc opens the pause menu over it and Carry on comes back to it → AC-5
- [x] Play again from `?unit=u9&debug&seed=3` → the address becomes `?unit=u9&debug` (seed gone, the rest kept), the Play card shows, every chest is closed and the counter is 0 / 140, 12 left → AC-5 (value sourcing: Play again)
- [x] Back to Word Island → Word Island's home page (`../`) → AC-5 (value sourcing: Back)
- [x] `finish.result()` after the ending → `{ chestCoins, bonus: 20, coins, max: 140, stars }`, and the ending never opens twice; nothing new is stored on the device → AC-6

## Commands
- [x] `starsFor` edges in the browser: 99 → 1, 100 → 2, 129 → 2, 130 → 3, 140 → 3, and on a 130 coin island 120 → 2, 121 → 3 → AC-3 (value sourcing: stars)
- [x] Compressed size of `quest/js/finish.js` plus the lines added to other `quest/` files since commit `2e8122b` → 3 KB or less (measured 2026-10-17: 2.0 KB) → AC-7

## Acceptance-criteria coverage
- AC-1 UI steps 1, 2 · AC-2 UI step 3 · AC-3 UI step 4, command 1 · AC-4 UI step 5 · AC-5 UI steps 6, 7, 8 · AC-6 UI step 9 · AC-7 command 2
