// Treasure Quest · the Unit 8 robot town map (spec 0014). One round grassy island with a sandy rim:
// a pier where you start, a battery stall, the robot workshop with the robot from the story, a horse
// field and a tennis court ("Can you …?"), an animal park with Charlie Cheetah and Kate Kangaroo, a
// bike, the big tree with a monkey on the hill, a music stage with a piano and a guitar, Dan Dolphin's
// pool, a museum with a skeleton, Greg's go-kart and big bag, and a crocodile on the north beach.
// The layout follows the Unit 3, 4 and 7 islands (specs 0011 to 0013), so the same path and puzzle
// places are proven walkable. North is -z, east is +x. Feet heights: wet sand 7, beach 8, grass 9, hill top 12.
// The island checker (tools/check-quests.mjs) walks this map to prove every anchor can be reached.
import { createMap, land, hill, path, pier, house, tree, tent, pen, cart, rockPool } from "../js/mapkit.js";

const SEA = 6;
const BEACH = 7; // the top block of the sandy beach (feet at 8)
const GRASS = 8; // the top block of the grass (feet at 9)
const HILL = 11; // the top block of the hill top (feet at 12)

// Which way a puzzle object faces (the yaw a pupil would have looking the same way).
const NORTH = 0;
const WEST = Math.PI / 2;
const SOUTH = Math.PI;
const EAST = -Math.PI / 2;

// The path loop, as corners: up from the pier, east past the battery stall and the workshop, up the
// east side past the horse field and the tennis court, past the animal park and the bike, along the
// north past the music stage, down past the pool, the museum and the go-kart, and back to the pier.
// A second path crosses the island over the hill.
const LOOP = [
  [32, 56], [32, 47], [44, 47], [49, 41], [50, 30], [48, 22], [41, 17], [34, 13], [26, 13], [20, 17],
  [19, 24], [19, 30], [18, 36], [22, 44], [27, 47], [32, 47]
];
const CROSS = [[19, 30], [50, 30]];

// Where each puzzle (quest/islands/u8.js spots) sits: the empty block its object will fill, facing the path.
const ANCHORS = [
  { name: "pier-end", at: { x: 32, y: 8, z: 59 }, face: NORTH },
  { name: "battery-stall", at: { x: 34, y: 9, z: 45 }, face: SOUTH },
  { name: "workshop", at: { x: 40, y: 9, z: 45 }, face: SOUTH },
  { name: "horse", at: { x: 45, y: 9, z: 29 }, face: SOUTH },
  { name: "tennis", at: { x: 45, y: 9, z: 31 }, face: NORTH },
  { name: "animal-park", at: { x: 46, y: 9, z: 24 }, face: EAST },
  { name: "bike", at: { x: 40, y: 9, z: 19 }, face: NORTH },
  { name: "music-stage", at: { x: 30, y: 9, z: 15 }, face: SOUTH },
  { name: "pool", at: { x: 22, y: 9, z: 22 }, face: WEST },
  { name: "museum", at: { x: 18, y: 9, z: 28 }, face: EAST },
  { name: "go-kart", at: { x: 20, y: 9, z: 34 }, face: WEST },
  { name: "monkey-tree", at: { x: 31, y: 12, z: 28 }, face: SOUTH }
];

