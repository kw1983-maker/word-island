# 0003 rationale: Treasure Quest look and sound kit

## Context

Treasure Quest (scope feature 4) needs one look and one sound for every island: the blocks islands are built from, the chunky retro screen, the panels where puzzles appear, a top bar, sound effects, music, and the voice that reads every question. Every later feature (movement, the beach island, chests, riddles, finds, word blocks, the island finish) builds on these parts, so a gap here gets reinvented five times in five slightly different ways.

The forces are the same ones that shaped spec 0001. Pupils are 7 to 8 years old and play on their family's cheap phones as well as laptops, often during an online lesson at home. The first visit must stay under 2 MB, and school or home networks sometimes block outside CDNs. The site has no build step: plain HTML, CSS and browser JavaScript, with Three.js r184 copied into the repo. The teacher asked for a Minecraft style look, which must be our own art, never Minecraft's textures, sounds or name.

Phones add their own rules. Mobile browsers (iPhone Safari above all) refuse to play sound or speak until the person taps the page, and the set of speech voices differs from phone to phone; some cheap Android phones have no English voice installed. Pupils must be able to read every word, because the voice is not always available, and Word Island's rule is that every question can also be read aloud.

Without this decision, each feature would pick its own textures, sizes, sounds and voice settings, the islands would not feel like one game, and the download budget would be spent by accident.

## Options considered

### Option 1: Everything made in code (chosen)

Block pictures are 16×16 pixel art drawn by a script onto a canvas when the quest opens. Sounds and the tune come from a small Web Audio synth, like the ones Run and pick and Listen and shoot already use. The browser voice reads questions. Panels and the top bar are HTML over the 3D canvas. The only new file is a small self hosted pixel font.

**Pros**:
- Almost zero download: textures, sounds and music cost a few KB of code.
- Our own art by construction, with no licence questions.
- One person can tweak a colour, a note or a pitch in a minute, with no art tool.
- HTML panels keep text sharp at any pixel size and work with screen readers and keyboards.

**Cons**:
- Making code drawn art and synth music look and sound good takes several tweak rounds.
- Synth sound is simple; it will never sound like a recorded soundtrack.

### Option 2: Asset files (picture sheet, audio files, image based UI)

A hand made PNG sheet of block pictures, MP3 sound effects and music made with a music tool, and panel images.

**Pros**:
- The richest look and sound, made by eye and ear.
- No drawing or synth code to maintain.

**Cons**:
- Adds roughly 200 to 600 KB to the first visit, pushing on the 2 MB budget and slowing cheap phones on mobile data.
- Every change means editing a file in another tool; music and sound files need licence care.
- Image based panels blur when scaled and need extra work for screen readers.

### Option 3: Small libraries (ZzFX and ZzFXM for sound, a pixel art export for textures)

Copy the tiny ZzFX sound library and its ZzFXM tracker (MIT licence, about 3 KB) into the repo, and use a pixel art tool to export textures.

**Pros**:
- ZzFX gives a large range of game sounds from short number lists, and ZzFXM plays tracker music.
- Still very small.

**Cons**:
- A new tool and notation to learn, while Word Island's own games already use a simple Web Audio synth.
- Exported textures bring back the file editing problem from Option 2.

### Option 4: Panels drawn inside the 3D world

Draw the puzzle panels and the top bar in WebGL (as 3D signs or a canvas texture) so everything is chunky pixels.

**Pros**:
- The most consistent retro look: text and buttons share the world's pixels.

**Cons**:
- Text drawn at about half resolution is hard for 7 year olds to read.
- Screen readers and keyboard focus do not work without a second, hidden HTML copy.
- Much more code: hit testing, text layout and wrapping by hand.

## Rationale

Option 1 fits every force in the Context. The 2 MB budget and blocked networks rule out a heavy asset set, and the no build, plain JavaScript stack favours small modules over new tools. Word Island already makes its game sounds with a Web Audio synth, so the quest reuses a pattern the project knows rather than adding ZzFX's notation (Option 3). Drawing textures in code also guarantees the Minecraft style is our own art, which the teacher's request requires.

HTML panels over a chunky 3D world (rather than Option 4) is the decision with the most weight for pupils. The world can be drawn at about half resolution for the retro feel and for speed on cheap phones, while every word a 7 year old must read stays sharp, large and readable by a screen reader. The pixel font carries the retro feel in titles and numbers only; questions use the device's clear font, because a pixel font everywhere is harder to read for young pupils.

The Play button exists because phones refuse sound and speech until the person taps, and an island whose first question is silent feels broken. Making the start tap explicit is simpler and more reliable than unlocking audio on whatever tap happens first. Saving Sound and Music under the quest's own key protects Word Island: its `word-island-pupil` key is live on pupils' devices and the project rules forbid risking it.

**Choices settled during the design** (made by the architect, with the runner up):
- Baked face shading in vertex colours with `MeshBasicMaterial`, over lit `MeshLambertMaterial`: the classic blocky look with no lighting cost on cheap phones. Runner up: Lambert with a fixed sun, which looks softer and costs more.
- One `InstancedMesh` per block kind sharing one tile sheet, over merged chunk geometry: at most 12 draw calls and simple code, enough for island sized worlds. Runner up: merged geometry with hidden faces removed, worth it only if islands grow large.
- Cutout transparency (`alphaTest`) for leaves and glass, over true transparency: no sorting problems and no extra cost. Runner up: real transparency for glass, if it ever looks wrong.
- Opaque water that drifts its own repeating texture, over see through water: no sorting, cheap, still alive. Runner up: a semi transparent top layer.
- Pixel size `clamp(height ÷ 240, 1, 2)`, over a fixed half resolution: never fewer than 240 drawn rows on a phone in landscape, about half on a laptop. Runner up: a fixed 2× pixel, which drops phones to 195 rows.
- The quest's own `voice.js` copying Word Island's voice choice, over moving `pickVoice` into a shared file: Word Island was just regression tested after spec 0002, and the copied part is six lines. Runner up: a shared `shared/voice.js` (listed as a follow up).
- Cast voices by pitch and speed on one English voice, over different installed voices: the same on every phone. Runner up: a different voice where available.
- Music and effects at a quarter of their volume while the voice speaks, the same ducking Run and pick uses.
- Pixelify Sans (SIL Open Font License), subset to the characters the kit shows, over Press Start 2P (all capitals, hard to read) and Silkscreen (capitals only): a readable pixel font with lowercase letters.
