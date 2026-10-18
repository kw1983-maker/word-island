# 0015. Live word search: a class race the teacher starts from the results page

**Date**: 2026-10-18
**Status**: In Progress

## Summary

The teacher picks a class, a unit (Unit 3 only for now), how many words and how long, then presses Start on the
Teacher results page. Every pupil in that class who has Word Island open sees "Live word search!" with a 5 second
countdown, then the same letter grid. The words are hidden across (left to right) and down. Letter blanks show
how many words there are and how long each one is, and a word's picture appears once it is found (pictures from
the start would let pupils type the words without searching). Pupils type a word they spot. If it is a hidden word, it lights
up in the grid and their count goes up. A ranking on the teacher's page updates as pupils find words, the race stops
for everyone when the time is up (or when the teacher presses Stop), and a top three podium follows.

## Teacher's picks (2026-10-18)
- Pupils **type** the words (spelling practice), they don't drag across the grid.
- The race starts from a **Start button on the Teacher results page** (no join code).
- Everyone gets the **same grid**.
- The teacher's page shows a **live ranking, then a podium**.
- **Unit 3 first.** The other units come later with their own word lists.

My calls (easy to change): words go across and down only (Year 1), letter blank clues with the picture shown once
the word is found, and no
penalty for a wrong word. Pupils see only their own score, and the ranking is on the teacher's screen. Pupils in
Treasure Quest don't get pulled into the race.

## Acceptance criteria
- **AC-1** The Teacher results page has a "Live word search" panel with Class, Unit (Unit 3), Words (8 / 10 / 12,
  default 10) and Time (2 / 3 / 5 minutes, default 3), and a Start button.
- **AC-2** Start builds a grid (10×10, or 12×12 for 12 words) with the chosen number of words picked at random from
  the unit's list, placed across or down, with the other cells filled with random letters. No other word from the
  unit's list may appear by accident across or down. The race is saved, and the class's current race is set in
  `settings/wordIsland.live`.
- **AC-3** Every pupil of that class on any Word Island screen (not the teacher explain page) sees a full screen race
  within about 2 seconds: "Get ready!", a countdown 5…1, then the grid. Their game underneath pauses and carries on
  afterwards. A pupil who opens Word Island during a race joins it with the time that is left. A pupil who reloads
  keeps the words they already found.
