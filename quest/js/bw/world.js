// Adapted from BlockWords js/world.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// BlockWords streams an endless world around the player; an island is small and fixed, so IslandWorld
// builds all 4×4 chunks once from a list of placed blocks (spec 0004). Kept as in BlockWords: getChunk,
// getBlock, getSky, getBlockLight, setBlock, highestBlockAt, raycast and remesh, so walking (feature 6)
// and mining (feature 23) can use them. Removed: streaming, unloading and save deltas.
// A ring of unmeshed sea chunks sits round the island, so its edges are lit and culled as if the sea
// carried on; buildSea() draws that sea out to the horizon.

import * as THREE from 'three';
import { B } from './blocks.js';
import { CHUNK_X, CHUNK_Y, CHUNK_Z, idx } from './worldgen.js';
import { Chunk, computeLight, buildGeometry } from './chunk.js';

export const ISLAND_CHUNKS = 4;                       // 4×4 chunks: an island is at most 64×64 blocks
export const ISLAND_SIZE = ISLAND_CHUNKS * CHUNK_X;
const WATER_TOP = 0.88;                               // chunk.js lowers a water surface by 0.12
const SEA_REACH = 700;                                // blocks of sea drawn round the island

const key = (cx, cz) => cx + ',' + cz;
const inIsland = (cx, cz) => cx >= 0 && cz >= 0 && cx < ISLAND_CHUNKS && cz < ISLAND_CHUNKS;

export class IslandWorld {
  constructor(scene, materials, seaLevel) {
    this.scene = scene;
    this.materials = materials;
    this.seaLevel = seaLevel;
    this.chunks = new Map();      // 'cx,cz' -> Chunk
    this.group = new THREE.Group();
    this.group.matrixAutoUpdate = false;
    scene.add(this.group);
    this.stats = { meshed: 0, buildMs: 0, skipped: 0 };
  }

  // ------------------------------------------------------------- chunk access
  getChunk(cx, cz, create = false) {
    const k = key(cx, cz);
    let c = this.chunks.get(k);
    if (!c && create) {
      c = new Chunk(cx, cz);
      this.chunks.set(k, c);
    }
    return c || null;
  }

  // ------------------------------------------------------------- building
  // Places every block and lights and meshes the whole island in one go, while the
  // loading card shows. placed: [{ x, y, z, kind }] or fill boxes [{ x0, x1, y0, y1, z0, z1, kind }].
  build(placed) {
    const start = performance.now();
    for (let cx = -1; cx <= ISLAND_CHUNKS; cx++) {
      for (let cz = -1; cz <= ISLAND_CHUNKS; cz++) {
        const c = this.getChunk(cx, cz, true);
        if (!inIsland(cx, cz)) this.fillSea(c);
        c.generated = true;
      }
    }
    placed.forEach((block) => this.place(block));
    for (const c of this.chunks.values()) computeLight(c, this);
    // A second pass lets light seeded from a neighbour's edge settle across borders.
    for (const c of this.chunks.values()) computeLight(c, this);
    for (const c of this.chunks.values()) {
      c.lightDirty = false;
      if (inIsland(c.cx, c.cz)) this.remesh(c);
    }
    this.stats.buildMs = performance.now() - start;
  }

  fillSea(chunk) {
    for (let x = 0; x < CHUNK_X; x++) {
      for (let z = 0; z < CHUNK_Z; z++) {
        for (let y = 0; y <= this.seaLevel; y++) chunk.data[idx(x, y, z)] = y === 0 ? B.BEDROCK : B.WATER;
      }
    }
  }

  place(block) {
    const id = B[String(block.kind).toUpperCase()];
    if (id === undefined || !block.kind) {
      this.stats.skipped += 1;
      console.warn(`Treasure Quest: no block called "${block.kind}", skipped.`);
      return;
    }
    if (block.x0 !== undefined) {
      for (let x = block.x0; x <= block.x1; x++) {
        for (let y = block.y0; y <= block.y1; y++) {
          for (let z = block.z0; z <= block.z1; z++) this.put(x, y, z, id);
        }
      }
    } else {
      this.put(block.x, block.y, block.z, id);
    }
  }

