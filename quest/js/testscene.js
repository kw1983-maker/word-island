// Treasure Quest · a small BlockWords style test beach, so the look can be judged before the real
// beach island (feature 7) replaces it (spec 0004): sand, sea, grass, an oak tree, a village house,
// a chest, a villager, and one row showing every block. You start on its path and walk it (spec 0005).
import * as THREE from "three";
import { BLOCKS } from "./bw/blocks.js";
import { buildAtlas, atlasCanvas, validateTiles, TILE, COLS, TILE_INDEX } from "./bw/atlas.js";
import { makeMaterials } from "./bw/chunk.js";
import { IslandWorld, ISLAND_SIZE, buildSea } from "./bw/world.js";
import { Sky } from "./bw/sky.js";
import { villagerModel } from "./bw/villager.js";

const SEA_LEVEL = 6;
const MID = ISLAND_SIZE / 2;

// Sharp square pixels, as BlockWords makes its atlas texture.
function pixelTexture(canvas, repeat) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.wrapS = tex.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  return tex;
}

// A repeating copy of the water tile, for the sea beyond the island.
function waterTexture() {
  const at = TILE_INDEX.water;
  const c = document.createElement("canvas");
  c.width = c.height = TILE;
  c.getContext("2d").drawImage(atlasCanvas, (at % COLS) * TILE, Math.floor(at / COLS) * TILE, TILE, TILE, 0, 0, TILE, TILE);
  return pixelTexture(c, true);
}

// The beach, as placed blocks: a round island of grass, sand and wet sand in a shallow sea.
function beachBlocks() {
  const placed = [];
  const fill = (x0, x1, y0, y1, z0, z1, kind) => placed.push({ x0, x1, y0, y1, z0, z1, kind });
  const put = (x, y, z, kind) => placed.push({ x, y, z, kind });

  for (let x = 0; x < ISLAND_SIZE; x += 1) {
    for (let z = 0; z < ISLAND_SIZE; z += 1) {
      const r = Math.hypot(x + 0.5 - MID, z + 0.5 - MID);
      put(x, 0, z, "bedrock");
      if (r >= 26) {
        fill(x, x, 1, 3, z, z, "sand");
        fill(x, x, 4, SEA_LEVEL, z, z, "water");
      } else if (r >= 23) {
        fill(x, x, 1, 5, z, z, "sand");
        put(x, SEA_LEVEL, z, "wet_sand");
      } else if (r >= 16) {
        fill(x, x, 1, 4, z, z, "stone");
        fill(x, x, 5, 7, z, z, "sand");
      } else {
        fill(x, x, 1, 5, z, z, "stone");
        fill(x, x, 6, 7, z, z, "dirt");
        put(x, 8, z, "grass_block");
      }
    }
  }

  // A path from where you stand to the house.
  for (let z = 30; z <= 41; z += 1) put(32, 8, z, "dirt_path");

  // An oak tree: a trunk with a ball of leaves.
  for (let y = 9; y <= 13; y += 1) put(24, y, 26, "oak_log");
  for (let y = 12; y <= 14; y += 1) {
    const reach = y === 14 ? 1 : 2;
    for (let dx = -reach; dx <= reach; dx += 1) {
      for (let dz = -reach; dz <= reach; dz += 1) {
        if (dx === 0 && dz === 0 && y < 14) continue;
        if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        put(24 + dx, y, 26 + dz, "oak_leaves");
      }
    }
  }
  put(24, 15, 26, "oak_leaves");

  // A small village house: cobblestone floor, log corners, plank walls, glass windows, a doorway.
  const [hx0, hx1, hz0, hz1] = [29, 35, 22, 28];
  fill(hx0, hx1, 8, 8, hz0, hz1, "cobblestone");
  for (let y = 9; y <= 11; y += 1) {
    for (let x = hx0; x <= hx1; x += 1) {
      for (let z = hz0; z <= hz1; z += 1) {
        const edgeX = x === hx0 || x === hx1;
        const edgeZ = z === hz0 || z === hz1;
        if (!edgeX && !edgeZ) continue;
        const corner = edgeX && edgeZ;
        const door = z === hz1 && x === 32 && y <= 10;
        const window = y === 10 && !corner && (x === 30 || x === 34 || z === 25);
        if (door) continue;
        put(x, y, z, corner ? "oak_log" : window ? "glass" : "oak_planks");
      }
    }
  }
  fill(hx0, hx1, 12, 12, hz0, hz1, "oak_planks");
  fill(hx0 + 1, hx1 - 1, 13, 13, hz0 + 1, hz1 - 1, "oak_planks");
  put(30, 9, 23, "crafting_table");
  put(34, 9, 23, "bookshelf");

  // A treasure chest by the path, and some flowers and grass.
  put(34, 9, 36, "chest");
  [[27, 33, "rose"], [28, 37, "dandelion"], [37, 31, "rose"], [38, 38, "dandelion"], [26, 30, "tall_grass"],
    [29, 39, "tall_grass"], [36, 34, "tall_grass"], [21, 33, "tall_grass"], [40, 27, "tall_grass"]]
    .forEach(([x, z, kind]) => put(x, 9, z, kind));
  [[44, 51], [45, 51], [46, 50]].forEach(([x, z]) => {
    put(x, SEA_LEVEL + 1, z, "sugar_cane");
    put(x, SEA_LEVEL + 2, z, "sugar_cane");
  });

  // The kit row: every block once, on the sand in front of you.
  const kinds = BLOCKS.filter((b) => b.name !== "air").map((b) => b.name);
  kinds.forEach((kind, i) => put(15 + i, 8, 46, kind));
  return placed;
}

export function buildTestScene(camera) {
  const scene = new THREE.Scene();
  buildAtlas();
  validateTiles();
  const materials = makeMaterials(pixelTexture(atlasCanvas, false));

  const world = new IslandWorld(scene, materials, SEA_LEVEL);
  world.build(beachBlocks());
  scene.add(buildSea(materials, SEA_LEVEL, waterTexture()));

  const sky = new Sky(scene, materials);
  sky.setFogDistance(6);

  // The villager stands by the house, facing the path.
  const villager = villagerModel();
  villager.position.set(31.5, 9, 30.5);
  villager.rotation.y = Math.PI;
  scene.add(villager);

  // You start on the path, looking up it at the house and the tree (feet on the grass at y 9).
  const start = { x: 32.5, y: 9, z: 41.5, yaw: 0, pitch: -0.12 };

  function update(dt) {
    sky.update(dt, camera);
  }

  return { scene, update, world, start, villager, chest: { x: 34, y: 9, z: 36 } };
}
