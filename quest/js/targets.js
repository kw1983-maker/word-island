// Treasure Quest · using things (spec 0005): chests, villagers and, later, finds, word blocks and
// mined blocks are "targets" that features add with targets.add({ at, label, onUse }). The one in
// front of the pupil, within 4 blocks and not behind a wall, gets a white outline and its label
// above the hotbar; a click, E, a tap on it, or the phone's Use button calls its onUse once.
// This file never decides what using does: each feature's onUse does.
import * as THREE from "three";
import { controls } from "./controls.js";
import { touchpad } from "./touchpad.js";
import { notice } from "./notice.js";
import { hand } from "./hand.js";

const REACH = 4;        // blocks
const TAP_REACH = 40;   // how far a tap looks for a target, to say "Walk closer."

let camera = null;
let world = null;
let outline = null;
let label = null;
let current = null;
const list = [];
const raycaster = new THREE.Raycaster();
const box = new THREE.Box3();
const hit = new THREE.Vector3();
const dir = new THREE.Vector3();

// The space a target takes: a block's cube, or a 3D thing's bounding box.
function boxOf(target) {
  if (target.at && target.at.isObject3D) return box.setFromObject(target.at);
  const { x, y, z } = target.at;
  return box.set(new THREE.Vector3(x, y, z), new THREE.Vector3(x + 1, y + 1, z + 1));
}

// The nearest target this ray reaches within maxDist that no solid block hides.
function pick(ray, maxDist) {
  let best = null;
  let bestDist = Infinity;
  list.forEach((target) => {
    if (!ray.intersectBox(boxOf(target), hit)) return;
    const dist = hit.distanceTo(ray.origin);
    if (dist > maxDist || dist >= bestDist) return;
    const wall = world.raycast(ray.origin, ray.direction, dist);
    const isTarget = wall && !target.at.isObject3D && wall.x === target.at.x && wall.y === target.at.y && wall.z === target.at.z;
    if (wall && !isTarget && wall.distance < dist - 0.01) return;
    best = target;
    bestDist = dist;
  });
  return best ? { target: best, dist: bestDist } : null;
}

function show(target) {
  current = target;
  touchpad.setUse(Boolean(target));
  if (!target) {
    outline.visible = false;
    label.hidden = true;
    return;
  }
  boxOf(target);
  const size = box.getSize(new THREE.Vector3());
  outline.scale.set(size.x + 0.02, size.y + 0.02, size.z + 0.02);
  box.getCenter(outline.position);
  outline.visible = true;
  label.textContent = `${target.label} · ${controls.isLaptop() ? "click or E" : "tap"}`;
  label.hidden = false;
}

function use(target) {
  hand.swing();
  try {
    target.onUse();
  } catch (err) {
    console.warn("Treasure Quest: using a target failed.", err);
  }
}

export const targets = {
  // Call once with the island's scene, camera and world.
  attach(scene, cam, islandWorld) {
    camera = cam;
    world = islandWorld;
    outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    outline.visible = false;
    scene.add(outline);
    label = document.createElement("p");
    label.className = "uselabel";
    label.hidden = true;
    document.body.append(label);
    controls.onUse(() => targets.useCurrent());
    touchpad.onTap((x, y) => targets.tapAt(x, y));
  },

  // target: { at: { x, y, z } block or a THREE.Object3D, label: "Open the chest", onUse() }.
  // Returns a function that removes it again.
  add(target) {
    list.push(target);
    return () => {
      const at = list.indexOf(target);
      if (at >= 0) list.splice(at, 1);
      if (current === target) show(null);
    };
  },

  // Every frame: which target is in front (through the crosshair, or the middle of a phone's view).
  update() {
    if (!camera) return;
    if (!controls.playing()) {
      if (current || label.hidden === false) show(null);
      return;
    }
    camera.getWorldDirection(dir);
    raycaster.set(camera.position, dir);
    const found = pick(raycaster.ray, REACH);
    const target = found ? found.target : null;
    if (target !== current) show(target);
  },

  // A click, E or the Use button.
  useCurrent() {
    if (current && controls.playing()) use(current);
  },

  // A tap on the phone screen: use what was tapped, or say to walk closer.
  tapAt(x, y) {
    if (!camera || !controls.playing()) return;
    raycaster.setFromCamera(new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
    const found = pick(raycaster.ray, TAP_REACH);
    if (!found) return;
    if (found.dist <= REACH) use(found.target);
    else notice("Walk closer.");
  },

  current: () => current
};
