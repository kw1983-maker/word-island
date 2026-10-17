// Treasure Quest · builds an island from its map file (spec 0006): the world from the map's placed
// blocks, the sea round it, BlockWords' sky, the villagers, and the anchors where puzzles will sit.
// Villagers stand still and turn their heads to look at a pupil who comes near.
// Replaces the test beach of specs 0004 and 0005.
import * as THREE from "three";
import { buildAtlas, atlasCanvas, validateTiles, TILE, COLS, TILE_INDEX } from "./bw/atlas.js";
import { makeMaterials } from "./bw/chunk.js";
import { IslandWorld, buildSea } from "./bw/world.js";
import { Sky } from "./bw/sky.js";
import { villagerModel } from "./bw/villager.js";

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

const LOOK_NEAR = 8;                       // a villager looks at a pupil this close (blocks)
const LOOK_MAX = (70 * Math.PI) / 180;     // and turns its head at most this far either way
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Turns a villager's head toward the camera, or back to the front when the pupil is far away.
function lookAt(villager, camera, dt) {
  const head = villager.userData.head;
  const dx = camera.position.x - villager.position.x;
  const dz = camera.position.z - villager.position.z;
  let want = 0;
  if (Math.hypot(dx, dz) <= LOOK_NEAR) {
    want = wrap(Math.atan2(-dx, -dz) - villager.rotation.y);
    want = Math.max(-LOOK_MAX, Math.min(LOOK_MAX, want));
  }
  head.rotation.y += (want - head.rotation.y) * Math.min(1, dt * 6);
}

// map: the island's map file. kit: true on the &kit page, which adds its sample chest and villager.
export function buildIsland(camera, map, { kit = false } = {}) {
  const scene = new THREE.Scene();
  buildAtlas();
  validateTiles();
  const materials = makeMaterials(pixelTexture(atlasCanvas, false));

  const placed = map.blocks();
  const kitPlaces = kit && map.kit ? { chest: map.kit.chest } : null;
  if (kitPlaces) placed.push({ ...kitPlaces.chest, kind: "chest" });

  const world = new IslandWorld(scene, materials, map.seaLevel);
  world.build(placed);
  scene.add(buildSea(materials, map.seaLevel, waterTexture()));

  const sky = new Sky(scene, materials);
  sky.setFogDistance(6);

  if (kitPlaces) {
    const villager = villagerModel();
    const { x, y, z } = map.kit.villager;
    villager.position.set(x, y, z);
    scene.add(villager);
    kitPlaces.villager = villager;
  }

  // The villagers who live on the island just stand there, so they have no "!" over them.
  const villagers = map.villagers.map(({ at, yaw }) => {
    const villager = villagerModel();
    villager.position.set(at.x, at.y, at.z);
    villager.rotation.y = yaw;
    villager.userData.marker.visible = false;
    scene.add(villager);
    return villager;
  });

  const anchors = new Map(map.anchors.map((a) => [a.name, { at: a.at, face: a.face }]));

  function update(dt) {
    sky.update(dt, camera);
    villagers.forEach((villager) => lookAt(villager, camera, dt));
  }

  return { scene, update, world, start: map.start, anchors, villagers, kit: kitPlaces };
}