function blocks() {
  const m = createMap({ seaLevel: SEA });
  land(m, { cx: 32, cz: 32, radius: 25 });
  hill(m, { x: 32, z: 30, radius: 8, height: 3, topRadius: 3.5 });

  // The pier in the south, where you start.
  pier(m, { x: 32, z0: 56, z1: 60, deckY: BEACH });

  // The path goes down before the trees and things, so it follows the ground, not the leaves.
  path(m, LOOP);
  path(m, CROSS);

  // The battery stall and the robot workshop in the south east. The robot stands on the workbench,
  // with nothing in front of it on the side you walk up from.
  cart(m, { x: 33, z: 44, groundY: GRASS });
  m.set(33, GRASS + 2, 44, "battery");
  m.set(34, GRASS + 2, 44, "battery");
  tent(m, { x0: 37, z0: 37, groundY: GRASS, colours: ["purple_wool", "white_wool"] });
  m.fill(39, 41, GRASS + 1, GRASS + 1, 39, 40, "oak_planks"); // the workbench
  m.set(40, GRASS + 2, 39, "robot");
  m.set(40, GRASS + 3, 39, "robot_head");
  m.set(39, GRASS + 2, 40, "battery");
  m.set(41, GRASS + 2, 40, "battery");

  // A horse field and a tennis court on either side of the cross path, gates facing it.
  pen(m, { x0: 42, z0: 25, groundY: GRASS, gate: "s" });
  m.set(43, GRASS + 1, 26, "horse");
  pen(m, { x0: 42, z0: 32, groundY: GRASS, gate: "n" });
  m.set(43, GRASS + 1, 34, "tennis");

  // The animal park from the song: Charlie Cheetah on the west edge, Kate Kangaroo on the east edge
  // and Lucy Ladybird between them.
  m.set(42, GRASS + 1, 22, "cheetah");
  m.set(44, GRASS + 1, 21, "kangaroo");
  m.set(43, GRASS + 1, 20, "ladybird");

  // A bike by the path, and a tree.
  m.set(37, GRASS + 1, 20, "bike");
  tree(m, { x: 38, z: 23, height: 5 });

  // The hill top: the big tree with a monkey on its trunk and Bella Bird under the leaves.
  tree(m, { x: 33, z: 28, height: 6, radius: 3 });
  m.set(34, HILL + 2, 27, "monkey");
  m.set(35, HILL + 4, 29, "bird");

  // The music stage in the north: a low stage with a piano and a guitar under a striped roof.
  m.fill(26, 26, GRASS + 1, GRASS + 3, 18, 18, "oak_log");
  m.fill(32, 32, GRASS + 1, GRASS + 3, 18, 18, "oak_log");
  m.fill(27, 31, GRASS + 1, GRASS + 1, 18, 18, "oak_planks");
  for (let x = 26; x <= 32; x += 1) m.fill(x, x, GRASS + 4, GRASS + 4, 17, 19, x % 2 ? "purple_wool" : "white_wool");
  m.set(28, GRASS + 2, 18, "piano");
  m.set(30, GRASS + 2, 18, "guitar");

  // Dan Dolphin's pool in the north west, shallow enough to paddle in, with the dolphin jumping.
  rockPool(m, { x0: 24, z0: 19, w: 3, d: 3, waterY: GRASS, rocks: [[27, 20], [25, 18]] });
  m.set(25, GRASS + 1, 20, "dolphin");

  // The crocodile on the north beach, at the water's edge.
  m.set(34, BEACH + 1, 9, "crocodile");

  // The town in the west: the museum (stone walls, skeletons along the back wall), two houses, and
  // Greg's green go-kart with his big bag.
  house(m, { x0: 12, z0: 27, floorY: GRASS, door: "e", walls: "stone" });
  m.set(13, GRASS + 1, 28, "skeleton");
  m.set(13, GRASS + 1, 30, "skeleton");
  house(m, { x0: 12, z0: 34, floorY: GRASS, door: "e" });
  house(m, { x0: 13, z0: 20, floorY: GRASS, door: "e" });
  m.set(23, GRASS + 1, 34, "go_kart");
  m.set(24, GRASS + 1, 35, "school_bag");

  // Flowers round the town.
  [[28, 42], [29, 40], [36, 35], [24, 38], [26, 27], [38, 27], [47, 37], [21, 40], [30, 21], [25, 31]].forEach(([x, z], i) => {
    const g = m.ground(x, z);
    if (m.get(x, g, z) === "grass_block" && m.get(x, g + 1, z) === "air") m.set(x, g + 1, z, i % 2 ? "rose" : "dandelion");
  });
  return m.blocks();
}

export default {
  unit: "u8",
  seaLevel: SEA,
  // On the path at the water's edge by the pier, facing north up the path to the town.
  start: { x: 32.5, y: 7, z: 55.5, yaw: 0 },
  blocks,
  anchors: ANCHORS,
  // Things that say their word when you use them (each word is in the Unit 8 questions).
  things: [
    { at: { x: 40, y: 10, z: 39 }, word: "robot", say: "a robot" },
    { at: { x: 43, y: 9, z: 26 }, word: "horse", say: "a horse" },
    { at: { x: 43, y: 9, z: 34 }, word: "tennis" },
    { at: { x: 42, y: 9, z: 22 }, word: "cheetah", say: "Charlie Cheetah" },
    { at: { x: 44, y: 9, z: 21 }, word: "kangaroo", say: "Kate Kangaroo" },
    { at: { x: 37, y: 9, z: 20 }, word: "bike", say: "a bike" },
    { at: { x: 34, y: 13, z: 27 }, word: "monkey", say: "a monkey" },
    { at: { x: 28, y: 10, z: 18 }, word: "piano", say: "a piano" },
    { at: { x: 30, y: 10, z: 18 }, word: "guitar", say: "a guitar" },
    { at: { x: 25, y: 9, z: 20 }, word: "dolphin", say: "Dan Dolphin" },
    { at: { x: 34, y: 8, z: 9 }, word: "crocodile", say: "a crocodile" },
    { at: { x: 13, y: 9, z: 28 }, word: "skeleton", say: "a skeleton" },
    { at: { x: 23, y: 9, z: 34 }, word: "go-kart", say: "a green go-kart" },
    { at: { x: 24, y: 9, z: 35 }, word: "bag", say: "a big bag" }
  ],
  // Three villagers: two in the town and one by the workshop, off the path and clear of the puzzles.
  villagers: [
    { at: { x: 15.5, y: 9, z: 32.5 }, yaw: EAST },
    { at: { x: 22.5, y: 9, z: 26.5 }, yaw: WEST },
    { at: { x: 35.5, y: 9, z: 41.5 }, yaw: EAST }
  ],
  // Only on the &kit page: a sample chest and villager on the grass just west of the battery stall.
  kit: { chest: { x: 29, y: 9, z: 44 }, villager: { x: 27.5, y: 9, z: 44.5 } }
};
