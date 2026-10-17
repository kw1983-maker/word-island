// Copied from BlockWords js/atlas.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// Trimmed to the tiles the kept blocks use (spec 0004); tiles are seeded by name, so each one matches BlockWords.
// Added: wet_sand, the beach things of spec 0006, the gold and open chests of spec 0007, the pet
// show things of spec 0011 and the clothes town things of spec 0012 (drawn here in the same 16
// pixel style).

// Procedural 16x16 pixel-art texture atlas, drawn to a canvas at load time.
// No image files: every tile is generated in code, then sampled with a NEAREST
// filter so it stays crisp and blocky like the original.

import { BLOCKS, WOOL_COLOURS } from './blocks.js';
import { mulberry32 } from './noise.js';

export const TILE = 16;   // pixels per tile
export const COLS = 8;    // tiles per atlas row

const defs = [];                 // [{ name, draw }]
export const TILE_INDEX = {};    // tile name -> index in the atlas

function tile(name, draw) {
  TILE_INDEX[name] = defs.length;
  defs.push({ name, draw });
}

// ---------------------------------------------------------------- pixel API
// Each draw function gets `p`, a tiny painter over one 16x16 RGBA buffer.
function painter(buf, seed) {
  const rnd = mulberry32(seed);
  const put = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= TILE || y >= TILE) return;
    const i = (y * TILE + x) * 4;
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a === undefined ? 255 : a;
  };
  return {
    rnd,
    clear() { buf.fill(0); },
    // Flat fill with per-pixel brightness jitter — the base of most tiles.
    fill(col, jitter = 0, alpha = 255) {
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const d = jitter ? (rnd() - 0.5) * 2 * jitter : 0;
          put(x, y, col[0] + d, col[1] + d, col[2] + d, alpha);
        }
      }
    },
    set: put,
    rect(x0, y0, w, h, col, jitter = 0, alpha = 255) {
      for (let y = y0; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++) {
          const d = jitter ? (rnd() - 0.5) * 2 * jitter : 0;
          put(x, y, col[0] + d, col[1] + d, col[2] + d, alpha);
        }
      }
    },
    // Random blobs — cobble lumps, ore veins, gravel stones.
    blobs(count, size, col, jitter = 0) {
      for (let i = 0; i < count; i++) {
        const cx = Math.floor(rnd() * TILE), cy = Math.floor(rnd() * TILE);
        const r = size * (0.6 + rnd() * 0.8);
        for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) {
          for (let x = -Math.ceil(r); x <= Math.ceil(r); x++) {
            if (x * x + y * y > r * r) continue;
            const d = jitter ? (rnd() - 0.5) * 2 * jitter : 0;
            put((cx + x + TILE) % TILE, (cy + y + TILE) % TILE, col[0] + d, col[1] + d, col[2] + d, 255);
          }
        }
      }
    },
    speckle(count, col, jitter = 0) {
      for (let i = 0; i < count; i++) {
        const d = jitter ? (rnd() - 0.5) * 2 * jitter : 0;
        put(Math.floor(rnd() * TILE), Math.floor(rnd() * TILE), col[0] + d, col[1] + d, col[2] + d, 255);
      }
    },
    // Punch alpha holes — leaves and other "fancy" cutout textures.
    holes(count) {
      for (let i = 0; i < count; i++) {
        const i2 = (Math.floor(rnd() * TILE) + Math.floor(rnd() * TILE) * TILE) * 4;
        buf[i2 + 3] = 0;
      }
    },
  };
}

// -------------------------------------------------------------- the tiles
const GREY = [125, 125, 125];
const DIRT = [134, 96, 67];
const GRASS = [104, 168, 70];
const SANDC = [219, 207, 163];
const OAK = [162, 130, 78];

tile('stone', (p) => { p.fill(GREY, 16); p.blobs(3, 2.2, [113, 113, 113], 8); });
tile('cobblestone', (p) => {
  p.fill([90, 90, 90], 6);
  for (let i = 0; i < 7; i++) {
    const x = Math.floor(p.rnd() * 12), y = Math.floor(p.rnd() * 12);
    const w = 3 + Math.floor(p.rnd() * 3), h = 3 + Math.floor(p.rnd() * 3);
    p.rect(x, y, w, h, [138, 138, 138], 14);
  }
});
tile('bedrock', (p) => { p.fill([70, 70, 70], 18); p.blobs(6, 2.5, [40, 40, 40], 12); p.blobs(3, 1.8, [110, 110, 110], 10); });
tile('dirt', (p) => { p.fill(DIRT, 14); p.speckle(24, [110, 78, 52], 8); });
tile('grass_top', (p) => { p.fill(GRASS, 20); p.speckle(30, [86, 150, 58], 10); });
tile('grass_side', (p) => {
  p.fill(DIRT, 14); p.speckle(20, [110, 78, 52], 8);
  p.rect(0, 0, TILE, 3, GRASS, 18);
  for (let x = 0; x < TILE; x++) { // ragged fringe where grass meets dirt
    const d = 3 + Math.floor(p.rnd() * 3);
    for (let y = 3; y < d; y++) p.set(x, y, GRASS[0] - 6, GRASS[1] - 6, GRASS[2] - 6);
  }
});
tile('path_top', (p) => { p.fill([150, 124, 88], 12); p.speckle(20, [128, 104, 72], 8); });
tile('path_side', (p) => { p.fill(DIRT, 12); p.rect(0, 0, TILE, 2, [150, 124, 88], 10); });
tile('sand', (p) => { p.fill(SANDC, 10); p.speckle(18, [204, 190, 146], 6); });
tile('wet_sand', (p) => { p.fill([188, 172, 124], 10); p.speckle(18, [168, 152, 108], 6); });
tile('sandstone', (p) => {
  p.fill([216, 203, 155], 8);
  p.rect(0, 2, TILE, 1, [190, 176, 128], 4);
  p.rect(0, 9, TILE, 1, [190, 176, 128], 4);
  p.rect(0, 14, TILE, 1, [190, 176, 128], 4);
});
tile('sandstone_top', (p) => { p.fill([222, 209, 162], 8); p.speckle(14, [198, 184, 138], 5); });
tile('gravel', (p) => { p.fill([124, 118, 114], 16); p.blobs(9, 1.8, [92, 88, 84], 12); p.blobs(5, 1.4, [156, 150, 146], 10); });
tile('clay', (p) => { p.fill([160, 166, 179], 10); p.speckle(14, [142, 148, 162], 6); });

