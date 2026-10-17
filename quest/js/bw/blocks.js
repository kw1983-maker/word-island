// Copied from BlockWords js/blocks.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// Trimmed to the blocks an island, mining and crafting can use (spec 0004): no ores, other woods,
// snow, ice, cactus, pumpkin, crops, farmland, torches, glowstone, furnace or bed. Leaves and tall
// grass drop nothing (BlockWords drops apples and wheat). Added: wet_sand, and the beach things of
// spec 0006 (palm leaves, shells, fish, a football, kites, a bucket and spade, flags, a towel, a koala
// and a fishing rod), the gold and open chests of spec 0007, and the pet show things of spec 0011
// (twelve animals, a giraffe's neck, a spider web, a school bag and a pencil case), and the clothes
// town things of spec 0012 (eleven clothes, a sheep, a cow, a cotton plant, a bird and the cool cat),
// and the lunchtime town things of spec 0013 (sixteen foods, a hot dog, corn and bean plants).

// The block registry. Every voxel in the world is one byte — an index into
// BLOCKS. Ids are assigned in registration order, so ALWAYS refer to blocks by
// name through B (B.STONE), never by a hardcoded number.

export const B = {};      // 'STONE' -> id
export const BLOCKS = []; // id -> definition

// Tool tiers. A block only drops its item if the tool tier is >= its `needs`.
export const TIER = { HAND: 0, WOOD: 1, STONE: 2, IRON: 3, DIAMOND: 4 };
export const TIER_SPEED = [1, 2, 4, 6, 8]; // mining speed multiplier per tier

function def(name, o = {}) {
  const id = BLOCKS.length;
  const tiles = typeof o.tiles === 'string'
    ? { top: o.tiles, bottom: o.tiles, side: o.tiles }
    : Object.assign({ top: name, bottom: name, side: name }, o.tiles || {});
  const b = {
    id,
    name,
    label: o.label || name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    tiles,
    render: o.render || 'cube',       // cube | cross | liquid
    solid: o.solid !== undefined ? o.solid : true,
    opaque: o.opaque !== undefined ? o.opaque : (o.render || 'cube') === 'cube',
    hardness: o.hardness !== undefined ? o.hardness : 1,
    tool: o.tool || null,             // pickaxe | axe | shovel | null
    needs: o.needs || TIER.HAND,
    light: o.light || 0,
    drops: o.drops !== undefined ? o.drops : name, // item name or null
    interact: o.interact || null,     // crafting_table | chest | sign
    liquid: o.render === 'liquid',
    height: o.height || 1,
  };
  BLOCKS.push(b);
  B[name.toUpperCase()] = id;
  return id;
}

// ---- air ----------------------------------------------------------------
def('air', { render: 'cube', solid: false, opaque: false, hardness: 0, drops: null });

// ---- stone family -------------------------------------------------------
def('bedrock', { hardness: -1, drops: null, tool: 'pickaxe' });   // negative = unbreakable
def('stone', { hardness: 1.5, tool: 'pickaxe', needs: TIER.WOOD, drops: 'cobblestone' });
def('cobblestone', { hardness: 2, tool: 'pickaxe', needs: TIER.WOOD });
def('dirt', { hardness: 0.5, tool: 'shovel' });
def('grass_block', {
  label: 'Grass Block', hardness: 0.6, tool: 'shovel', drops: 'dirt',
  tiles: { top: 'grass_top', bottom: 'dirt', side: 'grass_side' },
});
def('dirt_path', {
  label: 'Path', hardness: 0.6, tool: 'shovel', drops: 'dirt',
  tiles: { top: 'path_top', bottom: 'dirt', side: 'path_side' },
});
def('sand', { hardness: 0.5, tool: 'shovel' });
def('wet_sand', { label: 'Wet Sand', hardness: 0.5, tool: 'shovel' });
def('sandstone', {
  hardness: 0.8, tool: 'pickaxe', needs: TIER.WOOD,
  tiles: { top: 'sandstone_top', bottom: 'sandstone_top', side: 'sandstone' },
});
def('gravel', { hardness: 0.6, tool: 'shovel' });
def('clay', { hardness: 0.6, tool: 'shovel' });

