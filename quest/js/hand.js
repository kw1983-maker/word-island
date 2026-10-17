// Treasure Quest · the hand: a blocky arm at the bottom right holding the selected hotbar item,
// drawn in its own small scene on top of the world (spec 0004). The held item is BlockWords'
// held item sprite (main.js, updateHeldItem); the arm is ours, because BlockWords shows no arm.
import * as THREE from "three";
import { blockIconUrl } from "./bw/icons.js";

// Until feature 14 (pick your hero) gives the arm the hero's colours.
const SLEEVE = 0x3a6fd8;
const SKIN = 0xc9a07a;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.01, 10);

function part(w, h, d, colour) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: colour }));
}

// The arm reaches in from the bottom right corner, as in a block game.
const arm = new THREE.Group();
const sleeve = part(0.24, 0.24, 0.62, SLEEVE);
sleeve.position.set(0, 0, 0.12);
const fist = part(0.25, 0.25, 0.26, SKIN);
fist.position.set(0, 0, -0.32);
arm.add(sleeve, fist);
arm.position.set(0.78, -0.72, -1.25);
arm.rotation.set(0.42, 0.18, -0.12);
scene.add(arm);

// BlockWords' held item: the item's icon as a sprite in the hand.
const held = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false }));
held.scale.set(0.4, 0.4, 0.4);
held.position.set(0.78, -0.55, -1.6);
held.material.rotation = -0.25;
held.renderOrder = 1;
held.visible = false;
scene.add(held);

let current = null;
let swingT = 0;          // seconds left of a swing (using something)
const SWING = 0.28;      // BlockWords' swing length
const armRest = arm.position.clone();
const heldRest = held.position.clone();

export const hand = {
  scene,
  camera,

  // Shows a block name in the hand, or the arm alone when empty.
  setItem(name) {
    if (name === current) return;
    current = name || null;
    const url = current && blockIconUrl(current);
    if (!url) {
      held.visible = false;
      return;
    }
    const texture = new THREE.TextureLoader().load(url);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    if (held.material.map) held.material.map.dispose();
    held.material.map = texture;
    held.material.needsUpdate = true;
    held.visible = true;
  },

  item: () => current,

  // The hand swings when the pupil uses something, as BlockWords' does.
  swing() {
    swingT = SWING;
  },

  // Every frame: move the arm and held item through the swing.
  update(dt) {
    if (swingT > 0) swingT = Math.max(0, swingT - dt);
    const s = swingT / SWING;
    arm.position.set(armRest.x - s * 0.08, armRest.y - s * 0.18, armRest.z);
    held.position.set(heldRest.x - s * 0.08, heldRest.y - s * 0.22, heldRest.z);
    held.material.rotation = -0.25 + s * 0.9;
  }
};
