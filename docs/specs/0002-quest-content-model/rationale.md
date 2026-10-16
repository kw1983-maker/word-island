# 0002. Rationale: Treasure Quest content model

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

Treasure Quest islands need puzzles: treasure chests, riddle characters, listen and find, and word blocks, about 12 per island for a 10 minute play, across 9 units (Year 1: Units 1 to 4, Year 2: Units 5 to 9). Word Island already holds, per unit, about 130 to 155 checked questions in five banks (picture questions, answer questions, spelling words, and two listening banks), with teacher hints and explanations, and the book pictures cropped in `img/uN/`.

The forces: the content must be correct (pupils learn from it, and the teacher wants to check new text), replayable (pupils play an island more than once), easier for Year 1, and cheap to extend to 9 units. The game is built in releases: Release 1 has only chests, Release 3 adds the other puzzle types, so the data must already hold the full mix while the game plays only part of it. Feature 10 will save scores, so the maximum score per island must be fixed and computable.

Without one data shape, each puzzle feature would invent its own content format, and every unit would need code changes.

## Options considered

### Option 1: Fully authored islands

Every puzzle on every island is written out in the island file, with its own question, choices and answer.

**Pros**: total control over every puzzle; easy to read one island in one place.
**Cons**: about 100 new puzzles to write and check for 9 units; duplicates questions Word Island already has, so a fix must be made twice; fixed content makes replays a memory test.

### Option 2: Island file that references the banks, new text only where needed (chosen)

The island file lists spots and holds only riddles and Year 2 sentences; chests, finds and spelling words are drawn from the unit's existing banks at play time by one seeded drawing module.

**Pros**: reuses checked content and pictures; fresh questions each play; new units are mostly data; one fix reaches both games.
**Cons**: depends on bank conventions and ids; draw rules must keep Year 1 easy without hand picking; needs a checker to catch pools that are too small.

### Option 3: Reuse only

No riddles or sentences; riddle and find spots just show more bank questions.

**Pros**: no new text at all, fastest to build.
**Cons**: riddles stop being riddles and finds stop using the 3D world, which removes much of what makes the quest different from Word Island.

## Rationale

Option 2 fits the forces best. Correctness comes from reusing content that is already checked and used daily, plus a review page for the only new text. Replay value comes from drawing fresh questions at fixed spots. Year 1 is handled by rules (two choices, short words, no challenge questions) rather than by writing separate content. Cost across 9 units stays low because a unit only needs its riddles and sentences written. The `SUPPORTED` list lets Release 1 play every spot as a chest, while keeping the island data and the maximum score (140) the same across releases, which feature 10 needs.

Moving Word Island's picture drawer into a shared file was the engineer's pick over supporting book photos only; it costs one more regression pass on Word Island but makes every existing question usable in a chest.

The engineer's answers: reuse where possible and write the rest; same places with fresh questions; AI drafts riddles and the teacher checks them on a review page; free roam then a final treasure; Year 1 gets 2 choices and short words; hint, try again, then show; 10, 5 or 0 coins plus a 20 coin bonus; picture signs for finds; 6 chests, 2 riddles, 2 finds, 2 word blocks; Release 1 plays every spot as a chest; challenge questions on Year 2 only, at most 2; a Minecraft style look made from our own art, with word blocks broken then placed.
