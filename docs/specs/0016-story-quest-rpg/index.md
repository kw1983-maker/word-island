# 0016. Story Quest: a 2D pixel story RPG for Unit 9, "Save the Beach Day"

**Date**: 2026-10-18
**Status**: In Progress

## Summary

The teacher shared an idea card for an RPG (role playing game): pupils become a character, explore a top down pixel map, talk to people, answer quiz questions and finish a mission, with a bag, dialogue boxes, hearts and a score. Story Quest is that game inside Word Island, built from a unit's question banks. The first adventure is Unit 9 (At the beach, Year 2): "Save the Beach Day". A storm mixed up the beach; the pupil helps five friends so the beach party can start at sunset. It is a flat 2D canvas game (no Three.js), so it runs on budget phones, and all of a unit's adventure is one data file, so another unit is a new file.

## Teacher's picks (2026-10-18)

- First unit: **Unit 9 At the beach**.
- Where: **inside Word Island**, a new card next to Treasure Quest (same link, class settings, banks and pictures).
- Style: **2D pixel story RPG**: top down map, people to talk to, a mission with steps, bag, hearts and score. No battles.
- Mission: **Save the beach day** (a storm mixed up the beach; help friends so the party can start).
- Unlock: **same rule as Treasure Quest** (the unit's five Word Island games done on this device, or `?open=all`).
- Scores: **not sent to the results page yet** (no Firebase or rules change).

## Calls made while building (check these)

- The game is called **Story Quest**; the card is "07 Story Quest · Help your friends on a mission."
- The pupil plays as **themselves** (called by their Word Island name), with 4 looks to choose from, because Mei, Jie, Flash and Thunder are people in the story.
- At 0 hearts there is no game over: Robo says "You look tired. Have a rest!", the pupil goes back to the pier with full hearts, and every finished task stays done.
- Progress is saved on the device in a new key `word-island-rpg-u9`, so a reload carries on; the finish panel's Play again starts fresh.

## Acceptance criteria

- **AC-1**: `rpg/?unit=u9` opens Story Quest after the same checks as the quest page: pupil known, class allowed to see the unit, the teacher's Pause screen, and the five games done (or `?open=all`), else the matching end screen. A Play tap starts sound and voice.
- **AC-2**: The pupil picks one of 4 looks, then walks a top down pixel beach (40 by 30 tiles, 16 pixel art drawn in code) tile by tile: arrows or WASD on a laptop, a D-pad on a phone. The camera follows; the picture stays sharp (whole number scaling).
- **AC-3**: A (Space, Enter or E on a laptop) talks to the person or uses the thing in front. Talk boxes show the speaker's face and name, type the words out (a tap shows them all), and read them aloud in that speaker's voice.
- **AC-4**: Five tasks run from `rpg/missions/u9.js`: Mei's lost shells (3 shells, each a question), fix Jie's sandcastle (bucket and spade from the hut, then build "Let's make a sandcastle."), the ice cream cart (2 questions, gives ice cream), Flash's guitar (a "Where" question, then the guitar is under the boat), and the top of the hill (opens after the other four; Thunder's riddle moves the big rock; the lantern at the lighthouse goes back to Robo). A quest log shows "N of 5 done" and what to do next.
- **AC-5**: Questions come from `units/u9.js` by topic (Year 2: 3 choices, at most 2 challenge questions), never repeat in one play, and show the bank's hint after a wrong try and its explanation after. Coins 10 / 5 / 0 by tries, as Treasure Quest. Each wrong try costs a heart (3 hearts).
- **AC-6**: The bag shows what the pupil carries with pictures and names (a tap reads the name).
- **AC-7**: Three villagers ask the bonus riddles from `quest/islands/u9.js` for extra coins.
- **AC-8**: When the lantern reaches Robo: a sunset party with every friend saying a "Let's ..." line, then a finish panel with coins, a 20 coin finishing bonus and 1 to 3 stars (Treasure Quest's thresholds against 140), Play again and Back to Word Island.
- **AC-9**: Progress (look, tasks, bag, picked things, coins, hearts, place, questions used) is saved per device in `word-island-rpg-u9`; a reload carries on. No other localStorage key is written except the shared `treasure-quest-audio` Sound and Music choice.
- **AC-10**: Word Island shows a seventh card "07 Story Quest" on units listed in `wiRpgUnits` (`u9`), locked with "Finish all five games first." until the five games are done (or `?open=all`, carried on the link).
- **AC-11**: `node tools/check-rpg.mjs` passes: every person, thing and task spot reachable on foot from the start (the rock counts as open only for the hill), every asked topic has enough questions, every item and riddle named exists, and `wiRpgUnits` matches `rpg/missions/`.
- **AC-12**: Works at 1280×720, 844×390 and 390×844 with touch, mouse and keyboard; Esc or the Pause button opens Carry on, Music, Sound, Leave.

## Build plan

1. Spec and scope entry
2. Page, screens, engine, pixel art, map and walking (AC-1, AC-2, AC-12)
3. Unit 9 beach map, people and talk box (AC-3)
4. Quiz panel, hearts, coins and bag (AC-5, AC-6)
5. Mission runner, sentence builder, bonus riddles and saving (AC-4, AC-7, AC-9)
6. Party and finish (AC-8)
7. Word Island card and checker (AC-10, AC-11)
8. Browser checks at phone and laptop sizes
