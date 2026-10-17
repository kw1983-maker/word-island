# Verify: Beach island (Unit 9) · spec 0006 · updated 2026-10-17
_Steps derived from spec 0006 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
_Nothing here writes to Firebase. A saved pupil (`word-island-pupil` with a name and class) is needed; blocking the gstatic Firebase files makes every island open after 8 seconds. Scripted checks used Python Playwright (headless Chromium) with Firebase blocked._

## UI / manual
- [ ] Open the quest → the Unit 9 beach island shows (no test beach): a round island with sand all round, shallow water at its edge, a gentle stepped grassy hill in the middle, a red and white lighthouse on a rocky point, a wooden pier, three houses in the west and an ice cream cart → AC-1
- [ ] Open `&kit` → the same island; the kit chest and villager stand on the beach just north west of the start, and E on them opens the sample chest and riddle → AC-1
- [ ] Try to walk into the lighthouse → the door is closed planks; there is no way in → AC-2
- [ ] You start on the path at the water's edge by the pier, facing north up the path to the hill (32.5, 7, 55.5) → AC-4 (value sourcing: start)
- [ ] Follow the path from the start all the way round → it passes the boat, the palm tree, the ice cream cart, the village and hut, the bench, the hill top, the lighthouse, the big rock, the beach towel, the rock pool and the sandcastle, and comes back to the start; the pier end is 3 blocks from where the path meets the pier → AC-3
- [ ] On a phone, using only the joystick (never Jump), walk to all 12 anchors (use `&debug` labels to find them) → every one can be reached → AC-5
- [ ] Walk into the deep sea from the beach → the spec 0005 rescue puts you back; walk into the rock pool → you paddle, no rescue → AC-5
- [ ] Look round the beach → shells, three sandcastles with flags, the fishing rod and a bucket and spade on the pier, fish under the water in the rock pool, a second boat on the west shore, a football, two kites, two beach umbrellas, a striped towel, a bucket and spade by the north sandcastle, flag posts for the UK, Canada and Australia near the start, and a koala in a palm tree on the east beach → AC-6
- [ ] Look at the shells near the start within reach → "shells · click or E" (on a phone "shells · tap"); press E → "shells" shows above the hotbar for 2 seconds and the voice reads it; the coins stay at 0 / 140 → AC-7 (value sourcing: word thing label, reading, hint bar)
- [ ] Use the koala → the hint bar says "koala" and the voice says "a koala"; use a kite → "kite", read as "a kite"; use the Canada flag → "Canada" → AC-7 (value sourcing: say defaults to word)
- [ ] Walk past the village → each of the three villagers turns its head to follow you while you are within 8 blocks, stops turning at about 70 degrees, and looks ahead again when you walk away; none has a "!" → AC-8 (value sourcing: villager head turn)
- [ ] Watch the island for a minute → only the clouds, the sea and the villagers' heads move; the sound is BlockWords' music and step sounds as before → AC-9
- [ ] `&debug` → a yellow label floats over every anchor (`s1 pier-end` … `s12 sandcastle`), and a line reads "nearest anchor: <name>, <distance> blocks", changing as you walk → AC-10 (value sourcing: debug labels, nearest anchor)
- [ ] Serve a map with one anchor renamed (for example the boat) → the island still plays, the bar shows "0 / 130" and "11 left", and the console says the spot was left out → AC-11 (value sourcing: coins total, N left)
- [ ] Puzzles still change with `&seed=N`, while the island looks the same every time → AC-2

## Commands
- [ ] `node tools/check-quests.mjs` → `u9.js: OK` → AC-2, AC-3, AC-5, AC-7, AC-11
- [ ] Copies of the map, each checked with `node tools/check-quests.mjs u9 --map quest/islands/<copy>.js` (the copy must sit in `quest/islands/` so its imports work; delete it after): an anchor renamed → "s3 needs anchor …"; a two block pit dug in the grass → "a pupil can walk to … but can't walk back to the start"; the hill top walled in → "anchor "hill-top" … can't be reached on foot"; a word thing "giraffe" → "not in the Unit 9 questions"; a word thing next to an anchor → "closer than 3 blocks to anchor"; a villager on the path → "stands on the path" → AC-5, AC-7, AC-8, AC-11 (value sourcing: reachability check, word in bank check)
- [ ] The path is 150 to 350 blocks (measured 2026-10-17: 173 blocks, about 40 seconds of walking) → AC-3 (value sourcing: path length check)
- [ ] `&debug` → "island built in" under 400 ms (measured 2026-10-17: 67 to 160 ms headless) → AC-12
- [ ] `&debug` at 844×390 with the CPU slowed 6 times, walking and turning for 10 seconds → 30 fps or better at quality step 0.75 or higher (measured 2026-10-17: 7 of 8 runs held 0.75 at 33 to 43 fps; one run dropped to 0.5, then 41 to 49 fps; the old test beach measured 0.75 or 1 in 3 of 3 runs; the island draws about 20,900 triangles against 16,800) → AC-12
- [ ] Compressed size of `quest/js/mapkit.js`, `quest/islands/u9-map.js`, `quest/js/island.js` plus the lines added to other `quest/` files since commit `bf592c6` → 15 KB or less (measured 2026-10-17: 12.7 KB) → AC-12
- [ ] `quest/js/testscene.js` is gone and nothing in `quest/` refers to it → AC-1

## Acceptance-criteria coverage
- AC-1 UI steps 1, 2, command 7 · AC-2 UI steps 3, 15, command 1 · AC-3 UI step 5, commands 1, 3 · AC-4 UI step 4 · AC-5 UI steps 6, 7, commands 1, 2 · AC-6 UI step 8 · AC-7 UI steps 9, 10, commands 1, 2 · AC-8 UI step 11, command 2 · AC-9 UI step 12 · AC-10 UI step 13 · AC-11 UI step 14, commands 1, 2 · AC-12 commands 4, 5, 6
