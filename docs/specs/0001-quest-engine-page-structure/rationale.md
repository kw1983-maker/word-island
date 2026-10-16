# 0001. Rationale: Treasure Quest engine and page structure

Decision record for [index.md](index.md). `/develop` does not need this file.

## Context

Treasure Quest is a blocky, retro 3D treasure hunt for Year 1 and Year 2 pupils, planned in `docs/scope/scope.md` (Skateboard approach, Alpha workflow). It must live inside Word Island: same link, same class picker, same unit questions (`units/uN.js`) and pictures (`img/uN/`), and the same Firebase settings for classes and Pause (basis: your AGENTS.md; scope feature 2).

Word Island is plain HTML and browser JavaScript with no build step, one 113 KB `index.html`, two canvas games as classic scripts, and Firebase loaded as a module from a CDN (basis: your AGENTS.md). Pupils play at home during online lessons, many on budget Android phones and mobile data, so the floor is a 2 to 3 year old budget phone at 30 frames a second, with a first download under 2 MB.

The forces: the game needs a real 3D engine (camera, lighting, many blocks) but must stay light; the project has one maintainer and an AI builder, so tooling must stay simple; school and home networks sometimes block outside sites; and the live Word Island must not break, because pupils' results flow from it to the teacher's page.

Without this decision, every later feature (movement, islands, puzzles, scores) would invent its own loading, loop and data access.

## Options considered

### Option 1: Three.js, vendored, ES modules, own `quest/` page with shared files (chosen)

Three.js r184 copied into `quest/vendor/`, loaded by an import map, game code as ES modules, Word Island's shared pieces lifted into `shared/`.

**Pros**: the most used web 3D library with official blocky world examples (basis: Three.js minecraft example); fits the no build workflow; works when CDNs are blocked; one copy of shared rules.
**Cons**: the whole engine ships without tree shaking, using much of the 2 MB budget; lifting shared code touches the live page; manual upgrades.

### Option 2: Babylon.js

A full game engine with physics, input and tools built in.

**Pros**: more included out of the box (collisions, cameras, GUI); strong documentation.
**Cons**: a far larger download for a blocky island that needs little of it; harder to hit the 2 MB budget on phones.

### Option 3: Hand written WebGL voxel renderer

A small custom renderer that draws only cube faces.

**Pros**: the smallest possible download and full control over speed.
**Cons**: weeks of extra work on cameras, lighting, textures, picking and device quirks that Three.js already solves; harder for anyone else to maintain.

### Option 4: Three.js with a bundler build step

The same engine, bundled and tree shaken.

**Pros**: a smaller engine download; modern tooling.
**Cons**: Word Island gains a build to run before every deploy and a toolchain to keep working, against the project's plain static workflow (basis: your AGENTS.md).

Page placement was weighed separately: a screen inside `index.html` would make every Word Island visit pay for the 3D engine and grow the largest file further; a single `quest.html` gets crowded once islands and engine files arrive. A `quest/` folder keeps the game together and loads it only on demand.

## Rationale

The budget phone and the 2 MB first load rule out Babylon.js, and the one person team rules out a hand written renderer; Three.js is the boring, proven middle (basis: boring technology is a feature). Vendoring a pinned release keeps the game working on networks that block CDNs and stops silent upgrades; r184 is about six months old while the newest r186 removed the minified builds and is only weeks old (basis: Three.js releases list). ES modules with an import map keep the no build workflow, and import maps are supported by about 96% of browsers, including iOS Safari 16.4 and later (basis: caniuse import maps).

Sharing the question helpers, Firebase module and class rules through `shared/` follows the rule of one copy of each rule: a later fix to Pause or classes reaches both pages. Moving code verbatim, not rewriting it, keeps the risk to the live page small, and the full regression check (AC-10) on a preview guards it.

The engineer's picks matched the recommendation on every layer: own folder, Three.js, budget phone floor, vendored copy, ES modules, shared files, hub entry, landscape, automatic lower quality then a kind message, under 2 MB, and the quiz copy.

## Landscape check (2026-10-16)

- Latest release r186 (24 Sep 2026); earlier r185 (1 Jul), r184 (16 Apr), r183 (20 Feb). r186 notes "Remove minified builds", so check whether r184 still ships `three.module.min.js` when vendoring (step 2 of the build plan).
- WebGL 1 support was deprecated in r153 and removed in r163; `WebGLRenderer` needs WebGL 2.
- Import maps: about 96% global support; iOS Safari from 16.4.
- Licence: MIT.
- Agent Skills found: `cloudai-x/threejs-skills` (installed), others declined; Three.js MCP servers skipped (young, unverified).

## References

**Project sources**:
- `AGENTS.md` (stack, no build step, deploy and Firebase rules) and `units/AGENTS.md` (bank format)
- `docs/scope/scope.md`, feature 2 and the Skateboard approach
- Installed skills `cloudai-x/threejs-skills` (`.agents/skills/`)

**Practices & standards**:
- Boring technology is a feature
- One copy of each rule (shared code over copies)
- Move code verbatim before changing it (refactor without behaviour change)

**Links** (web verified 2026-10-16):
- Three.js releases: https://github.com/mrdoob/three.js/releases
- Three.js r186 release notes: https://github.com/mrdoob/three.js/releases/tag/r186
- Three.js migration guide: https://github.com/mrdoob/three.js/wiki/Migration-Guide
- Three.js minecraft example: https://threejs.org/examples/webgl_geometry_minecraft.html
- Three.js licence: https://github.com/mrdoob/three.js/blob/dev/LICENSE
- Can I use, import maps: https://caniuse.com/import-maps
