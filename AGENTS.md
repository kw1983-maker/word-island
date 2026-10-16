# Word Island

Pupil practice games for Super Minds English Units 1 to 9 (Year 1: Units 1 to 4, Year 2: Units 5 to 9). Live at https://word-island-red.vercel.app (not word-island.vercel.app, which belongs to someone else). Treasure Quest, a 3D game, is planned on top: see `docs/scope/scope.md`.

## Stack

- **Language / Runtime**: plain HTML, CSS and browser JavaScript; no framework, no bundler, no build step
- **Key dependencies**: Firebase web SDK 11 loaded from the gstatic CDN (Firestore + Auth, project `english-pdpr-quiz`); Google Fonts (Lexend, Fraunces, Black Ops One); browser speech for voices; Web Audio for sound effects
- **Hosting**: Vercel project `word-island` (static); a copy also ships inside the quiz site (`../quiz`, Firebase Hosting) for the teacher explain page
- **Tools**: Python with PyMuPDF and Pillow, only for cropping book pictures (`tools/crop.py`)
## Build approach

Skateboard (ship the smallest island pupils can really play, then grow it release by release).

## Commands

```bash
# Run locally (any static server from this folder)
python -m http.server 8000

# Crop book pictures for a unit
python -I tools/crop.py u9 [name ...]
# Deploy a preview, let the teacher test, then promote it
vercel deploy
vercel promote <preview-url>

# After any Word Island change, rebuild and deploy the quiz copy too (from ../quiz)
npm run build && npx -y firebase-tools@14 deploy
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.
## Rules

- `index.html` owns screens, questions, stars, results and Firebase; the canvas games (`run.js` as `window.RunGame`, `sky.js` as `window.SkyGame`) only draw and report back through the hooks they are given.
- Pupil facing text is short, plain English a 7 year old can read; every question can be read aloud.
- Works on phones and laptops: touch, mouse and keyboard all play every game.
- Firebase rules decide what is valid: a new game or score needs its id in `../quiz/firestore.rules`, `GAMES` in `../quiz/src/WordIsland.tsx`, and new files listed in `../quiz/scripts/copy-word-island.mjs`. Deploy Firebase before Vercel.
- Never test write to the real Firebase project: pupils' results show on the teacher's page. Use the Firestore and Auth emulators with a patched page copy.
- localStorage keys (`word-island-pupil`, `word-island-u1-v2-outbox`) are live on pupils' devices; never rename them.
- Comments explain why in plain sentences; commit messages are one plain sentence plus a short body.

## Git

- integration: on
- commit: one commit per finished step on `main`, kept local
- push: only after the teacher approves the Vercel preview (pushing `main` auto deploys production; if no new deployment appears, run `vercel deploy --prod`)
- remote: https://github.com/kw1983-maker/word-island (HTTPS, no SSH keys here)

## Agent skills

Declined: registry search for this stack (2026-10-16)
MCP servers: Vercel (connected), Firebase (connected)

## Context files

- [units/AGENTS.md](units/AGENTS.md): how a unit's question banks, hints and pictures are written

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
