// Treasure Quest · shape helpers for island maps (spec 0006). A map file calls these to lay out its
// land, hill, path and buildings, then hands the result to the island builder as placed blocks.
// Nothing here touches Three.js or the page, so tools/check-quests.mjs can run the same map in Node
// and walk it to prove every puzzle spot can be reached.
import { B, BLOCKS } from "./bw/blocks.js";
import { CHUNK_Y } from "./bw/worldgen.js";

export const MAP_SIZE = 64;      // an island is at most 4×4 chunks (spec 0004)
export const MAP_HEIGHT = CHUNK_Y;

const id = (kind) => {
  const n = B[String(kind).toUpperCase()];
  if (n === undefined) throw new Error(`mapkit: no block called "${kind}".`);
  return n;
};

// The island being built: one block id per cell, air to start with.
export function createMap({ seaLevel }) {
  const cells = new Uint8Array(MAP_SIZE * MAP_HEIGHT * MAP_SIZE);
  const at = (x, y, z) => (x * MAP_SIZE + z) * MAP_HEIGHT + y;
  const inside = (x, y, z) => x >= 0 && z >= 0 && y >= 0 && x < MAP_SIZE && z < MAP_SIZE && y < MAP_HEIGHT;
  const m = {
    seaLevel,
    inside,
    set(x, y, z, kind) {
      if (inside(x, y, z)) cells[at(x, y, z)] = id(kind);
    },
    get(x, y, z) {
      return inside(x, y, z) ? BLOCKS[cells[at(x, y, z)]].name : "air";
    },
    fill(x0, x1, y0, y1, z0, z1, kind) {
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x += 1) {
        for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y += 1) {
          for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z += 1) m.set(x, y, z, kind);
        }
      }
    },
    // The highest solid block in a column (the ground you stand on), or -1.
    ground(x, z) {
      for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
        if (inside(x, y, z) && BLOCKS[cells[at(x, y, z)]].solid) return y;
      }
      return -1;
    },
    // The placed block list for the island builder (spec 0004 form): one fill box per run of the
    // same block up a column, so a whole island is a few thousand entries.
    blocks() {
      const list = [];
      for (let x = 0; x < MAP_SIZE; x += 1) {
        for (let z = 0; z < MAP_SIZE; z += 1) {
          let y = 0;
          while (y < MAP_HEIGHT) {
            const kind = cells[at(x, y, z)];
            let top = y;
            while (top + 1 < MAP_HEIGHT && cells[at(x, top + 1, z)] === kind) top += 1;
            if (kind !== B.AIR) list.push({ x0: x, x1: x, y0: y, y1: top, z0: z, z1: z, kind: BLOCKS[kind].name });
            y = top + 1;
          }
        }
      }
      return list;
    }
  };
  return m;
}

// The round island: deep sea, a ring of shallow water (one block over sand) to paddle in, wet sand at
// the water's edge, a sandy beach and grass inside. The coast wobbles a little so it looks natural.
// Feet heights: shallow water sea level, wet sand sea level + 1, beach + 2, grass + 3.
export function land(m, { cx, cz, radius, wobble = 0.8, beach = 7 }) {
  const sea = m.seaLevel;
  for (let x = 0; x < MAP_SIZE; x += 1) {
    for (let z = 0; z < MAP_SIZE; z += 1) {
      const dx = x + 0.5 - cx;
      const dz = z + 0.5 - cz;
      const coast = radius + wobble * Math.sin(3 * Math.atan2(dz, dx));
      const inland = coast - Math.hypot(dx, dz); // blocks inside the coast (negative: in the sea)
      m.set(x, 0, z, "bedrock");
      if (inland < -3.5) {
        m.fill(x, x, 1, sea - 3, z, z, "sand");
        m.fill(x, x, sea - 2, sea, z, z, "water");
      } else if (inland < 0) {
        m.fill(x, x, 1, sea - 1, z, z, "sand");
        m.set(x, sea, z, "water");
      } else if (inland < 1.5) {
        m.fill(x, x, 1, sea - 1, z, z, "sand");
        m.set(x, sea, z, "wet_sand");
      } else if (inland < beach) {
        m.fill(x, x, 1, sea - 2, z, z, "stone");
        m.fill(x, x, sea - 1, sea + 1, z, z, "sand");
      } else {
        m.fill(x, x, 1, sea - 1, z, z, "stone");
        m.fill(x, x, sea, sea + 1, z, z, "dirt");
        m.set(x, sea + 2, z, "grass_block");
      }
    }
  }
}