// ---- wood ---------------------------------------------------------------
def('oak_log', { hardness: 2, tool: 'axe', tiles: { top: 'log_top', bottom: 'log_top', side: 'oak_log' } });
def('oak_planks', { hardness: 2, tool: 'axe', tiles: 'oak_planks' });
def('oak_leaves', { hardness: 0.2, opaque: false, drops: null });

// ---- plants (X-shaped billboards) ---------------------------------------
def('tall_grass', { label: 'Grass', render: 'cross', solid: false, hardness: 0.05, drops: null });
def('rose', { label: 'Red Flower', render: 'cross', solid: false, hardness: 0.05 });
def('dandelion', { label: 'Yellow Flower', render: 'cross', solid: false, hardness: 0.05 });
def('sugar_cane', { render: 'cross', solid: false, hardness: 0.1 });

// ---- crafted / utility --------------------------------------------------
def('glass', { hardness: 0.3, opaque: false, drops: null });
def('bricks', { hardness: 2, tool: 'pickaxe', needs: TIER.WOOD });
def('crafting_table', {
  hardness: 2.5, tool: 'axe', interact: 'crafting_table',
  tiles: { top: 'crafting_top', bottom: 'oak_planks', side: 'crafting_side' },
});
def('chest', {
  hardness: 2.5, tool: 'axe', interact: 'chest',
  tiles: { top: 'chest_top', bottom: 'chest_top', side: 'chest_side' },
});
// Treasure chests (spec 0007): a gold one for challenge questions, and open, empty ones once done.
def('gold_chest', { label: 'Gold Chest', hardness: 2.5, tool: 'axe', interact: 'chest', tiles: { top: 'gold_chest_top', bottom: 'gold_chest_top', side: 'gold_chest_side' } });
def('chest_open', { label: 'Open Chest', hardness: 2.5, tool: 'axe', tiles: { top: 'chest_open_top', bottom: 'chest_top', side: 'chest_open_side' } });
def('gold_chest_open', { label: 'Open Gold Chest', hardness: 2.5, tool: 'axe', tiles: { top: 'gold_chest_open_top', bottom: 'gold_chest_top', side: 'gold_chest_open_side' } });
def('sign', { render: 'cross', solid: false, hardness: 1, tool: 'axe', interact: 'sign', tiles: 'sign' });
def('bookshelf', { hardness: 1.5, tool: 'axe', tiles: { top: 'oak_planks', bottom: 'oak_planks', side: 'bookshelf' } });

// ---- beach things (spec 0006): sprites like flowers, a palm crown and a flat towel --------
def('palm_leaves', { hardness: 0.2, opaque: false, drops: null });
def('shell', { label: 'Shell', render: 'cross', solid: false, hardness: 0.05 });
def('fish', { render: 'cross', solid: false, hardness: 0.05 });
def('football', { render: 'cross', solid: false, hardness: 0.05 });
def('kite', { render: 'cross', solid: false, hardness: 0.05 });
def('kite_string', { label: 'Kite String', render: 'cross', solid: false, hardness: 0.05, drops: null });
def('bucket_spade', { label: 'Bucket and Spade', render: 'cross', solid: false, hardness: 0.05 });
def('flag_uk', { label: 'UK Flag', render: 'cross', solid: false, hardness: 0.1 });
def('flag_ca', { label: 'Canada Flag', render: 'cross', solid: false, hardness: 0.1 });
def('flag_au', { label: 'Australia Flag', render: 'cross', solid: false, hardness: 0.1 });
def('towel', { label: 'Beach Towel', solid: false, opaque: false, height: 1 / 16, hardness: 0.1 });
def('koala', { render: 'cross', solid: false, hardness: 0.05 });
def('fishing_rod', { label: 'Fishing Rod', render: 'cross', solid: false, hardness: 0.05 });

// ---- pet show things (spec 0011): animals, a web, a school bag and a pencil case, all sprites ------
for (const name of ['cat', 'dog', 'rat', 'frog', 'duck', 'lizard', 'spider', 'snake', 'butterfly', 'tiger', 'giraffe', 'crocodile']) {
  def(name, { render: 'cross', solid: false, hardness: 0.05 });
}
def('giraffe_neck', { label: 'Giraffe', render: 'cross', solid: false, hardness: 0.05 }); // stands on top of a giraffe
def('spider_web', { label: 'Spider Web', render: 'cross', solid: false, hardness: 0.05, drops: null });
def('school_bag', { label: 'School Bag', render: 'cross', solid: false, hardness: 0.05 });
def('pencil_case', { label: 'Pencil Case', render: 'cross', solid: false, hardness: 0.05 });