- **AC-4** The pupil types a word and presses Enter or Check (case and spaces don't matter). A hidden word lights up
  in the grid, its clue card shows the word and its picture, it is read aloud (if sound is on), and "Found N of M" goes up. A word
  found already says "You found that one already!". Any other word shakes and says "Not one of the hidden words.
  Try again." with no penalty.
- **AC-5** Time is the server's time, so all pupils stop together even when a device clock is wrong. At the end
  (time up or teacher Stop), the pupil sees "Time's up!" or "Your teacher stopped the race.", "You found N of M
  words." plus the words, and "Back to Word Island". Typing is closed.
- **AC-6** The teacher panel shows the grid big enough to share on a projector, a timer, how many pupils joined, and
  a ranking that updates live: the most words first, and on a tie, whoever reached that count first. When the race
  ends it shows a podium for the top three plus the full list, and a "Show answers" switch highlights the words in
  the grid. The teacher can Stop early and start a new race.
- **AC-7** The Firestore rules only let the teacher create or stop a race and set `live`. A pupil may only write
  their own player document in a race for their own class, with only words from that race, each word once, a count
  that matches, words that never disappear, and only before the race ends (plus a 15 second grace for slow
  networks). Only the teacher can read every player, and a pupil can read only their own.
- **AC-8** The five games, results, leaderboards and Pause work as before. Pause covers the race too.

## Data

| Piece | Where | Fields |
|---|---|---|
| Race | `wordIslandLive/{raceId}` (auto id) | `cls`, `unit`, `words` (lower case), `grid` (list of row strings, upper case), `duration` (seconds), `startAt` (server time), `stopped` (bool) |
| Player | `wordIslandLive/{raceId}/players/{uid}` | `uid`, `name`, `cls`, `found` (list), `count`, `lastAt` (server time of the last new word, or of joining), `seenAt` (server time of the last write) |
| Current race per class | `settings/wordIsland.live` | `{ "2B": raceId }` |

The countdown is 5 s after `startAt`. The race ends at `startAt + 5 s + duration`. The pupil works out the server
time from the `seenAt` of its own join write.

## Pieces
- `quiz/src/wordSearch.ts`: the unit word lists for the race (`LIVE_WORDS`, Unit 3 for now) and `makeGrid(words, size)`.
- `quiz/src/LiveRace.tsx`: the teacher panel, shown on `WordIsland.tsx` under the class list.
- `quiz/src/firebase.ts`: `startLiveRace`, `stopLiveRace`, `watchLiveRace`, `watchLivePlayers`, `watchIslandLive`.
- `word-island/shared/firebase.js`: `wiLive.join`, `wiLive.watch`, `wiLive.found`.
- `word-island/live.js` (`window.LiveRace`): draws the race screen and reports back through hooks.
- `word-island/index.html`: notices `live[cls]` in the settings it already watches, joins, and opens the race screen.
- `quiz/firestore.rules`, `quiz/scripts/copy-word-island.mjs` (add `live.js`).

## Verify
Use the Firestore and Auth emulators with patched page copies (never the real project). Open three pupil tabs in
one class and one in another class, plus the teacher panel. Start a race, then check AC-3 to AC-6. Run rules tests
for AC-7: a word that isn't in the race, a duplicate, a wrong count, another pupil's document, another class's race,
a write after the end, and a pupil reading other players.

## Verified (2026-10-18, emulators only)
- Rules: 36 of 36 checks passed (`live.test.mjs`, session scratchpad).
- Browser: 27 of 27 steps passed (`e2e.py`): race reached three 2B pupils in about 1 to 2 s and no 2E pupil; same grid
  for all; a device clock 3 minutes fast showed the same time; right word (any case), wrong word and a repeated word;
  a live ranking with ties going to whoever got there first; a reload kept the words; Pause on top of the race, then
  Resume put the cursor back in the word box; Stop showed the end screen and podium; Back to Word Island resumed
  the paused Game 1; a stopped race didn't open for a pupil who arrived later; a new race reached that pupil. No
  console errors.
- Not yet tried: a natural time up end, real phones, and the real Firebase project.

## All units (2026-10-18)
The teacher tried Unit 3 on the real site ("It works!") and asked for every unit. `LIVE_WORDS` now covers Units 1 to 9,
each with its spelling words (17 to 26 words per unit), minus names, two-letter words, "pencil case", and one word
of each pair where one hides inside the other ("pen"/"pencil", "book"/"notebook", "hot"/"photo"). The Unit box starts
on the first unit ticked for the chosen class. Checked: every word is a spelling word of its unit (so it has a
picture), and 200 grids each for 8, 10 and 12 words in every unit came out right (`gridcheck.mjs`). In the browser,
a race for each of the 9 units reached the pupil with the right unit and size, and a found word showed its picture
(36 of 36), and the Unit 3 run still passed (27 of 27).

## Diagonal words and each pupil's place (2026-10-18)
The teacher asked for diagonal words, and for each pupil to see their place on their own screen at the end.
- **Diagonal ↘** (top left to bottom right, so every word still reads forwards). A "Diagonal words ↘" tick box on
  the panel is on by default. With it on, about a third of the words go diagonally. The race saves `diagonal`, and
  the pupils' instructions say "across →, down ↓ and diagonal ↘". Accidental unit words are checked in all three
  ways even when it is off.
- **Place**: pupils can't read each other's rows, so the teacher's page closes a timed race 2 s after the end (it was
  15 s), then saves `places` (uid → 1, 2, 3 …, in podium order, only for pupils with at least one word) on the race.
  It saves again if the ranking still changes. Pupils already watch the race, so they see "You won! You came 1st!
  🏆", "You came 2nd! 🥈", "You came 3rd! 🥉" or "You came 7th out of 25.", read aloud. No words means "Good try!".
  If no places arrive within 25 s (the teacher's page is closed), the line says to look at the teacher's screen.
  The rules let only the teacher write `places`, and only on a stopped race.
- **Fixed**: a new race started while a pupil was still on the last race's screen (often its end screen) used to
  leave the old screen running underneath. Now it is replaced cleanly (`dispose()`).
- Checked: rules 45/45; grids for every unit with and without diagonals (200 each); browser 32/32 (Unit 3, places
  1st/2nd/3rd, a new race over an old end screen) and 44/44 (all units, all 12 words found with diagonals, a race
  with no diagonals, and a 2 minute race that ran out of time, with the place arriving and the race closed).
