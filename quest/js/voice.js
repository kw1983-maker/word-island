// Treasure Quest · voice: the browser reads puzzles aloud, with its own pitch and speed for each
// series character. The words are always on screen too, so the voice is extra, never the only way in.
// The voice choice copies Word Island's pickVoice (index.html): change both together (spec 0003).
import { sound } from "./sound.js";

// The narrator matches Word Island's voice settings; an unknown speaker uses the narrator.
const NARRATOR = { rate: 0.9, pitch: 1.15 };
export const CAST = {
  Robo: { rate: 0.85, pitch: 0.6 },
  Ming: { rate: 0.95, pitch: 1.0 },
  Mei: { rate: 0.95, pitch: 1.4 },
  Jie: { rate: 1.0, pitch: 1.2 },
  Flash: { rate: 1.05, pitch: 1.35 }
};

const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
let chosen = null;      // the English voice in use
let listed = false;     // true once the browser has listed its voices
let unlocked = false;   // true after the Play tap
let paused = false;

// Some Android phones write en_GB with a line at the bottom, so allow both.
function pickVoice() {
  if (!synth) return;
  let voices = [];
  try {
    voices = synth.getVoices() || [];
  } catch (err) {
    voices = [];
  }
  if (voices.length) listed = true;
  chosen = voices.find((v) => /^en[-_]GB/i.test(v.lang))
    || voices.find((v) => /^en/i.test(v.lang))
    || null;
}

if (synth) {
  pickVoice();
  // Chrome lists its voices a moment after the page opens, so look again when they arrive.
  if (typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", pickVoice);
  else synth.onvoiceschanged = pickVoice;
}

function stop() {
  if (!synth) return;
  try {
    synth.cancel();
  } catch (err) {
    // nothing to stop
  }
}

// Turning Sound off also stops any reading that is going on.
sound.onChange((now) => {
  if (!now.sound) stop();
});

export const voice = {
  // Call inside the Play tap: iPhone Safari only speaks after it has spoken once from a tap.
  unlock() {
    unlocked = true;
    if (!synth) return;
    try {
      const line = new SpeechSynthesisUtterance(" ");
      line.volume = 0;
      synth.speak(line);
    } catch (err) {
      // no speech on this device
    }
  },

  // Speech exists and has an English voice (or has not listed its voices yet, so it may still have one).
  available: () => Boolean(synth) && (!listed || Boolean(chosen)),

  // Reads text aloud. Without fromButton it only reads when Sound is on (reading a panel as it opens).
  // Returns false when this device can't read it, so a Hear it button can show the words instead.
  say(text, { by = "", fromButton = false } = {}) {
    if (!text) return true;
    if (!fromButton && (!unlocked || !sound.state().sound)) return true;
    if (paused) return true;
    if (!voice.available()) return false;
    try {
      synth.cancel();
      const line = new SpeechSynthesisUtterance(text);
      const style = CAST[by] || NARRATOR;
      line.lang = chosen ? chosen.lang : "en-GB";
      line.rate = style.rate;
      line.pitch = style.pitch;
      if (chosen) line.voice = chosen;
      synth.speak(line);
      return true;
    } catch (err) {
      console.warn("Treasure Quest: the voice did not speak.", err);
      return false;
    }
  },

  stop,

  // The engine's pause and resume: no speech while the game is paused.
  pause() {
    paused = true;
    stop();
  },
  resume() {
    paused = false;
  },

  // For the debug view.
  name() {
    if (!synth) return "no speech";
    if (chosen) return `${chosen.name} (${chosen.lang})`;
    return listed ? "no English voice" : "not listed yet";
  }
};
