# Verify: Retro look & sound kit · spec 0003 · updated 2026-10-16
_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. A saved pupil (`word-island-pupil` with a name and class) is needed to reach the island; blocking the gstatic Firebase files makes every island open after 8 seconds._

## UI / manual
- [ ] Open `/quest/?unit=u9` with a saved pupil → the card shows "The island is ready." and a big gold **Play** with focus on it; no sound, music or speech yet; Back is hidden → AC-1 (value sourcing: ready card)
- [ ] Press Enter (and, on a fresh load, tap Play on a phone, including iPhone Safari) → the card goes, Back shows, the island turns, the tune starts → AC-1, AC-10 (value sourcing: Play)
- [ ] Open `&kit`, tap Kit, look at the block row and the block sheet → 12 different blocks with sharp square pixels; grass has a grass top, grass edged sides and a dirt bottom; log has rings on top and bark on the sides; leaves and glass are see through; the red wool block is red; water drifts slowly → AC-2, AC-3 (value sourcing: tile pixels, wool colour, face brightness, water drift)
- [ ] Reload twice and compare the block sheet → the same pixels every time → AC-2
- [ ] With the system set to reduce motion, reload → the water stands still → AC-3 (value sourcing: reduced motion)
- [ ] Open `&debug` at 844×390 → `drawn 519×240`; at 1366×768 → `drawn 683×384` → AC-4 (value sourcing: drawn size)
- [ ] In `&kit`, open Chest, Riddle and Find at 844×390 and at 1366×768 → each panel fits with no scrolling, choice buttons at least 56 px tall, question text at least 20 px; the label is "Treasure chest", the riddle speaker's name (e.g. Mei), and "Listen and find"; a chest with a picture shows it beside the choices; find choices show their book pictures with labels → AC-5 (value sourcing: label, question text, main picture, choice labels, choice pictures)
- [ ] On an open panel, press 2, then H, then Tab round the buttons → 2 picks the second choice, H reads it again, Tab stays inside the panel; focus started on the first choice → AC-6
- [ ] With a screen reader on, open a panel and answer → it is announced as a dialog and the result lines are read out → AC-6
- [ ] In `&kit`, pick a wrong answer, then the right one → "Try again." plus the hint and the wrong sound, then "Well done! +5 coins", the right sound and Carry on; the top bar shows the coins and one fewer left → AC-7, AC-8 (value sourcing: wrong line, right line, top bar coins)
- [ ] Pick two wrong answers on a fresh panel → "The answer is: …" with the right choice marked gold, the explanation, the hint sound, and Carry on → AC-7 (value sourcing: shown line)
- [ ] In `&kit`, tap Message → a plain wooden sign with "Island finished!" and two buttons; a button closes it → AC-7
- [ ] At 844×390 the top bar shows `0 / 140`, `12 left`, Music and Sound on one row next to Back, each saying on or off → AC-8 (value sourcing: top bar maximum and puzzles left)
- [ ] Tap every button on the kit sound board → 14 different sounds and the tune button; speak a cast line and tap an effect while it speaks → the effect is much quieter → AC-9 (value sourcing: volume while speaking)
- [ ] Turn Music off → only the tune stops; turn Sound off → effects and tune stop and a panel opens silently; Hear it still reads → AC-10, AC-12
- [ ] With the tune playing, open the Leave box, hide the tab, and turn a phone upright → the tune stops each time and carries on when play resumes → AC-10
- [ ] Turn Music off and reload → Music is still off, Sound unchanged; `treasure-quest-audio` is `{"sound":true,"music":false}`; `word-island-pupil` is unchanged → AC-11 (value sourcing: Sound and Music buttons)
- [ ] Delete `treasure-quest-audio`, set Word Island's sound off, open the quest → Sound starts off and Music on → AC-11
- [ ] Open a riddle by Robo and one by Mei → the voice reads each once, Robo low and slow, Mei high; the narrator reads chests; closing the panel stops the speech → AC-12 (value sourcing: text spoken, pitch and speed)
- [ ] `&debug` shows the voice in use: an en-GB voice where the device has one, else another English one → AC-12 (value sourcing: which voice)
- [ ] Titles, buttons and the top bar are in the pixel font; questions and choices in the device font; the digits 2 and 5 read as 2 and 5, not 8 and S → AC-13
- [ ] Teacher Pause (fake it on a patched copy or the emulator) → the tune and speech stop; lift it → the tune carries on → AC-10

## Commands
- [ ] Block `AudioContext` and `speechSynthesis` before load, tap Play, open a chest, tap Hear it → "Read the words on the screen." and no page errors → AC-16
- [ ] Make `localStorage.setItem` throw, tap Music and Sound → both change for the visit, no page errors → AC-11
- [ ] Block `fonts/pixelify-sans.woff2` → panels and buttons show in the device font, no page errors → AC-13
- [ ] Cold load `/quest/?unit=u9` and add up the compressed sizes → under 2 MB; the kit's files add under 60 KB (measured 2026-10-16: about 24 KB gzip, so about 418 KB in all) → AC-15
- [ ] `&debug` at 844×390 with the CPU slowed 6 times → 30 fps or better (measured 2026-10-16 on a laptop: 60 fps); then on a real budget Android phone → AC-15
- [ ] Search `quest/` for `word-island-pupil` writes → only reads; `treasure-quest-audio` is the only new key → AC-11
- [ ] `node tools/check-quests.mjs` → `u9.js: OK`

## Acceptance-criteria coverage
- AC-1 steps 1 to 2 · AC-2 steps 3 to 4 · AC-3 steps 3 and 5 · AC-4 step 6 · AC-5 step 7 · AC-6 steps 8 to 9 · AC-7 steps 10 to 12 · AC-8 steps 10 and 13 · AC-9 step 14 · AC-10 steps 2, 15, 16 and 22 · AC-11 steps 17 to 18 and commands 2 and 6 · AC-12 steps 15, 19 and 20 · AC-13 step 21 and command 3 · AC-14 steps 3, 7 and 14 · AC-15 commands 4 to 5 · AC-16 command 1