function logTiles(side, top, bark, core) {
  tile(side, (p) => {
    p.fill(bark, 12);
    for (let x = 0; x < TILE; x += 3) p.rect(x, 0, 1, TILE, [bark[0] - 22, bark[1] - 18, bark[2] - 12], 8);
  });
  tile(top, (p) => {
    p.fill(core, 10);
    for (let r = 6; r > 1; r -= 2) {
      for (let a = 0; a < 64; a++) {
        const t = (a / 64) * Math.PI * 2;
        p.set(8 + Math.round(Math.cos(t) * r), 8 + Math.round(Math.sin(t) * r), core[0] - 26, core[1] - 22, core[2] - 16);
      }
    }
  });
}
logTiles('oak_log', 'log_top', [107, 84, 50], [166, 133, 82]);

function planks(name, col) {
  tile(name, (p) => {
    p.fill(col, 12);
    for (let y = 3; y < TILE; y += 4) p.rect(0, y, TILE, 1, [col[0] - 34, col[1] - 30, col[2] - 22], 6);
    p.rect(6, 0, 1, 4, [col[0] - 34, col[1] - 30, col[2] - 22]);
    p.rect(11, 4, 1, 4, [col[0] - 34, col[1] - 30, col[2] - 22]);
    p.rect(3, 8, 1, 4, [col[0] - 34, col[1] - 30, col[2] - 22]);
    p.rect(9, 12, 1, 4, [col[0] - 34, col[1] - 30, col[2] - 22]);
  });
}
planks('oak_planks', OAK);

function leaves(name, col) {
  tile(name, (p) => { p.fill(col, 22); p.speckle(30, [col[0] - 22, col[1] - 18, col[2] - 14], 10); p.holes(26); });
}
leaves('oak_leaves', [66, 140, 52]);

