// Treasure Quest · sound: BlockWords' synthesised sounds and ambient music (bw/audio.js), behind
// the quest's own controls: the Play tap unlock, the saved Sound and Music choice, quieter sound
// while the voice speaks, and silence while the game is paused (specs 0003 and 0004).
// No audio files. Without Web Audio every call quietly does nothing.
import { attach, QuestSfx, materialOf, musicNote, MUSIC_LEVEL, MUSIC_EVERY } from "./bw/audio.js";

const KEY = "treasure-quest-audio";
const DUCK = 0.25;     // effects and music drop to a quarter while the voice speaks
const MASTER = 0.55;   // BlockWords' master volume

// Every sound the quest can play by name (the &kit sound board lists them).
export const EFFECTS = Object.keys(QuestSfx);

let ctx = null;     // the AudioContext, made inside the Play tap
let out = null;     // everything goes through here, so speech can duck it
let music = null;   // the music's bus
let musicTimer = 0;
let paused = false;
const listeners = [];

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (err) {
    return null; // private windows can block storage
  }
}

// The saved choice, else the Sound choice the pupil made in Word Island, and Music on.
function readSettings() {
  const saved = readJson(KEY);
  if (saved && typeof saved.sound === "boolean" && typeof saved.music === "boolean") {
    return { sound: saved.sound, music: saved.music };
  }
  const pupil = readJson("word-island-pupil");
  return { sound: !(pupil && pupil.sound === false), music: true };
}

const settings = readSettings();

// Only the pupil's own taps save. Blocked storage still lets the buttons work for this visit.
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ sound: settings.sound, music: settings.music }));
  } catch (err) {
    // keep the choice in memory only
  }
}

function emit() {
  const now = sound.state();
  listeners.forEach((fn) => {
    try {
      fn(now);
    } catch (err) {
      console.warn("Treasure Quest: sound listener failed.", err);
    }
  });
}

function makeNoise() {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// The music plays only after Play, with Sound and Music both on, while the game is not paused.
// It is BlockWords' gentle random notes, so stopping and starting again simply carries on.
function updateMusic() {
  const want = Boolean(ctx) && settings.sound && settings.music && !paused;
  if (want && !musicTimer) {
    music.gain.setTargetAtTime(MUSIC_LEVEL, ctx.currentTime, 1.5);
    try {
      musicNote();
      musicTimer = setInterval(musicNote, MUSIC_EVERY);
    } catch (err) {
      console.warn("Treasure Quest: the music did not play.", err);
    }
  } else if (!want && musicTimer) {
    clearInterval(musicTimer);
    musicTimer = 0;
    // Fade the notes already sounding.
    if (ctx) music.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
  }
}

// While the voice speaks, everything else is quieter, so the words stay clear.
function watchSpeech() {
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  setInterval(() => {
    if (!ctx) return;
    const target = synth && synth.speaking ? DUCK : 1;
    out.gain.setTargetAtTime(target * MASTER, ctx.currentTime, 0.05);
  }, 150);
}

export const sound = {
  // Call inside the Play tap: phones only allow sound that starts from a tap.
  unlock() {
    if (ctx) {
      if (ctx.state !== "running" && !paused) ctx.resume().catch(() => {});
      return;
    }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    try {
      ctx = new Context();
      out = ctx.createGain();
      out.gain.value = MASTER;
      out.connect(ctx.destination);
      music = ctx.createGain();
      music.gain.value = 0;
      music.connect(out);
      attach({ ctx, fx: out, music, noise: makeNoise() });
      // iPhone Safari also wants a sound to start inside the tap.
      const silent = ctx.createBufferSource();
      silent.buffer = ctx.createBuffer(1, 1, 22050);
      silent.connect(ctx.destination);
      silent.start(0);
      ctx.resume().catch(() => {});
      watchSpeech();
    } catch (err) {
      console.warn("Treasure Quest: no Web Audio, playing without sound.", err);
      ctx = null;
    }
    if (ctx) updateMusic();
    emit();
  },

  // name: one of EFFECTS. options.block: the block a dig, step, place or break sound is about.
  play(name, { block } = {}) {
    const effect = QuestSfx[name];
    if (!effect) {
      console.warn(`Treasure Quest: no sound called "${name}".`);
      return;
    }
    if (!ctx || !settings.sound || paused) return;
    try {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      effect(block ? materialOf(block) : undefined);
    } catch (err) {
      console.warn("Treasure Quest: a sound did not play.", err);
    }
  },

  setSound(on) {
    settings.sound = Boolean(on);
    save();
    updateMusic();
    emit();
  },

  setMusic(on) {
    settings.music = Boolean(on);
    save();
    updateMusic();
    emit();
  },

  // The engine's pause and resume: nothing plays while the game is paused.
  pause() {
    if (paused) return;
    paused = true;
    updateMusic();
    if (ctx) ctx.suspend().catch(() => {});
    emit();
  },
  resume() {
    if (!paused) return;
    paused = false;
    if (ctx) ctx.resume().catch(() => {});
    updateMusic();
    emit();
  },

  onChange: (fn) => listeners.push(fn),

  state: () => ({
    context: ctx ? ctx.state : "none",
    sound: settings.sound,
    music: settings.music,
    tune: Boolean(musicTimer),
    paused
  })
};
