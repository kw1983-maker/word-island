// Treasure Quest · the Unit 3 pet show park map (spec 0011). One round grassy island with a sandy rim:
// a pier where you start, a striped pet show tent with a stage, a prize stall, two animal pens, a
// little hill with the big story tree (spiders in it, a table under it), a frog and duck pond, a small
// school with a desk outside, a jungle corner for the camouflage animals, and a crocodile on the
// north beach. A path loops round the island and crosses it over the hill, past every puzzle spot.
// North is -z, east is +x. Feet heights: wet sand 7, beach 8, grass 9, hill top 12.
// The island checker (tools/check-quests.mjs) walks this map to prove every anchor can be reached.
import { createMap, land, hill, path, pier, house, tree, tent, pen, table, log, cart, rockPool } from "../js/mapkit.js";

const SEA = 6;
const BEACH = 7; // the top block of the sandy beach (feet at 8)
const GRASS = 8; // the top block of the grass (feet at 9)
const HILL = 11; // the top block of the hill top (feet at 12)

// Which way a puzzle object faces (the yaw a pupil would have looking the same way).
const NORTH = 0;
const WEST = Math.PI / 2;
const SOUTH = Math.PI;
const EAST = -Math.PI / 2;

// The path loop, as corners: up from the pier, east past the prize stall and the tent, up the east
// side past the pens, through the jungle corner, along the north beach, down past the pond, the
// school and the desk, and back to the pier. A second path crosses the island over the hill top.
const LOOP = [
  [32, 56], [32, 47], [44, 47], [49, 41], [50, 30], [48, 22], [41, 17], [34, 13], [26, 13], [20, 17],
  [19, 24], [19, 30], [18, 36], [22, 44], [27, 47], [32, 47]
];
const CROSS = [[19, 30], [50, 30]];

// Where each puzzle (quest/islands/u3.js spots) sits: the empty block its object will fill, facing the path.
const ANCHORS = [
  { name: "pier-end", at: { x: 32, y: 8, z: 59 }, face: NORTH },
  { name: "prize-stall", at: { x: 34, y: 9, z: 45 }, face: SOUTH },
  { name: "pet-show", at: { x: 40, y: 9, z: 45 }, face: SOUTH },
  { name: "cat-pen", at: { x: 45, y: 9, z: 29 }, face: SOUTH },
  { name: "dog-pen", at: { x: 45, y: 9, z: 31 }, face: NORTH },
  { name: "tall-grass", at: { x: 46, y: 9, z: 24 }, face: EAST },
  { name: "log", at: { x: 40, y: 9, z: 19 }, face: NORTH },
  { name: "crocodile", at: { x: 30, y: 8, z: 11 }, face: SOUTH },
  { name: "pond", at: { x: 22, y: 9, z: 22 }, face: WEST },
  { name: "school", at: { x: 18, y: 9, z: 28 }, face: EAST },
  { name: "desk", at: { x: 20, y: 9, z: 34 }, face: WEST },
  { name: "big-tree", at: { x: 31, y: 12, z: 28 }, face: SOUTH }
];

// Puts a plant on every grass block in a box that has open air above it, except next to a puzzle
// spot, so plants never hide a chest. Path blocks are not grass, so the path stays clear.
function plants(m, { x0, x1, z0, z1, kind, every = 1 }) {
  for (let x = x0; x <= x1; x += 1) {
    for (let z = z0; z <= z1; z += 1) {
      if ((x * 7 + z * 3) % every !== 0) continue;
      const g = m.ground(x, z);
      if (m.get(x, g, z) !== "grass_block" || m.get(x, g + 1, z) !== "air") continue;
      if (ANCHORS.some(({ at }) => Math.abs(at.x - x) <= 1 && Math.abs(at.z - z) <= 1)) continue;
      m.set(x, g + 1, z, kind);
    }
  }
}

