// Treasure Quest · a temporary test island built from the kit's 12 blocks, so the engine and the look
// can be judged before the real beach island (feature 7) replaces it. One row shows every block.
import * as THREE from "three";
import { BLOCKS, buildBlocks } from "./blocks.js";

const SIZE = 24;
const SKY = 0x8fd3ff;

function islandBlocks() {
  const blocks = [];
  const add = (x, y, z, kind, tint) => blocks.push({ x, y, z, kind, tint });

  // Sea round the edge, then wet sand, sand and grass, with a cobble path across.
  for (let x = 0; x < SIZE; x += 1) {
    for (let z = 0; z < SIZE; z += 1) {
      const edge = Math.min(x, z, SIZE - 1 - x, SIZE - 1 - z);
      if (edge < 2) add(x, -1, z, "water");
      else if (edge === 2) add(x, -1, z, "wetsand");
      else if (edge < 5) add(x, 0, z, "sand");
      else add(x, 0, z, z === 12 && x > 4 && x < 19 ? "cobble" : "grass");
    }
  }

  // A tree: a log with leaves round the top.
  for (let y = 1; y <= 3; y += 1) add(6, y, 6, "log");
  for (let y = 3; y <= 4; y += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dz = -1; dz <= 1; dz += 1) if (dx || dz) add(6 + dx, y, 6 + dz, "leaves");
    }
  }
  add(6, 5, 6, "leaves");

  // A small plank hut with a glass window and a doorway.
  for (let y = 1; y <= 2; y += 1) {
    for (let x = 15; x <= 18; x += 1) {
      for (let z = 14; z <= 17; z += 1) {
        const wall = x === 15 || x === 18 || z === 14 || z === 17;
        const door = x === 16 && z === 14;
        const window = y === 2 && x === 18 && z === 15;
        if (wall && !door) add(x, y, z, window ? "glass" : "planks");
      }
    }
  }
  // A stone tower with a cobble top, and coloured wool.
  for (let y = 1; y <= 3; y += 1) add(17, y, 6, "stone");
  add(17, 4, 6, "cobble");
  add(9, 1, 16, "wool", 0xd62828);
  add(10, 1, 16, "wool", 0xffd60a);
  add(11, 1, 16, "wool", 0x1d6fe0);

  // The kit row: every block once, the wool one red.
  Object.keys(BLOCKS).forEach((kind, i) => add(6 + i, 1, 19, kind, kind === "wool" ? 0xd62828 : undefined));
  return blocks;
}

export function buildTestScene(camera) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 30, 70);

  const blocks = islandBlocks();
  const island = buildBlocks(blocks);
  island.position.set(-SIZE / 2 + 0.5, 0, -SIZE / 2 + 0.5);
  scene.add(island);

  // The camera circles the island slowly, so the frame rate can be judged on a moving picture.
  let angle = 0;
  function update(dt) {
    angle += dt * 0.25;
    camera.position.set(Math.cos(angle) * 22, 14, Math.sin(angle) * 22);
    camera.lookAt(0, 0, 0);
    island.userData.tick(dt);
  }
  update(0);

  return { scene, update, blockCount: blocks.length };
}
