// Treasure Quest · the &debug view: frame rate, render scale and drawn size, island build time, unit and question counts,
// the sound and the voice, and this play's drawn puzzles (add &seed=N to get the same ones again).
// Each puzzle anchor shows a floating label above it, and a line names the nearest one (spec 0006).
import * as THREE from "three";
import { sound } from "./sound.js";
import { voice } from "./voice.js";
import { walk } from "./walk.js";
import { targets } from "./targets.js";

const onOff = (on) => (on ? "on" : "off");

// A floating text label that always faces the camera and shows through walls.
function label(text) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 48;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffe066";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  sprite.scale.set(2.4, 0.45, 1);
  sprite.renderOrder = 10;
  return sprite;
}

// One label per spot, 1.5 blocks above where its puzzle object will sit.
function anchorLabels(quest) {
  if (!quest.scene || !quest.anchors) return;
  quest.island.spots.forEach((spot) => {
    const anchor = quest.anchors.get(spot.anchor);
    if (!anchor) return;
    const sprite = label(`${spot.id} ${spot.anchor}`);
    sprite.position.set(anchor.at.x + 0.5, anchor.at.y + 1.5, anchor.at.z + 0.5);
    quest.scene.add(sprite);
  });
}

// The anchor nearest the pupil's feet, measured flat (x and z).
function nearestAnchor(quest, pos) {
  let best = null;
  if (!quest.anchors) return best;
  quest.anchors.forEach((anchor, name) => {
    const dist = Math.hypot(anchor.at.x + 0.5 - pos.x, anchor.at.z + 0.5 - pos.z);
    if (!best || dist < best.dist) best = { name, dist };
  });
  return best;
}

export function showDebug(engine, quest) {
  const box = document.getElementById("debug");
  box.hidden = false;
  anchorLabels(quest);
  const banks = Object.entries(quest.unit.banks).map(([name, list]) => `${name} ${list.length}`).join(" · ");
  const plan = (quest.plan || []).map((p) => {
    const as = p.playAs === p.type ? p.type : `${p.type} as ${p.playAs}`;
    return `${p.spot.padEnd(3)} ${as.padEnd(15)} ${p.id}${p.challenge ? " ★" : ""}`;
  });
  const audio = () => {
    const a = sound.state();
    return `audio ${a.context} · sound ${onOff(a.sound)} · music ${onOff(a.music)}${a.tune ? " · music playing" : ""} · voice ${voice.name()}`;
  };
  // Where the pupil is, whether they stand or paddle, where a rescue would take them, and what is in front.
  const player = () => {
    const p = walk.player();
    if (!p) return "";
    const f = (v) => v.toFixed(1);
    const safe = walk.state().lastSafe;
    const target = targets.current();
    return `at ${f(p.pos.x)}, ${f(p.pos.y)}, ${f(p.pos.z)} · ${p.onGround ? "on ground" : "in the air"}${p.inWater ? " · in water" : ""}` +
      ` · safe ${f(safe.x)}, ${f(safe.y)}, ${f(safe.z)} · rescues ${walk.state().rescues} · in front: ${target ? target.label : "nothing"}`;
  };
  const nearest = () => {
    const p = walk.player();
    const near = p && nearestAnchor(quest, p.pos);
    return near ? `nearest anchor: ${near.name}, ${near.dist.toFixed(1)} blocks` : "";
  };
  const draw = () => {
    const s = engine.stats();
    box.textContent = [
      `fps ${s.fps.toFixed(1)} (judged ${s.judged.toFixed(1)})`,
      `scale ${s.scale} · drawn ${s.drawn[0]}×${s.drawn[1]}${s.running ? "" : " · paused: " + s.reasons.join(", ")}`,
      quest.world ? `island built in ${quest.world.stats.buildMs.toFixed(0)} ms · ${quest.world.stats.meshed} chunks meshed` : "",
      audio(),
      player(),
      nearest(),
      `unit ${quest.unit.id} · ${quest.pupil.cls}`,
      banks,
      `island year ${quest.island.year} · seed ${quest.seed}`,
      ...plan
    ].join("\n");
  };
  draw();
  setInterval(draw, 250);
}
