# 0002. Describe each Treasure Quest island in one data file that reuses the unit question banks

**Date**: 2026-10-16
**Status**: Proposed

## Summary

Each island is one small data file, `quest/islands/uN.js`. It says whether it is a Year 1 or Year 2 island, lists its 12 puzzle spots (6 chests, 2 riddles, 2 listen and find, 2 word blocks), and holds the only new text: riddles and Year 2 sentences. Every play draws fresh questions for those spots from the questions Word Island already has, so fixing a question fixes it in both places. Word Island's picture drawing moves into a shared file, so every question looks the same in the quest. A checker script and a review page let you check an island before it goes live. The whole quest has a Minecraft style look (our own textures and characters, not Minecraft's).

## Requirements

**User stories**:
- As a pupil, I want a fresh set of puzzles each time I play an island, so that replaying is still a challenge.
- As a Year 1 pupil, I want fewer choices and short words, so that I can solve puzzles on my own.
- As the teacher, I want to read every riddle and sentence with its answer before pupils see it, so that nothing wrong or confusing reaches them.
- As the person adding islands, I want a new island to be a data file only, so that Units 1 to 8 are quick to add after Unit 9.

**Acceptance criteria**:
- **AC-1**: `quest/islands/u9.js` describes Unit 9: `year: 2`, `bonus: 20`, 12 spots (6 `chest`, 2 `riddle`, 2 `find`, 2 `blocks`), each with a unique `id` and an `anchor` name, a riddle pool of 4 to 6 riddles, and 3 to 6 sentences.
- **AC-2**: `drawIsland(island, unit, seed)` returns one puzzle per spot with a fresh question: chests from the unit's Word maze and Answer moles questions, spread across topics; finds from Run and pick and Listen and shoot questions whose choices are pictures; word blocks from Spelling balloons words (and, on Year 2, one sentence); riddles from the island's pool. No question appears twice in one play.
- **AC-3**: The same seed always gives the same puzzles; different seeds usually give different questions at the same spots.
- **AC-4**: Year 1 islands show 2 choices (the right one and one random wrong one) on chests, riddles and finds, use spelling words of up to 5 letters with no spaces, have no sentences and no challenge questions. Year 2 islands draw at most 2 challenge questions, make exactly one of the two word block spots a sentence, and use spelling words of up to 8 letters.
- **AC-5**: A spot whose puzzle type the game cannot play yet is played as a chest (Release 1: all 12 spots are chests). The island's maximum is always 12 × 10 + `bonus` coins (140 for Unit 9), whatever the release.
- **AC-6**: Every drawn puzzle carries what the game needs: the text to show, the text to speak, the choices in a shuffled order with the right one marked, its picture, a hint and an explanation (from Word Island's `hints`/`notes`, the riddle's own fields, or the fallbacks in this spec).
- **AC-7**: `coinsFor(tries)` gives 10 for the first try, 5 for the second (after the hint), and 0 when the answer had to be shown; the answer is shown after the second wrong try.
- **AC-8**: Every Word Island picture style (book photos, icons, balloons, counts, colour mixes, letters, numbers, quotes, days, calendar) draws the same in the quest as in Word Island, through `shared/picture.js` and `shared/picture.css`. Word Island looks and behaves exactly as before.
- **AC-9**: `node tools/check-quests.mjs` checks every island file against the rules in this spec, prints one plain line per problem, and exits with an error when there is one. Unit 9 passes.
- **AC-10**: `quest/review.html?unit=u9` lists the island's spots, every riddle (pictures, choices, the right answer marked, hint and explanation), every sentence, the pool size for each puzzle type, and one sample play. It is not linked from anywhere pupils go.
- **AC-11**: Opening the quest for a unit with no island file yet shows "This island is not open".
- **AC-12**: The drawing code contains no unit specific code: adding Unit 5 means adding `quest/islands/u5.js` and passing the checker, nothing else.

## Decision

**Chosen option**: Option 2: one island data file per unit that references the existing banks, with new text only for riddles and sentences.

Islands are ES module data files that list spots and new text; puzzles are drawn at play time from the unit's existing banks by one shared, seeded drawing module.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Style**: the whole quest follows a Minecraft style look made from our own art: puzzle chests look like blocky wooden chests, riddles come from blocky villager style characters, listen and find pictures hang in item frames or on wooden signs, and word blocks are letter blocks the pupil breaks to collect, then places in order on a wooden bench. Specs for the look kit (feature 4), movement (6) and the beach island (7) build on this.