// ---- clothes town things (spec 0012): clothes, farm animals, a cotton plant, a bird and the cool cat ----
for (const name of ['jeans', 'socks', 'shoes', 'boots', 'cap', 'hat', 'jacket', 'sweater', 'skirt', 'gloves', 'sheep', 'cow', 'bird']) {
  def(name, { render: 'cross', solid: false, hardness: 0.05 });
}
def('tshirt', { label: 'T-shirt', render: 'cross', solid: false, hardness: 0.05 });
def('cotton_plant', { label: 'Cotton Plant', render: 'cross', solid: false, hardness: 0.05 });
def('cool_cat', { label: 'Cool Cat', render: 'cross', solid: false, hardness: 0.05 });

// ---- lunchtime town things (spec 0013): food, and plants where food grows ----
for (const name of ['pizza', 'sandwich', 'apple', 'banana', 'orange', 'cheese', 'cake', 'milk', 'juice', 'sausage', 'chicken', 'carrot', 'peas', 'onion', 'coconut', 'lunchbox']) {
  def(name, { render: 'cross', solid: false, hardness: 0.05 });
}
def('hot_dog', { label: 'Hot Dog', render: 'cross', solid: false, hardness: 0.05 });
def('corn_plant', { label: 'Corn', render: 'cross', solid: false, hardness: 0.05 });
def('bean_plant', { label: 'Beans', render: 'cross', solid: false, hardness: 0.05 });

// ---- wool: the colour vocabulary, one block per colour -------------------
export const WOOL_COLOURS = [
  ['white', 0xf0f0f0], ['red', 0xd23f3f], ['orange', 0xe07a24], ['yellow', 0xf2d13c],
  ['green', 0x4caf3f], ['blue', 0x3a6fd8], ['purple', 0x8b46c6], ['pink', 0xf08fc0],
  ['brown', 0x8a5a32], ['black', 0x2b2b2b],
];
for (const pair of WOOL_COLOURS) {
  const colour = pair[0];
  def(colour + '_wool', {
    label: colour.charAt(0).toUpperCase() + colour.slice(1) + ' Wool',
    hardness: 0.8,
  });
}

// ---- liquids ------------------------------------------------------------
def('water', { render: 'liquid', solid: false, opaque: false, hardness: -1, drops: null });

// ---- helpers ------------------------------------------------------------
export const AIR = B.AIR;

export function isOpaque(id) { return BLOCKS[id].opaque; }
export function isSolid(id) { return BLOCKS[id].solid; }
export function isLiquid(id) { return BLOCKS[id].liquid; }

// Faces of a cube share tiles unless a block defines a distinct front face.
// dir: 0=+x 1=-x 2=+y 3=-y 4=+z 5=-z
export function tileFor(bdef, dir) {
  if (dir === 2) return bdef.tiles.top;
  if (dir === 3) return bdef.tiles.bottom;
  if (bdef.tiles.front && dir === 4) return bdef.tiles.front;
  return bdef.tiles.side;
}

// Seconds to break a block (kept for mining, feature 23). The right tool speeds
// you up, the wrong tool is a slog, and a block you cannot harvest still breaks
// but drops nothing.
export function breakTime(id, toolType, tier) {
  const b = BLOCKS[id];
  if (b.hardness < 0) return Infinity;
  if (b.hardness === 0) return 0;
  const right = b.tool && b.tool === toolType;
  const speed = right ? TIER_SPEED[tier] : 1;
  let t = (b.hardness * 1.5) / speed;
  if (!canHarvest(id, toolType, tier)) t = (b.hardness * 5) / speed;
  return Math.max(0.05, t);
}

export function canHarvest(id, toolType, tier) {
  const b = BLOCKS[id];
  if (b.needs === TIER.HAND) return true;
  return b.tool === toolType && tier >= b.needs;
}
