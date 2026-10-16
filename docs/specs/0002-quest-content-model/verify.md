# Verify: Quest content model · spec 0002 · updated 2026-10-16 · verified 2026-10-16 (all 18 steps passed)
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. Stop every Word Island game before the end of a round, so no result is sent._

## UI / manual
- [x] Open `/quest/?unit=u9&debug&seed=7` with a saved pupil → the island opens; debug shows `island year 2 · seed 7` and 12 lines `s1` to `s12`, all played as chest (`riddle as chest`, `find as chest`, `blocks as chest` for s7 to s12), 12 different ids, at most 2 marked ★ → AC-2, AC-5
- [x] Reload the same address → exactly the same 12 ids in the same order; change to `&seed=8` → different ids at some spots → AC-3 (value sourcing: seed)
- [x] Open `/quest/?unit=u9&debug` with no seed twice → a different seed and plan each time → AC-3 (value sourcing: fresh random seed)
- [x] Open `/quest/?unit=u5` (no island file yet) → "This island is not open" → AC-11
- [x] Open `/quest/review.html?unit=u9&seed=7` → spots table (12 rows, s7 to s12 marked "a chest for now"), 6 riddles each with pictures or words, the right answer marked, hint and why, 4 sentences, the pool sizes (chest 53, riddle 6, find 26, spelling 20, sentence 4) and a sample play of 6 chests, 2 riddles, 2 finds and 2 word blocks → AC-10 (value sourcing: riddles, sentences, island spots)
- [x] On that sample play: s11 is a sentence split into words with the full stop on the last word; s12 is a spelling word of up to 8 letters with no spaces → AC-4 (value sourcing: word blocks)
- [x] On that sample play: chest pictures load from `../img/u9/`; a quote question (e.g. `u9o-clean`) shows its quote; finds show three picture choices with labels from `alts` → AC-6, AC-8 (value sourcing: chest text, choice labels, find sign pictures)
- [x] A question with a note (e.g. `u9m-l-photo`) shows the note's hint and why; one without (e.g. `u9m-music`) shows "Look at the picture again." and its spoken sentence → AC-6 (value sourcing: hint and explanation fallbacks)
- [x] View the page source of `review.html` → `<meta name="robots" content="noindex, nofollow">`; search `index.html` and `quest/` for `review.html` → no link to it → AC-10
- [x] Word Island regression: play the first question of all five games in units 1, 4 and 9 (stop before the end of a round) → book photos, icons, balloons, counts, colour mixes, letters, numbers, quotes, days and calendar look as before; the teacher explain page still shows pictures → AC-8

## Commands
- [x] `node tools/check-quests.mjs` → `u9.js: OK`, exit code 0 → AC-9
- [x] Copy `quest/islands/u9.js` to a scratch file, change one riddle picture to a name that does not exist, make one sentence 7 words, delete one spot, then `node tools/check-quests.mjs <copy>` → one plain line for each problem, exit code 1 → AC-9
- [x] `node tools/check-quests.mjs u5` → "there is no such island file", exit code 1 → AC-9
- [x] In Node, draw a Year 1 test island over Unit 1 with all four types for 30 seeds → every choice puzzle has 2 choices, no challenge items, spelling words of up to 5 letters with no spaces, no sentences → AC-4 (value sourcing: Year 1 rules)
- [x] In Node, draw Unit 9 with all four types for 200 seeds → never more than 2 challenge items and never a repeated id → AC-2, AC-4
- [x] `islandMax(u9 island)` → 140; `coinsFor(0)`, `coinsFor(1)`, `coinsFor(2)` → 10, 5, 0 → AC-5, AC-7
- [x] Search `quest/js/puzzles.js` for `u1` to `u9` → no unit is named → AC-12
- [x] Compare the HTML of `picture()`, `choiceText()` and `answerText()` from `shared/picture.js` with the old inline versions in `index.html` at commit `eef3be8`, over every bank item → no difference (measured 2026-10-16: 2,292 pictures, 0 differences) → AC-8

## Acceptance-criteria coverage
- AC-1 command 1 · AC-2 steps 1, 5 and command 5 · AC-3 steps 2 to 3 · AC-4 step 6 and commands 4 to 5 · AC-5 step 1 and command 6 · AC-6 steps 7 to 8 · AC-7 command 6 · AC-8 steps 7, 10 and command 8 · AC-9 commands 1 to 3 · AC-10 steps 5 and 9 · AC-11 step 4 · AC-12 command 7