  // Island cells only: blocks outside 0..63 or 0..31 are ignored.
  put(x, y, z, id) {
    if (x < 0 || z < 0 || x >= ISLAND_SIZE || z >= ISLAND_SIZE || y < 0 || y >= CHUNK_Y) return;
    const c = this.getChunk(Math.floor(x / CHUNK_X), Math.floor(z / CHUNK_Z), false);
    c.data[idx(x - c.cx * CHUNK_X, y, z - c.cz * CHUNK_Z)] = id;
  }

  // Lights and meshes again whatever setBlock marked (mining and placing, feature 23).
  rebuildDirty() {
    for (const c of this.chunks.values()) {
      if (!c.lightDirty) continue;
      computeLight(c, this);
      c.lightDirty = false;
      c.dirty = true;
    }
    for (const c of this.chunks.values()) {
      if (c.dirty && inIsland(c.cx, c.cz)) this.remesh(c);
    }
  }

  // ------------------------------------------------------------- block access
  getBlock(wx, wy, wz) {
    if (wy < 0 || wy >= CHUNK_Y) return B.AIR;
    const cx = Math.floor(wx / CHUNK_X), cz = Math.floor(wz / CHUNK_Z);
    const c = this.chunks.get(key(cx, cz));
    if (!c || !c.generated) return wy <= this.seaLevel ? B.WATER : B.AIR;
    return c.data[idx(wx - cx * CHUNK_X, wy, wz - cz * CHUNK_Z)];
  }

  getSky(wx, wy, wz) {
    if (wy >= CHUNK_Y) return 15;
    if (wy < 0) return 0;
    const cx = Math.floor(wx / CHUNK_X), cz = Math.floor(wz / CHUNK_Z);
    const c = this.chunks.get(key(cx, cz));
    if (!c || !c.lit) return 15;
    return c.sky[idx(wx - cx * CHUNK_X, wy, wz - cz * CHUNK_Z)];
  }

  getBlockLight(wx, wy, wz) {
    if (wy < 0 || wy >= CHUNK_Y) return 0;
    const cx = Math.floor(wx / CHUNK_X), cz = Math.floor(wz / CHUNK_Z);
    const c = this.chunks.get(key(cx, cz));
    if (!c || !c.lit) return 0;
    return c.blockLight[idx(wx - cx * CHUNK_X, wy, wz - cz * CHUNK_Z)];
  }

