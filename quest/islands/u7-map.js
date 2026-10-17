// Treasure Quest · the Unit 7 clothes town map (spec 0012). One round grassy island with a sandy rim:
// a pier where you start, a hat stall, a striped stage for the cool cat song, a sheep pen and a cow pen
// near a cotton field (the materials lesson), the park bench with Gary's cap, the big tree on the hill
// with the bird from the story, a washing line of clothes, stairs with six spiders, a clothes shop and
// a clothes rail by the houses. A path loops round the island and crosses it over the hill.
// The layout follows the Unit 3 park (spec 0011), so the same path and puzzle places are proven walkable.
// North is -z, east is +x. Feet heights: wet sand 7, beach 8, grass 9, hill top 12.
// The island checker (tools/check-quests.mjs) walks this map to prove every anchor can be reached.
import { createMap, land, hill, path, pier, house, tree, tent, pen, bench, cart } from "../js/mapkit.js";

const SEA = 6;
const BEACH = 7; // the top block of the sandy beach (feet at 8)
const GRASS = 8; // the top block of the grass (feet at 9)
const HILL = 11; // the top block of the hill top (feet at 12)

// Which way a puzzle object faces (the yaw a pupil would have looking the same way).
const NORTH = 0;
const WEST = Math.PI / 2;
const SOUTH = Math.PI;
const EAST = -Math.PI / 2;

// The path loop, as corners: up from the pier, east past the hat stall and the stage, up the east
// side past the farm, through the park, along the north past the washing line, down past the stairs,
// the shop and the clothes rail, and back to the pier. A second path crosses the island over the hill.
const LOOP = [
  [32, 56], [32, 47], [44, 47], [49, 41], [50, 30], [48, 22], [41, 17], [34, 13], [26, 13], [20, 17],
  [19, 24], [19, 30], [18, 36], [22, 44], [27, 47], [32, 47]
];
const CROSS = [[19, 30], [50, 30]];

// Where each puzzle (quest/islands/u7.js spots) sits: the empty block its object will fill, facing the path.
const ANCHORS = [
  { name: "pier-end", at: { x: 32, y: 8, z: 59 }, face: NORTH },
  { name: "hat-stall", at: { x: 34, y: 9, z: 45 }, face: SOUTH },
  { name: "cat-stage", at: { x: 40, y: 9, z: 45 }, face: SOUTH },
  { name: "sheep", at: { x: 45, y: 9, z: 29 }, face: SOUTH },
  { name: "cow", at: { x: 45, y: 9, z: 31 }, face: NORTH },
  { name: "cotton-field", at: { x: 46, y: 9, z: 24 }, face: EAST },
  { name: "park-bench", at: { x: 40, y: 9, z: 19 }, face: NORTH },
  { name: "washing-line", at: { x: 30, y: 9, z: 15 }, face: SOUTH },
  { name: "stairs", at: { x: 22, y: 9, z: 22 }, face: WEST },
  { name: "clothes-shop", at: { x: 18, y: 9, z: 28 }, face: EAST },
  { name: "wardrobe", at: { x: 20, y: 9, z: 34 }, face: WEST },
  { name: "bird-tree", at: { x: 31, y: 12, z: 28 }, face: SOUTH }
];

// Puts a plant on every grass block in a box that has open air above it, except next to a puzzle
// spot, so plants never hide a chest. Path blocks are not grass, so the path stays clear.
function plants(m, { x0, x1, z0, z1, kind }) {
  for (let x = x0; x <= x1; x += 1) {
    for (let z = z0; z <= z1; z += 1) {
      const g = m.ground(x, z);
      if (m.get(x, g, z) !== "grass_block" || m.get(x, g + 1, z) !== "air") continue;
      if (ANCHORS.some(({ at }) => Math.abs(at.x - x) <= 1 && Math.abs(at.z - z) <= 1)) continue;
      m.set(x, g + 1, z, kind);
    }
  }
}