// A gentle grassy hill in one block terraces, so it can be walked up without jumping. The top is a
// flat circle of topRadius; each terrace below it is one block lower.
export function hill(m, { x, z, radius, height, topRadius = 2.5 }) {
  const step = (radius - topRadius) / height;
  for (let cx = Math.floor(x - radius); cx <= Math.ceil(x + radius); cx += 1) {
    for (let cz = Math.floor(z - radius); cz <= Math.ceil(z + radius); cz += 1) {
      const r = Math.hypot(cx + 0.5 - x, cz + 0.5 - z);
      if (r >= radius) continue;
      const rise = Math.min(height, Math.ceil((radius - r) / step));
      const g = m.ground(cx, cz);
      if (g < 0 || m.get(cx, g, cz) !== "grass_block") continue;
      m.fill(cx, cx, g, g + rise - 1, cz, cz, "dirt");
      m.set(cx, g + rise, cz, "grass_block");
    }
  }
}

// Cells from a to b, one step at a time along x or z, so a path never has a diagonal gap.
export function line([x0, z0], [x1, z1]) {
  const cells = [[x0, z0]];
  let x = x0;
  let z = z0;
  const dx = Math.abs(x1 - x0);
  const dz = Math.abs(z1 - z0);
  let err = 0;
  while (x !== x1 || z !== z1) {
    // Step along whichever axis is further behind the straight line.
    if (z === z1 || (x !== x1 && err <= 0)) {
      x += Math.sign(x1 - x0);
      err += dz;
    } else {
      z += Math.sign(z1 - z0);
      err -= dx;
    }
    cells.push([x, z]);
  }
  return cells;
}

// BlockWords' path blocks along the ground between points (a list of [x, z]); water is left alone.
export function path(m, points) {
  for (let i = 1; i < points.length; i += 1) {
    line(points[i - 1], points[i]).forEach(([x, z]) => {
      const g = m.ground(x, z);
      if (g < 0 || m.get(x, g + 1, z) === "water") return;
      m.set(x, g, z, "dirt_path");
    });
  }
}

// Clears the air above a box and fills under it down to the sea bed, so a building stands on flat ground.
function pad(m, x0, x1, z0, z1, floorY, kind) {
  m.fill(x0, x1, 1, floorY - 1, z0, z1, "stone");
  m.fill(x0, x1, floorY, floorY, z0, z1, kind);
  m.fill(x0, x1, floorY + 1, MAP_HEIGHT - 1, z0, z1, "air");
}

// A palm tree: a log trunk with a crown of palm leaves whose arms droop at the ends, and maybe a
// koala holding on near the top (koala: the side it sits on, "n", "s", "e" or "w").
export function palm(m, { x, z, height = 6, leaves = "palm_leaves", koala = null }) {
  const g = m.ground(x, z);
  if (koala) {
    const [dx, dz] = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[koala];
    m.set(x + dx, g + height - 1, z + dz, "koala");
  }
  m.fill(x, x, g + 1, g + height, z, z, "oak_log");
  const top = g + height + 1;
  m.set(x, top, z, leaves);
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => {
    m.set(x + dx, top, z + dz, leaves);
    m.set(x + 2 * dx, top, z + 2 * dz, leaves);
    m.set(x + 3 * dx, top - 1, z + 3 * dz, leaves);
  });
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([dx, dz]) => m.set(x + dx, top, z + dz, leaves));
  return { top };
}

