// Treasure Quest · blocks: our own 16×16 pixel block pictures, drawn by code into one 64×64 sheet when the
// quest opens (no texture files), and the block set every island is built from (spec 0003).
// Each tile is a fixed seeded pattern over a few colours from the kit palette, so it looks the same
// on every load. Faces are shaded by baking a brightness into each corner, not by lights.
import * as THREE from "three";
import { mulberry32 } from "./puzzles.js";

const TILE = 16;
const SHEET = 64;
const PER_ROW = SHEET / TILE;
const DRIFT = 1 / 8; // water moves one tile every 8 seconds

// Face brightness: top 1.0, east and west 0.8, north and south 0.65, bottom 0.5.
// BoxGeometry's faces come in the order +x, -x, +y, -y, +z, -z.
const SHADE = [0.8, 0.8, 1.0, 0.5, 0.65, 0.65];
const FACE_PART = ["side", "side", "top", "bottom", "side", "side"];

// Colour lists are [hex, weight]; the weights say how often each colour is picked.
const SAND = [["#f2e2a0", 4], ["#e8d48a", 3.5], ["#dcc57a", 2], ["#cbb26a", 0.5]];
const WET_SAND = [["#cdb370", 3.5], ["#c2a764", 3.5], ["#b39758", 2], ["#d8c07e", 1]];
const WATER = [["#3c8dde", 4.5], ["#3580cf", 3], ["#4a9ae6", 1.5], ["#5aa8ee", 1]];
const GRASS = [["#5cb85c", 4], ["#4ea84e", 3], ["#67c467", 2], ["#3d8b3d", 1]];
const DIRT = [["#8b5a2b", 4], ["#7a4e25", 3], ["#996633", 2], ["#6b4420", 1]];
const STONE = [["#9a9a9a", 4.5], ["#8f8f8f", 3], ["#a6a6a6", 1.5], ["#7d7d7d", 1]];
const PLANK = [["#c8a165", 4], ["#bd955a", 3], ["#b08a50", 2]];
const BARK = [["#6b4a2b", 3], ["#5a3d22", 3], ["#7a5634", 2]];
const LEAVES = [["#3d8b3d", 3.5], ["#2f7a2f", 3], ["#4ea84e", 2], ["#23602a", 1.5]];
const WOOL = [["#f4f4f4", 4], ["#e8e8e8", 3], ["#dcdcdc", 2], ["#ffffff", 1]];

function rgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function picker(list, rand) {
  const total = list.reduce((sum, [, w]) => sum + w, 0);
  const colours = list.map(([hex, w]) => [rgb(hex), w]);
  return () => {
    let roll = rand() * total;
    for (const [colour, w] of colours) {
      roll -= w;
      if (roll < 0) return colour;
    }
    return colours[0][0];
  };
}

const CLEAR = [0, 0, 0, 0];