// A wooden frame (two log posts and a log bar on top, along x) with things hanging under the bar:
// the washing line and the clothes rail. hang lists what hangs, one per block between the posts.
function rail(m, { x, z, groundY, height = 3, hang = [], under = [] }) {
  const x1 = x + hang.length + 1;
  const top = groundY + height;
  m.fill(x, x, groundY + 1, top, z, z, "oak_log");
  m.fill(x1, x1, groundY + 1, top, z, z, "oak_log");
  m.fill(x + 1, x1 - 1, top, top, z, z, "oak_log");
  hang.forEach((kind, i) => m.set(x + 1 + i, top - 1, z, kind));
  under.forEach((kind, i) => { if (kind) m.set(x + 1 + i, groundY + 1, z, kind); });
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

  // The hat stall and the cool cat's stage in the south east.
  cart(m, { x: 33, z: 44, groundY: GRASS });
  m.set(33, GRASS + 2, 44, "hat");
  m.set(34, GRASS + 2, 44, "cap");
  tent(m, { x0: 37, z0: 37, groundY: GRASS, colours: ["blue_wool", "yellow_wool"] });
  m.fill(39, 41, GRASS + 1, GRASS + 1, 39, 40, "oak_planks"); // the stage
  m.set(40, GRASS + 2, 39, "cool_cat");

  // The farm in the east: a sheep pen and a cow pen on either side of the cross path, and a cotton
  // field: wool, leather and cotton.
  pen(m, { x0: 42, z0: 25, groundY: GRASS, gate: "s" });
  m.set(43, GRASS + 1, 26, "sheep");
  m.set(44, GRASS + 1, 27, "sheep");
  pen(m, { x0: 42, z0: 32, groundY: GRASS, gate: "n" });
  m.set(43, GRASS + 1, 34, "cow");
  // The cotton field is three plants wide, so a plant that says its word stands on each edge: one seen
  // from the path to the east, one seen from the park to the west.
  plants(m, { x0: 42, x1: 44, z0: 19, z1: 23, kind: "cotton_plant" });

  // The park in the north east: Gary's cap on the bench, and a tree.
  bench(m, { x: 36, z: 20, groundY: GRASS });
  m.set(37, GRASS + 2, 20, "cap");
  tree(m, { x: 38, z: 23, height: 5 });

  // The hill top: the big tree with the bird that takes Gary's cap.
  tree(m, { x: 33, z: 28, height: 6, radius: 3 });
  m.set(34, HILL + 2, 27, "bird");
  m.set(35, HILL + 4, 29, "cap");

  // The washing line in the north, with clothes hanging out to dry.
  rail(m, { x: 26, z: 18, groundY: GRASS, height: 4, hang: ["tshirt", "socks", "jeans", "sweater", "skirt"] });

  // Six spiders on the stairs in the north west (the sp and st sounds), up to a little platform.
  for (let k = 1; k <= 4; k += 1) m.fill(20 + k, 20 + k, GRASS + 1, GRASS + k, 20, 20, "oak_planks");
  m.fill(25, 26, GRASS + 1, GRASS + 4, 19, 21, "oak_planks");
  [[21, 10, 20], [22, 11, 20], [23, 12, 20], [24, 13, 20], [25, 13, 19], [26, 13, 21]].forEach(([x, y, z]) => m.set(x, y, z, "spider"));

  // The town in the west: the clothes shop (white walls, clothes inside), two houses, and a clothes
  // rail outside with jackets and sweaters above and shoes and boots below.
  house(m, { x0: 12, z0: 27, floorY: GRASS, door: "e", walls: "white_wool" });
  m.set(13, GRASS + 1, 28, "shoes");
  m.set(13, GRASS + 1, 30, "hat");
  m.set(13, GRASS + 1, 29, "jeans"); // all along the back wall, so nothing hides the ones that speak
  house(m, { x0: 12, z0: 34, floorY: GRASS, door: "e" });
  house(m, { x0: 13, z0: 20, floorY: GRASS, door: "e" });
  rail(m, { x: 21, z: 35, groundY: GRASS, hang: ["gloves", "sweater", "jacket"], under: ["shoes", "boots", "socks"] });

  // Flowers round the town.
  [[28, 42], [29, 40], [36, 35], [24, 38], [26, 27], [38, 27], [47, 37], [21, 40], [30, 21], [25, 31]].forEach(([x, z], i) => {
    const g = m.ground(x, z);
    if (m.get(x, g, z) === "grass_block" && m.get(x, g + 1, z) === "air") m.set(x, g + 1, z, i % 2 ? "rose" : "dandelion");
  });
  return m.blocks();
}

export default {
  unit: "u7",
  seaLevel: SEA,
  // On the path at the water's edge by the pier, facing north up the path to the town.
  start: { x: 32.5, y: 7, z: 55.5, yaw: 0 },
  blocks,
  anchors: ANCHORS,
  // Clothes, animals and things that say their word when you use them (each word is in the Unit 7 questions).
  things: [
    { at: { x: 40, y: 10, z: 39 }, word: "cat", say: "the cool cat" },
    { at: { x: 43, y: 9, z: 26 }, word: "sheep", say: "a sheep" },
    { at: { x: 43, y: 9, z: 34 }, word: "cow", say: "a cow" },
    { at: { x: 44, y: 9, z: 21 }, word: "cotton", say: "a cotton plant" },
    { at: { x: 42, y: 9, z: 22 }, word: "cotton", say: "a cotton plant" },
    { at: { x: 37, y: 10, z: 20 }, word: "cap", say: "a cap" },
    { at: { x: 34, y: 13, z: 27 }, word: "bird", say: "a bird" },
    { at: { x: 27, y: 11, z: 18 }, word: "T-shirt", say: "a T-shirt" },
    { at: { x: 28, y: 11, z: 18 }, word: "socks" },
    { at: { x: 29, y: 11, z: 18 }, word: "jeans" },
    { at: { x: 30, y: 11, z: 18 }, word: "sweater", say: "a sweater" },
    { at: { x: 31, y: 11, z: 18 }, word: "skirt", say: "a skirt" },
    { at: { x: 26, y: 13, z: 21 }, word: "spiders", say: "six spiders" },
    { at: { x: 13, y: 9, z: 28 }, word: "shoes" },
    { at: { x: 13, y: 9, z: 30 }, word: "hat", say: "a hat" },
    { at: { x: 24, y: 10, z: 35 }, word: "jacket", say: "a jacket" },
    { at: { x: 23, y: 9, z: 35 }, word: "boots" }
  ],
  // Three villagers: two in the town and one watching the stage, off the path and clear of the puzzles.
  villagers: [
    { at: { x: 15.5, y: 9, z: 32.5 }, yaw: EAST },
    { at: { x: 22.5, y: 9, z: 26.5 }, yaw: WEST },
    { at: { x: 35.5, y: 9, z: 41.5 }, yaw: EAST }
  ],
  // Only on the &kit page: a sample chest and villager on the grass just west of the hat stall.
  kit: { chest: { x: 29, y: 9, z: 44 }, villager: { x: 27.5, y: 9, z: 44.5 } }
};