// A small beach house: a cobblestone floor, log corners, plank walls with glass windows, a doorway on
// one side (door: "n", "s", "e" or "w") and a stepped plank roof. Returns the door's outside cell.
export function house(m, { x0, z0, w = 5, d = 5, floorY, door = "s", walls = "oak_planks" }) {
  const x1 = x0 + w - 1;
  const z1 = z0 + d - 1;
  pad(m, x0, x1, z0, z1, floorY, "cobblestone");
  const mid = { x: x0 + Math.floor(w / 2), z: z0 + Math.floor(d / 2) };
  const doorCell = {
    n: { x: mid.x, z: z0 }, s: { x: mid.x, z: z1 }, e: { x: x1, z: mid.z }, w: { x: x0, z: mid.z }
  }[door];
  for (let y = floorY + 1; y <= floorY + 3; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      for (let z = z0; z <= z1; z += 1) {
        const edgeX = x === x0 || x === x1;
        const edgeZ = z === z0 || z === z1;
        if (!edgeX && !edgeZ) continue;
        if (x === doorCell.x && z === doorCell.z && y <= floorY + 2) continue;
        const corner = edgeX && edgeZ;
        const window = y === floorY + 2 && !corner && ((edgeX && Math.abs(z - mid.z) === 1) || (edgeZ && Math.abs(x - mid.x) === 1));
        m.set(x, y, z, corner ? "oak_log" : window ? "glass" : walls);
      }
    }
  }
  m.fill(x0 - 1, x1 + 1, floorY + 4, floorY + 4, z0 - 1, z1 + 1, "oak_planks");
  m.fill(x0, x1, floorY + 5, floorY + 5, z0 + 1, z1 - 1, "oak_planks");
  const out = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[door];
  return { x: doorCell.x + out[0], z: doorCell.z + out[1] };
}

// A plank pier on log posts, running from (x, z0) to (x, z1), deck at deckY, width blocks wide.
export function pier(m, { x, z0, z1, deckY, width = 3 }) {
  const half = Math.floor(width / 2);
  const step = Math.sign(z1 - z0) || 1;
  for (let z = z0; z !== z1 + step; z += step) {
    m.fill(x - half, x + half, deckY, deckY, z, z, "oak_planks");
    m.fill(x - half, x + half, deckY + 1, deckY + 3, z, z, "air");
  }
  [z0 + step, z1].forEach((z) => {
    [x - half, x + half].forEach((px) => {
      for (let y = deckY - 1; y >= 1 && !BLOCKS[id(m.get(px, y, z))].solid; y -= 1) m.set(px, y, z, "oak_log");
    });
  });
}

// A rocky platform (stone under a cobblestone top) of the given radius, its top at topY.
export function rockShelf(m, { x, z, radius, topY }) {
  for (let cx = Math.floor(x - radius); cx <= Math.ceil(x + radius); cx += 1) {
    for (let cz = Math.floor(z - radius); cz <= Math.ceil(z + radius); cz += 1) {
      if (Math.hypot(cx + 0.5 - x, cz + 0.5 - z) > radius) continue;
      m.fill(cx, cx, 1, topY - 1, cz, cz, "stone");
      m.set(cx, topY, cz, "cobblestone");
      m.fill(cx, cx, topY + 1, MAP_HEIGHT - 1, cz, cz, "air");
    }
  }
}

// A white and red striped lighthouse on solid ground at baseY, with a glass lamp room and a red roof.
// The door is a closed plank door on one side (door: "n", "s", "e" or "w"): there is no way in.
export function lighthouse(m, { x, z, baseY, height = 10, door = "w" }) {
  const ring = (r) => {
    const cells = [];
    for (let dx = -r; dx <= r; dx += 1) {
      for (let dz = -r; dz <= r; dz += 1) if (Math.abs(dx) + Math.abs(dz) <= r + 1) cells.push([x + dx, z + dz]);
    }
    return cells;
  };
  for (let i = 0; i < height; i += 1) {
    const kind = Math.floor(i / 2) % 2 === 0 ? "white_wool" : "red_wool";
    ring(2).forEach(([cx, cz]) => m.set(cx, baseY + i, cz, kind));
  }
  const lamp = baseY + height;
  ring(1).forEach(([cx, cz]) => m.fill(cx, cx, lamp, lamp + 1, cz, cz, "glass"));
  m.fill(x, x, lamp, lamp + 1, z, z, "yellow_wool");
  ring(2).forEach(([cx, cz]) => m.set(cx, lamp + 2, cz, "red_wool"));
  ring(1).forEach(([cx, cz]) => m.set(cx, lamp + 3, cz, "red_wool"));
  const [dx, dz] = { n: [0, -2], s: [0, 2], e: [2, 0], w: [-2, 0] }[door];
  m.fill(x + dx, x + dx, baseY, baseY + 1, z + dz, z + dz, "oak_planks");
}