// Each tile painter fills a 16×16 grid through put(x, y, colour), using its own seeded random numbers.
const PAINT = {
  sand: (put, rand) => speckle(put, picker(SAND, rand)),
  wetsand: (put, rand) => speckle(put, picker(WET_SAND, rand)),
  water(put, rand) {
    speckle(put, picker(WATER, rand));
    // A few light ripples; they wrap round the edges so the tile repeats without a seam.
    for (let n = 0; n < 4; n += 1) {
      const y = Math.floor(rand() * TILE);
      const x = Math.floor(rand() * TILE);
      const length = 3 + Math.floor(rand() * 3);
      for (let i = 0; i < length; i += 1) put((x + i) % TILE, y, rgb("#8cc4f2"));
    }
  },
  grass_top: (put, rand) => speckle(put, picker(GRASS, rand)),
  grass_side(put, rand) {
    const grass = picker(GRASS, rand);
    const dirt = picker(DIRT, rand);
    for (let x = 0; x < TILE; x += 1) {
      const depth = 3 + (rand() < 0.5 ? 1 : 0) + (rand() < 0.25 ? 1 : 0);
      for (let y = 0; y < TILE; y += 1) put(x, y, y < depth ? grass() : dirt());
    }
  },
  dirt: (put, rand) => speckle(put, picker(DIRT, rand)),
  stone(put, rand) {
    speckle(put, picker(STONE, rand));
    // Short dark cracks.
    for (let n = 0; n < 3; n += 1) {
      let x = Math.floor(rand() * TILE);
      let y = Math.floor(rand() * TILE);
      for (let i = 0; i < 3; i += 1) {
        put(x, y, rgb("#6e6e6e"));
        x = (x + 1) % TILE;
        y = (y + (rand() < 0.5 ? 0 : 1)) % TILE;
      }
    }
  },
  cobble(put, rand) {
    // Rounded stones in three rows, with dark mortar between them.
    const rows = [[0, 5], [5, 11], [11, 16]];
    const shades = ["#ababab", "#9a9a9a", "#8a8a8a", "#a2a2a2"].map(rgb);
    rows.forEach(([top, bottom]) => {
      let x = Math.floor(rand() * 4);
      const cuts = [];
      while (cuts.length < 4) {
        cuts.push(x % TILE);
        x += 4 + Math.floor(rand() * 3);
      }
      for (let y = top; y < bottom; y += 1) {
        for (let px = 0; px < TILE; px += 1) {
          const cell = cuts.filter((c) => c <= px).length;
          const edge = y === top || cuts.includes(px);
          const shade = shades[(cell + top) % shades.length];
          const light = y === top + 1 && !cuts.includes(px - 1);
          put(px, y, edge ? rgb("#5c5c5c") : light ? rgb("#bdbdbd") : shade);
        }
      }
    });
  },
  planks(put, rand) {
    const wood = picker(PLANK, rand);
    for (let board = 0; board < 4; board += 1) {
      const seam = (board * 7 + 3) % TILE;
      for (let y = board * 4; y < board * 4 + 4; y += 1) {
        for (let x = 0; x < TILE; x += 1) {
          const line = y === board * 4 + 3 || x === seam;
          put(x, y, line ? rgb("#6e5230") : rand() < 0.08 ? rgb("#8b6a3e") : wood());
        }
      }
    }
  },
  log_top(put, rand) {
    // Rings around the middle, bark round the edge.
    for (let y = 0; y < TILE; y += 1) {
      for (let x = 0; x < TILE; x += 1) {
        const ring = Math.floor(Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)));
        let colour;
        if (ring >= 7) colour = rand() < 0.5 ? "#5a3d22" : "#6b4a2b";
        else if (ring <= 1) colour = "#c8a165";
        else colour = ring % 2 ? "#9c7845" : "#b89058";
        put(x, y, rgb(colour));
      }
    }
  },
  log_side(put, rand) {
    const bark = picker(BARK, rand);
    for (let x = 0; x < TILE; x += 2) {
      const stripe = bark();
      for (let y = 0; y < TILE; y += 1) {
        const dark = rand() < 0.12;
        put(x, y, dark ? rgb("#4a3220") : stripe);
        put(x + 1, y, dark || rand() < 0.1 ? rgb("#4a3220") : stripe);
      }
    }
  },
  leaves(put, rand) {
    const leaf = picker(LEAVES, rand);
    for (let y = 0; y < TILE; y += 1) {
      for (let x = 0; x < TILE; x += 1) put(x, y, rand() < 0.22 ? CLEAR : leaf());
    }
  },
  wool(put, rand) {
    const wool = picker(WOOL, rand);
    for (let y = 0; y < TILE; y += 1) {
      for (let x = 0; x < TILE; x += 1) put(x, y, (x + y) % 4 === 0 ? rgb("#d2d2d2") : wool());
    }
  },
  glass(put) {
    // A pale frame with a couple of shine marks; the middle is see through.
    for (let y = 0; y < TILE; y += 1) {
      for (let x = 0; x < TILE; x += 1) {
        const edge = x === 0 || y === 0 || x === TILE - 1 || y === TILE - 1;
        put(x, y, edge ? rgb("#dcf0ff") : CLEAR);
      }
    }
    [[3, 4], [4, 3], [5, 2], [3, 5], [10, 12], [11, 11], [12, 10]].forEach(([x, y]) => put(x, y, rgb("#ffffff")));
  }
};

function speckle(put, colour) {
  for (let y = 0; y < TILE; y += 1) {
    for (let x = 0; x < TILE; x += 1) put(x, y, colour());
  }
}

// The tiles in the sheet, left to right and top to bottom (two spare places at the end).
const TILES = ["sand", "wetsand", "water", "grass_top", "grass_side", "dirt", "stone", "cobble",
  "planks", "log_top", "log_side", "leaves", "wool", "glass"];

export const BLOCKS = {
  sand: { top: "sand", side: "sand", bottom: "sand" },
  wetsand: { top: "wetsand", side: "wetsand", bottom: "wetsand" },
  water: { top: "water", side: "water", bottom: "water" },
  grass: { top: "grass_top", side: "grass_side", bottom: "dirt" },
  dirt: { top: "dirt", side: "dirt", bottom: "dirt" },
  stone: { top: "stone", side: "stone", bottom: "stone" },
  cobble: { top: "cobble", side: "cobble", bottom: "cobble" },
  planks: { top: "planks", side: "planks", bottom: "planks" },
  log: { top: "log_top", side: "log_side", bottom: "log_top" },
  leaves: { top: "leaves", side: "leaves", bottom: "leaves", cutout: true },
  wool: { top: "wool", side: "wool", bottom: "wool", tint: true },
  glass: { top: "glass", side: "glass", bottom: "glass", cutout: true }
};

