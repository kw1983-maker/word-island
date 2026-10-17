// Treasure Quest · mining (spec 0010): hold on a block to crack it, BlockWords style, and after about
// a second it breaks and goes into the hotbar; its name shows above the hotbar and is read aloud the
// first time that kind is collected. Using a chest or word thing always wins over mining.
// The crack textures and the timing loop are adapted from BlockWords js/main.js at commit 31a2bf4.
import * as THREE from "three";
import { B, BLOCKS } from "./bw/blocks.js";
import { mulberry32 } from "./bw/noise.js";
import { controls } from "./controls.js";
import { targets } from "./targets.js";
import { hud } from "./hud.js";
import { hand } from "./hand.js";
import { sound } from "./sound.js";
import { voice } from "./voice.js";
import { notice } from "./notice.js";

const REACH = 4;          // blocks, the same reach as using things (spec 0005)
const BREAK = 1.0;        // seconds to break any solid block; sprites break at once
const DIG_EVERY = 0.22;   // BlockWords' dig sound and swing rhythm
const REFUSE_EVERY = 2000; // ms between "You can't break this." lines

let world = null;
let camera = null;
let crack = null;
let textures = [];
const state = { target: null, progress: 0, digTimer: 0 };
const collected = new Set();   // block kinds already read aloud this play
const dir = new THREE.Vector3();

// Ten stages of cracking, drawn the same way the block textures are (BlockWords).
function makeCrackTextures() {
  const out = [];
  for (let stage = 0; stage < 10; stage++) {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const g = c.getContext("2d");
    const rnd = mulberry32(1234 + stage);
    g.strokeStyle = "rgba(0,0,0,0.75)";
    g.lineWidth = 1;
    for (let i = 0; i < 1 + stage; i++) {
      g.beginPath();
      let x = Math.floor(rnd() * 16);
      let y = Math.floor(rnd() * 16);
      g.moveTo(x, y);
      for (let s = 0; s < 3 + stage; s++) {
        x += Math.floor(rnd() * 7) - 3;
        y += Math.floor(rnd() * 7) - 3;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    out.push(t);
  }
  return out;
}

function reset() {
  state.target = null;
  state.progress = 0;
  if (crack) crack.visible = false;
}

// The block in the middle of the view, within reach (water is looked through, as in BlockWords).
function lookedAt() {
  camera.getWorldDirection(dir);
  return world.raycast(camera.position, dir, REACH);
}

function breakable(hit) {
  return hit.id !== B.AIR && BLOCKS[hit.id].hardness >= 0;
}

// Collects the block (and any sprite resting on it) into the hotbar, or refuses when there is no room.
function breakBlock(hit) {
  const bdef = BLOCKS[hit.id];
  const aboveId = world.getBlock(hit.x, hit.y + 1, hit.z);
  const above = aboveId !== B.AIR && BLOCKS[aboveId].render === "cross" && breakable({ ...hit, y: hit.y + 1, id: aboveId })
    ? BLOCKS[aboveId] : null;
  if (!hud.canAdd(above ? [bdef.name, above.name] : [bdef.name])) {
    notice("Your hotbar is full");
    reset();
    return;
  }
  world.setBlock(hit.x, hit.y, hit.z, B.AIR);
  if (above) world.setBlock(hit.x, hit.y + 1, hit.z, B.AIR);
  world.rebuildDirty();
  sound.play("break", { block: bdef.name });
  [bdef, above].filter(Boolean).forEach((b) => hud.add(b.name));
  notice(bdef.label);
  if (!collected.has(bdef.name)) {
    collected.add(bdef.name);
    voice.say(bdef.label);
  }
  if (above) collected.add(above.name);
  reset();
}

export const mining = {
  // Call once the island and its chests are built.
  start({ world: islandWorld, scene, camera: cam }) {
    world = islandWorld;
    camera = cam;
    textures = makeCrackTextures();
    crack = new THREE.Mesh(
      new THREE.BoxGeometry(1.01, 1.01, 1.01),
      new THREE.MeshBasicMaterial({ map: textures[0], transparent: true, depthWrite: false })
    );
    crack.visible = false;
    scene.add(crack);
  },

  // Every game step: while the pupil holds to mine, crack the block in front, then break it.
  update(dt) {
    if (!world || !controls.playing() || !controls.input.mine) {
      reset();
      return;
    }
    // Using a chest or word thing always wins (spec 0005): never crack what can be used.
    const hit = targets.current() ? null : lookedAt();
    if (!hit || !breakable(hit)) {
      reset();
      return;
    }
    const key = `${hit.x},${hit.y},${hit.z}`;
    if (state.target !== key) {
      state.target = key;
      state.progress = 0;
      state.digTimer = 0;
    }
    const total = BLOCKS[hit.id].render === "cross" ? 0 : BREAK;
    state.progress += dt;
    state.digTimer -= dt;
    if (state.digTimer <= 0) {
      state.digTimer = DIG_EVERY;
      sound.play("dig", { block: BLOCKS[hit.id].name });
      hand.swing();
    }
    if (state.progress >= total) {
      breakBlock(hit);
      return;
    }
    const frac = state.progress / total;
    crack.visible = frac > 0.02;
    crack.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
    crack.material.map = textures[Math.min(9, Math.floor(frac * 10))];
  },

  // For the debug view and tests.
  state: () => ({ target: state.target, progress: +state.progress.toFixed(2), collected: [...collected] })
};