function blocks() {
  const m = createMap({ seaLevel: SEA });
  land(m, { cx: 32, cz: 32, radius: 25 });
  hill(m, { x: 32, z: 30, radius: 8, height: 3, topRadius: 3.5 });

  // The pier in the south, where you start.
  pier(m, { x: 32, z0: 56, z1: 60, deckY: BEACH });

  // The path goes down before the trees and things, so it follows the ground, not the leaves.
  path(m, LOOP);
  path(m, CROSS);

  // The pet show in the south east: a striped tent with a stage of pets, and the prize stall.
  tent(m, { x0: 37, z0: 37, groundY: GRASS });
  m.fill(39, 41, GRASS + 1, GRASS + 1, 39, 40, "oak_planks"); // the stage
  m.set(40, GRASS + 2, 39, "lizard");
  m.set(39, GRASS + 2, 40, "frog");
  m.set(41, GRASS + 2, 40, "spider");
  cart(m, { x: 33, z: 44, groundY: GRASS });
  m.set(33, GRASS + 2, 44, "dandelion");

  // The cat pen and the dog pen on either side of the cross path, gates facing it.
  pen(m, { x0: 42, z0: 25, groundY: GRASS, gate: "s" });
  m.set(43, GRASS + 1, 26, "cat");
  pen(m, { x0: 42, z0: 32, groundY: GRASS, gate: "n" });
  m.set(43, GRASS + 1, 34, "dog");

  // The hill top: the big story tree with spiders and a web, and the table with a spider under it.
  tree(m, { x: 33, z: 28, height: 6, radius: 3 });
  m.set(34, HILL + 1, 27, "spider");
  m.set(33, HILL + 2, 27, "spider_web");
  m.set(35, HILL + 3, 29, "spider");
  m.set(34, HILL + 4, 26, "spider");
  table(m, { x: 30, z: 32, groundY: HILL });
  m.set(31, HILL + 1, 32, "spider");

  // The jungle corner in the north east: trees, tall grass, a fallen log, leafy bushes and the
  // camouflage animals hiding in them.
  tree(m, { x: 35, z: 20, height: 5 });
  tree(m, { x: 42, z: 22, height: 5 });
  plants(m, { x0: 43, x1: 47, z0: 19, z1: 23, kind: "tall_grass" });
  plants(m, { x0: 36, x1: 41, z0: 21, z1: 25, kind: "tall_grass", every: 2 });
  log(m, { x: 36, z: 20, groundY: GRASS });
  m.set(37, GRASS + 2, 20, "snake");
  m.set(39, GRASS + 1, 23, "oak_leaves"); // a bush with a butterfly on it
  m.set(39, GRASS + 2, 23, "butterfly");
  m.set(38, GRASS + 1, 24, "oak_leaves");
  m.set(44, GRASS + 1, 21, "tiger");
  m.set(36, GRASS + 1, 18, "giraffe");
  m.set(36, GRASS + 2, 18, "giraffe_neck");

  // The crocodile on the north beach, at the water's edge.
  m.set(34, BEACH + 1, 9, "crocodile");

  // The pond in the north west, with frogs and ducks round it.
  rockPool(m, { x0: 21, z0: 19, w: 4, d: 3, waterY: GRASS, rocks: [[25, 19], [21, 18]] });
  m.set(23, GRASS + 1, 18, "frog");
  m.set(25, GRASS + 1, 20, "duck");
  m.set(24, GRASS + 1, 18, "duck");
  tree(m, { x: 26, z: 23, height: 5 });

  // The village in the west: the school and two houses, doors facing the path, and the desk outside
  // the school with a school bag on it and a rat under it.
  house(m, { x0: 12, z0: 27, floorY: GRASS, door: "e" });
  house(m, { x0: 12, z0: 34, floorY: GRASS, door: "e" });
  house(m, { x0: 13, z0: 20, floorY: GRASS, door: "e" });
  table(m, { x: 22, z: 34, groundY: GRASS });
  m.set(23, GRASS + 3, 34, "school_bag");
  m.set(22, GRASS + 3, 34, "pencil_case");
  m.set(23, GRASS + 1, 34, "rat");

  // Flowers round the park.
  [[28, 42], [29, 40], [36, 35], [24, 38], [26, 27], [38, 27], [47, 37], [21, 40], [30, 20], [25, 31]].forEach(([x, z], i) => {
    const g = m.ground(x, z);
    if (m.get(x, g, z) === "grass_block" && m.get(x, g + 1, z) === "air") m.set(x, g + 1, z, i % 2 ? "rose" : "dandelion");
  });
  return m.blocks();
}

export default {
  unit: "u3",
  seaLevel: SEA,
  // On the path at the water's edge by the pier, facing north up the path to the park.
  start: { x: 32.5, y: 7, z: 55.5, yaw: 0 },
  blocks,
  anchors: ANCHORS,
  // Animals and things that say their word when you use them (each word is in the Unit 3 questions).
  things: [
    { at: { x: 40, y: 10, z: 39 }, word: "lizard", say: "a lizard" },
    { at: { x: 43, y: 9, z: 26 }, word: "cat", say: "a cat" },
    { at: { x: 43, y: 9, z: 34 }, word: "dog", say: "a dog" },
    { at: { x: 34, y: 12, z: 27 }, word: "spider", say: "a spider" },
    { at: { x: 37, y: 10, z: 20 }, word: "snake", say: "a snake" },
    { at: { x: 39, y: 10, z: 23 }, word: "butterfly", say: "a butterfly" },
    { at: { x: 44, y: 9, z: 21 }, word: "tiger", say: "a tiger" },
    { at: { x: 36, y: 9, z: 18 }, word: "giraffe", say: "a giraffe" },
    { at: { x: 34, y: 8, z: 9 }, word: "crocodile", say: "a crocodile" },
    { at: { x: 23, y: 9, z: 18 }, word: "frog", say: "a frog" },
    { at: { x: 25, y: 9, z: 20 }, word: "duck", say: "a duck" },
    { at: { x: 23, y: 9, z: 34 }, word: "rat", say: "a rat" },
    { at: { x: 23, y: 11, z: 34 }, word: "bag", say: "a bag" }
  ],
  // Three villagers: two in the village and one visiting the pet show, off the path and clear of the puzzles.
  villagers: [
    { at: { x: 15.5, y: 9, z: 32.5 }, yaw: EAST },
    { at: { x: 22.5, y: 9, z: 26.5 }, yaw: WEST },
    { at: { x: 35.5, y: 9, z: 41.5 }, yaw: EAST }
  ],
  // Only on the &kit page: a sample chest and villager on the grass just west of the prize stall.
  kit: { chest: { x: 29, y: 9, z: 44 }, villager: { x: 27.5, y: 9, z: 44.5 } }
};