function paintTile(context, name, at) {
  const image = context.createImageData(TILE, TILE);
  // A fixed seed per tile: the same pixels on every load.
  const rand = mulberry32(1000 + at * 7919);
  const put = (x, y, colour) => {
    const i = (y * TILE + x) * 4;
    image.data[i] = colour[0];
    image.data[i + 1] = colour[1];
    image.data[i + 2] = colour[2];
    image.data[i + 3] = colour[3];
  };
  PAINT[name](put, rand);
  context.putImageData(image, (at % PER_ROW) * TILE, Math.floor(at / PER_ROW) * TILE);
}

let sheetCanvas = null;

// The 64×64 sheet of every tile (used by the blocks, the &kit view and tests).
export function blockTiles() {
  if (sheetCanvas) return sheetCanvas;
  sheetCanvas = document.createElement("canvas");
  sheetCanvas.width = SHEET;
  sheetCanvas.height = SHEET;
  const context = sheetCanvas.getContext("2d");
  TILES.forEach((name, at) => paintTile(context, name, at));
  return sheetCanvas;
}

// Sharp square pixels: no smoothing and no smaller copies.
function pixelTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

let shared = null;

function sharedParts() {
  if (shared) return shared;
  const sheet = pixelTexture(blockTiles());
  // Water has its own repeating copy of its tile, so it can drift.
  const waterCanvas = document.createElement("canvas");
  waterCanvas.width = TILE;
  waterCanvas.height = TILE;
  const at = TILES.indexOf("water");
  waterCanvas.getContext("2d").drawImage(blockTiles(), (at % PER_ROW) * TILE, Math.floor(at / PER_ROW) * TILE, TILE, TILE, 0, 0, TILE, TILE);
  const water = pixelTexture(waterCanvas);
  water.wrapS = THREE.RepeatWrapping;
  water.wrapT = THREE.RepeatWrapping;
  shared = {
    sheet,
    water,
    solid: new THREE.MeshBasicMaterial({ map: sheet, vertexColors: true }),
    cutout: new THREE.MeshBasicMaterial({ map: sheet, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }),
    waterMaterial: new THREE.MeshBasicMaterial({ map: water, vertexColors: true }),
    geometry: {}
  };
  return shared;
}

// A cube whose faces point at the right tiles in the sheet, with the face brightness baked in.
function blockGeometry(kind) {
  const parts = sharedParts();
  if (parts.geometry[kind]) return parts.geometry[kind];
  const block = BLOCKS[kind];
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const uv = geometry.attributes.uv;
  const colours = new Float32Array(uv.count * 3);
  const shade = new THREE.Color();
  const inset = 0.001; // keeps the nearest pixel inside the tile
  for (let face = 0; face < 6; face += 1) {
    shade.setRGB(SHADE[face], SHADE[face], SHADE[face], THREE.SRGBColorSpace);
    const at = TILES.indexOf(block[FACE_PART[face]]);
    const col = at % PER_ROW;
    const row = Math.floor(at / PER_ROW);
    for (let corner = 0; corner < 4; corner += 1) {
      const i = face * 4 + corner;
      if (kind !== "water") {
        const u0 = col / PER_ROW + inset;
        const u1 = (col + 1) / PER_ROW - inset;
        const v0 = 1 - (row + 1) / PER_ROW + inset;
        const v1 = 1 - row / PER_ROW - inset;
        uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
      }
      colours.set([shade.r, shade.g, shade.b], i * 3);
    }
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  parts.geometry[kind] = geometry;
  return geometry;
}

function materialFor(kind) {
  const parts = sharedParts();
  if (kind === "water") return parts.waterMaterial;
  return BLOCKS[kind].cutout ? parts.cutout : parts.solid;
}

const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)");

// Builds placed blocks { x, y, z, kind, tint } into one instanced mesh per kind (one draw call each).
// group.userData.tick(dt) makes the water drift.
export function buildBlocks(list) {
  const byKind = {};
  list.forEach((block) => {
    if (!BLOCKS[block.kind]) {
      console.warn(`Treasure Quest: no block called "${block.kind}", skipped.`);
      return;
    }
    (byKind[block.kind] = byKind[block.kind] || []).push(block);
  });
  const group = new THREE.Group();
  const place = new THREE.Matrix4();
  const colour = new THREE.Color();
  Object.entries(byKind).forEach(([kind, blocks]) => {
    const mesh = new THREE.InstancedMesh(blockGeometry(kind), materialFor(kind), blocks.length);
    mesh.name = kind;
    blocks.forEach((block, i) => {
      mesh.setMatrixAt(i, place.makeTranslation(block.x, block.y, block.z));
      if (BLOCKS[kind].tint) mesh.setColorAt(i, colour.setHex(block.tint == null ? 0xffffff : block.tint));
    });
    group.add(mesh);
  });
  const water = sharedParts().water;
  group.userData.tick = (dt) => {
    if (still && still.matches) return;
    water.offset.x = (water.offset.x + dt * DRIFT) % 1;
  };
  return group;
}