tile('tall_grass', (p) => {
  p.clear();
  for (let i = 0; i < 7; i++) {
    const x = 1 + Math.floor(p.rnd() * 14);
    const h = 6 + Math.floor(p.rnd() * 8);
    for (let y = TILE - 1; y > TILE - h; y--) {
      p.set(x + Math.round(Math.sin(y * 0.5) * 0.6), y, 88, 152, 56, 255);
    }
  }
});
tile('rose', (p) => {
  p.clear();
  p.rect(7, 8, 2, 8, [70, 130, 50]);
  p.rect(5, 10, 2, 2, [70, 130, 50]);
  p.rect(5, 3, 6, 5, [200, 50, 50], 18);
  p.rect(6, 2, 4, 1, [170, 36, 36]);
});
tile('dandelion', (p) => {
  p.clear();
  p.rect(7, 8, 2, 8, [70, 130, 50]);
  p.rect(9, 11, 2, 2, [70, 130, 50]);
  p.rect(5, 3, 6, 5, [240, 214, 60], 16);
  p.rect(6, 2, 4, 1, [214, 184, 40]);
});
tile('sugar_cane', (p) => {
  p.clear();
  p.rect(6, 0, 4, TILE, [148, 200, 118], 12);
  for (let y = 3; y < TILE; y += 5) p.rect(6, y, 4, 1, [120, 172, 92]);
});
tile('glass', (p) => {
  p.clear();
  p.rect(0, 0, TILE, 1, [214, 236, 240], 0, 210);
  p.rect(0, 15, TILE, 1, [214, 236, 240], 0, 210);
  p.rect(0, 0, 1, TILE, [214, 236, 240], 0, 210);
  p.rect(15, 0, 1, TILE, [214, 236, 240], 0, 210);
  p.rect(2, 2, 4, 1, [255, 255, 255], 0, 120);
  p.rect(2, 3, 1, 3, [255, 255, 255], 0, 120);
});
tile('bricks', (p) => {
  p.fill([150, 148, 142], 4); // mortar
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 4 : 0;
    for (let c = -1; c < 3; c++) p.rect(off + c * 8 + 1, row * 4 + 1, 6, 3, [156, 82, 62], 12);
  }
});
tile('crafting_top', (p) => {
  p.fill([154, 118, 70], 10);
  p.rect(0, 5, TILE, 1, [96, 72, 40]);
  p.rect(0, 10, TILE, 1, [96, 72, 40]);
  p.rect(5, 0, 1, TILE, [96, 72, 40]);
  p.rect(10, 0, 1, TILE, [96, 72, 40]);
});
tile('crafting_side', (p) => {
  p.fill(OAK, 12);
  p.rect(0, 3, TILE, 1, [110, 84, 48]);
  p.rect(2, 6, 5, 4, [128, 100, 58]);
  p.rect(9, 8, 5, 5, [128, 100, 58]);
});
tile('chest_top', (p) => { p.fill([150, 108, 56], 10); p.rect(0, 0, TILE, 1, [104, 74, 36]); p.rect(0, 15, TILE, 1, [104, 74, 36]); });
tile('chest_side', (p) => {
  p.fill([150, 108, 56], 10);
  p.rect(0, 4, TILE, 1, [104, 74, 36]);
  p.rect(6, 4, 4, 4, [70, 70, 74]);
  p.rect(7, 5, 2, 2, [212, 190, 90]);
});
// Treasure chests (spec 0007): the same chest drawn in gold, and open chests that show a dark empty
// inside on top and no lock on the sides.
function chestTiles(prefix, wood, band, lock) {
  tile(prefix + 'chest_top', (p) => { p.fill(wood, 10); p.rect(0, 0, TILE, 1, band); p.rect(0, 15, TILE, 1, band); });
  tile(prefix + 'chest_side', (p) => {
    p.fill(wood, 10);
    p.rect(0, 4, TILE, 1, band);
    p.rect(6, 4, 4, 4, [70, 70, 74]);
    p.rect(7, 5, 2, 2, lock);
  });
  tile(prefix + 'chest_open_top', (p) => {
    p.fill(wood, 10);
    p.rect(2, 2, 12, 12, [44, 30, 18], 6);  // the empty inside
    p.rect(2, 2, 12, 1, [24, 16, 10]);      // its shadowed back edge
  });
  tile(prefix + 'chest_open_side', (p) => {
    p.fill(wood, 10);
    p.rect(0, 0, TILE, 2, band);            // the rim where the lid lifted off
    p.rect(0, 15, TILE, 1, band);
  });
}
chestTiles('gold_', [214, 172, 56], [150, 110, 30], [250, 244, 200]);
// The wooden open chest reuses chest_top and chest_side's colours.
tile('chest_open_top', (p) => {
  p.fill([150, 108, 56], 10);
  p.rect(2, 2, 12, 12, [44, 30, 18], 6);
  p.rect(2, 2, 12, 1, [24, 16, 10]);
});
tile('chest_open_side', (p) => {
  p.fill([150, 108, 56], 10);
  p.rect(0, 0, TILE, 2, [104, 74, 36]);
  p.rect(0, 15, TILE, 1, [104, 74, 36]);
});
tile('sign', (p) => {
  p.clear();
  p.rect(1, 1, 14, 9, OAK, 10);
  p.rect(1, 1, 14, 1, [126, 100, 58]);
  p.rect(3, 4, 10, 1, [96, 74, 42]);
  p.rect(3, 6, 7, 1, [96, 74, 42]);
  p.rect(7, 10, 2, 6, [126, 100, 58]);
});
tile('bookshelf', (p) => {
  p.fill(OAK, 10);
  p.rect(0, 0, TILE, 2, [126, 100, 58]);
  p.rect(0, 14, TILE, 2, [126, 100, 58]);
  const books = [[172, 60, 60], [70, 100, 180], [200, 172, 60], [80, 150, 80], [140, 80, 170]];
  for (let band = 0; band < 2; band++) {
    for (let x = 0; x < TILE; x += 3) {
      const c = books[Math.floor(p.rnd() * books.length)];
      p.rect(x, 2 + band * 6, 2, 6, c, 12);
    }
  }
});
// ---- beach things (spec 0006) --------------------------------------------
tile('palm_leaves', (p) => {
  p.fill([92, 166, 58], 16);
  for (let i = -16; i < 16; i += 4) { // long fronds running corner to corner
    for (let x = 0; x < TILE; x++) {
      const y = x + i;
      if (y >= 0 && y < TILE) p.set(x, y, 62, 128, 40);
    }
  }
  p.speckle(14, [130, 196, 82], 8);
  p.holes(30);
});
tile('shell', (p) => {
  p.clear();
  for (let y = 8; y <= 14; y++) { // a scallop: a fan that widens towards the top
    const half = Math.round((14 - y) * 0.8) + 1;
    for (let x = 8 - half; x <= 7 + half; x++) {
      const ridge = (x - 8 + 16) % 3 === 0;
      p.set(x, y, ridge ? 214 : 246, ridge ? 160 : 216, ridge ? 146 : 200);
    }
  }
  p.rect(6, 14, 4, 2, [222, 176, 160]);
});
tile('fish', (p) => {
  p.clear();
  for (let y = 5; y <= 11; y++) { // an orange body, rounder in the middle
    const half = 4 - Math.abs(y - 8);
    p.rect(6 - half, y, 6 + half * 2, 1, [240, 140, 52], 10);
  }
  p.rect(12, 5, 2, 2, [224, 112, 36]); // the tail
  p.rect(12, 10, 2, 2, [224, 112, 36]);
  p.rect(11, 7, 2, 3, [224, 112, 36]);
  p.rect(4, 7, 1, 1, [20, 20, 20]); // the eye
  p.rect(7, 6, 1, 5, [255, 196, 120]);
});
tile('football', (p) => {
  p.clear();
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const d = Math.hypot(x - 7.5, y - 10.5);
      if (d < 4.6) p.set(x, y, 244, 244, 244);
    }
  }
  p.rect(7, 9, 2, 2, [30, 30, 30]); // black patches
  p.rect(4, 8, 1, 2, [30, 30, 30]);
  p.rect(11, 8, 1, 2, [30, 30, 30]);
  p.rect(5, 13, 2, 1, [30, 30, 30]);
  p.rect(9, 13, 2, 1, [30, 30, 30]);
  p.rect(7, 6, 2, 1, [30, 30, 30]);
});
tile('kite', (p) => {
  p.clear();
  for (let y = 0; y <= 12; y++) { // a diamond, red above and yellow below
    const half = y <= 5 ? y : 12 - y;
    for (let x = 8 - half; x <= 7 + half; x++) {
      const left = x < 8;
      const top = y <= 5;
      p.set(x, y, top === left ? 220 : 246, top === left ? 54 : 206, top === left ? 54 : 58);
    }
  }
  p.rect(7, 0, 1, 13, [120, 84, 48]); // the cross sticks
  p.rect(2, 5, 12, 1, [120, 84, 48]);
  p.rect(7, 13, 1, 3, [235, 235, 235]); // the string
});
tile('kite_string', (p) => {
  p.clear();
  for (let y = 0; y < TILE; y++) p.set(7 + Math.round(Math.sin(y * 0.4)), y, 235, 235, 235);
});
tile('bucket_spade', (p) => {
  p.clear();
  for (let y = 8; y <= 15; y++) p.rect(1 + Math.floor((15 - y) / 4), y, 8 - 2 * Math.floor((15 - y) / 4), 1, [220, 52, 52], 8);
  p.rect(1, 6, 1, 3, [90, 90, 96]); // the handle
  p.rect(8, 6, 1, 3, [90, 90, 96]);
  p.rect(2, 5, 6, 1, [90, 90, 96]);
  p.rect(12, 1, 1, 9, [140, 100, 60]); // the spade
  p.rect(11, 1, 3, 1, [140, 100, 60]);
  p.rect(10, 10, 5, 5, [58, 112, 216], 6);
});
function flag(name, draw) {
  tile(name, (p) => {
    p.clear();
    p.rect(1, 1, 1, 15, [120, 84, 48]); // the stick
    draw(p);
  });
}
// The flags fill x 2..14, y 1..8 (13 by 8 pixels).
function unionJack(p, x0, y0, w, h) {
  p.rect(x0, y0, w, h, [36, 62, 146]);
  for (let i = 0; i < w; i++) {
    const a = Math.round((i * (h - 1)) / (w - 1));
    p.set(x0 + i, y0 + a, 240, 240, 240);
    p.set(x0 + i, y0 + h - 1 - a, 240, 240, 240);
  }
  const cx = x0 + Math.floor(w / 2);
  const cy = y0 + Math.floor(h / 2);
  p.rect(x0, cy - 1, w, 2, [240, 240, 240]);
  p.rect(cx - 1, y0, 2, h, [240, 240, 240]);
  p.rect(x0, cy - 1, w, 1, [206, 36, 44]);
  p.rect(cx - 1, y0, 1, h, [206, 36, 44]);
}
flag('flag_uk', (p) => unionJack(p, 2, 1, 13, 8));
flag('flag_ca', (p) => {
  p.rect(2, 1, 13, 8, [244, 244, 244]);
  p.rect(2, 1, 3, 8, [214, 40, 40]);
  p.rect(12, 1, 3, 8, [214, 40, 40]);
  p.rect(7, 3, 3, 4, [214, 40, 40]); // the maple leaf
  p.rect(6, 4, 5, 1, [214, 40, 40]);
  p.rect(8, 2, 1, 1, [214, 40, 40]);
  p.rect(8, 7, 1, 1, [214, 40, 40]);
});
flag('flag_au', (p) => {
  p.rect(2, 1, 13, 8, [36, 62, 146]);
  unionJack(p, 2, 1, 7, 4);
  p.rect(4, 6, 2, 2, [244, 244, 244]); // the big star and the Southern Cross
  [[11, 2], [13, 4], [10, 5], [12, 7]].forEach(([x, y]) => p.set(x, y, 244, 244, 244));
});
tile('towel', (p) => {
  const bands = [[220, 52, 52], [244, 244, 244], [58, 112, 216], [244, 244, 244]];
  for (let y = 0; y < TILE; y++) p.rect(0, y, TILE, 1, bands[Math.floor(y / 4) % 4], 6);
});
tile('koala', (p) => {
  p.clear();
  const grey = [150, 150, 158];
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      if (Math.hypot(x - 7.5, y - 6) < 4.2) p.set(x, y, ...grey);           // the head
      if (Math.hypot(x - 3, y - 3) < 2.4 || Math.hypot(x - 12, y - 3) < 2.4) p.set(x, y, 196, 196, 204); // ears
      if (y >= 10 && Math.abs(x - 7.5) < 4.5 - (y - 10) * 0.3) p.set(x, y, 138, 138, 146); // the body
    }
  }
  p.rect(7, 6, 2, 3, [36, 36, 40]); // the nose
  p.set(5, 5, 20, 20, 20);
  p.set(10, 5, 20, 20, 20);
});
tile('fishing_rod', (p) => {
  p.clear();
  for (let i = 0; i <= 12; i++) p.set(2 + i, 15 - i, 120, 84, 48); // the rod
  p.rect(4, 11, 2, 2, [110, 110, 118]); // the reel
  for (let y = 4; y <= 12; y++) p.set(14, y, 235, 235, 235); // the line
  p.rect(13, 12, 1, 2, [160, 160, 170]); // the hook
});