**Data model sketch** (data files, nothing stored online):

| Entity | Where | Fields | Rules |
|---|---|---|---|
| Island | `quest/islands/uN.js`, `export default { … }` | `unit` (string, required, `u1`…`u9`, equals the file name), `year` (1 or 2, required), `bonus` (number, required, 20), `spots` (Spot[], required), `riddles` (Riddle[], required), `sentences` (Sentence[], required, empty on Year 1) | 1 island → exactly 12 spots, 4 to 6 riddles, 0 sentences (Year 1) or 3 to 6 (Year 2) |
| Spot | inside Island | `id` (string, required, `s1`…`s12`), `type` (`chest`, `riddle`, `find`, `blocks`, required), `anchor` (string, required) | ids unique in the island; exactly 6 chest, 2 riddle, 2 find, 2 blocks; `anchor` names a place the island map (feature 7) defines |
| Riddle | inside Island | `id` (string, required, `uNq-r-<name>`), `topic` (required, a key of the unit's `topics`), `lines` (2 or 3 strings, required), `choices` (3 strings, required, first is right), `pics` (boolean, optional), `alts` (3 strings, required when `pics`), `hint` (string, required), `why` (string, required), `by` (string, optional speaker name) | with `pics`, every choice is a picture file name in `img/uN/`; ids unique across the island |
| Sentence | inside Island | `id` (string, required, `uNq-s-<name>`), `text` (string, required), `topic` (required, a key of `topics`) | 3 to 6 words; only letters, apostrophes, spaces and one closing `.`, `!` or `?` |
| Bank question | `units/uN.js` (existing, unchanged) | as today | read only by the quest |
| Puzzle (drawn at play time, never stored) | memory | `spot` (Spot id), `type` (spot type), `playAs` (type actually played), `id` (bank question id, riddle id or sentence id), `show` (text), `say` (spoken text), `choices` ({ value, label, ok }[] for chest, riddle, find), `answer` (word or sentence for blocks), `pic` (the item for the picture drawer, optional), `hint`, `why`, `challenge` (boolean) | one per spot; feature 10 sends `spot`, `id`, `tries`, `coins` per puzzle |

Example (shortened):

```js
// quest/islands/u9.js
export default {
  unit: "u9",
  year: 2,
  bonus: 20,
  spots: [
    { id: "s1", type: "chest", anchor: "pier-end" },
    { id: "s7", type: "riddle", anchor: "hut" },
    { id: "s9", type: "find", anchor: "rock-pool" },
    { id: "s11", type: "blocks", anchor: "bench" }
    // … 12 in all
  ],
  riddles: [
    { id: "u9q-r-sandcastle", topic: "beach", by: "Robo",
      lines: ["I am made of sand.", "I have towers, but I am not big.", "The sea can wash me away."],
      choices: ["sandcastle", "shells", "fish"], pics: true, alts: ["a sandcastle", "shells", "a fish"],
      hint: "You make me with a bucket.", why: "A sandcastle is made of sand. Let's make a sandcastle!" }
  ],
  sentences: [{ id: "u9q-s-sandcastle", text: "Let's make a sandcastle.", topic: "beach" }]
};
```

**Drawing rules** (in `quest/js/puzzles.js`):
- Tag every bank item with `unit` and `game` after loading, as Word Island does.
- Chests: candidates are `banks.maze` and `banks.moles`. Pick round robin across shuffled topics. Year 1 skips `challenge` items; Year 2 takes at most 2.
- Finds: candidates are `banks.runner` and `banks.planes` items with `pics` or `icons`, under the same challenge rule.
- Word blocks: spelling candidates are `banks.hangman` words without spaces, up to 5 letters (Year 1) or 8 letters (Year 2). On Year 2, the first `blocks` spot in spot order is a sentence from `island.sentences`, and the other is a spelling word.
- Riddles: drawn from `island.riddles`.
- No id is used twice in a play.
- Year 1: 2 choices, the right one plus one wrong one picked at random. Choice order is always shuffled.
- Spots whose `type` is not in `SUPPORTED` (Release 1: `["chest"]`) get `playAs: "chest"` and a chest question. Features 11 to 13 add their type to `SUPPORTED`.
- Randomness: a small seeded generator (`mulberry32`). The seed is the `&seed=` address parameter when present (debug and testing), else a random one per play.

**Interface surface**:
| Interface | Inputs | Outputs | Notes |
|---|---|---|---|
| `drawIsland(island, unit, seed)` | island data, the loaded unit bank, a number | Puzzle[12] in spot order | Pure; no DOM |
| `SUPPORTED` | none | puzzle types the game can play | Grows per release |
| `islandMax(island)` | island data | `12 * 10 + island.bonus` | Feature 10 uses it for the score limit |
| `coinsFor(tries)` | wrong tries before the right answer (0, 1, or 2 when shown) | 10, 5 or 0 | Answer shown after the second wrong try |
| `picture(item, small, base)` in `shared/picture.js` | a bank item, optional size, image folder (default `"img/"`) | HTML string | Moved from `index.html`; quest passes `"../img/"` |
| `choiceText(item, choice)`, `answerText(item)` in `shared/picture.js` | as today | as today | Moved verbatim from `index.html` |
| `quest/islands/uN.js` | none | the island default export | Loaded by `main.js` with `import()`; missing file → "This island is not open" |
| `node tools/check-quests.mjs [uN]` | optional unit | problem lines, exit code | Loads `shared/bank.js` and `units/uN.js` in a Node `vm` context |
| `quest/review.html?unit=uN[&seed=N]` | unit, optional seed | the review list | Uses the same `drawIsland` |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Draw | which spots exist, their type and place name | `island.spots` |
| Draw | Year 1 or Year 2 rules | `island.year` |
| Draw | chest question | `unit.banks.maze` + `unit.banks.moles`, by the drawing rules |
| Draw | find question | `unit.banks.runner` + `unit.banks.planes` items with `pics` or `icons` |
| Draw | spelling word | `unit.banks.hangman[i].word`, filtered by length |
| Draw | sentence | `island.sentences[i].text` (Year 2 only) |
| Draw | riddle | `island.riddles[i]` |
| Draw | random choices | `seed` (address `&seed=` or a fresh random number) |
| Chest | text shown | `"“" + pic.quote + "” " + q` when the item has a quote picture, else `item.q` |
| Chest | text spoken | `item.speakQ || item.q` (as Word Island's `spoken`) |
| Chest, find | choice labels | `choiceText(item, choice)` (pictures use `alts`, icons use `THING`) |
| Chest | picture | `picture(item, false, "../img/")` |
| Find | spoken word | `item.say` |
| Find | sign pictures | picture names in `item.choices` (`img/uN/<name>.webp`), or icon names drawn by `icon()` |
| Riddle | text shown and spoken | `riddle.lines` joined with spaces |
| Riddle | choice pictures | `img/uN/<choice>.webp` when `pics`, with `alts` as labels |
| Word blocks | letters or words | the word split into letters, or the sentence split into words (the closing mark stays on the last word) |
| Word blocks | spoken | the word, or the sentence text |
| Any bank puzzle | hint | `unit.hints[id].hint`, else the fallback: chest "Look at the picture again.", find "Listen again.", spelling "It starts with <first letter>." |
| Any bank puzzle | explanation after showing the answer | `unit.hints[id].why`, else `unit.notes[id]`, else `item.say` (chest, find) or the word spelled out (spelling) |
| Riddle | hint, explanation | `riddle.hint`, `riddle.why` |
| Gold chest look | challenge flag | `item.challenge` |
| Coins | coins for a puzzle | `coinsFor(tries)` |
| End | maximum coins | `islandMax(island)` |

**Key invariants**:
- The first choice in every bank item and riddle is the right one (the existing convention); the game never shows them in that order.
- A play never repeats an id. The pools must be big enough: the checker fails an island whose pools cannot fill all 12 spots under its year's rules.
- The quest never writes to `units/uN.js` data; it only reads and tags it.
- `islandMax` does not depend on the release.
- Nothing in `puzzles.js` names a unit.

**Checker rules** (`tools/check-quests.mjs`): every field rule in the data model table; picture names exist in `img/uN/`; riddle and sentence topics exist in the unit's `topics`; spot and puzzle ids unique; pools big enough for one full play under the year's rules (all 12 spots as chests for Release 1, and the full mix); Year 1 has no sentences; 20 sample draws with seeds 1 to 20 complete without error and repeat no id.

**Security model**: static data files, read only, no personal data. The review page shows answers, so it carries `<meta name="robots" content="noindex">` and no link from Word Island or the quest; answers are already visible to anyone reading the public unit files, so it is no new exposure.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: `drawIsland(u9 island, u9 bank, 7)` returns 12 chests (Release 1) with 12 different ids spread across topics, each with shuffled choices and a picture, verifies **AC-2**, **AC-5**, **AC-6**
- Seeds: seed 7 twice gives the same plan; seeds 7 and 8 differ, verifies **AC-3**
- Year 1: a test Year 1 island over Unit 1 gives 2 choices everywhere, short words, no sentences, no challenge items, verifies **AC-4**
- Full mix: with `SUPPORTED` set to all four types, the plan has 6 chests, 2 riddles, 2 finds, 2 word blocks (one a sentence on Year 2), verifies **AC-2**, **AC-4**
- Checker: Unit 9 passes; a copy with a missing picture name, a 7 word sentence and 11 spots fails with three plain lines, verifies **AC-9**
- Pictures: one item of each picture style drawn in the quest and in Word Island looks the same, verifies **AC-8**
- Regression: Word Island's five games still show their pictures, verifies **AC-8**
- Review page: lists 4 to 6 riddles with the right answer marked and a sample play, verifies **AC-10**
- Missing island: `/quest/?unit=u5` shows "This island is not open", verifies **AC-11**

## Build plan

Skateboard order: first the data and the draw that Release 1's chests need, then the tools that keep island content safe, then the full mix ready for Release 3.

1. Move `HEX`, `THING`, `ICONS`, `EAR`, `esc`, `icon`, `balloonSvg`, `picture` (with the new `base` parameter, default `"img/"`), `choiceText` and `answerText` from `index.html` into `shared/picture.js`, and their picture CSS rules into `shared/picture.css`; load both in `index.html` and the quest; retest Word Island's pictures in all five games, satisfies **AC-8**
2. Write `quest/islands/u9.js`: year 2, bonus 20, 12 spots with anchor names, 6 riddles and 4 sentences drafted from the Unit 9 pages and words, satisfies **AC-1**
3. Write `quest/js/puzzles.js`: tagging, seeded generator, chest drawing with topic spread and the challenge limit, Year 1 choice trimming, `SUPPORTED`, `islandMax`, `coinsFor`, hints and explanations with fallbacks, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-12**
4. Load the island file in `quest/js/main.js` (missing → "This island is not open") and show the drawn plan in the `&debug` view, satisfies **AC-11**, **AC-2**
5. Add riddle, find and word block drawing (riddle pool, picture item finds, spelling and sentence blocks), so Release 3 only switches `SUPPORTED`, satisfies **AC-2**, **AC-4**
6. Write `tools/check-quests.mjs` and run it on Unit 9 plus a deliberately broken copy, satisfies **AC-9**, **AC-12**
7. Write `quest/review.html` and share its preview address with you for the riddle and sentence check, satisfies **AC-10**

## Consequences

**Positive**:
- New islands are mostly data; a fix to a Word Island question reaches the quest at once.
- Every play is different, while each spot always stays at the same place on the island.
- The checker stops a broken island before it reaches pupils, and the review page puts every new sentence in front of you.

**Negative / tradeoffs**:
- Build step 1 touches `index.html` again (the picture drawer), so Word Island needs another regression pass.
- Quest content depends on the bank ids and conventions; renaming a bank id or breaking the "first choice is right" rule breaks the quest too (the checker catches most of it).
- Riddles and sentences are new text that must be written and checked for all 9 units.
- Release 1 islands are all chests, so they feel more like a quiz until Release 3.

**Neutral**:
- Island files are ES modules, unit files stay classic scripts.
- A `&seed=` address parameter exists for testing and the review page.
- The Minecraft style note applies to features 4, 6, 7 and 8 onwards.

## Follow-up

- [ ] The beach island spec (feature 7) defines the anchor names `quest/islands/u9.js` uses (`pier-end`, `hut`, `rock-pool`, `bench`, …), or renames them in the island file.
- [ ] Feature 10 sends `spot`, `id`, `tries` and `coins` per puzzle and uses `islandMax` for the score limit in the Firestore rules.
- [ ] Riddles and sentences for Units 1 to 8 are drafted when each island is built, and checked on the review page each time.
