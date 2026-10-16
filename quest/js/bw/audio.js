// Adapted from BlockWords js/audio.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// BlockWords' synthesised sounds (tone, noise, the material sounds, Sfx) and its quiet ambient
// music, unchanged in shape. The quest's sound.js owns the AudioContext, the Sound and Music
// settings and pausing, and hands this file its buses through attach(); nothing plays until then.

let ctx = null;
let master = null;      // the quest's effects bus
let musicGain = null;   // the quest's music bus
let noiseBuffer = null;

export function attach(audio) {
  ({ ctx, fx: master, music: musicGain, noise: noiseBuffer } = audio);
}

function now() { return ctx ? ctx.currentTime : 0; }

function tone(freq, dur, type = 'sine', vol = 0.2, slideTo = null, delay = 0) {
  if (!ctx) return;
  const t = now() + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.2, filterFreq = 1200, q = 1, delay = 0, type = 'bandpass') {
  if (!ctx) return;
  const t = now() + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = filterFreq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t); src.stop(t + dur + 0.02);
}

// Different materials have to *sound* different or mining feels flat.
const MATERIAL_SOUND = {
  grass: { f: 900, q: 0.7, vol: 0.16, dur: 0.09 },
  dirt: { f: 700, q: 0.8, vol: 0.16, dur: 0.09 },
  sand: { f: 1600, q: 0.5, vol: 0.13, dur: 0.11 },
  stone: { f: 2200, q: 3.0, vol: 0.15, dur: 0.06 },
  wood: { f: 1100, q: 4.0, vol: 0.16, dur: 0.07 },
  wool: { f: 500, q: 0.6, vol: 0.13, dur: 0.10 },
  glass: { f: 4200, q: 6.0, vol: 0.14, dur: 0.09 },
  plant: { f: 1500, q: 1.2, vol: 0.10, dur: 0.06 },
};

// Map a block name onto one of those material groups.
export function materialOf(blockName) {
  if (/grass_block|dirt_path/.test(blockName)) return 'grass';
  if (/dirt|clay|gravel/.test(blockName)) return 'dirt';
  if (/sand/.test(blockName)) return 'sand';
  if (/log|planks|crafting|chest|sign|bookshelf/.test(blockName)) return 'wood';
  if (/wool/.test(blockName)) return 'wool';
  if (/glass/.test(blockName)) return 'glass';
  if (/leaves|grass|rose|dandelion|cane/.test(blockName)) return 'plant';
  return 'stone';
}

export const Sfx = {
  dig(mat) {
    const m = MATERIAL_SOUND[mat] || MATERIAL_SOUND.stone;
    noise(m.dur, m.vol * 0.7, m.f * (0.85 + Math.random() * 0.3), m.q);
  },
  break_(mat) {
    const m = MATERIAL_SOUND[mat] || MATERIAL_SOUND.stone;
    noise(m.dur * 2.2, m.vol * 1.3, m.f, m.q);
    noise(m.dur * 1.4, m.vol * 0.8, m.f * 0.6, m.q, 0.03);
  },
  place(mat) {
    const m = MATERIAL_SOUND[mat] || MATERIAL_SOUND.stone;
    noise(m.dur * 1.4, m.vol, m.f * 0.9, m.q);
  },
  step(mat) {
    const m = MATERIAL_SOUND[mat] || MATERIAL_SOUND.stone;
    noise(0.055, m.vol * 0.35, m.f * (0.7 + Math.random() * 0.4), m.q * 0.6);
  },
  pickup() { tone(880, 0.07, 'square', 0.09); tone(1320, 0.08, 'square', 0.07, null, 0.05); },
  craft() { tone(660, 0.08, 'triangle', 0.12); tone(880, 0.1, 'triangle', 0.12, null, 0.07); },
  levelUp() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.13, null, i * 0.09)); },
  correct() { [659, 880].forEach((f, i) => tone(f, 0.18, 'sine', 0.15, null, i * 0.1)); },
  wrong() { tone(300, 0.2, 'sine', 0.12, 220); },
  open() { tone(420, 0.07, 'square', 0.07); },
  villager() { tone(240 + Math.random() * 60, 0.14, 'sawtooth', 0.09, 180); },
};

// The quest's own effect names, made from the same tone and noise shapes. BlockWords has no
// close, jump, chest, hint or fanfare sound, so those are new sounds in its style.
export const QuestSfx = {
  click: () => Sfx.open(),
  open: () => Sfx.open(),
  close: () => tone(420, 0.07, 'square', 0.06, 300),
  chest: () => { Sfx.place('wood'); tone(880, 0.07, 'square', 0.09, null, 0.12); tone(1320, 0.1, 'square', 0.07, null, 0.17); },
  coin: () => Sfx.pickup(),
  right: () => Sfx.correct(),
  wrong: () => Sfx.wrong(),
  hint: () => Sfx.craft(),
  win: () => Sfx.levelUp(),
  fanfare: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.22, 'triangle', 0.13, null, i * 0.11)),
  step: (mat) => Sfx.step(mat || 'grass'),
  jump: () => tone(260, 0.12, 'square', 0.06, 420),
  break: (mat) => Sfx.break_(mat || 'stone'),
  place: (mat) => Sfx.place(mat || 'stone'),
  dig: (mat) => Sfx.dig(mat || 'stone'),
  pickup: () => Sfx.pickup(),
  craft: () => Sfx.craft(),
  villager: () => Sfx.villager(),
};

// ------------------------------------------------------------------- music
// A slow, unobtrusive pad plus occasional pentatonic notes. Original, generated
// live, and quiet enough to leave under a teacher's voice.
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16];
export const MUSIC_LEVEL = 0.16;
export const MUSIC_EVERY = 2600;   // ms between chances of a note

export function musicNote() {
  if (!ctx || Math.random() >= 0.75) return;
  const root = 220;
  const semi = SCALE[Math.floor(Math.random() * SCALE.length)];
  const f = root * Math.pow(2, semi / 12);
  const t = now();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
  o.connect(g); g.connect(musicGain);
  o.start(t); o.stop(t + 3.4);

  // a soft fifth underneath
  const o2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  o2.type = 'triangle';
  o2.frequency.value = f * 0.5 * 1.5;
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.exponentialRampToValueAtTime(0.05, t + 0.9);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 4.0);
  o2.connect(g2); g2.connect(musicGain);
  o2.start(t); o2.stop(t + 4.2);
}