// A rowing boat pulled up on the shore: a plank floor at floorY with a one block rim round it.
// It runs along x from x0 for length blocks and is 3 blocks wide, centred on z.
export function boat(m, { x0, z, floorY, length = 5 }) {
  const x1 = x0 + length - 1;
  for (let x = x0; x <= x1; x += 1) {
    for (let dz = -1; dz <= 1; dz += 1) {
      const bow = (x === x0 || x === x1) && dz !== 0; // round off the ends
      if (bow) continue;
      m.set(x, floorY, z + dz, "oak_planks");
      const rim = x === x0 || x === x1 || dz !== 0;
      m.set(x, floorY + 1, z + dz, rim ? "oak_planks" : "air");
      m.fill(x, x, floorY + 2, floorY + 3, z + dz, z + dz, "air");
    }
  }
}

// A big rock: a block of stone with a cobblestone lump on top.
export function rock(m, { x, z, groundY, w = 3, d = 3, h = 2 }) {
  m.fill(x, x + w - 1, groundY + 1, groundY + h, z, z + d - 1, "stone");
  m.set(x + Math.floor(w / 2), groundY + h + 1, z + Math.floor(d / 2), "cobblestone");
}

// A rock pool dug one block into the beach: water over sand, with a few rocks round it. The pool
// is shallow, so a pupil can paddle in it. Returns the pool's cells (for fish, feature things).
export function rockPool(m, { x0, z0, w = 3, d = 3, waterY, rocks = [] }) {
  const cells = [];
  for (let x = x0; x < x0 + w; x += 1) {
    for (let z = z0; z < z0 + d; z += 1) {
      m.set(x, waterY - 1, z, "sand");
      m.set(x, waterY, z, "water");
      cells.push([x, z]);
    }
  }
  rocks.forEach(([x, z]) => m.set(x, waterY + 1, z, "cobblestone"));
  return cells;
}

// A sandcastle: a 3 by 3 sandstone base with four corner towers and a keep in the middle, with a flag
// on top of the keep. Returns the keep's top block.
export function sandcastle(m, { x, z, groundY, flag = null }) {
  m.fill(x, x + 2, groundY + 1, groundY + 1, z, z + 2, "sandstone");
  [[0, 0], [2, 0], [0, 2], [2, 2]].forEach(([dx, dz]) => m.set(x + dx, groundY + 2, z + dz, "sandstone"));
  m.fill(x + 1, x + 1, groundY + 2, groundY + 3, z + 1, z + 1, "sandstone");
  if (flag) m.set(x + 1, groundY + 4, z + 1, flag);
  return { x: x + 1, y: groundY + 3, z: z + 1 };
}

// An ice cream cart: a white counter with two posts holding a pink and white striped canopy.
export function cart(m, { x, z, groundY }) {
  m.fill(x, x + 1, groundY + 1, groundY + 1, z, z, "white_wool");
  m.set(x, groundY + 2, z, "oak_log");
  m.set(x + 1, groundY + 2, z, "oak_log");
  for (let dx = -1; dx <= 2; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) m.set(x + dx, groundY + 3, z + dz, (dx + dz) % 2 === 0 ? "pink_wool" : "white_wool");
  }
}

// A bench along x: a plank seat with log arms at each end.
export function bench(m, { x, z, groundY, length = 3 }) {
  m.fill(x, x + length - 1, groundY + 1, groundY + 1, z, z, "oak_planks");
  m.set(x - 1, groundY + 1, z, "oak_log");
  m.set(x + length, groundY + 1, z, "oak_log");
}

// A beach umbrella: a log pole three blocks high under a 3 by 3 striped wool canopy.
export function umbrella(m, { x, z, groundY, colours = ["red_wool", "white_wool"] }) {
  m.fill(x, x, groundY + 1, groundY + 3, z, z, "oak_log");
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) m.set(x + dx, groundY + 4, z + dz, colours[Math.abs(dx + dz) % 2]);
  }
}

// A flat striped beach towel lying on the ground.
export function towel(m, { x, z, groundY, w = 2, d = 3 }) {
  m.fill(x, x + w - 1, groundY + 1, groundY + 1, z, z + d - 1, "towel");
}

