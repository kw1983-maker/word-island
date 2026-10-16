// Treasure Quest · sound: a small Web Audio synth for the sound effects and the tune, and the saved
// Sound and Music choice. No audio files: every sound is made from notes here (spec 0003).
// Nothing plays before unlock() (the Play tap) or while the game is paused, and without Web Audio
// every call quietly does nothing.

const KEY = "treasure-quest-audio";
const DUCK = 0.25; // effects and music drop to a quarter while the voice speaks

// Each effect is a list of notes: w wave ("square", "triangle", "sawtooth" or "noise"), f frequency in Hz
// (for noise, how bright it is), to an optional frequency to slide to, t start and d length in seconds, v volume.
export const EFFECTS = {
  click: [{ w: "square", f: 880, t: 0, d: 0.04, v: 0.18 }],
  open: [
    { w: "square", f: 392, t: 0, d: 0.06, v: 0.2 },
    { w: "square", f: 587, t: 0.06, d: 0.09, v: 0.2 }
  ],
  close: [
    { w: "square", f: 587, t: 0, d: 0.06, v: 0.2 },
    { w: "square", f: 392, t: 0.06, d: 0.09, v: 0.2 }
  ],
  chest: [
    { w: "sawtooth", f: 120, to: 70, t: 0, d: 0.2, v: 0.16 },
    { w: "triangle", f: 784, t: 0.18, d: 0.08, v: 0.35 },
    { w: "triangle", f: 1047, t: 0.25, d: 0.08, v: 0.35 },
    { w: "triangle", f: 1319, t: 0.32, d: 0.16, v: 0.35 }
  ],
  coin: [
    { w: "square", f: 988, t: 0, d: 0.07, v: 0.16 },
    { w: "square", f: 1319, t: 0.07, d: 0.22, v: 0.16 }
  ],
  right: [
    { w: "triangle", f: 523, t: 0, d: 0.09, v: 0.4 },
    { w: "triangle", f: 659, t: 0.09, d: 0.09, v: 0.4 },
    { w: "triangle", f: 784, t: 0.18, d: 0.09, v: 0.4 },
    { w: "triangle", f: 1047, t: 0.27, d: 0.2, v: 0.4 }
  ],
  wrong: [
    { w: "square", f: 196, t: 0, d: 0.13, v: 0.16 },
    { w: "square", f: 147, t: 0.14, d: 0.24, v: 0.16 }
  ],
  hint: [
    { w: "triangle", f: 660, t: 0, d: 0.12, v: 0.35 },
    { w: "triangle", f: 880, t: 0.13, d: 0.2, v: 0.35 }
  ],
  win: [
    { w: "square", f: 523, t: 0, d: 0.1, v: 0.14 },
    { w: "square", f: 659, t: 0.1, d: 0.1, v: 0.14 },
    { w: "square", f: 784, t: 0.2, d: 0.1, v: 0.14 },
    { w: "square", f: 1047, t: 0.3, d: 0.1, v: 0.14 },
    { w: "square", f: 1319, t: 0.4, d: 0.35, v: 0.14 },
    { w: "triangle", f: 131, t: 0, d: 0.3, v: 0.35 },
    { w: "triangle", f: 196, t: 0.3, d: 0.45, v: 0.35 }
  ],
  fanfare: [
    { w: "square", f: 392, t: 0, d: 0.12, v: 0.14 },
    { w: "square", f: 392, t: 0.15, d: 0.12, v: 0.14 },
    { w: "square", f: 392, t: 0.3, d: 0.12, v: 0.14 },
    { w: "square", f: 523, t: 0.45, d: 0.5, v: 0.15 },
    { w: "square", f: 466, t: 0.98, d: 0.14, v: 0.14 },
    { w: "square", f: 523, t: 1.14, d: 0.6, v: 0.15 },
    { w: "triangle", f: 131, t: 0.45, d: 0.5, v: 0.35 },
    { w: "triangle", f: 196, t: 0.98, d: 0.14, v: 0.35 },
    { w: "triangle", f: 131, t: 1.14, d: 0.6, v: 0.35 }
  ],
  step: [{ w: "noise", f: 700, t: 0, d: 0.05, v: 0.22 }],
  jump: [{ w: "square", f: 260, to: 620, t: 0, d: 0.16, v: 0.14 }],
  break: [
    { w: "noise", f: 1600, t: 0, d: 0.14, v: 0.35 },
    { w: "square", f: 140, to: 60, t: 0, d: 0.12, v: 0.12 }
  ],
  place: [
    { w: "noise", f: 500, t: 0, d: 0.06, v: 0.35 },
    { w: "triangle", f: 180, t: 0, d: 0.07, v: 0.4 }
  ]
};

let ctx = null;     // the AudioContext, made inside the Play tap
let out = null;     // everything goes through here, so speech can duck it
let fx = null;      // the effects bus
let noise = null;   // one second of white noise, shared by every noise note
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

// One note: a quick rise, then a fall to silence by the end, which is what makes it sound chiptune.
function playNote(note, at, bus) {
  const start = at + note.t;
  const end = start + note.d;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(note.v, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  gain.connect(bus);
  let source;
  if (note.w === "noise") {
    source = ctx.createBufferSource();
    source.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = note.f;
    source.connect(filter).connect(gain);
  } else {
    source = ctx.createOscillator();
    source.type = note.w;
    source.frequency.setValueAtTime(note.f, start);
    if (note.to) source.frequency.exponentialRampToValueAtTime(note.to, end);
    source.connect(gain);
  }
  source.start(start);
  source.stop(end + 0.02);
}

// While the voice speaks, everything else is quieter, so the words stay clear.
function watchSpeech() {
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  setInterval(() => {
    if (!ctx) return;
    const target = synth && synth.speaking ? DUCK : 1;
    out.gain.setTargetAtTime(target, ctx.currentTime, 0.05);
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
      out.connect(ctx.destination);
      fx = ctx.createGain();
      fx.gain.value = 0.6;
      fx.connect(out);
      noise = makeNoise();
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
    emit();
  },

  play(name) {
    const notes = EFFECTS[name];
    if (!notes) {
      console.warn(`Treasure Quest: no sound called "${name}".`);
      return;
    }
    if (!ctx || !settings.sound || paused) return;
    try {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const at = ctx.currentTime + 0.01;
      notes.forEach((note) => playNote(note, at, fx));
    } catch (err) {
      console.warn("Treasure Quest: a sound did not play.", err);
    }
  },

  setSound(on) {
    settings.sound = Boolean(on);
    save();
    emit();
  },

  setMusic(on) {
    settings.music = Boolean(on);
    save();
    emit();
  },

  // The engine's pause and resume: nothing plays while the game is paused.
  pause() {
    if (paused) return;
    paused = true;
    if (ctx) ctx.suspend().catch(() => {});
    emit();
  },
  resume() {
    if (!paused) return;
    paused = false;
    if (ctx) ctx.resume().catch(() => {});
    emit();
  },

  onChange: (fn) => listeners.push(fn),

  state: () => ({
    context: ctx ? ctx.state : "none",
    sound: settings.sound,
    music: settings.music,
    paused
  })
};
