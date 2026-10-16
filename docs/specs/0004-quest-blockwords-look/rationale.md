# 0004. Rationale: the BlockWords look for Treasure Quest

## Context

Spec 0003 gave Treasure Quest its own look: code drawn 16×16 tiles, a world drawn at about 240 rows for a chunky retro screen, wooden sign panels, a pixel font and a chiptune synth. It was built and checked on 2026-10-16, and when you tried it you said it looked nothing like what you wanted. You pointed at BlockWords (`C:/Users/User/Documents/Claude/Minecraft`), your own Minecraft style English game: first person, a sharp full screen picture, rich block textures with soft corner shadows, a sunny sky with blocky clouds, dark grey talk boxes with big green buttons, a hotbar, and synthesised sounds.

The quest has to stay a separate, simpler island game inside Word Island: one island per unit, about 10 minutes, phones and laptops, puzzles from the unit banks (spec 0002), and scores to your results page later. You also want pupils to mine and craft, with nothing that can hurt them and coins only from puzzles. Spec 0001's engine already runs the quest (Three.js r184, a fixed step loop, pause reasons, quality steps), and spec 0003's sound, voice, settings and talk box rules were built and tested.

BlockWords is written as plain ES modules that import `three` (its `build.py` only bundles them), so its code can run under the quest's import map. It targets laptops: it has no touch controls, an endless streamed world, survival stats, ElevenLabs recorded voices and Firebase saves, none of which the quest wants. Its world code (chunks, light, mesher, `setBlock`, `raycast`) is exactly what walking and mining will need.

Not deciding means feature 6 (movement), 7 (beach island), 23 (mining) and 24 (crafting) would each guess at a look and a world engine, and the island would drift further from what you pictured.

## Options considered

### Option 1: Restyle spec 0003's own kit to look like BlockWords

Keep the quest's own block drawing and instanced meshes, raise the resolution, repaint the tiles to resemble BlockWords' and restyle the panels.

**Pros**:
- Smallest change from what is built; no copied code to keep in step.

**Cons**:
- Imitating BlockWords by hand will keep missing it (its tile painting, corner shadows and light are a lot of careful work already done).
- Instanced cubes draw hidden faces and have no corner shadows or `setBlock`, so mining would need a second world engine later.

### Option 2: Copy and trim BlockWords' modules into the quest (chosen)

Copy the needed BlockWords files into `quest/js/bw/` with source headers, cut what an island never uses, and dress the quest's existing engine, sound, voice and talk box in BlockWords' look.

**Pros**:
- Looks the same as BlockWords because it is the same code.
- Brings a tested world engine that already breaks and places blocks, for features 6, 23 and 24.
- The quest stays independent: a change in BlockWords can't break it.

**Cons**:
- Two copies to keep in step by hand.
- BlockWords' shader and full sharpness are untested on budget phones.

### Option 3: Share one copy of the BlockWords files between both games

Both games load the same modules (a shared folder or a build step that copies them on deploy).

**Pros**:
- A fix lands in both games at once.

**Cons**:
- Every BlockWords change can break the quest without anyone touching it; Word Island has no build step, and the two sites deploy separately.
- BlockWords' endless world and survival code would have to be switched off by flags rather than removed.

### Option 4: Make Treasure Quest a mode of BlockWords itself

Add Word Island's islands and puzzles inside BlockWords.

**Pros**:
- One game to maintain.

**Cons**:
- You chose a separate, simpler game inside Word Island; this would move the quest out of Word Island's link, class settings and results flow (spec 0001).

## Rationale

You want the quest to look like BlockWords, and the most reliable way to look like a game is to use its code. Option 1 already failed once at imitating a look by hand, and it would leave the quest without the world engine that walking and mining need. Option 2 gets the exact textures, light, sky, talk box and hotbar on the first try, and the copied `World` already answers `setBlock` and `raycast`, so features 6, 23 and 24 start from tested code instead of a second engine.

Copying beats sharing (Option 3) because the two games deploy separately, Word Island has no build step, and a quest used in lessons must not break because BlockWords changed. The cost is keeping two copies in step by hand; the source header on each file makes that manageable, and an island needs only a slice of BlockWords. Option 4 contradicts your choice of a separate game inside Word Island.

The quest keeps spec 0001's engine and spec 0003's sound, voice and talk box rules because they work and were verified; only their look changes. Your other answers set the details: first person with a hand in view, always sunny, coins above the hotbar, BlockWords' sounds inside the quest's sound module, screen size sharpness (safest for budget phones, since BlockWords' shader is the heaviest new cost), BlockWords' font, a pause menu holding Music and Sound, a first person test beach with drag to look, picture cards for picture answers, and islands up to 64×64×32. The biggest open risk is the phone frame rate, which is why the build plan measures it before features 6 and 7 build on top.

### What carries over from spec 0003

| Spec 0003 part | In this design |
|---|---|
| Play card and unlock (AC-1) | Kept, restyled as a BlockWords panel |
| Sound module API, ducking, settings, pause rules (AC-9 to AC-11) | Kept; the effects and tune are replaced by BlockWords' sounds |
| Voice and cast pitches (AC-12, AC-16) | Kept unchanged |
| Talk box behaviour (AC-5 to AC-7) | Kept; markup and styles become BlockWords' |
| Code drawn tiles, instanced blocks (AC-2, AC-3) | Replaced by BlockWords' atlas and mesher |
| Chunky pixel screen (AC-4) | Removed; screen size sharpness |
| Wooden signs, top bar, pixel font (AC-5, AC-8, AC-13) | Removed; BlockWords panels, hotbar counter, font |
| `&kit` view (AC-14) | Kept and updated |
