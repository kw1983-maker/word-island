// Treasure Quest · the Unit 9 beach island map (spec 0006). One round island: a sandy beach all
// round, a gentle grassy hill in the middle, a lighthouse on a rocky point, a pier, a small village,
// and a path that loops past every puzzle spot.
// North is -z, east is +x. Feet heights: wet sand 7, beach 8, grass 9, hill top 15.
// The island checker (tools/check-quests.mjs) walks this map to prove every anchor can be reached.
import { createMap, land, hill, path, palm, house, pier, rockShelf, lighthouse, boat, rock, rockPool, sandcastle, cart, bench } from "../js/mapkit.js";

const SEA = 6;
const BEACH = 7; // the top block of the sandy beach (feet at 8)
const GRASS = 8; // the top block of the grass (feet at 9)

// Which way a puzzle object faces (the yaw a pupil would have looking the same way).
const NORTH = 0;
const WEST = Math.PI / 2;
const SOUTH = Math.PI;
const EAST = -Math.PI / 2;

// The path loop, as corners: from the pier root along the shore to the west, north through the
// village, over the hill top, out to the lighthouse, down the east beach and back to the pier.
const PATH = [
  [32, 56], [32, 55], [25, 55], [25, 53], [21, 47], [19, 44], [15, 40], [20, 38], [21, 34], [21, 20],
  [22, 16], [27, 21], [31, 28], [33, 27], [40, 20], [45, 13], [48, 18], [49, 30], [49, 36], [45, 44],
  [42, 48], [38, 52], [34, 55], [32, 55]
];

// Where each puzzle (quest/islands/u9.js spots) sits: the empty block its object will fill, facing the path.
const ANCHORS = [
  { name: "pier-end", at: { x: 32, y: 8, z: 59 }, face: NORTH },
  { name: "palm-tree", at: { x: 17, y: 8, z: 44 }, face: EAST },
  { name: "boat", at: { x: 22, y: 7, z: 55 }, face: EAST },
  { name: "big-rock", at: { x: 51, y: 8, z: 33 }, face: WEST },
  { name: "hill-top", at: { x: 31, y: 15, z: 30 }, face: NORTH },
  { name: "lighthouse", at: { x: 46, y: 9, z: 11 }, face: WEST },
  { name: "hut", at: { x: 19, y: 9, z: 26 }, face: EAST },
  { name: "ice-cream-cart", at: { x: 13, y: 8, z: 38 }, face: EAST },
  { name: "rock-pool", at: { x: 42, y: 8, z: 50 }, face: WEST },
  { name: "beach-towel", at: { x: 45, y: 8, z: 46 }, face: WEST },
  { name: "bench", at: { x: 24, y: 9, z: 15 }, face: SOUTH },
  { name: "sandcastle", at: { x: 36, y: 8, z: 51 }, face: EAST }
];

function blocks() {
  const m = createMap({ seaLevel: SEA });
  land(m, { cx: 32, cz: 32, radius: 25 });
  hill(m, { x: 31, z: 30, radius: 10, height: 6 });

  // The rocky point in the north east, with the lighthouse; its door faces the path.
  rockShelf(m, { x: 48, z: 12, radius: 4.5, topY: GRASS });
  lighthouse(m, { x: 49, z: 11, baseY: GRASS + 1, height: 10, door: "w" });

  // The pier in the south, where you start, and a boat pulled up on the shore west of it.
  pier(m, { x: 32, z0: 56, z1: 60, deckY: BEACH });
  boat(m, { x0: 20, z: 55, floorY: SEA });

  // The path goes down before the trees and beach things, so it follows the ground, not the leaves.
  path(m, PATH);

  // The village in the west: the riddle hut and two beach houses, doors facing the path.
  house(m, { x0: 14, z0: 25, floorY: GRASS, door: "e" });
  house(m, { x0: 13, z0: 32, floorY: GRASS, door: "e" });
  house(m, { x0: 15, z0: 18, floorY: GRASS, door: "e" });

  // Landmarks round the beach.
  palm(m, { x: 15, z: 44, leaves: "oak_leaves" });
  cart(m, { x: 11, z: 38, groundY: BEACH });
  bench(m, { x: 23, z: 13, groundY: BEACH });
  rock(m, { x: 53, z: 32, groundY: BEACH });
  rockPool(m, { x0: 43, z0: 49, waterY: BEACH, rocks: [[46, 49], [46, 51], [44, 52], [43, 48]] });
  sandcastle(m, { x: 33, z: 49, groundY: BEACH });
  return m.blocks();
}

export default {
  unit: "u9",
  seaLevel: SEA,
  // On the path at the water's edge by the pier, facing north up the path to the hill.
  start: { x: 32.5, y: 7, z: 55.5, yaw: 0 },
  blocks,
  anchors: ANCHORS,
  things: [],
  villagers: [],
  // Only on the &kit page: a sample chest and villager on the beach just west of the start.
  kit: { chest: { x: 30, y: 8, z: 51 }, villager: { x: 28.5, y: 8, z: 50.5 } }
};