// ---- the pet show things of spec 0011 ------------------------------------
// Pictures written as 16 rows of letters, top row first: '.' is see through and every other letter
// takes its colour from the palette. A row of 8 letters is mirrored into 16, for things seen from the front.
function art(name, palette, rows) {
  tile(name, (p) => {
    p.clear();
    rows.forEach((row, y) => {
      const full = row.length === 8 ? row + row.split('').reverse().join('') : row;
      [...full].forEach((ch, x) => { if (palette[ch]) p.set(x, y, ...palette[ch]); });
    });
  });
}
const INK = [24, 24, 28];
art('cat', { o: [232, 140, 52], d: [190, 100, 30], k: INK, p: [240, 150, 170], w: [250, 246, 236] }, [
  '................',
  '................',
  '................',
  '..........o...o.',
  '..........oo.oo.',
  '..........ooooo.',
  '..........okoko.',
  '..........oopoo.',
  '...........www..',
  '..o.......oww...',
  '.o.....oooooo...',
  '.o....oodoodo...',
  '.oo..oooooooo...',
  '..ooooodoodoo...',
  '....ooooooooo...',
  '....ww..ww.ww...',
]);
art('dog', { b: [156, 102, 56], d: [100, 62, 34], w: [242, 236, 224], k: INK, r: [220, 60, 60] }, [
  '................',
  '................',
  '................',
  '..........bbbb..',
  '.........dbbbbb.',
  '.........dbkbbbb',
  '.........dbbbwwk',
  '.........dbbwww.',
  '..b.......rrr...',
  '..b.......bbb...',
  '...bbbbbbbbbbb..',
  '...bbbbbbbbbbb..',
  '...bbwwwwwwbbb..',
  '...bb..bb.bb.bb.',
  '...bb..bb.bb.bb.',
  '...kk..kk.kk.kk.',
]);
art('rat', { g: [146, 146, 154], d: [112, 112, 120], p: [236, 150, 162], k: INK, w: [236, 236, 240] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..........pp....',
  '.........pddg...',
  '......gggggggg..',
  '.....ggggggggkg.',
  '....gggggggggggp',
  'p...gwwwwwwgggg.',
  '.p..ggggggggg...',
  '..pppg.g..g.g...',
  '.....p.p..p.p...',
]);
art('frog', { g: [86, 170, 60], d: [52, 118, 38], y: [214, 226, 120], k: INK, w: [250, 250, 250] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '...ww...',
  '..wkkw..',
  '..wkkwgg',
  '.ggggggg',
  '.gdddddd',
  '.ggyyyyy',
  'ggyyyyyy',
  'ggdyyyyy',
  'gg.ddgg.',
  'g...gg..',
]);
art('duck', { w: [246, 246, 240], s: [206, 206, 200], o: [242, 150, 40], k: INK }, [
  '................',
  '................',
  '................',
  '..........www...',
  '.........wwwww..',
  '.........wwkwwoo',
  '.........wwwwooo',
  '..........www...',
  '..........ww....',
  'w........www....',
  'ww....wwwwwww...',
  'wwwwwwwwsswwww..',
  '.wwwwwssssswww..',
  '..wwwwwwwwwww...',
  '....wwwwwww.....',
  '......oo.oo.....',
]);
art('lizard', { l: [120, 182, 60], d: [78, 128, 40], y: [204, 216, 96], k: INK }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '...........lll..',
  'll........llkll.',
  '.lllllllllllllll',
  '...ldlldlldlyy..',
  '...ll.l...l.l...',
  '..l..l...l...l..',
]);
art('spider', { k: [34, 34, 38], g: [84, 84, 92], w: [250, 250, 250] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '..k.....',
  '...k..kk',
  'k...kkkg',
  '.k..kkkk',
  '..kkkkkk',
  '.k..kkwk',
  'k..k.kkk',
  '..k...kk',
  '.k......',
  'k.......',
  '................',
]);
art('snake', { g: [72, 162, 60], k: [30, 52, 26], r: [224, 44, 44], y: [204, 222, 96] }, [
  '................',
  '................',
  '................',
  '................',
  '...........ggg..',
  '..........gkggg.',
  '..........ggggrr',
  '...........gg...',
  '...........gk...',
  '....gkggkggkg...',
  '...gggggggggkg..',
  '..gk.......ygg..',
  '..gg........kg..',
  '...kggkggkggg...',
  '.ggggkggkgggk...',
  'gkgyyyyyyyyyg...',
]);
art('butterfly', { o: [244, 140, 40], y: [250, 222, 80], b: [58, 104, 214], k: [30, 30, 30] }, [
  '................',
  '................',
  '....k...',
  '.....k..',
  '.oooo.k.',
  'oobboo.k',
  'obyybook',
  'obyybook',
  'oobboook',
  '.oooookk',
  '..ooyook',
  '..oyyook',
  '...ooo.k',
  '........',
  '................',
  '................',
]);
art('tiger', { o: [236, 138, 38], k: INK, w: [250, 246, 236], p: [240, 150, 170] }, [
  '................',
  '................',
  '................',
  '................',
  '...........o..o.',
  '..........oooooo',
  '..........okookk',
  '..........owwpww',
  '...........www..',
  'k.....ookokokoo.',
  '.o.ookokokokooo.',
  '.o.oooooooooooo.',
  '..oookokokokoo..',
  '...oowwwwwwwoo..',
  '...oo.oo..oo.oo.',
  '...kk.kk..kk.kk.',
]);
const GIRAFFE = { y: [234, 192, 82], b: [150, 92, 42], k: INK };
art('giraffe', GIRAFFE, [
  '..........yyb...',
  '..........yyy...',
  '..........byy...',
  '..........yyy...',
  '..yybyybyyyyb...',
  '.yyyyyyyyyybyy..',
  'y.ybyybyyyyyyy..',
  'y.yyyyyyybyyy...',
  '...yy.......yy..',
  '...yy.......yy..',
  '...yb.......yb..',
  '...yy.......yy..',
  '...yy.......yy..',
  '...by.......yy..',
  '...yy.......by..',
  '...kk.......kk..',
]);
art('giraffe_neck', GIRAFFE, [
  '................',
  '................',
  '..........k.k...',
  '..........b.b...',
  '.........yyyyy..',
  '.........ykyyyy.',
  '.........yyyyyyy',
  '..........yyyyb.',
  '..........yyb...',
  '..........yyy...',
  '..........byy...',
  '..........yyy...',
  '..........yby...',
  '..........yyy...',
  '..........byy...',
  '..........yyy...',
]);
art('crocodile', { g: [72, 132, 52], d: [46, 96, 34], w: [250, 250, 250], k: INK, y: [176, 194, 96] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..........gk....',
  '.d.d.d.d.ggggggg',
  'gggggggggggwgwgw',
  '.ggggggggggggggg',
  '..yyyyyyyyyyy...',
  '...gg.gg...gg.gg',
  '................',
]);
art('school_bag', { b: [58, 112, 216], d: [38, 78, 166], y: [242, 210, 60] }, [
  '................',
  '................',
  '................',
  '................',
  '......dddd......',
  '.....d....d.....',
  '....bbbbbbbb....',
  '...bbbbbbbbbb...',
  '...bddddddddb...',
  '...bbbbyybbbb...',
  '...bbbbbbbbbb...',
  '...bbddddddbb...',
  '...bbd....dbb...',
  '...bbddddddbb...',
  '...bbbbbbbbbb...',
  '....bbbbbbbb....',
]);
art('pencil_case', { r: [214, 50, 50], d: [156, 28, 28], y: [240, 210, 70] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '...rrrrrrrrrr...',
  '..rddddddddddry.',
  '..rrrrrrrrrrrr..',
  '..rrrrrrrrrrrr..',
  '..rrrrrrrrrrrr..',
  '...rrrrrrrrrr...',
]);
tile('spider_web', (p) => {
  p.clear();
  const silk = [236, 236, 240];
  for (let a = 0; a < 8; a++) { // threads out from the middle
    const ang = (a / 8) * Math.PI * 2;
    for (let r = 0; r < 8; r += 0.5) p.set(Math.round(7.5 + Math.cos(ang) * r), Math.round(7.5 + Math.sin(ang) * r), ...silk, 220);
  }
  [2.5, 4.5, 6.5].forEach((r) => { // rings across the threads
    for (let a = 0; a < 64; a++) {
      const ang = (a / 64) * Math.PI * 2;
      p.set(Math.round(7.5 + Math.cos(ang) * r), Math.round(7.5 + Math.sin(ang) * r), ...silk, 200);
    }
  });
});
// ---- the clothes town things of spec 0012 --------------------------------
art('tshirt', { b: [58, 112, 216], d: [40, 80, 170] }, [
  '................',
  '...bbbd.',
  '.bbbbbbd',
  'bbbbbbbb',
  'bbbbbbbb',
  'bbbbbbbb',
  '..bbbbbb',
  '..bbbbbb',
  '..bbbbbb',
  '..bbbbbb',
  '..bbbbbb',
  '..bbbbbb',
  '..dddddd',
  '................',
  '................',
  '................',
]);
art('jeans', { j: [56, 88, 156], d: [36, 60, 112], y: [224, 184, 70] }, [
  '................',
  '.dddddddddddddd.',
  '.jjjyjjjjjjyjjj.',
  '.jjjjjjjjjjjjjj.',
  '.jjjjjjjjjjjjjj.',
  '.jjjjjj.',
  '.jjjjjj.',
  '.jjjjj..',
  '.jjjjj..',
  '.jjjjj..',
  '.jjjjj..',
  '.jjjjj..',
  '.jjjjj..',
  '.ddddd..',
  '................',
  '................',
]);
art('socks', { p: [150, 80, 200], w: [240, 240, 240], d: [112, 56, 156] }, [
  '................',
  '..www.....www...',
  '..ppp.....ppp...',
  '..ppp.....ppp...',
  '..www.....www...',
  '..ppp.....ppp...',
  '..ppp.....ppp...',
  '..www.....www...',
  '..ppp.....ppp...',
  '..pppp....pppp..',
  '..ppppp...ppppp.',
  '..pdppp...pdppp.',
  '...ppp.....ppp..',
  '................',
  '................',
  '................',
]);
art('shoes', { r: [212, 50, 50], d: [140, 30, 30], w: [244, 244, 244] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '.rrr.....rrr....',
  '.rwrr....rwrr...',
  '.rrwrrr..rrwrrr.',
  '.rrrrrrr.rrrrrrr',
  '.ddddddd.ddddddd',
  '................',
]);
art('boots', { k: [236, 120, 172], d: [186, 78, 128], w: [250, 220, 236] }, [
  '................',
  '................',
  '................',
  '..www....www....',
  '..kkk....kkk....',
  '..kkk....kkk....',
  '..kkk....kkk....',
  '..kkk....kkk....',
  '..kkk....kkk....',
  '..kkk....kkk....',
  '..kkk....kkk....',
  '..kkkk...kkkk...',
  '..kkkkk..kkkkk..',
  '..kkkkk..kkkkk..',
  '..ddddd..ddddd..',
  '................',
]);
art('cap', { b: [50, 100, 212], d: [34, 70, 160], w: [244, 244, 244] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '.......w........',
  '.....bbbbb......',
  '....bbbbbbb.....',
  '...bbbdbbbbb....',
  '...bbbdbbbbb....',
  '...bbbdbbbbb....',
  '...dddddddddddd.',
  '...........dddd.',
  '................',
  '................',
  '................',
]);
art('hat', { w: [244, 244, 238], s: [206, 206, 198], k: [36, 36, 40] }, [
  '................',
  '................',
  '................',
  '................',
  '................',
  '......ww',
  '.....www',
  '....wwww',
  '....wwww',
  '....kkkk',
  '.wwwwwww',
  'wsssssss',
  '................',
  '................',
  '................',
  '................',
]);
art('jacket', { g: [76, 160, 70], d: [50, 120, 46], y: [232, 202, 60] }, [
  '................',
  '...gggd.',
  '.gggggdy',
  'ggggggdy',
  'gggggggy',
  'gg.ggggy',
  'gg.ggggy',
  'gg.ggggy',
  'gg.ggggy',
  'gg.ggggy',
  'dd.ggggy',
  '...ggggy',
  '...ddddy',
  '................',
  '................',
  '................',
]);
art('sweater', { w: [242, 238, 226], s: [214, 208, 196], b: [70, 110, 200] }, [
  '................',
  '...wwws.',
  '.wwwwwww',
  'wwwwwwww',
  'wwwwwwww',
  'ww.wwwww',
  'bb.bbbbb',
  'ww.wwwww',
  'ww.wwwww',
  'ww.wwwww',
  'ss.wwwww',
  '...wwwww',
  '...sssss',
  '................',
  '................',
  '................',
]);
art('skirt', { b: [60, 110, 222], d: [40, 80, 170] }, [
  '................',
  '................',
  '....dddd',
  '....bbbb',
  '...bbbbb',
  '...bbdbb',
  '..bbbbbb',
  '..bdbbdb',
  '.bbbbbbb',
  '.bdbbdbb',
  'bbbbbbbb',
  'dddddddd',
  '................',
  '................',
  '................',
  '................',
]);
art('gloves', { b: [60, 110, 212], w: [242, 242, 242] }, [
  '................',
  '................',
  '.b.b.b..',
  '.b.b.b..',
  '.bbbbb.b',
  '.bbbbbbb',
  '.bbbbbb.',
  '.bbbbb..',
  '.wwwww..',
  '.bbbbb..',
  '.wwwww..',
  '................',
  '................',
  '................',
  '................',
  '................',
]);
art('sheep', { w: [242, 242, 238], s: [206, 206, 200], k: [44, 44, 48], e: [250, 250, 250] }, [
  '................',
  '................',
  '................',
  '................',
  '....wwwwww......',
  '...wwswwwsww....',
  '..wwwwwwwwwwkk..',
  '.wwswwwwswwkkkk.',
  '.wwwwwwwwwwkekk.',
  '.wwwwswwwwwkkk..',
  '..wwwwwwwwww....',
  '...wwwswwww.....',
  '...k.k...k.k....',
  '...k.k...k.k....',
  '...k.k...k.k....',
  '................',
]);
art('cow', { w: [244, 244, 240], k: [36, 36, 40], p: [238, 160, 170], n: [232, 222, 190] }, [
  '................',
  '................',
  '................',
  '.............n..',
  '...........kkkn.',
  '...........kwkk.',
  '..wwkkwwwwwkkkk.',
  '.wwkkkwwwkkwwpp.',
  'kwwwkwwwwkkwwpp.',
  '.wwwwwwkkkwww...',
  '.wkkwwwkkwwww...',
  '.wwwwwwwwwwww...',
  '.ww.ww...ww.ww..',
  '.ww.ww...ww.ww..',
  '.kk.kk...kk.kk..',
  '................',
]);
art('cotton_plant', { g: [70, 140, 50], w: [250, 250, 250], b: [140, 100, 60] }, [
  '................',
  '....ww....ww....',
  '...wwww..wwww...',
  '....bw....wb....',
  '.....g....g.....',
  '..ww..g..g..ww..',
  '.wwww..gg..wwww.',
  '..bw...gg...wb..',
  '....g..gg..g....',
  '.....gggggg.....',
  '.......gg.......',
  '.......gg.......',
  '.......gg.......',
  '.......gg.......',
  '.......gg.......',
  '......gggg......',
]);
art('bird', { b: [70, 120, 210], d: [44, 86, 168], y: [244, 182, 40], k: INK, w: [250, 250, 250] }, [
  '................',
  '................',
  '................',
  '................',
  '......bbb.......',
  '.....bwkbb......',
  '.....bbbbbyy....',
  '..d..bbbbb......',
  '..ddbbbbbbb.....',
  '...ddbbbbbbb....',
  '....dbbbbbbb....',
  '.....bbbbbb.....',
  '......y..y......',
  '................',
  '................',
  '................',
]);
art('cool_cat', { o: [232, 140, 52], d: [190, 100, 30], k: INK, p: [240, 150, 170], w: [250, 246, 236], h: [226, 84, 150], s: [140, 82, 204] }, [
  '................',
  '...........hhh..',
  '...........hhh..',
  '.........hhhhhhh',
  '..........ooooo.',
  '..........okoko.',
  '..........oopoo.',
  '...........www..',
  '..o.......oww...',
  '.o.....oooooo...',
  '.o....oodoodo...',
  '.oo..ssssssss...',
  '..ooossssssss...',
  '....ssssssssss..',
  '....ww..ww.ww...',
  '................',
]);

