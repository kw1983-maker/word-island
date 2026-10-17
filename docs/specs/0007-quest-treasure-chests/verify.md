# Verify: Treasure chests · spec 0007 · updated 2026-10-17
_Steps derived from spec 0007 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. A saved pupil (`word-island-pupil` with a name and class) is needed; blocking the gstatic Firebase files makes every island open after 8 seconds. Scripted checks used Python Playwright (headless Chromium) with Firebase blocked; `chestlib.py` in the session scratchpad stands the pupil beside a chest on real ground and answers by clicking._

## UI / manual
- [ ] Open the quest with `&seed=3` → a chest stands at each of the 12 anchors; s1 (pier end) and s2 (palm tree) are gold, because their puzzles are challenge questions, and the other 10 are wooden → AC-1 (value sourcing: where, wooden or gold)
- [ ] Look at a closed chest within reach → "Open the chest · click or E" (on a phone "· tap"); press E → the talk box opens titled "Treasure chest" ("Gold chest" for s1), with the question, its picture, the answers and a small Not now button, and the question is read aloud → AC-2 (value sourcing: label, title, question)
- [ ] Answer right first time → "Well done! +10 coins", the coin sound, the counter shows 10 / 140 at once with the coin icon popping; "N left" has not changed yet → AC-3 (value sourcing: coins, counter, counter pop)
- [ ] With reduced motion on, win coins → the counter changes but the coin icon does not pop → AC-3 (value sourcing: counter pop)
- [ ] Answer wrong once → "Try again." with the hint, the answers stay open and Not now stays; then right → +5 coins → AC-3, AC-4 (value sourcing: hint line)
- [ ] Answer wrong twice → "The answer is: …" with the explanation (said once when it only repeats the answer), 0 coins, only Carry on → AC-4 (value sourcing: answer and explanation)
- [ ] Tap Carry on after a finished chest → the talk box closes, the chest becomes an open, empty chest of the same colour (gold stays gold) with the chest sound, "N left" goes down by one, and looking at it shows no outline and no label → AC-5 (value sourcing: open chest, N left)
- [ ] Open a chest, answer wrong once, tap Not now → the talk box closes, the chest stays closed and the counter is unchanged; walk away and back, open it → the same question; answer right → +5 → AC-6
- [ ] Finish all 12 chests → "0 left"; the counter never passes 140 (all right first time gives 120, the bonus belongs to the island finish); a listener on `chests.onFinished` runs exactly once, after the last talk box closes, with the coins and 140 → AC-7 (value sourcing: finished hook)
- [ ] Reload the page → every chest is closed again and the counter is back to 0 / 140, 12 left → AC-8
- [ ] Open a chest, then press Esc (pause menu) and Carry on, or hide the tab and come back → the same talk box is still open with the same state → AC-8
- [ ] In `&kit`, open the kit's sample chest and answer right → "Well done! +10 coins" but the counter stays at 0 / 140 → AC-9
- [ ] `&debug` → a line "chests done N of 12 · coins C / 140" that changes as chests are done → AC-9 (value sourcing: debug line)

## Commands
- [ ] `node tools/check-quests.mjs` → `u9.js: OK` (chests are placed at run time, so the anchors stay open air in the map) → AC-1
- [ ] Time `world.setBlock` plus `world.rebuildDirty` for one chest → under 50 ms (measured 2026-10-17: 12 to 23 ms headless) → AC-10
- [ ] Compressed size of `quest/js/chests.js` plus the lines added to other `quest/` files since commit `69b860c` → 6 KB or less (measured 2026-10-17: 3.3 KB) → AC-10

## Acceptance-criteria coverage
- AC-1 UI step 1, command 1 · AC-2 UI step 2 · AC-3 UI steps 3, 4, 5 · AC-4 UI steps 5, 6 · AC-5 UI step 7 · AC-6 UI step 8 · AC-7 UI step 9 · AC-8 UI steps 10, 11 · AC-9 UI steps 12, 13 · AC-10 commands 2, 3
