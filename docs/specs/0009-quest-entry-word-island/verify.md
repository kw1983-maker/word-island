# Verify: Quest entry in Word Island · spec 0009 · updated 2026-10-17
_Steps derived from spec 0009 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Test setup: serve `word-island/` locally, block the gstatic and Firebase requests (the class check then opens every unit), and set `word-island-pupil` to a test pupil. Never write to the real Firebase project.

## UI / manual
- [x] Unit 9 page with no games done → six cards; the sixth is "06 Treasure Quest", "Find the treasure on the island.", with the island picture → AC-1
- [x] Unit 5 page → five cards only, page otherwise unchanged → AC-1
- [x] Unit 9, nothing or four games done → card 06 says "Finish all five games first."; tapping it shows that line as the tip and caption and stays on Word Island → AC-2
- [x] Unit 9, all five `done` flags true in `word-island-u9-v2` → card 06 says "Play"; tapping opens `quest/?unit=u9` in the same tab and reaches the Play card → AC-3
- [x] From the quest, Back to Word Island (and the pause menu's home button) → returns to Word Island → AC-3
- [x] Word Island opened with `?open=all`, no games done → card 06 is open; tapping opens `quest/?unit=u9&open=all`, which reaches the Play card → AC-4
- [x] `quest/?unit=u9` opened directly with four games done → "Finish the five games first", "Play all five Word Island games for Unit 9, then come back for the treasure.", button "Back to Word Island" to `../` that returns to Word Island → AC-5
- [x] `quest/?unit=u9` with no pupil saved → the "needs pupil" screen, not the five games screen (check order) → AC-5
- [x] A class not allowed Unit 9 → the unit page (and so card 06) never shows; `quest/?unit=u9` shows "This island is not open" before the five games check → AC-5, AC-6
- [x] Teacher's Pause on → the hush screen covers Word Island and the quest as before → AC-6
- [x] With no games done, only Word maze is open; finishing a game still unlocks the next and saves its stars, and `localStorage` holds no new keys after visiting card 06 and the quest → AC-7
- [x] Phone size (390 × 844): six cards fit with no sideways scroll; the lock screen is readable → AC-1, AC-5

## Commands
- [x] `node tools/check-quests.mjs` → `u9.js: OK`, `island list: OK`, exit 0 → AC-8
- [x] `node tools/check-quests.mjs --list <copy of shared/quest.js with []>` → "u9 has an island file but is not in wiQuestIslands", exit 1 → AC-8
- [x] `node tools/check-quests.mjs --list <copy with ["u9", "u5"]>` → "u5 is in wiQuestIslands … but has no island file", exit 1 → AC-8

## Value sourcing
- [x] Card shown ← `wiQuestHasIsland(U.id)`: shows on u9, not u5 → AC-1
- [x] Card locked or open ← `wiQuestOpen(U.id, location.search)`: vary the five flags (0, 4, 5 done), a broken JSON record (counts as locked), and `?open=all` → AC-2, AC-4
- [x] Card link ← `quest/?unit=<U.id>` plus `&open=all` only when Word Island's address has it → AC-3, AC-4
- [x] Quest locked or open ← the same `wiQuestOpen`: Word Island's card and the quest always agree for each case above → AC-5
- [x] Lock screen unit number ← `WORD_ISLAND_UNITS[unitId].number`: reads "Unit 9" → AC-5

## Acceptance-criteria coverage
- AC-1 … card and Unit 5 steps, phone · AC-2 … locked steps · AC-3 … Play and Back steps · AC-4 … open=all step · AC-5 … quest lock, check order steps · AC-6 … class and Pause steps · AC-7 … regression step · AC-8 … the three commands

_Self check on 2026-10-17 (headless Chromium, `entry_test.py` in the session scratchpad): 19 of 19 checks passed covering AC-1 to AC-5, AC-7 and phone size; the three checker commands gave the expected results._
