# Verify: Retro look & sound kit (BlockWords look) · spec 0004 · updated 2026-10-16 · verified 2026-10-17 in a browser (26 of 28 steps passed; the 2 real phone steps are still open)
_Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. A saved pupil (`word-island-pupil` with a name and class) is needed to reach the island; blocking the gstatic Firebase files makes every island open after 8 seconds. Keep BlockWords (`C:/Users/User/Documents/Claude/Minecraft/index.html`) open beside it to compare._

## UI / manual
- [x] Open `/quest/?unit=u9` with a saved pupil → BlockWords' dark title sky, a dark panel "Treasure Quest" / "The island is ready." and a big green **Play** with focus on it; no sound yet; Pause is hidden → AC-1 (value sourcing: ready card)
- [ ] Press Enter (and, on a fresh load, tap Play on a phone, including iPhone Safari) → the card goes, the Pause button shows, the music starts quietly → AC-1, AC-13 (value sourcing: Play)
- [x] Look at the test beach beside BlockWords → the same grass, sand, oak, leaves, planks, glass and water textures, soft corner shadows, the sky colour, a square sun and blocky clouds; leaves and glass are see through; the sea carries on to the horizon and fades into the sky → AC-3, AC-4, AC-5 (value sourcing: atlas pixels, face brightness and corner shadows, what lies outside the island, sea level)
- [x] Find the block row on the sand → every kept block once (bedrock to water, 34 blocks), including `wet_sand` → AC-3
- [x] With the system set to reduce motion, reload → the clouds stand still; it is still sunny → AC-5 (value sourcing: time of day, cloud drift)
- [x] You stand on the path at eye height looking at the house, tree, chest and the villager with a yellow "!"; the view turns slowly; drag with a finger or the mouse → it turns by hand and starts again a few seconds later → AC-6, AC-17 (value sourcing: eye height, field of view, start point)
- [x] `&debug` at 844×390 → `drawn 844×390` and `island built in … ms` under 1000; at 1366×768 → `drawn 1366×768` → AC-6, AC-19 (value sourcing: drawn size, build time)
- [x] At 844×390 and 1366×768 → the hotbar (9 slots) at the bottom with `0 / 140` and `12 left` above it in BlockWords' style; no hearts or hunger → AC-8 (value sourcing: coins, maximum, puzzles left)
- [x] Open `&kit`: press 1 to 9, scroll the wheel and tap slots → the white frame moves and the blocky arm at the bottom right holds that block; the empty ninth slot shows the arm alone → AC-7, AC-8 (value sourcing: item shown, arm colours, slot contents)
- [x] In `&kit`, open Chest, Riddle and Find at 844×390 and 1366×768 → a dark BlockWords talk box: speaker line ("Treasure chest", the riddle's character name, "Listen and find") with a 🔊 button, the picture big when there is one, big bold white question text, word answers as full width grey buttons with keys 1 to 3, picture answers as cards side by side; no scrolling; answers at least 56 px tall; question at least 20 px → AC-9 (value sourcing: talk box values)
- [x] In a talk box press 2, then H, then Tab round the buttons → 2 picks the second answer and the hotbar does not change; H reads it again; Tab stays inside → AC-10
- [x] Pick a wrong answer, then the right one → "Try again." plus the hint in red with the wrong sound, then "Well done! +5 coins" in green with the right sound and a green **Carry on**; the counter goes up and `left` goes down. On a fresh box pick two wrong → "The answer is: …" with the right answer marked → AC-10
- [x] In `&kit` tap Message → "Island finished!" with two buttons; a button closes it → AC-10
- [x] Press Esc (or tap Pause) → BlockWords pause panel "Paused" with Carry on, Music: on, Sound: on, Leave the quest; `&debug` shows `paused: ask`; Esc again closes it and focus returns to Pause; Leave goes to Word Island → AC-11 (value sourcing: Music and Sound shown)
- [x] Turn a phone upright, and open an island your class does not have → "Turn your phone sideways" and "This island is not open" on BlockWords panels with the same words as before → AC-12
- [x] In the pause menu turn Music off, carry on, reload → Music is still off and Sound unchanged; `treasure-quest-audio` is `{"sound":true,"music":false}`; `word-island-pupil` unchanged → AC-14
- [x] Delete `treasure-quest-audio`, set Word Island's sound off, open the quest → Sound starts off, Music on → AC-14
- [x] Tap every button on the kit sound board → each plays a BlockWords style sound (dig, place, step, break sound like the block material); speak a cast line and tap an effect while it speaks → the effect is much quieter → AC-13 (value sourcing: which sound, material, volume while speaking)
- [x] Open a riddle by Robo and one by Mei → read once as each opens, Robo low, Mei high; closing the box stops the speech; the teacher's Stop and listen stops music and speech → AC-13, AC-15
- [x] Titles, buttons and the counter are in Trebuchet (or the device sans font) with BlockWords' hard text shadows; no font file loads → AC-16
- [ ] Try the test beach on a real budget Android phone and an iPhone → 30 fps or better in `&debug`, sound after Play → AC-19, AC-1

## Commands
- [x] Block `AudioContext` and `speechSynthesis` before load, tap Play, open a chest, tap 🔊 → "Read the words on the screen." and no page errors → AC-21
- [x] Make `localStorage.setItem` throw, open the pause menu, tap Music and Sound → both change for the visit, no page errors → AC-14
- [x] `&debug` at 844×390 with the CPU slowed 6 times → 30 fps or better (measured 2026-10-16 on a laptop: 43 to 49 fps at full sharpness) → AC-19
- [x] Add up the compressed sizes of the quest's own files against commit `b2b6adb` → under 60 KB more (measured 2026-10-16: about 42 KB more, of which `quest/js/bw/` is 23 KB), so the first visit stays far under 2 MB → AC-19
- [x] Search `quest/` for `elevenlabs`, `firebase-config`, `teacher-config`, `hunger`, `health`, `saves` → none; every file in `quest/js/bw/` starts with its BlockWords source and commit `31a2bf4` → AC-2
- [x] Check `quest/fonts/`, `tools/make-pixel-font.py` and `quest/js/blocks.js` are gone and nothing in `quest/` mentions Pixelify, `--pixel`, `wbtn` or `blockTiles` → AC-20
- [x] `node tools/check-quests.mjs` → `u9.js: OK`

## Acceptance-criteria coverage
- AC-1 steps 1, 2, 21 · AC-2 command 5 · AC-3 steps 3, 4 · AC-4 step 3 · AC-5 steps 3, 5 · AC-6 steps 6, 7 · AC-7 step 9 · AC-8 steps 8, 9 · AC-9 step 10 · AC-10 steps 11 to 13 · AC-11 step 14 · AC-12 step 15 · AC-13 steps 2, 18, 19 · AC-14 steps 16, 17 and command 2 · AC-15 step 19 · AC-16 step 20 · AC-17 step 6 · AC-18 steps 9 to 13, 18 · AC-19 steps 7, 21 and commands 3, 4 · AC-20 command 6 · AC-21 command 1
