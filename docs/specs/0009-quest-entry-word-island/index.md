# 0009. Open each unit's island from a locked sixth card on Word Island, unlocked by finishing the five games

**Date**: 2026-10-17
**Status**: In Progress

## Summary

On a unit's Word Island page, a sixth card, "06 Treasure Quest", joins the five game cards, but only for units that have an island (Unit 9 today). It stays locked, like the other cards, until the pupil has finished all five of that unit's games on this device; tapping it early says "Finish all five games first." Once open, it says "Play" and opens the island in the same tab. The quest page checks the same rule, so a shared link can't skip it, and your existing `?open=all` teacher link opens the island too. Nothing new is saved: the rule reads the record Word Island already keeps.

## Requirements

**User stories**:
- As a pupil who is 7, I want to see the treasure island waiting on my unit's page, so that I want to finish the five games.
- As a pupil, I want the island to open when I finish the five games, so that it feels like a reward.
- As the teacher, I want the island to follow the five games, so that pupils practise the words before the treasure hunt, and I want to open it for a lesson with my usual open all link.

**Acceptance criteria**:
- **AC-1**: On a unit's main page (the page with the five game cards), a sixth card "06 Treasure Quest" with its own island picture follows the five games, for every unit in the island list (`u9` today). Units without an island show no sixth card, and the page is otherwise unchanged.
- **AC-2**: The card is locked until all five of that unit's games (Word maze, Answer moles, Spelling balloons, Run and pick, Listen and shoot) are finished on this device, using Word Island's existing record (`word-island-<unit>-v2`, its `done` flags). While locked it shows "Finish all five games first." and tapping it shows that line as the tip and caption, as the other locked cards do.
- **AC-3**: Once open, the card shows "Play", and tapping it opens `quest/?unit=<unit>` in the same tab. Back to Word Island and the quest's other home buttons return to Word Island.
- **AC-4**: When Word Island is opened with `?open=all` (the teacher link that opens every game), the card is open too and its link carries `&open=all`; the quest page with `open=all` in its address skips the five games check.
- **AC-5**: The quest page checks the same rule. If the five games are not finished on this device (and there is no `open=all`), it shows a screen "Finish the five games first" with "Play all five Word Island games for Unit N, then come back for the treasure." and a "Back to Word Island" button to `../`. The order of checks is: pupil saved, island file, class allowed, five games, then the 3D engine.
- **AC-6**: The card only appears on units the pupil's class may play (it lives on that unit's page, which Word Island already only opens for allowed units), and the teacher's Pause covers Word Island and the quest as it does today.
- **AC-7**: Nothing new is stored, and the five games behave exactly as before (their unlock chain, stars, results and leaderboards).
- **AC-8**: `tools/check-quests.mjs` fails, naming the unit, when an island file has no entry in the island list, or the list names a unit with no island file.

## Decision

**Chosen option**: Option 1: a small shared classic script, `shared/quest.js`, holds the island list and the open rule; Word Island adds a sixth gate card from it, and the quest page checks it before loading the 3D engine.

**Implementation skills**: none beyond the project's own code.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (nothing new stored; confirmed with you):

| Piece | Where | Fields | Rules |
|---|---|---|---|
| Unit progress (existing, read only) | `localStorage["word-island-<unit>-v2"]` | `done` { maze, moles, hangman, runner, planes: boolean }, `best`, `missed` | set by Word Island after a full play of each game (any score); never written by this feature |
| Island list (new) | `shared/quest.js`, `window.wiQuestIslands` | unit ids with an island, `["u9"]` | must match the files `quest/islands/uN.js` (checked by the island checker) |
| Island open (worked out, never stored) | `shared/quest.js`, `window.wiQuestOpen(unitId, search)` | true or false | true when `unitId` is in the island list and (`search` has `open=all`, or every one of the five `done` flags is true) |

**Interface surface**:

