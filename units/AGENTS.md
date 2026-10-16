# Units (question banks)

## Overview

One file per Super Minds unit (`u1.js` to `u9.js`). Each fills `WORD_ISLAND_UNITS.uN` with the unit's topics, questions for every game, teacher hints and explanations. Treasure Quest is planned to reuse these banks and pictures, so keep their shape stable.

## Key files

| File | Owns |
|---|---|
| `units/uN.js` | One unit: `TOPICS`, the five banks, `HINTS`, `NOTES`, title and intro text |
| `img/uN/` | That unit's cropped book pictures (`.webp`), named by the `img` key a question uses |
| `tools/crop.py` | Crop boxes per unit (book page, x0, y0, x1, y1 at 80 dpi) and the cropping script |
| `index.html` (top script) | The helpers `look`, `ask`, `spell`, `hear` that build question objects |

## Conventions

- Banks map to games: `maze` uses `look(...)`, `moles` uses `ask(...)`, `hangman` uses `spell(...)`, `runner` and `planes` use `hear(...)`.
- Question ids are `uN` + a game letter + a name: `m` maze, `o` moles, `h` hangman, `r` runner, `p` planes (e.g. `u9m-fish`). Ids are saved in pupils' results, so never rename one that is live.
- The first choice is always the right answer; the game shuffles them. Wrong choices should be words from the same unit.
- Every question has a `topic` key from `TOPICS`. A round is 8 questions spread across topics plus 2 marked `{ challenge: true }`.
- `HINTS[id]` gives `hint` (a nudge before answering) and `why` (the explanation after); hints must make sense without the book (no page references).
- Book pages: Unit 1 is pp. 4 to 21; Unit N (N ≥ 2) starts at p. 22 + 12 × (N − 2). In the books Thunder is the red haired boy and Flash is the girl with the headband.
- Adding a unit: crop boxes in `tools/crop.py`, a `units/uN.js` bank, a `<script src="units/uN.js">` tag in `index.html`, and an entry in `UNITS` in `../quiz/src/WordIsland.tsx`.

## Gotchas

- Unit files are plain scripts that run in order; `uN.js` must load after the helpers in `index.html` and before the game scripts.
- The unit PDFs are scanned images (`../unit N.pdf`); read them by rendering pages, not by text extraction.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
