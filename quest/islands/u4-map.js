// Treasure Quest · the Unit 4 lunchtime town map (spec 0013). One round grassy island with a sandy rim:
// a pier where you start, a juice stall, the school canteen with the pizza from the story, Tommy's
// kitchen with the fridge, a picnic table, a vegetable garden (corn, beans, onions), a coconut palm,
// the apple tree on the hill, a fruit stall, a pizza oven, Polly's shop with hot dogs and a lunch table
// with lunchboxes. A path loops round the island and crosses it over the hill.
// The layout follows the Unit 3 and Unit 7 islands (specs 0011, 0012), so the same path and puzzle
// places are proven walkable. North is -z, east is +x. Feet heights: wet sand 7, beach 8, grass 9, hill top 12.
// The island checker (tools/check-quests.mjs) walks this map to prove every anchor can be reached.
import { createMap, land, hill, path, pier, house, tree, tent, pen, table, palm, cart } from "../js/mapkit.js";

const SEA = 6;
const BEACH = 7; // the top block of the sandy beach (feet at 8)
const GRASS = 8; // the top block of the grass (feet at 9)
const HILL = 11; // the top block of the hill top (feet at 12)

// Which way a puzzle object faces (the yaw a pupil would have looking the same way).
const NORTH = 0;
const WEST = Math.PI / 2;
const SOUTH = Math.PI;
const EAST = -Math.PI / 2;

// The path loop, as corners: up from the pier, east past the juice stall and the canteen, up the east
// side past the kitchen and the picnic table, past the garden and the coconut palm, along the north
// past the fruit stall, down past the pizza oven, the shop and the lunch table, and back to the pier.
// A second path crosses the island over the hill.
const LOOP = [
  [32, 56], [32, 47], [44, 47], [49, 41], [50, 30], [48, 22], [41, 17], [34, 13], [26, 13], [20, 17],
  [19, 24], [19, 30], [18, 36], [22, 44], [27, 47], [32, 47]
];
const CROSS = [[19, 30], [50, 30]];