// A kite flying on its string: string blocks from the ground up, the kite on top. Returns the kite cell.
export function kite(m, { x, z, groundY, height = 4 }) {
  m.fill(x, x, groundY + 1, groundY + height - 1, z, z, "kite_string");
  m.set(x, groundY + height, z, "kite");
  return { x, y: groundY + height, z };
}

// A flag on a log post two blocks high. Returns the flag cell.
export function flagPost(m, { x, z, groundY, flag }) {
  m.fill(x, x, groundY + 1, groundY + 2, z, z, "oak_log");
  m.set(x, groundY + 3, z, flag);
  return { x, y: groundY + 3, z };
}

// ---- pet show park helpers (spec 0011) ------------------------------------------------------------

// A leafy oak tree: a log trunk and a round crown of oak leaves. The lowest leaves are one block
// below the top of the trunk, so a trunk of 4 or more leaves room to walk under the crown.
export function tree(m, { x, z, height = 5, radius = 2.5 }) {
  const g = m.ground(x, z);
  const top = g + height;
  m.fill(x, x, g + 1, top, z, z, "oak_log");
  [[-1, radius - 0.5], [0, radius], [1, radius], [2, radius - 1]].forEach(([dy, r]) => {
    for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx += 1) {
      for (let dz = -Math.ceil(r); dz <= Math.ceil(r); dz += 1) {
        if (dx * dx + dz * dz > r * r) continue;
        if (m.get(x + dx, top + dy, z + dz) === "air") m.set(x + dx, top + dy, z + dz, "oak_leaves");
      }
    }
  });
  return { top };
}

// A pet show tent: log posts at the corners holding a striped wool roof, open on every side so a
// pupil can walk in. It covers x0 to x0 + w - 1 and z0 to z0 + d - 1; the roof hangs one block over.
export function tent(m, { x0, z0, w = 7, d = 7, groundY, colours = ["red_wool", "white_wool"] }) {
  const x1 = x0 + w - 1;
  const z1 = z0 + d - 1;
  [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(([x, z]) => m.fill(x, x, groundY + 1, groundY + 3, z, z, "oak_log"));
  for (let x = x0 - 1; x <= x1 + 1; x += 1) {
    const kind = colours[((x - x0 + 1) >> 1) % colours.length]; // stripes two blocks wide
    m.fill(x, x, groundY + 4, groundY + 4, z0 - 1, z1 + 1, kind);
    m.fill(x, x, groundY + 5, groundY + 5, z0 + 1, z1 - 1, kind);
  }
}

// A small pen with a one block plank fence and a gap for a gate in the middle of one side (gate:
// "n", "s", "e" or "w"). Its fence runs round x0 to x0 + w - 1 and z0 to z0 + d - 1.
export function pen(m, { x0, z0, w = 4, d = 4, groundY, gate = "s" }) {
  const x1 = x0 + w - 1;
  const z1 = z0 + d - 1;
  const gx = x0 + Math.floor(w / 2);
  const gz = z0 + Math.floor(d / 2);
  const gap = { n: [gx, z0], s: [gx, z1], e: [x1, gz], w: [x0, gz] }[gate];
  for (let x = x0; x <= x1; x += 1) {
    for (let z = z0; z <= z1; z += 1) {
      const edge = x === x0 || x === x1 || z === z0 || z === z1;
      if (edge && !(x === gap[0] && z === gap[1])) m.set(x, groundY + 1, z, "oak_planks");
    }
  }
}

// A table (or desk) along x: a plank top two blocks up on log legs at each end, so there is an open
// cell under the middle for something to sit "under the table". Returns that cell.
export function table(m, { x, z, groundY, length = 3 }) {
  m.fill(x, x + length - 1, groundY + 2, groundY + 2, z, z, "oak_planks");
  m.set(x, groundY + 1, z, "oak_log");
  m.set(x + length - 1, groundY + 1, z, "oak_log");
  return { x: x + Math.floor(length / 2), y: groundY + 1, z };
}

// A fallen log lying on the ground along x.
export function log(m, { x, z, groundY, length = 3 }) {
  m.fill(x, x + length - 1, groundY + 1, groundY + 1, z, z, "oak_log");
}