for (const pair of WOOL_COLOURS) {
  const rgb = [(pair[1] >> 16) & 255, (pair[1] >> 8) & 255, pair[1] & 255];
  tile(pair[0] + '_wool', (p) => { p.fill(rgb, 12); p.speckle(26, [rgb[0] - 16, rgb[1] - 16, rgb[2] - 16], 8); });
}
tile('water', (p) => {
  p.fill([50, 96, 200], 14, 190);
  p.speckle(20, [80, 130, 226], 10);
});

// -------------------------------------------------------------- build it
export const ROWS = Math.ceil(defs.length / COLS);
export const ATLAS_W = COLS * TILE;
export const ATLAS_H = ROWS * TILE;

export const atlasCanvas = document.createElement('canvas');
atlasCanvas.width = ATLAS_W;
atlasCanvas.height = ATLAS_H;

export function buildAtlas() {
  const ctx = atlasCanvas.getContext('2d');
  ctx.clearRect(0, 0, ATLAS_W, ATLAS_H);
  defs.forEach((d, i) => {
    const img = ctx.createImageData(TILE, TILE);
    let seed = 0;
    for (let k = 0; k < d.name.length; k++) seed = (seed * 31 + d.name.charCodeAt(k)) >>> 0;
    const p = painter(img.data, seed || 1);
    p.fill([255, 0, 255], 0); // magenta = a tile that forgot to paint itself
    d.draw(p);
    ctx.putImageData(img, (i % COLS) * TILE, Math.floor(i / COLS) * TILE);
  });
  return atlasCanvas;
}

