// Copied from BlockWords js/noise.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// Only the seeded random numbers are kept: the atlas and the clouds need them, so their pixels match BlockWords.

// Fast 32-bit seeded PRNG (Mulberry32). Returns a function giving 0..1.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
