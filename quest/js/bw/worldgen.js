// Copied from BlockWords js/worldgen.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// Only the chunk constants are kept: an island is placed block by block, never generated.
// CHUNK_Y is 32 here (BlockWords uses 128): an island is at most 32 blocks high (spec 0004).

export const CHUNK_X = 16;
export const CHUNK_Y = 32;
export const CHUNK_Z = 16;
export const CHUNK_VOL = CHUNK_X * CHUNK_Y * CHUNK_Z;

export function idx(x, y, z) { return ((x * CHUNK_Z + z) * CHUNK_Y) + y; }