// UV rectangle for a tile name, inset slightly so neighbouring tiles never
// bleed in along a face edge.
const EPS = 0.0001;
export function tileUV(name) {
  const i = TILE_INDEX[name];
  if (i === undefined) { console.warn('unknown tile', name); return { u0: 0, v0: 0, u1: 1, v1: 1 }; }
  const cx = i % COLS, cy = Math.floor(i / COLS);
  return {
    u0: cx / COLS + EPS,
    u1: (cx + 1) / COLS - EPS,
    // canvas y grows downward, texture v grows upward
    v0: 1 - (cy + 1) / ROWS + EPS,
    v1: 1 - cy / ROWS - EPS,
  };
}

// Average colour of a tile — used for particles and map-ish UI dots.
const avgCache = {};
export function tileAverage(name) {
  if (avgCache[name]) return avgCache[name];
  const i = TILE_INDEX[name] || 0;
  const ctx = atlasCanvas.getContext('2d');
  const d = ctx.getImageData((i % COLS) * TILE, Math.floor(i / COLS) * TILE, TILE, TILE).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let k = 0; k < d.length; k += 4) {
    if (d[k + 3] < 128) continue;
    r += d[k]; g += d[k + 1]; b += d[k + 2]; n++;
  }
  n = n || 1;
  const c = ((r / n) << 16) | ((g / n) << 8) | (b / n);
  avgCache[name] = c;
  return c;
}

// Sanity check: every tile a block references must exist in the atlas.
export function validateTiles() {
  const missing = new Set();
  for (const b of BLOCKS) {
    if (b.name === 'air') continue;
    for (const key of ['top', 'bottom', 'side', 'front']) {
      const t = b.tiles[key];
      if (t && TILE_INDEX[t] === undefined) missing.add(b.name + '.' + key + ' -> ' + t);
    }
  }
  if (missing.size) console.warn('Missing atlas tiles:', [...missing]);
  return missing;
}