  // Changes one island block and marks what must be lit and meshed again (call rebuildDirty after).
  setBlock(wx, wy, wz, id) {
    if (wy < 0 || wy >= CHUNK_Y) return false;
    const cx = Math.floor(wx / CHUNK_X), cz = Math.floor(wz / CHUNK_Z);
    if (!inIsland(cx, cz)) return false;
    const c = this.getChunk(cx, cz, false);
    const lx = wx - cx * CHUNK_X, lz = wz - cz * CHUNK_Z;
    const k = idx(lx, wy, lz);
    if (c.data[k] === id) return false;
    c.data[k] = id;
    c.dirty = true;
    c.lightDirty = true;
    // Anything within a block of a border, or any light change at all, can
    // affect the neighbouring chunk's faces and lighting.
    for (const [ox, oz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const n = this.getChunk(cx + ox, cz + oz, false);
      if (!n) continue;
      n.lightDirty = true;
      const touching = (ox === -1 && lx === 0) || (ox === 1 && lx === CHUNK_X - 1) ||
                       (oz === -1 && lz === 0) || (oz === 1 && lz === CHUNK_Z - 1);
      if (touching) n.dirty = true;
    }
    return true;
  }

  highestBlockAt(wx, wz) {
    for (let y = CHUNK_Y - 1; y >= 0; y--) {
      const id = this.getBlock(wx, y, wz);
      if (id !== B.AIR && id !== B.WATER) return y;
    }
    return -1;
  }

  // ------------------------------------------------------------------ raycast
  // Amanatides & Woo voxel traversal — exact, and never steps past a block.
  raycast(origin, dir, maxDist = 5, includeLiquid = false) {
    let x = Math.floor(origin.x), y = Math.floor(origin.y), z = Math.floor(origin.z);
    const stepX = dir.x > 0 ? 1 : -1, stepY = dir.y > 0 ? 1 : -1, stepZ = dir.z > 0 ? 1 : -1;
    const tDeltaX = Math.abs(1 / (dir.x || 1e-9));
    const tDeltaY = Math.abs(1 / (dir.y || 1e-9));
    const tDeltaZ = Math.abs(1 / (dir.z || 1e-9));
    const distX = stepX > 0 ? x + 1 - origin.x : origin.x - x;
    const distY = stepY > 0 ? y + 1 - origin.y : origin.y - y;
    const distZ = stepZ > 0 ? z + 1 - origin.z : origin.z - z;
    let tMaxX = tDeltaX * distX, tMaxY = tDeltaY * distY, tMaxZ = tDeltaZ * distZ;
    let face = [0, 0, 0];
    let t = 0;

    while (t <= maxDist) {
      const id = this.getBlock(x, y, z);
      if (id !== B.AIR && (includeLiquid || id !== B.WATER)) {
        return { x, y, z, id, face, distance: t };
      }
      if (tMaxX < tMaxY && tMaxX < tMaxZ) {
        x += stepX; t = tMaxX; tMaxX += tDeltaX; face = [-stepX, 0, 0];
      } else if (tMaxY < tMaxZ) {
        y += stepY; t = tMaxY; tMaxY += tDeltaY; face = [0, -stepY, 0];
      } else {
        z += stepZ; t = tMaxZ; tMaxZ += tDeltaZ; face = [0, 0, -stepZ];
      }
    }
    return null;
  }

  remesh(chunk) {
    const geo = buildGeometry(chunk, this);
    const px = chunk.cx * CHUNK_X, pz = chunk.cz * CHUNK_Z;

    if (chunk.mesh) { this.group.remove(chunk.mesh); chunk.mesh.geometry.dispose(); chunk.mesh = null; }
    if (chunk.waterMesh) { this.group.remove(chunk.waterMesh); chunk.waterMesh.geometry.dispose(); chunk.waterMesh = null; }

    if (geo.opaque) {
      const m = new THREE.Mesh(geo.opaque, this.materials.solid);
      m.position.set(px, 0, pz);
      m.updateMatrix();
      this.group.add(m);
      chunk.mesh = m;
    }
    if (geo.water) {
      const m = new THREE.Mesh(geo.water, this.materials.water);
      m.position.set(px, 0, pz);
      m.updateMatrix();
      m.renderOrder = 1;
      this.group.add(m);
      chunk.waterMesh = m;
    }
    chunk.dirty = false;
    this.stats.meshed++;
  }
}

// The sea beyond the island: a flat frame of water round the 64×64 island at the water blocks'
// surface height, using the water tile and the world's own shader, so it joins the island's water
// and fades into the sky fog. waterTexture is a repeating copy of the atlas's water tile.
export function buildSea(materials, seaLevel, waterTexture) {
  const sea = new THREE.ShaderMaterial({
    uniforms: Object.assign({}, materials.water.uniforms, { map: { value: waterTexture } }),
    vertexShader: materials.water.vertexShader,
    fragmentShader: materials.water.fragmentShader,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const y = seaLevel + WATER_TOP;
  const n = ISLAND_SIZE;
  const r = SEA_REACH;
  // Four strips round the island: north, south, west, east.
  const strips = [[-r, -r, n + r, 0], [-r, n, n + r, n + r], [-r, 0, 0, n], [n, 0, n + r, n]];
  const pos = [], uv = [], lit = [], ind = [];
  strips.forEach(([x0, z0, x1, z1]) => {
    const base = pos.length / 3;
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(([x, z]) => {
      pos.push(x, y, z);
      uv.push(x, z);                   // one tile per block, repeating
      lit.push(1, 0, 1);               // full sky light, no block light, no shading
    });
    ind.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('alight', new THREE.Float32BufferAttribute(lit, 3));
  g.setIndex(ind);
  const mesh = new THREE.Mesh(g, sea);
  mesh.renderOrder = 1;
  return mesh;
}
