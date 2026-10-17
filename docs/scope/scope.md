# Scope: Treasure Quest

A blocky, retro 3D treasure hunt inside Word Island. Pupils pick a hero, walk around an island built on one Super Minds unit, open chests and solve riddles to score marks. Year 1 plays Units 1 to 4, Year 2 plays Units 5 to 9.

**Build approach:** Skateboard (ship the smallest island pupils can really play, then grow it release by release).
**Look:** looks and feels like your own BlockWords game (`C:/Users/User/Documents/Claude/Minecraft`): first person, a sharp full screen picture, its blocky textures, sky and clouds, villagers, dark grey talk boxes and hotbar, reusing its code (ours, MIT licence; never Minecraft's own art or name). Treasure Quest stays a separate, simpler island game inside Word Island: pupils mine and craft too, but nothing can hurt them (no hearts, no hunger) and only puzzles give coins. Chests are blocky wooden chests, riddles come from villager style characters, find pictures hang in item frames or on signs, and word blocks are broken then placed (spec 0002).
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
| 4 | Retro look & sound kit | Foundation | done |
| 5 | Quest entry in Word Island | Release 1 | done |
| 6 | Movement & controls | Release 1 | done |
| 7 | Beach island (Unit 9) | Release 1 | done |
| 8 | Treasure chests | Release 1 | done |
| 9 | Island finish & score | Release 1 | done |
| 23 | Mining | Release 2 | in-progress |
| 24 | Crafting unit things | Release 2 | planned |
| 10 | Scores to your results page | Release 3 | planned |
| 11 | Riddle characters | Release 4 | planned |
| 12 | Listen and find | Release 4 | planned |
| 13 | Word blocks | Release 4 | planned |
| 14 | Pick your hero | Release 4 | planned |
| 15 | Free time island (Unit 5) | Release 5 | planned |
| 16 | Old house island (Unit 6) | Release 5 | planned |
| 17 | Get dressed island (Unit 7) | Release 5 | in-progress |
| 18 | Robot island (Unit 8) | Release 5 | planned |
| 19 | School island (Unit 1) | Release 6 | planned |
| 20 | Let's play island (Unit 2) | Release 6 | planned |
| 21 | Pet show island (Unit 3) | Release 6 | in-progress |
| 22 | Lunchtime island (Unit 4) | Release 6 | planned |

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

### 4. Retro look & sound kit · done
Make the island look and sound like BlockWords: its block textures, a sharp first person picture, sky and clouds, dark grey talk boxes with big green buttons, the hotbar, chiptune sounds and the browser voice reading every question.
**Done when:** a test scene looks like BlockWords on phone and laptop, a talk box shows a real puzzle, music and sound effects play, and the voice reads a question aloud.
The first build (spec 0003: chunky pixels, wooden signs, new textures) was turned down on 2026-10-16 as nothing like BlockWords; spec 0004 replaces it by reusing BlockWords' own code.
- [x] Redesign it to match BlockWords (spec): `/architect retro look & sound kit`
- [x] Build it: `/develop retro look & sound kit`
   - [x] BlockWords world in first person: copied blocks, atlas, mesher, island world, sea, sunny sky, screen sharpness and the test beach (AC-2 to AC-6, AC-17)
   - [x] Hand, hotbar and coin counter (AC-7, AC-8)
   - [x] Talk box, screens, Play card, font and pause menu (AC-1, AC-9 to AC-12, AC-14, AC-16)
   - [x] BlockWords sounds and the `&kit` view (AC-13 to AC-15, AC-18, AC-21)
   - [x] Remove the spec 0003 look, then the budget and speed checks (AC-19 to AC-21)
- [x] Verify it: `/check verify retro look & sound kit` (26 of 28 steps passed in a browser on 2026-10-17; the real iPhone and budget Android check was skipped for now, to run once walking is built)
Spec [0004](../specs/0004-quest-blockwords-look/index.md) (replaces [0003](../specs/0003-quest-look-sound-kit/index.md)) · code in `quest/js/bw/` (copied BlockWords code), `quest/js/` (`hand.js`, `hud.js`, `look.js`, `pause.js`, `panel.js`, `sound.js`, `kit.js`, `testscene.js`), `quest/quest.css`

## Release 1: Beach treasure hunt (the first playable island)

### 5. Quest entry in Word Island · done
A Treasure Quest button on Word Island that opens only the islands the pupil's class is allowed, and respects Pause class. Each unit's island stays locked until the pupil finishes that unit's five games.
**Done when:** a pupil who taps their class sees Treasure Quest with only their units, and the teacher's Pause freezes the quest too.
- [x] Design it (spec): `/architect quest entry in Word Island`
- [x] Build it: `/develop quest entry in Word Island`
   - [x] The locked sixth card on the unit page, opening after the five games, with the open all link (AC-1 to AC-4, AC-6, AC-7)
   - [x] The quest page's Finish the five games first screen (AC-4, AC-5)
   - [x] The island checker's island list check (AC-8)
- [x] Verify it: `/check verify quest entry in Word Island` (all 20 steps passed in a browser on 2026-10-17, with a stand in for Firebase; the real phone check is still owed with features 4, 6, 7, 8 and 9)
Spec [0009](../specs/0009-quest-entry-word-island/index.md) · code in `index.html`, `shared/quest.js`, `quest/js/` (`main.js`, `screens.js`), `tools/check-quests.mjs`

### 6. Movement & controls · done
Walk, look around and jump like in BlockWords, in first person; touch controls on phones, mouse and keys on laptops; nothing can hurt you, and pupils can never fall off or get stuck.
**Done when:** a 7 year old can walk around the island on a phone and a laptop without help, and falling into the sea puts them back on land.
- [x] Design it (spec): `/architect movement & controls`
- [x] Build it: `/develop movement & controls`
   - [x] Walk the test beach with the keys: BlockWords' player, arrows that turn, the island start (AC-2, AC-4, AC-9)
   - [x] Laptop mouse capture, crosshair and click hint; phone joystick, drag to look and Jump (AC-1, AC-3)
   - [x] Safety net: shallow water, back to the beach from deep water (AC-5)
   - [x] Use things: glow, label, click, E, tap and Use, with the kit chest and villager (AC-6, AC-10)
   - [x] Pauses clear the controls, steps, jump sound, head bob, debug and the size and speed checks (AC-7, AC-8, AC-10, AC-11)
- [x] Verify it: `/check verify movement & controls` (24 of 25 steps passed in a browser on 2026-10-17; the real iPhone and budget Android check is still owed, together with feature 4's)
Spec [0005](../specs/0005-quest-movement-controls/index.md) · code in `quest/js/bw/player.js`, `quest/js/` (`walk.js`, `controls.js`, `touchpad.js`, `targets.js`, `notice.js`)

### 7. Beach island (Unit 9) · done
A blocky beach (sand, sea, rocks, shells, sandcastles, beach things from the unit) with spots for about 10 to 12 puzzles.
**Done when:** the island is explorable in about 10 minutes, its objects match Unit 9 words, and every puzzle spot can be reached.
- [x] Design it (spec): `/architect beach island`
- [x] Build it: `/develop beach island`
   - [x] Walk the real island: map file, shape helpers, island builder, hill, path loop and start; test beach gone (AC-1, AC-3, AC-4)
   - [x] Landmarks and the 12 anchors, with `&debug` labels (AC-1, AC-2, AC-10)
   - [x] Island checker: anchors, walk only reachability, no traps, path, and missing anchors left out (AC-3, AC-5, AC-11)
   - [x] Beach things with the new tiles, word things that speak, and 3 villagers (AC-6, AC-7, AC-8, AC-9)
   - [x] Build time, slowed phone speed and size checks (AC-12)
- [x] Verify it: `/check verify beach island` (all 22 steps passed in a browser on 2026-10-17; the real iPhone and budget Android check is still owed, together with features 4 and 6)
Spec [0006](../specs/0006-quest-beach-island/index.md) · code in `quest/islands/u9-map.js`, `quest/js/` (`mapkit.js`, `island.js`), `tools/check-quests.mjs`

### 8. Treasure chests · done
Walk to a chest, hear a Unit 9 picture question, tap the right answer to open it and win coins.
**Done when:** each chest reads its question aloud, a right answer opens it with coins and a sound, a wrong answer gives a hint and a retry, and the score counts up.
- [x] Design it (spec): `/architect treasure chests`
- [x] Build it: `/develop treasure chests`
   - [x] A chest at every spot that opens with its puzzle: coins, hint, answer shown, open chest, N left (AC-1 to AC-5, AC-8)
   - [x] Talk box title and Not now, tries kept, and the finished hook for feature 9 (AC-2, AC-6, AC-7)
   - [x] Gold chest and open chest looks, and the coin pop (AC-1, AC-3, AC-5)
   - [x] Kit counter, debug line, size and speed checks (AC-9, AC-10)
- [x] Verify it: `/check verify treasure chests` (all 16 steps passed in a browser on 2026-10-17; the real phone check is still owed with features 4, 6 and 7)
Spec [0007](../specs/0007-quest-treasure-chests/index.md) · code in `quest/js/` (`chests.js`, `panel.js`, `hud.js`), `quest/js/bw/` (`blocks.js`, `atlas.js`)

### 9. Island finish & score · done
When all puzzles are done, a treasure ending shows the score and stars, with play again and back to Word Island.
**Done when:** finishing the island always shows the ending with the right score and stars, and both buttons work.
- [x] Design it (spec): `/architect island finish & score`
- [x] Build it: `/develop island finish & score`
   - [x] The ending after the last chest: finishing bonus, fanfare, read aloud, Play again and Back to Word Island (AC-1, AC-2, AC-4, AC-5, AC-6)
   - [x] Stars: the rule and the three star row in the talk box (AC-3)
   - [x] Size check (AC-7)
- [x] Verify it: `/check verify island finish & score` (all 11 steps passed in a browser on 2026-10-17; the real phone check is still owed with features 4, 6, 7 and 8)
Spec [0008](../specs/0008-quest-island-finish/index.md) · code in `quest/js/` (`finish.js`, `panel.js`, `main.js`)

## Release 2: Mine and craft

Mining and crafting follow BlockWords but stay simple, and the island content stays as planned: only puzzles give coins.

### 23. Mining · in-progress
Break blocks on the island and collect them in a hotbar, as in BlockWords; every block says its name when you collect it. Pupils can place them too.
**Done when:** pupils can break and collect blocks on a phone and a laptop, each block's name shows and is read aloud, and puzzle spots, chests and villagers can never be broken away.
- [x] Design it (spec): `/architect mining`
- [x] Build it: `/develop mining`
   - [x] Hold to break and collect on a laptop: cracks, sounds, the name, a full hotbar, use wins (AC-1, AC-2, AC-3, AC-6, AC-9)
   - [x] Keep the puzzles and the island floor safe: protected blocks and one block deep digging (AC-7, AC-8)
   - [x] Place blocks: right click, and the phone's hold to break and Place button (AC-4, AC-5)
   - [x] Speed and size checks (AC-10)
- [ ] Verify it: `/check verify mining`
Spec [0010](../specs/0010-quest-mining/index.md) · code in `quest/js/` (`mining.js`, `controls.js`, `touchpad.js`, `hud.js`, `main.js`)

### 24. Crafting unit things · needs a decision
Make things from the unit's words out of collected blocks (on the beach: a bucket, a spade, a sandcastle, a fishing rod); each thing is named and read aloud.
**Done when:** a pupil can craft every unit thing on the island on a phone and a laptop, sees and hears its name, and crafting never changes the coins.
- [ ] Design it (spec): `/architect crafting unit things`

## Release 3: Scores reach you

### 10. Scores to your results page · needs a decision
Each finished island sends name, class, unit and score to your Teacher results page, with a per class, per unit leaderboard; impossible scores are rejected.
**Done when:** a finished island appears on the results page and leaderboard, the rules refuse a score above the island's maximum, and it is proven on the emulator before the real project.
- [ ] Design it (spec): `/architect scores to your results page`

## Release 4: More puzzles and heroes

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

## Release 5: Year 2 islands

### 15. Free time island (Unit 5)
A park and playground island for days of the week and free time activities.
**Done when:** the island plays end to end with Unit 5 content and scores reach the results page.
- [ ] Build it: `/develop free time island`

### 16. Old house island (Unit 6)
A spooky old house with rooms to search for treasure.
**Done when:** the island plays end to end with Unit 6 content and scores reach the results page.
- [ ] Build it: `/develop old house island`

### 17. Get dressed island (Unit 7) · in-progress
A clothes shop and wardrobe island for clothes and colours.
**Done when:** the island plays end to end with Unit 7 content and scores reach the results page.
- [ ] Build it: `/develop get dressed island`

### 18. Robot island (Unit 8)
A toy workshop island for robot body parts and actions.
**Done when:** the island plays end to end with Unit 8 content and scores reach the results page.
- [ ] Build it: `/develop robot island`

## Release 6: Year 1 islands

Year 1 islands lean on pictures and listening, with shorter words and fewer letters per word block.

### 19. School island (Unit 1)
A school island with classroom things.
**Done when:** the island plays end to end with Unit 1 content at Year 1 difficulty and scores reach the results page.
- [ ] Build it: `/develop school island`

### 20. Let's play island (Unit 2)
A toy room and playground island.
**Done when:** the island plays end to end with Unit 2 content at Year 1 difficulty and scores reach the results page.
- [ ] Build it: `/develop lets play island`

### 21. Pet show island (Unit 3) · in-progress
A pet show island with animals to find.
**Done when:** the island plays end to end with Unit 3 content at Year 1 difficulty and scores reach the results page.
- [x] Design it (spec): the teacher asked for "the same game for unit 3" (pet show park, about 12 animal tiles, push live straight away)
- [x] Build it: `/develop pet show island` (island file, 16 new tiles, `tree`/`tent`/`pen`/`table`/`log` helpers, map, Word Island card)
- [x] Verify it: all 8 checks passed in a browser on 2026-10-17 (scores reaching the results page waits for feature 10, as on Unit 9)
Spec [0011](../specs/0011-quest-pet-show-island/index.md) · code in `quest/islands/u3.js`, `quest/islands/u3-map.js`

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
