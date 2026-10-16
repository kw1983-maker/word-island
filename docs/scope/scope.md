# Scope: Treasure Quest

A blocky, retro 3D treasure hunt inside Word Island. Pupils pick a hero, walk around an island built on one Super Minds unit, open chests and solve riddles to score marks. Year 1 plays Units 1 to 4, Year 2 plays Units 5 to 9.

**Build approach:** Skateboard (ship the smallest island pupils can really play, then grow it release by release).
**Look:** Minecraft style, made from our own blocky textures, characters and sounds (never Minecraft's own art or name). Chests are blocky wooden chests, riddles come from villager style characters, find pictures hang in item frames or on signs, and word blocks are broken then placed (spec 0002).
**Workflow:** Alpha (after `/develop`, `/check verify` plays it in a real browser at phone and laptop size). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· Beta`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Word Island practice games | Existing | existing |
| B | Class settings, results page and leaderboards | Existing | existing |
| 1 | Project context & standards | Foundation | planned |
| 2 | Game engine & page structure | Foundation | in-progress |
| 3 | Quest content model | Foundation | done |
| 4 | Retro look & sound kit | Foundation | in-progress |
| 5 | Quest entry in Word Island | Release 1 | planned |
| 6 | Movement & controls | Release 1 | planned |
| 7 | Beach island (Unit 9) | Release 1 | planned |
| 8 | Treasure chests | Release 1 | planned |
| 9 | Island finish & score | Release 1 | planned |
| 10 | Scores to your results page | Release 2 | planned |
| 11 | Riddle characters | Release 3 | planned |
| 12 | Listen and find | Release 3 | planned |
| 13 | Word blocks | Release 3 | planned |
| 14 | Pick your hero | Release 3 | planned |
| 15 | Free time island (Unit 5) | Release 4 | planned |
| 16 | Old house island (Unit 6) | Release 4 | planned |
| 17 | Get dressed island (Unit 7) | Release 4 | planned |
| 18 | Robot island (Unit 8) | Release 4 | planned |
| 19 | School island (Unit 1) | Release 5 | planned |
| 20 | Let's play island (Unit 2) | Release 5 | planned |
| 21 | Pet show island (Unit 3) | Release 5 | planned |
| 22 | Lunchtime island (Unit 4) | Release 5 | planned |

## Already built (for context)

### A. Word Island practice games · existing
The pupil site at word-island-red.vercel.app: 5 games per unit, Units 1 to 9, with question banks and pictures the quest will reuse. code in `index.html`, `units/`, `img/`, `run.js`, `sky.js`

### B. Class settings, results page and leaderboards · existing
Teacher sets class to units and Pause on the quiz Teacher results page; results and leaderboards live in the quiz Firebase project. code in `../quiz/src/`, `../quiz/firestore.rules`

## Foundations

### 1. Project context & standards
Write down how Word Island is built and deployed (Vercel preview then promote, quiz copy, Firebase deploy order) so every later step follows it.
**Done when:** root `AGENTS.md` describes the structure, the deploy steps and the "never test write to the real Firebase" rule.
- [ ] Capture conventions: `/audit`

### 2. Game engine & page structure · in-progress
How a 3D game sits inside a plain HTML site that must load fast on cheap phones, and how it shares the unit banks and class settings.
**Done when:** an empty blocky scene opens from Word Island on a phone and a laptop, runs smoothly, and can read a unit's existing questions.
- [x] Design it (spec): `/architect game engine & page structure`
- [ ] Build it: `/develop game engine & page structure`
   - [x] Shared files lifted out of `index.html`, Word Island unchanged (AC-10)
   - [x] Three.js r184 vendored, quest page, engine loop and test scene (AC-1, AC-6, AC-9)
   - [x] Boot checks, unit loading, class check and every overlay screen (AC-2, AC-3, AC-4)
   - [x] Pause, turn your phone, Back button, quality watch and debug view (AC-5, AC-7, AC-8, AC-12, AC-13)
   - [ ] Quiz copy, `.vercelignore`, preview deploy and download check (AC-9, AC-11): all done locally; the Vercel preview and quiz deploy wait for your go ahead
- [ ] Verify it: `/check verify game engine & page structure`
Spec [0001](../specs/0001-quest-engine-page-structure/index.md) · code in `quest/`, `shared/`

### 3. Quest content model · done
One way to describe an island's puzzles (chests, riddles, listen and find, word blocks) that reuses the existing unit questions and pictures, with easier settings for Year 1.
**Done when:** all four puzzle types and the Unit 9 content can be written in the one shape, and adding a unit means adding data, not code.
- [x] Design it (spec): `/architect quest content model`
- [x] Build it: `/develop quest content model`
   - [x] Shared picture drawer lifted out of `index.html`, Word Island unchanged (AC-8)
   - [x] Unit 9 island file and the chest draw with Year rules, seeds and coins (AC-1 to AC-7, AC-12)
   - [x] Island loading in the quest, the drawn plan in the debug view (AC-11)
   - [x] Riddle, find and word block drawing ready for Release 3 (AC-2, AC-4)
   - [x] Island checker and review page (AC-9, AC-10)
- [x] Verify it: `/check verify quest content model`
Spec [0002](../specs/0002-quest-content-model/index.md) · code in `quest/islands/`, `quest/js/puzzles.js`, `quest/review.html`, `shared/picture.js`, `tools/check-quests.mjs`

### 4. Retro look & sound kit · in-progress
The blocky pixel palette and textures, chunky pixel screen, big pupil friendly buttons and text, chiptune music and beeps, and the browser voice that reads every question.
**Done when:** a test scene shows the block set and on screen panel, music and sound effects play, and the voice reads a question aloud on phone and laptop.
- [x] Design it (spec): `/architect retro look & sound kit`
- [ ] Build it: `/develop retro look & sound kit`
   - [ ] Play button, sound effects, saved Sound and Music, and the voice (AC-1, AC-9, AC-11, AC-12, AC-16)
   - [ ] Pixel font, wooden sign panels, top bar and the `&kit` sample puzzles (AC-5 to AC-8, AC-13, AC-14)
   - [ ] Pixel blocks, the rebuilt test island and the chunky screen (AC-2, AC-3, AC-4, AC-14)
   - [ ] Music, the sound and voice boards, and the budget and failure checks (AC-10, AC-14, AC-15, AC-16)
- [ ] Verify it: `/check verify retro look & sound kit`
Spec [0003](../specs/0003-quest-look-sound-kit/index.md)

## Release 1: Beach treasure hunt (the first playable island)

### 5. Quest entry in Word Island
A Treasure Quest button on Word Island that opens only the islands the pupil's class is allowed, and respects Pause class.
**Done when:** a pupil who taps their class sees Treasure Quest with only their units, and the teacher's Pause freezes the quest too.
- [ ] Build it: `/develop quest entry in Word Island`

### 6. Movement & controls · needs a decision
Walk, turn and jump with a camera behind the hero; touch joystick on phones, arrows and WASD on laptops; pupils can never fall off or get stuck.
**Done when:** a 7 year old can walk around the island on a phone and a laptop without help, and falling into the sea puts them back on land.
- [ ] Design it (spec): `/architect movement & controls`

### 7. Beach island (Unit 9) · needs a decision
A blocky beach (sand, sea, rocks, shells, sandcastles, beach things from the unit) with spots for about 10 to 12 puzzles.
**Done when:** the island is explorable in about 10 minutes, its objects match Unit 9 words, and every puzzle spot can be reached.
- [ ] Design it (spec): `/architect beach island`

### 8. Treasure chests
Walk to a chest, hear a Unit 9 picture question, tap the right answer to open it and win coins.
**Done when:** each chest reads its question aloud, a right answer opens it with coins and a sound, a wrong answer gives a hint and a retry, and the score counts up.
- [ ] Build it: `/develop treasure chests`

### 9. Island finish & score
When all puzzles are done, a treasure ending shows the score and stars, with play again and back to Word Island.
**Done when:** finishing the island always shows the ending with the right score and stars, and both buttons work.
- [ ] Build it: `/develop island finish & score`

## Release 2: Scores reach you

### 10. Scores to your results page · needs a decision
Each finished island sends name, class, unit and score to your Teacher results page, with a per class, per unit leaderboard; impossible scores are rejected.
**Done when:** a finished island appears on the results page and leaderboard, the rules refuse a score above the island's maximum, and it is proven on the emulator before the real project.
- [ ] Design it (spec): `/architect scores to your results page`

## Release 3: More puzzles and heroes

### 11. Riddle characters
Characters on the island read a riddle aloud ("I am yellow and you build castles with me") and the pupil picks the answer.
**Done when:** each riddle character speaks its riddle, answers give right and wrong feedback, and solved riddles add to the score.
- [ ] Build it: `/develop riddle characters`

### 12. Listen and find
Hear a word, then walk to the right object in the world; a pointer helps after a while.
**Done when:** touching the right object scores, a wrong one says what it is, and the help pointer appears if a pupil is stuck.
- [ ] Build it: `/develop listen and find`

### 13. Word blocks
Collect letter or word blocks around the island and put them in order to spell a word or build a sentence from the unit.
**Done when:** blocks can be picked up and ordered on phone and laptop, the right order scores, and Year 1 uses short words only.
- [ ] Build it: `/develop word blocks`

### 14. Pick your hero
Choose Ming, Mei, Jie, Flash or Robo as a blocky character before playing.
**Done when:** all five heroes look right in the pixel style, the choice is remembered, and the chosen hero is the one that walks.
- [ ] Build it: `/develop pick your hero`

## Release 4: Year 2 islands

### 15. Free time island (Unit 5)
A park and playground island for days of the week and free time activities.
**Done when:** the island plays end to end with Unit 5 content and scores reach the results page.
- [ ] Build it: `/develop free time island`

### 16. Old house island (Unit 6)
A spooky old house with rooms to search for treasure.
**Done when:** the island plays end to end with Unit 6 content and scores reach the results page.
- [ ] Build it: `/develop old house island`

### 17. Get dressed island (Unit 7)
A clothes shop and wardrobe island for clothes and colours.
**Done when:** the island plays end to end with Unit 7 content and scores reach the results page.
- [ ] Build it: `/develop get dressed island`

### 18. Robot island (Unit 8)
A toy workshop island for robot body parts and actions.
**Done when:** the island plays end to end with Unit 8 content and scores reach the results page.
- [ ] Build it: `/develop robot island`

## Release 5: Year 1 islands

Year 1 islands lean on pictures and listening, with shorter words and fewer letters per word block.

### 19. School island (Unit 1)
A school island with classroom things.
**Done when:** the island plays end to end with Unit 1 content at Year 1 difficulty and scores reach the results page.
- [ ] Build it: `/develop school island`

### 20. Let's play island (Unit 2)
A toy room and playground island.
**Done when:** the island plays end to end with Unit 2 content at Year 1 difficulty and scores reach the results page.
- [ ] Build it: `/develop lets play island`

### 21. Pet show island (Unit 3)
A pet show island with animals to find.
**Done when:** the island plays end to end with Unit 3 content at Year 1 difficulty and scores reach the results page.
- [ ] Build it: `/develop pet show island`

### 22. Lunchtime island (Unit 4)
A picnic and lunchbox island for food words.
**Done when:** the island plays end to end with Unit 4 content at Year 1 difficulty and scores reach the results page.
- [ ] Build it: `/develop lunchtime island`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Mandarin hint button**: a 中 button that shows instructions in Mandarin
- **Recorded voices**: ElevenLabs voices for riddles instead of the browser voice
- **Make your own avatar**: pick hair, skin and shirt colours
- **Final boss riddle and island map**: a longer 15 to 20 minute mode
- **Revision world**: one world per year mixing questions from all its units

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies, so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· Beta`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
