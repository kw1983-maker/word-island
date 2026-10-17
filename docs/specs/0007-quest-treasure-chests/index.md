# 0007. Put a chest at every puzzle spot that opens when the puzzle is done, with a gold chest for challenges and a Not now button

**Date**: 2026-10-17
**Status**: Accepted

## Summary

Every puzzle spot on the island gets a blocky wooden chest, or a gold chest when its question is a harder challenge question. A pupil walks up, opens it, hears the Unit 9 question and taps an answer: the coins arrive at once (10, or 5 after a hint), and when they tap Carry on the chest turns into an open, empty chest that stays there, so they can see which ones they have done. A Not now button lets a pupil close a chest they opened by mistake; the same question waits, and any wrong try still counts. Nothing is saved yet: a reload starts a fresh play.

## Requirements

**User stories**:
- As a pupil who is 7, I want to open treasure chests by answering Unit 9 questions, so that practising feels like a treasure hunt.
- As a pupil, I want to see which chests I have already opened, so that I know where to go next.
- As a pupil, I want to close a chest I opened by mistake, so that I can come back to it later.
- As the teacher, I want harder questions to stand out and give the same coins, so that the score stays fair (spec 0002).

**Acceptance criteria**:
- **AC-1**: Every placed spot (all 12 on Unit 9; every spot plays as a chest in Release 1, spec 0002) has a closed chest block at its anchor's `at`: a wooden `chest`, or a `gold_chest` when that play's puzzle is a challenge question (`puzzle.challenge`).
- **AC-2**: Looking at a closed chest within reach shows "Open the chest · click or E" (phone: "· tap"). Using it opens the talk box titled "Treasure chest" ("Gold chest" for a gold one), with the question, its picture, the answers, and a Not now button; the question is read aloud (spec 0003 talk box).
- **AC-3**: A right answer with no wrong tries gives 10 coins, after one wrong try 5 coins (spec 0002 `coinsFor`). The talk box says "Well done! +N coins", the coin sound plays, and at once the coin counter shows the new total with a short pop of the coin icon (no pop when the device asks for reduced motion).
- **AC-4**: A wrong answer shows "Try again." with the puzzle's hint and the answers stay open. A second wrong answer shows the answer and the explanation, gives 0 coins, and the chest counts as done.
- **AC-5**: When a chest is done (right, or the answer shown), the Not now button goes and Carry on closes the talk box; then the chest becomes an open, empty chest (`chest_open`, or `gold_chest_open` for a gold one) with the chest sound, "N left" goes down by one, and the chest can no longer be used (no outline, no label).
- **AC-6**: Not now closes the talk box before the puzzle is done. The chest stays closed with the same question, and its wrong tries so far still count: a chest left after one wrong try gives at most 5 coins when it is answered later.
- **AC-7**: The counter starts at "0 / 140" and "12 left" (`islandMax` and the placed spots, spec 0006) and can never pass the maximum. After the last chest is done and its talk box closed, a "finished" hook runs exactly once, for feature 9 (island finish).
- **AC-8**: Nothing is stored on the device or online. A reload starts a new play with every chest closed. Pausing, a hidden tab or the teacher's Stop and listen while a chest is open keep its state (the talk box rules of specs 0004 and 0005).
- **AC-9**: On `&kit`, the kit's sample puzzles still open and show their results but no longer change the coin counter, so the counter always means the island's coins. With `&debug`, a line shows "chests done N of M · coins C / max".
- **AC-10**: The chests add no more than 6 KB compressed, and opening a chest (changing its block) takes under 50 ms in the test browser.

## Decision

**Chosen option**: Option 2: chests are blocks in the island world, driven by a small `quest/js/chests.js` that keeps one state per spot, uses the spec 0005 targets and the spec 0004 talk box, and swaps the block to an open chest when the puzzle is done.

