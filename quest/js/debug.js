// Treasure Quest · the &debug view: frame rate, render scale and drawn size, island build time, unit and question counts,
// the sound and the voice, and this play's drawn puzzles (add &seed=N to get the same ones again).
import { sound } from "./sound.js";
import { voice } from "./voice.js";

const onOff = (on) => (on ? "on" : "off");

export function showDebug(engine, quest) {
  const box = document.getElementById("debug");
  box.hidden = false;
  const banks = Object.entries(quest.unit.banks).map(([name, list]) => `${name} ${list.length}`).join(" · ");
  const plan = (quest.plan || []).map((p) => {
    const as = p.playAs === p.type ? p.type : `${p.type} as ${p.playAs}`;
    return `${p.spot.padEnd(3)} ${as.padEnd(15)} ${p.id}${p.challenge ? " ★" : ""}`;
  });
  const audio = () => {
    const a = sound.state();
    return `audio ${a.context} · sound ${onOff(a.sound)} · music ${onOff(a.music)}${a.tune ? " · music playing" : ""} · voice ${voice.name()}`;
  };
  const draw = () => {
    const s = engine.stats();
    box.textContent = [
      `fps ${s.fps.toFixed(1)} (judged ${s.judged.toFixed(1)})`,
      `scale ${s.scale} · drawn ${s.drawn[0]}×${s.drawn[1]}${s.running ? "" : " · paused: " + s.reasons.join(", ")}`,
      quest.world ? `island built in ${quest.world.stats.buildMs.toFixed(0)} ms · ${quest.world.stats.meshed} chunks meshed` : "",
      audio(),
      `unit ${quest.unit.id} · ${quest.pupil.cls}`,
      banks,
      `island year ${quest.island.year} · seed ${quest.seed}`,
      ...plan
    ].join("\n");
  };
  draw();
  setInterval(draw, 250);
}
