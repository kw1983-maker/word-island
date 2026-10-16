// Adapted from BlockWords js/items.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// Only the block icons are kept: a block drawn as a small isometric cube from its atlas tiles
// (a flat sprite for flowers and signs), for the hotbar and the hand. Tools, food and the item
// registry stay in BlockWords until mining and crafting (features 23 and 24) need them.

import { BLOCKS, B } from './blocks.js';
import { atlasCanvas, TILE, COLS, TILE_INDEX } from './atlas.js';

const iconCache = new Map();

function tileSrc(tileName) {
  const i = TILE_INDEX[tileName];
  if (i === undefined) return null;
  return { sx: (i % COLS) * TILE, sy: Math.floor(i / COLS) * TILE };
}

// Map a 16x16 tile onto a parallelogram, so a flat texture becomes a cube face.
function drawFace(g, tile, ox, oy, ux, uy, vx, vy, shade) {
  const src = tileSrc(tile);
  if (!src) return;
  g.save();
  g.setTransform(ux / TILE, uy / TILE, vx / TILE, vy / TILE, ox, oy);
  g.imageSmoothingEnabled = false;
  g.drawImage(atlasCanvas, src.sx, src.sy, TILE, TILE, 0, 0, TILE, TILE);
  if (shade < 1) {
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(0,0,0,' + (1 - shade).toFixed(3) + ')';
    g.fillRect(0, 0, TILE, TILE);
  }
  g.restore();
  g.globalCompositeOperation = 'source-over';
}

function blockIcon(bdef) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;

  if (bdef.render === 'cross') { // flowers, torches: show the sprite flat
    const src = tileSrc(bdef.tiles.side);
    if (src) g.drawImage(atlasCanvas, src.sx, src.sy, TILE, TILE, 2, 2, 28, 28);
    return c;
  }
  // Isometric cube: top rhombus, then the two visible side faces.
  drawFace(g, bdef.tiles.top, 2, 11, 14, -8, 14, 8, 1.0);
  drawFace(g, bdef.tiles.side, 2, 11, 14, 8, 0, 12, 0.72);
  drawFace(g, bdef.tiles.side, 16, 19, 14, -8, 0, 12, 0.55);
  return c;
}

// A data URL picture of a block, by name (the atlas must be built first). Null for an unknown name.
export function blockIconUrl(name) {
  if (iconCache.has(name)) return iconCache.get(name);
  const id = B[String(name).toUpperCase()];
  if (id === undefined) return null;
  const url = blockIcon(BLOCKS[id]).toDataURL();
  iconCache.set(name, url);
  return url;
}

export function blockLabel(name) {
  const id = B[String(name).toUpperCase()];
  return id === undefined ? name : BLOCKS[id].label;
}