// Where each puzzle (quest/islands/u4.js spots) sits: the empty block its object will fill, facing the path.
const ANCHORS = [
  { name: "pier-end", at: { x: 32, y: 8, z: 59 }, face: NORTH },
  { name: "juice-stall", at: { x: 34, y: 9, z: 45 }, face: SOUTH },
  { name: "canteen", at: { x: 40, y: 9, z: 45 }, face: SOUTH },
  { name: "kitchen", at: { x: 45, y: 9, z: 29 }, face: SOUTH },
  { name: "picnic", at: { x: 45, y: 9, z: 31 }, face: NORTH },
  { name: "garden", at: { x: 46, y: 9, z: 24 }, face: EAST },
  { name: "coconut-palm", at: { x: 40, y: 9, z: 19 }, face: NORTH },
  { name: "fruit-stall", at: { x: 30, y: 9, z: 15 }, face: SOUTH },
  { name: "pizza-oven", at: { x: 22, y: 9, z: 22 }, face: WEST },
  { name: "shop", at: { x: 18, y: 9, z: 28 }, face: EAST },
  { name: "lunch-table", at: { x: 20, y: 9, z: 34 }, face: WEST },
  { name: "apple-tree", at: { x: 31, y: 12, z: 28 }, face: SOUTH }
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

function blocks() {
  const m = createMap({ seaLevel: SEA });
  land(m, { cx: 32, cz: 32, radius: 25 });
  hill(m, { x: 32, z: 30, radius: 8, height: 3, topRadius: 3.5 });

  // The pier in the south, where you start.
  pier(m, { x: 32, z0: 56, z1: 60, deckY: BEACH });

  // The path goes down before the trees and things, so it follows the ground, not the leaves.
  path(m, LOOP);
  path(m, CROSS);

  // The juice stall and the school canteen in the south east. The canteen counter has the hot pizza
  // in the middle, with nothing in front of it on the side you walk up from.
  cart(m, { x: 33, z: 44, groundY: GRASS });
  m.set(33, GRASS + 2, 44, "juice");
  m.set(34, GRASS + 2, 44, "milk");
  tent(m, { x0: 37, z0: 37, groundY: GRASS, colours: ["orange_wool", "white_wool"] });
  m.fill(39, 41, GRASS + 1, GRASS + 1, 39, 40, "oak_planks"); // the counter
  m.set(40, GRASS + 2, 39, "pizza");
  m.set(39, GRASS + 2, 40, "sausage");
  m.set(41, GRASS + 2, 40, "peas");
  m.set(41, GRASS + 2, 39, "chicken");

  // Tommy's kitchen: a low wall with a door facing the cross path, a fridge with a cake on top, and
  // the cheese. The cells between the door and the cheese stay empty, so it can be seen.
  pen(m, { x0: 42, z0: 25, groundY: GRASS, gate: "s" });
  m.fill(44, 44, GRASS + 1, GRASS + 2, 26, 26, "white_wool"); // the fridge
  m.set(44, GRASS + 3, 26, "cake");
  m.set(43, GRASS + 1, 26, "cheese");

  // The picnic table on the other side of the cross path.
  table(m, { x: 42, z: 34, groundY: GRASS });
  m.set(43, GRASS + 3, 34, "sandwich");
  m.set(44, GRASS + 3, 34, "banana");

  // The vegetable garden: a row each of corn, beans and onions. The corn and the onions on its two
  // edges say their word.
  plants(m, { x0: 42, x1: 42, z0: 19, z1: 23, kind: "corn_plant" });
  plants(m, { x0: 43, x1: 43, z0: 19, z1: 23, kind: "bean_plant" });
  plants(m, { x0: 44, x1: 44, z0: 19, z1: 23, kind: "onion" });

  // The coconut palm, low enough to reach the coconuts.
  palm(m, { x: 37, z: 20, height: 4 });
  m.set(36, GRASS + 4, 20, "coconut");
  m.set(38, GRASS + 4, 20, "coconut");
  m.set(37, GRASS + 4, 21, "coconut");

  // The hill top: the big apple tree, with apples hanging under its leaves.
  tree(m, { x: 33, z: 28, height: 6, radius: 3 });
  m.set(35, HILL + 4, 29, "apple");
  m.set(31, HILL + 4, 27, "apple");
  m.set(34, HILL + 4, 30, "apple");

  // The fruit stall in the north: a counter of fruit under a striped roof.
  m.fill(26, 26, GRASS + 1, GRASS + 3, 18, 18, "oak_log");
  m.fill(32, 32, GRASS + 1, GRASS + 3, 18, 18, "oak_log");
  m.fill(27, 31, GRASS + 1, GRASS + 1, 18, 18, "oak_planks");
  for (let x = 26; x <= 32; x += 1) m.fill(x, x, GRASS + 4, GRASS + 4, 17, 19, x % 2 ? "yellow_wool" : "green_wool");
  ["banana", "orange", "apple", "coconut", "carrot"].forEach((kind, i) => m.set(27 + i, GRASS + 2, 18, kind));

  // The pizza oven in the north west, with a pizza waiting on the counter in front of it.
  m.fill(24, 26, GRASS + 1, GRASS + 3, 19, 21, "bricks");
  m.set(25, GRASS + 4, 20, "cobblestone"); // the chimney
  m.set(23, GRASS + 1, 20, "oak_planks");
  m.set(23, GRASS + 2, 20, "pizza");

  // The town in the west: Polly's shop (brick walls, hot dogs, cheese and juice along the back wall),
  // two houses, and the lunch table with a lunchbox and a sandwich.
  house(m, { x0: 12, z0: 27, floorY: GRASS, door: "e", walls: "bricks" });
  m.set(13, GRASS + 1, 28, "hot_dog");
  m.set(13, GRASS + 1, 29, "cheese");
  m.set(13, GRASS + 1, 30, "juice");
  house(m, { x0: 12, z0: 34, floorY: GRASS, door: "e" });
  house(m, { x0: 13, z0: 20, floorY: GRASS, door: "e" });
  table(m, { x: 22, z: 34, groundY: GRASS });
  m.set(23, GRASS + 3, 34, "lunchbox");
  m.set(24, GRASS + 3, 34, "sandwich");

  // Coconut palms on the beach.
  palm(m, { x: 52, z: 40 });
  m.set(51, m.ground(52, 40) + 6, 40, "coconut");
  palm(m, { x: 11, z: 42 });
  m.set(12, m.ground(11, 42) + 6, 42, "coconut");

  // Flowers round the town.
  [[28, 42], [29, 40], [36, 35], [24, 38], [26, 27], [38, 27], [47, 37], [21, 40], [30, 21], [25, 31]].forEach(([x, z], i) => {
    const g = m.ground(x, z);
    if (m.get(x, g, z) === "grass_block" && m.get(x, g + 1, z) === "air") m.set(x, g + 1, z, i % 2 ? "rose" : "dandelion");
  });
  return m.blocks();
}

export default {
  unit: "u4",
  seaLevel: SEA,
  // On the path at the water's edge by the pier, facing north up the path to the town.
  start: { x: 32.5, y: 7, z: 55.5, yaw: 0 },
  blocks,
  anchors: ANCHORS,
  // Food and plants that say their word when you use them (each word is in the Unit 4 questions).
  things: [
    { at: { x: 40, y: 10, z: 39 }, word: "pizza" },
    { at: { x: 43, y: 9, z: 26 }, word: "cheese" },
    { at: { x: 43, y: 11, z: 34 }, word: "sandwich", say: "a sandwich" },
    { at: { x: 44, y: 11, z: 34 }, word: "banana", say: "a banana" },
    { at: { x: 42, y: 9, z: 22 }, word: "corn" },
    { at: { x: 44, y: 9, z: 21 }, word: "onion", say: "an onion" },
    { at: { x: 36, y: 12, z: 20 }, word: "coconut", say: "a coconut" },
    { at: { x: 35, y: 15, z: 29 }, word: "apple", say: "an apple" },
    { at: { x: 27, y: 10, z: 18 }, word: "bananas" },
    { at: { x: 28, y: 10, z: 18 }, word: "orange", say: "an orange" },
    { at: { x: 29, y: 10, z: 18 }, word: "apple", say: "an apple" },
    { at: { x: 30, y: 10, z: 18 }, word: "coconut", say: "a coconut" },
    { at: { x: 31, y: 10, z: 18 }, word: "carrots" },
    { at: { x: 13, y: 9, z: 28 }, word: "hot dog", say: "a hot dog" },
    { at: { x: 13, y: 9, z: 30 }, word: "juice" },
    { at: { x: 23, y: 11, z: 34 }, word: "lunchbox", say: "a lunchbox" }
  ],
  // Three villagers: two in the town and one by the canteen, off the path and clear of the puzzles.
  villagers: [
    { at: { x: 15.5, y: 9, z: 32.5 }, yaw: EAST },
    { at: { x: 22.5, y: 9, z: 26.5 }, yaw: WEST },
    { at: { x: 35.5, y: 9, z: 41.5 }, yaw: EAST }
  ],
  // Only on the &kit page: a sample chest and villager on the grass just west of the juice stall.
  kit: { chest: { x: 29, y: 9, z: 44 }, villager: { x: 27.5, y: 9, z: 44.5 } }
};
