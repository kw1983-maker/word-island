// Treasure Quest · the Unit 9 beach island map (spec 0006). One round island: a sandy beach all
// round, a gentle grassy hill in the middle, and a path that loops past every puzzle spot.
// North is -z, east is +x. Feet heights: wet sand 7, beach 8, grass 9, hill top 15.
// The island checker (tools/check-quests.mjs) walks this map to prove every anchor can be reached.
import { createMap, land, hill, path } from "../js/mapkit.js";

const SEA = 6;

// The path loop, as corners: from the pier root along the shore to the west, north through the
// village, over the hill top, out to the lighthouse, down the east beach and back to the pier.
const PATH = [
  [32, 56], [32, 55], [29, 55], [28, 53], [21, 47], [19, 44], [15, 40], [20, 38], [21, 34], [21, 20],
  [22, 16], [27, 21], [31, 28], [33, 27], [40, 20], [45, 13], [48, 18], [49, 30], [49, 36], [45, 44],
  [42, 48], [38, 52], [34, 55], [32, 55]
];

function blocks() {
  const m = createMap({ seaLevel: SEA });
  land(m, { cx: 32, cz: 32, radius: 25 });
  hill(m, { x: 31, z: 30, radius: 10, height: 6 });
  path(m, PATH);
  return m.blocks();
}

export default {
  unit: "u9",
  seaLevel: SEA,
  // On the path at the water's edge by the pier, facing north up the path to the hill.
  start: { x: 32.5, y: 7, z: 55.5, yaw: 0 },
  blocks,
  anchors: [],
  things: [],
  villagers: [],
  // Only on the &kit page: a sample chest and villager on the beach just west of the start.
  kit: { chest: { x: 30, y: 8, z: 51 }, villager: { x: 28.5, y: 8, z: 50.5 } }
};