| Function | Inputs | Outputs | Notes |
|---|---|---|---|
| `wiQuestIslands` in `shared/quest.js` (classic script) | | the island list | loaded by `index.html` and `quest/index.html`, and run by the checker in Node like the other shared files |
| `wiQuestOpen(unitId, search)` | a unit id, an address query string (`location.search`) | boolean | reads the unit's progress record; a missing or broken record counts as not finished |
| `wiQuestHasIsland(unitId)` | a unit id | boolean | for Word Island's card |
| Word Island `showHub()` / `gateCard()` in `index.html` | | the sixth card after the five | a `quest` gate (`n: "06"`, title "Treasure Quest", line "Find the treasure on the island.", need "Finish all five games first.") with an island scene; act `quest` when open (go to the quest), `soon` when locked |
| quest `boot()` in `quest/js/main.js` | | a new end screen `finishGames` when locked | after the class check, before the engine loads |
| `screens` in `quest/js/screens.js` | | "Finish the five games first" screen | added to the end screens, with the unit number in its text |
| `checkIsland` in `tools/check-quests.mjs` | | problem lines | the island list against the island files |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Show the card | whether the unit has one | `wiQuestHasIsland(U.id)` (the island list) |
| Card | locked or open | `wiQuestOpen(U.id, location.search)` |
| Card | number, title, line | "06", "Treasure Quest", "Find the treasure on the island." |
| Card | status when open / locked | "Play" / "Finish all five games first." |
| Card | picture | a CSS island scene, like the other cards' scenes |
| Card tap (open) | where | `quest/?unit=<U.id>` plus `&open=all` when Word Island's address has `open=all` |
| Card tap (locked) | tip and caption | the card's need line ("Finish all five games first."), as other locked cards |
| Quest page | locked or open | `wiQuestOpen(unitId, location.search)` |
| Quest locked screen | title, text, button | "Finish the five games first"; "Play all five Word Island games for Unit " + the unit's number + ", then come back for the treasure."; "Back to Word Island" → `../` |
| Unit number | for the text | `WORD_ISLAND_UNITS[unitId].number` (already loaded by the quest before this check) |

**Key invariants**:
- The rule only reads Word Island's record; it never writes it.
- Word Island's card and the quest page always agree, because both call `wiQuestOpen`.
- The island list and the island files always match (the checker enforces it).
- The five games' unlock chain and scores are untouched.

**Security model**: nothing is sent or stored. The lock is a learning nudge on the pupil's own device, not a security barrier: a pupil who clears storage or uses `open=all` gets in, which is acceptable.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: a pupil with all five Unit 9 games done sees "06 Treasure Quest · Play", taps it, and the quest opens; Back to Word Island returns, verifies **AC-1**, **AC-2**, **AC-3**
- Locked: four games done: the card shows the lock line; tapping shows the tip; opening `quest/?unit=u9` directly shows "Finish the five games first", whose button goes back, verifies **AC-2**, **AC-5**
- Teacher: `?open=all` on Word Island: the card is open with no games done, and the quest opens through it, verifies **AC-4**
- Other units: Unit 5's page has five cards only, verifies **AC-1**
- Regression: the five games still unlock one by one and save stars, verifies **AC-7**
- Checker: an island list missing `u9` fails naming it, verifies **AC-8**

## Build plan

Skateboard: first the card pupils see and use, then the guard on the quest page, then the safety check.

1. Write `shared/quest.js` (list, `wiQuestHasIsland`, `wiQuestOpen`), load it in `index.html`, and add the sixth "Treasure Quest" card with its island scene, locked and open states, the tap tip, and the link with `open=all` carried, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-6**, **AC-7**
2. Load `shared/quest.js` in the quest page, add the `finishGames` end screen and the check after the class check, honouring `open=all`; update the scratchpad test helper to mark the five games done, satisfies **AC-4**, **AC-5**
3. Add the island list check to `tools/check-quests.mjs`, satisfies **AC-8**

## Consequences

**Positive**:
- Pupils practise the unit's words in the five games before the treasure hunt.
- The island is visible early, as a goal, without a new screen to learn.
- One shared rule keeps Word Island and the quest in step.

**Negative / tradeoffs**:
- The lock is per device: a pupil on a new device must play the five games again to open the island.
- Clearing the browser's storage relocks the island (as it already resets the games).
- `index.html` changes, so the quiz copy needs a rebuild and deploy before teachers see it there.

**Neutral**:
- Each new island (features 15 to 22) adds its unit to the island list; the checker reminds you.
- Tests that open the quest directly now need the five games marked done, or `&open=all`.

## Follow-up

- [ ] After the change lands, rebuild and deploy the quiz copy (`npm run build` and the Firebase deploy from `../quiz`), with your go ahead.
- [ ] Feature 10 (scores) may later let the online results open the island on any device.
