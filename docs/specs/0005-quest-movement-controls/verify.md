# Verify: Movement & controls · spec 0005 · updated 2026-10-17
_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. A saved pupil (`word-island-pupil` with a name and class) is needed; blocking the gstatic Firebase files makes every island open after 8 seconds. Scripted checks used Python Playwright (headless Chromium) with Firebase blocked._

## UI / manual
- [ ] On a laptop, tap Play → the mouse is captured (the pointer hides), a white cross shows in the middle; move the mouse 100 px right → the view turns right about 0.22 radians; looking up and down stops just short of straight up and down → AC-1 (value sourcing: look, laptop)
- [ ] Press Esc → the mouse is freed and the pause menu opens; Carry on (or Esc again) → the mouse is captured again → AC-1
- [ ] In a browser that refuses capture (or with `requestPointerLock` blocked) → "Drag to look around" shows; dragging with the button held turns the view; moving without the button does nothing; no pause menu appears by itself → AC-1
- [ ] Open the kit sheet with K → the mouse is freed and "Click to look around" shows; click the island → it is captured again → AC-1, AC-10
- [ ] Hold W for 1 second → walks about 4.4 blocks forward; S walks back; A and D step sideways; the Left and Right arrows turn; Up and Down walk; W+D together is no faster than W alone → AC-2 (value sourcing: walk, arrows)
- [ ] With the arrows and Space only, reach the far side of the test beach and climb onto the chest → AC-2, AC-4
- [ ] Walk into a one block ledge (the chest, the hut step) → you step up onto it without jumping; Space jumps about 1.25 blocks → AC-4 (value sourcing: jump)
- [ ] On a phone (touch, landscape): no crosshair; touch the left half → a joystick appears under the thumb; push up → walk forward; a half push walks slower than a full push; lift → stop → AC-3 (value sourcing: walk, joystick)
- [ ] With a second thumb drag on the right half while walking → the view turns at the same time → AC-3 (value sourcing: look, phone)
- [ ] Tap Jump → you jump; a touch that starts on a hotbar slot, Pause or Jump never walks or turns → AC-3
- [ ] Walk into the shallow cove (south west) → you paddle in the water with no rescue; walk into the deep sea from the shore → put back in the middle of the last dry block with a splash and "Back to the beach!" for 2 seconds; holding W does not walk you straight back in → AC-5 (value sourcing: deep water, where you go back to, rescue message)
- [ ] Get pushed off the island (feet outside 0..63) → back on the last dry block → AC-5
- [ ] In `&kit`, look at the chest from 2 blocks away → a white outline and "Open the chest · click or E"; press E (or click) → the sample chest talk box opens and the hand swings; from 8 blocks away → nothing in front → AC-6, AC-10 (value sourcing: which thing, label shown)
- [ ] Look at the villager within 4 blocks → "Talk to the villager · click or E"; click → the riddle opens → AC-6, AC-10
- [ ] On a phone in `&kit`, look at the chest → "Open the chest · tap" and the Use button shows; tap Use → it opens; tap the chest from 10 blocks away → "Walk closer." → AC-6
- [ ] Hold W and press E at the chest → while the talk box is open the player does not move and the mouse is free; Carry on → the mouse is captured again → AC-7
- [ ] Hold W, press Esc, then Carry on → the player stays still until W is pressed again; the same after the teacher's Stop and listen and a hidden tab → AC-7
- [ ] Walk on the path, then on sand → step sounds every 0.4 s that sound like the block underfoot; jumping plays the jump sound; the view bobs gently while walking, and not at all with reduced motion on → AC-8 (value sourcing: steps, bob)
- [ ] Open the quest → you start on the test beach path at 32.5, 9, 41.5 facing the house; nothing turns by itself → AC-9 (value sourcing: start)
- [ ] `&debug` → a line with the position, on ground or in the air, in water, the safe spot, the rescue count and the thing in front → AC-10
- [ ] Try walking on a real budget Android phone and an iPhone → 30 fps or better in `&debug`, the joystick and Jump comfortable for a child (together with spec 0004's owed phone check) → AC-3, AC-11

## Commands
- [ ] Compressed size of `quest/js/bw/player.js`, `walk.js`, `controls.js`, `touchpad.js`, `targets.js`, `notice.js` plus the changes to other files against commit `0a4acc1` → under 15 KB (measured 2026-10-17: about 12.8 KB) → AC-11
- [ ] `&debug` at 844×390 with the CPU slowed 6 times, walking and turning → 30 fps or better (measured 2026-10-17: the quality step moves to 0.75 while turning, then 35 to 48 fps; the same drop happens when only turning, so it comes from looking at different parts of the island in this software rendered test browser, not from the walking code) → AC-11
- [ ] Search `quest/js/bw/player.js` for health, hunger, air, damage, sprint, sneak → none; it starts with its BlockWords source and commit `31a2bf4` → AC-4, AC-5
- [ ] `quest/js/look.js` is gone and nothing refers to it → AC-9

## Acceptance-criteria coverage
- AC-1 steps 1 to 4 · AC-2 steps 5, 6 · AC-3 steps 8 to 10, 21 · AC-4 steps 6, 7 and command 3 · AC-5 steps 11, 12 and command 3 · AC-6 steps 13 to 15 · AC-7 steps 16, 17 · AC-8 step 18 · AC-9 step 19 and command 4 · AC-10 steps 4, 13, 14, 20 · AC-11 step 21 and commands 1, 2
