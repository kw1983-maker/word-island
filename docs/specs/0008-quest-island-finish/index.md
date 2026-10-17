# 0008. End the island with a happy ending: a finishing bonus, up to 3 stars, Play again and Back to Word Island

**Date**: 2026-10-17
**Status**: Proposed

## Summary

When a pupil opens the last chest, the island ends with a short, happy talk box: "Island finished!", the fanfare, the 20 bonus coins for finishing, their coins and up to 3 stars, read aloud. Every pupil who finishes gets at least 1 star; 100 coins or more earns 2 and 130 or more earns 3. Play again reloads the same island with fresh Unit 9 questions, and Back to Word Island goes home. Nothing is saved yet; feature 10 will send the score to the teacher.

## Requirements

**User stories**:
- As a pupil who is 7, I want a clear, happy ending when I open the last chest, so that I know I finished and feel proud.
- As a pupil, I want stars for doing well, so that I want to play again and do better.
- As a pupil, I want to play the island again with new questions, or go back to Word Island, so that I choose what to do next.

**Acceptance criteria**:
- **AC-1**: After the last chest's talk box closes and that chest opens (spec 0007's finished hook), about 1.5 seconds of play later the ending talk box opens, titled "Island finished!". If the game is paused during that wait (pause menu, hidden tab, the teacher's Stop and listen, turn your phone), the ending waits and opens once play resumes.
- **AC-2**: Finishing earns the island's `bonus` (20 on Unit 9): the coin counter adds it at once with the coin pop (never above the island maximum), and the ending says "+20 bonus for finishing!".
- **AC-3**: The ending shows the coins and stars as "You found N coins and S stars." ("1 star" when there is one) and three star icons, gold for each star earned and grey for the rest. Stars: 3 when the coins (with the bonus) are at least 130/140 of the island maximum (130 on Unit 9), 2 when at least 100/140 of it (100), otherwise 1.
- **AC-4**: The fanfare plays when the ending opens, and the narrator voice reads "Island finished! You found N coins and S stars." (following the Sound setting, as every talk box does).
- **AC-5**: The ending has two buttons and no other way to close. Play again reloads the quest for the same unit with a fresh draw of questions (any `&seed=` in the address is dropped; the rest of the address stays), so every chest is closed and the counter is back to 0. Back to Word Island goes to Word Island's home (`../`). Esc opens the pause menu over the ending, and Carry on comes back to it.
- **AC-6**: The ending opens exactly once per play, and nothing is stored on the device or online.
- **AC-7**: The ending adds no more than 3 KB compressed.

## Decision

**Chosen option**: Option 1: a small `quest/js/finish.js` that listens to spec 0007's finished hook, works out the result, and shows it in the existing talk box (`panel.message`, which gains a three star row).

**Implementation skills**: none beyond the project's own code.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (nothing stored; confirmed with you):

| Entity | Where | Fields | Rules |
|---|---|---|---|
| Result (one per play) | memory, `finish.js` | `chestCoins` (whole number, from `chests.state().coins`), `bonus` (`quest.island.bonus`, 20), `coins` (`min(chestCoins + bonus, max)`), `max` (`islandMax(quest.island)`, 140), `stars` (1, 2 or 3) | made once, when the finished hook runs; `stars = coins >= max × 130/140 ? 3 : coins >= max × 100/140 ? 2 : 1` |

Links: one Result per play, from the chests (spec 0007) and the island file (spec 0002). Feature 10 will send it.

**State transitions** (the play): `playing` → finished hook → `waiting` (1.5 seconds of play, paused time does not count) → `ending shown` → Play again (reload) or Back (leave). There is no way back to `playing`.

**Interface surface** (ES modules in `quest/js/`):

| Function | Inputs | Outputs | Notes |
|---|---|---|---|
| `finish.start({ quest })` in `finish.js` | the loaded quest | listens to `chests.onFinished`; on it waits, then shows the ending | called from `main.js` after `chests.start` |
| `finish.result()` | | the Result, or null before the ending | for feature 10 and the tests |
| `panel.message({ title, text, stars, buttons, onButton })` in `panel.js` | adds `stars: { got, of }` | a row of `of` star icons, `got` of them gold, with the label "S of 3 stars" | spec 0004 talk box; callers without `stars` are unaffected |
| `hud.setCoins(n, max, { pop })` (spec 0007) | | the counter with the bonus | existing |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Ending opens | when | spec 0007's `chests.onFinished`, plus 1.5 seconds counted only while the game runs (the engine's pause reasons, spec 0001) |
| Bonus | amount | `quest.island.bonus` (spec 0002) |
| Counter | coins and maximum | `min(chests.state().coins + bonus, max)`; `islandMax(quest.island)` |
| Ending | title | "Island finished!" |
| Ending | bonus line | "+" + bonus + " bonus for finishing!" |
| Ending | coins and stars line | "You found " + coins + " coins and " + stars + (stars === 1 ? " star." : " stars.") |
| Stars | how many | the Result rule (130/140 and 100/140 of `max`) |
| Star icons | gold or grey | `stars` gold, `3 − stars` grey |
| Voice | text | "Island finished! " + the coins and stars line (narrator, spec 0003 `voice.say`) |
| Sound | effect | `fanfare` (spec 0004 quest sounds) |
| Play again | where | the current address without its `seed` parameter |
| Back to Word Island | where | `../` (the same home the quest's screens use, spec 0001) |

**Key invariants**:
- The ending opens at most once per play.
- The counter never passes `islandMax`.
- Every pupil who finishes gets at least 1 star.
- The ending can only be left by its two buttons (the pause menu may cover it).

**Security model**: nothing new is stored or sent. The score stays in memory until feature 10.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: answer all 12 right first time: about 1.5 s after the last chest opens, "Island finished!", "+20 bonus for finishing!", "You found 140 coins and 3 stars.", fanfare, read aloud, counter 140 / 140, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**
- Stars: plays ending at 100 to 129 coins show 2 stars, under 100 show 1 star (a test helper may set the tries), verifies **AC-3**
- Paused wait: press Esc just after the last chest opens: the ending waits until Carry on, then opens, verifies **AC-1**
- Play again: the page reloads with the same unit, no `seed`, all chests closed, 0 / 140; with `&debug&seed=3` the debug flag stays and the seed goes, verifies **AC-5**
- Back: goes to `../`, verifies **AC-5**
- Once: the hook can't open a second ending, verifies **AC-6**

## Build plan

Skateboard: first an ending pupils can see and leave, then the stars, then the checks.

1. Write `finish.js`: listen to the finished hook, wait 1.5 seconds of play, add the bonus to the counter with the pop, play the fanfare, open "Island finished!" with the bonus and coins lines, read it aloud, and wire Play again and Back to Word Island; call it from `main.js`, satisfies **AC-1**, **AC-2**, **AC-4**, **AC-5**, **AC-6**
2. Add the stars rule and the three star row to `panel.message`, with the coins and stars line, satisfies **AC-3**
3. Measure the size, satisfies **AC-7**

## Consequences

**Positive**:
- Release 1 is complete: a pupil can play the beach island from start to finish.
- Stars give a simple, readable goal for playing again.
- Feature 10 can send `finish.result()` as it is.

**Negative / tradeoffs**:
- A reload for Play again shows the Play card again (a second tap), the price of a clean fresh start.
- The score is lost on a reload until feature 10 sends it.
- Pupils can't wander the finished island; they must play again to explore.

**Neutral**:
- The thresholds scale with the island maximum, so an island with a missing spot (spec 0006) still gives fair stars.
- The `&kit` sample "Island finished!" message stays as a look sample.

## Follow-up

- [ ] Feature 10 (scores): send `finish.result()` (coins, stars, max) with each chest's spot, puzzle id, tries and coins.