**Implementation skills**: none beyond the project's own code (the change is blocks, tiles and game logic).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch** (nothing stored; confirmed with you):

| Entity | Where | Fields | Rules |
|---|---|---|---|
| ChestState (one per placed spot) | memory, `chests.js` | `spot` (spot id), `puzzle` (this play's puzzle from `quest.plan`), `at` ({ x, y, z }, the anchor's block), `gold` (boolean, `puzzle.challenge`), `tries` (0, 1 or 2), `coins` (10, 5, 0, or null until done), `done` (boolean) | `tries` only goes up (Not now keeps it); once `done`, nothing changes; `coins = coinsFor(tries)` set when done |
| Score (one per play) | memory, `chests.js` | `coins` (sum of done chests' coins), `left` (chests not done), `max` (`islandMax(quest.island)`) | `coins` ≤ `max`; `left` = number of chests with `done` false |
| New blocks | `bw/blocks.js`, `bw/atlas.js` | `gold_chest`, `chest_open`, `gold_chest_open` | cubes like `chest` (solid, same hardness); new tiles `gold_chest_top`, `gold_chest_side`, `chest_open_top`, `chest_open_side`, `gold_chest_open_top`, `gold_chest_open_side`, drawn in BlockWords' 16 pixel style; open chests show a dark empty inside on top and no lock on the sides |

Links: each ChestState has one Spot (`quest/islands/u9.js`), one Anchor (`quest.anchors`, spec 0006) and one Puzzle (`quest.plan`, spec 0002).

**State transitions** (one chest): `closed (tries 0)` → open the talk box → right: `done, coins 10` · wrong: `closed (tries 1)` → right: `done, coins 5` · wrong: `done, coins 0 (answer shown)`. Not now from any closed state keeps it closed with its tries. `done` → Carry on → the block becomes the open chest and the target is removed.

**Interface surface** (ES modules in `quest/js/`):

| Function | Inputs | Outputs | Notes |
|---|---|---|---|
| `chests.start({ quest, world })` in `chests.js` | the loaded quest (plan, island, anchors, kit flag) and the island world | places a chest block per placed spot, adds a use target per chest, sets the counter | called from `main.js` after the targets are attached and before the Play card |
| `chests.state()` | | `{ coins, left, max, done, total }` | for the debug line and feature 9 |
| `chests.onFinished(fn)` | a function | runs `fn({ coins, max })` once, after the last chest's talk box closes | for feature 9 |
| `panel.open(puzzle, { unit, title, onChoose, onClose, onLeave })` in `panel.js` | adds `title` (talk box title) and `onLeave` | when `onLeave` is given, a Not now button shows until `result()`; tapping it closes the talk box and calls `onLeave` | changes the spec 0004 talk box API; existing callers are unaffected |
| `hud.setCoins(n, max, { pop })` in `hud.js` | adds `pop` | the coin icon pops briefly (a CSS class, skipped with reduced motion) | |
| `world.setBlock(x, y, z, id)` then `world.rebuildDirty()` (spec 0004) | | the open chest | existing world API |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Place chests | which spots | the spots in `quest.island` (only spots whose anchor exists, spec 0006) |
| Place chests | where | `quest.anchors.get(spot.anchor).at` |
| Place chests | wooden or gold | `puzzle.challenge` of that spot's entry in `quest.plan` |
| Use target | label | "Open the chest" (the spec 0005 label line adds "· click or E" or "· tap") |
| Talk box | title | "Gold chest" when gold, else "Treasure chest" |
| Talk box | question, picture, answers, spoken text | the puzzle (spec 0002: `show`, `pic`, `choices`, `say`) |
| Wrong answer | hint line | `puzzle.hint` |
| Answer shown | answer and explanation | `puzzle.answer` and `puzzle.why` |
| Coins for a chest | 10, 5 or 0 | `coinsFor(tries)` (spec 0002) |
| Counter | total and maximum | the sum of done chests' coins; `islandMax(quest.island)` |
| Counter pop | whether to pop | `prefers-reduced-motion` (no pop when it asks to reduce) |
| N left | count | chests not done |
| Open chest | which block | `gold_chest_open` when gold, else `chest_open` |
| Finished hook | when | the talk box closing on the last chest to become done |
| Debug line | numbers | `chests.state()` |

**Key invariants**:
- One chest per placed spot, exactly at its anchor; nothing else is placed at an anchor.
- A chest's coins are decided once, by `coinsFor(tries)`, when it becomes done; the counter never passes `islandMax`.
- A done chest is never usable again, and its block stays the open chest for the rest of the play.
- Not now never changes `tries`, the question, or the coins.
- The finished hook runs at most once per play.

**Security model**: nothing new is stored or sent. Coins live only in memory until feature 10 sends them (spot, puzzle id, tries, coins, as spec 0002 says).

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: open the s1 chest, answer right: +10, coin pop, Carry on, the chest is open, 11 left, verifies **AC-2**, **AC-3**, **AC-5**
- Hint path: one wrong, then right: the hint shows, +5, verifies **AC-3**, **AC-4**
- Shown path: two wrong: the answer and explanation show, 0 coins, the chest opens empty, verifies **AC-4**, **AC-5**
- Leaving: one wrong, Not now, walk away, come back: the same question, then right gives 5, verifies **AC-6**
- Gold: a seed whose plan has a challenge question: that chest is gold and its title says "Gold chest", verifies **AC-1**, **AC-2**
- All done: answer all 12 (a test helper may answer for the pupil): 0 left, the finished hook ran once, the counter never passed 140, verifies **AC-7**
- Reload: all chests closed again, the counter back to 0, verifies **AC-8**
- Kit: a sample chest in `&kit` does not change the counter, verifies **AC-9**

## Build plan

Skateboard: first one chest a pupil can really open, then all the rules, then the looks, then the extras.

1. Write `chests.js`: place a wooden chest at every placed spot's anchor, add its use target, open the talk box with the spot's puzzle, apply `coinsFor` on right, wrong and shown, update the counter and N left, and on Carry on swap to the open chest and remove the target; call it from `main.js`, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-8**
2. Add `title` and the Not now button (`onLeave`) to the talk box, keep tries on Not now, and add the finished hook, satisfies **AC-2**, **AC-6**, **AC-7**
3. Add the gold chest and the two open chests (blocks and six tiles), use them for challenge puzzles and done chests, and add the coin pop to the counter, satisfies **AC-1**, **AC-3**, **AC-5**
4. Stop the kit's samples changing the counter, add the debug line, and measure the size and the block swap time, satisfies **AC-9**, **AC-10**

## Consequences

**Positive**:
- Release 1 becomes playable end to end on the beach island: find a chest, answer, earn coins.
- Pupils see their progress on the island itself (open chests) as well as in the counter.
- Feature 9 only needs the finished hook and `chests.state()`.

**Negative / tradeoffs**:
- A cube can only suggest an open lid (a dark inside on top); there is no lid animation.
- The talk box API grows a little (`title`, `onLeave`), which the riddle, find and word block features will also use.
- Coins are lost on a reload until feature 10 sends them.
- Riddle, find and word block spots look like chests in Release 1 (spec 0002 already accepts this).

**Neutral**:
- Mining (feature 23) must not let pupils break chests or open chests.
- The anchor's `face` is not used by chests (they look the same from every side, like BlockWords' chest).

## Follow-up

- [ ] Feature 9 (island finish): use `chests.onFinished` and `chests.state()` for the ending.
- [ ] Feature 10 (scores): send each chest's `spot`, `puzzle.id`, `tries` and `coins`.
- [ ] Feature 23 (mining): chests (closed and open) cannot be broken.
- [ ] Features 11 to 13: reuse the talk box `title` and Not now for riddles, finds and word blocks.
