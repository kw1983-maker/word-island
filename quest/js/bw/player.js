// Adapted from BlockWords js/player.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// The first person body: walking, voxel collision, gravity, jumping, wading, the automatic step up
// onto one block ledges and the unstick rescue, unchanged. Removed (spec 0005): health, hunger,
// breath, fall damage, running, crouching, respawn and the void check. Nothing can hurt a pupil.

import * as THREE from 'three';
import { B, BLOCKS } from './blocks.js';

const WIDTH = 0.6, HEIGHT = 1.8, EYE = 1.62;
const HALF = WIDTH / 2;
const GRAVITY = 30;
const JUMP_V = 9.2;
const WALK = 4.4, SWIM = 3.2;

export const PLAYER_CONST = { WIDTH, HEIGHT, EYE, WALK, JUMP_V };

export class Player {
  constructor(world) {
    this.world = world;
    this.pos = new THREE.Vector3(0, 20, 0);   // feet position
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = false;
    this.inWater = false;
    this.headInWater = false;
    this.jumped = false;   // true on the step a jump starts (for its sound)
  }

  eye(out = new THREE.Vector3()) {
    return out.set(this.pos.x, this.pos.y + EYE, this.pos.z);
  }

  forward(out = new THREE.Vector3()) {
    return out.set(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
  }

  look(dx, dy) {
    this.yaw -= dx;
    this.pitch -= dy;
    const lim = Math.PI / 2 - 0.001;
    this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
  }

  // ------------------------------------------------------------- collision
  boxHits(px, py, pz) {
    const x0 = Math.floor(px - HALF), x1 = Math.floor(px + HALF);
    const y0 = Math.floor(py), y1 = Math.floor(py + HEIGHT - 0.001);
    const z0 = Math.floor(pz - HALF), z1 = Math.floor(pz + HALF);
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        for (let z = z0; z <= z1; z++) {
          if (BLOCKS[this.world.getBlock(x, y, z)].solid) return true;
        }
      }
    }
    return false;
  }

  groundUnder(px, py, pz) {
    const x0 = Math.floor(px - HALF), x1 = Math.floor(px + HALF);
    const z0 = Math.floor(pz - HALF), z1 = Math.floor(pz + HALF);
    const y = Math.floor(py - 0.08);
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        if (BLOCKS[this.world.getBlock(x, y, z)].solid) return true;
      }
    }
    return false;
  }

  liquidAt(px, py, pz) {
    return this.world.getBlock(Math.floor(px), Math.floor(py), Math.floor(pz)) === B.WATER;
  }

  // ------------------------------------------------------------------ update
  // input: { forward, strafe (each -1..1), jump (boolean) }
  update(dt, input) {
    dt = Math.min(dt, 0.05); // never let a stutter teleport the player
    this.jumped = false;

    this.inWater = this.liquidAt(this.pos.x, this.pos.y + 0.4, this.pos.z);
    this.headInWater = this.liquidAt(this.pos.x, this.pos.y + EYE, this.pos.z);

    // --- desired horizontal velocity from the controls, turned by where we look.
    // A joystick pushed part way walks slower; a full push or a key walks at full speed.
    const speed = this.inWater ? SWIM : WALK;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    let mx = input.strafe * cos - input.forward * sin;
    let mz = -input.strafe * sin - input.forward * cos;
    const len = Math.hypot(mx, mz);
    if (len > 0) {
      const push = Math.min(1, len);
      mx = (mx / len) * speed * push;
      mz = (mz / len) * speed * push;
    }

    // Ground control is snappy; air control deliberately is not.
    const control = this.onGround ? 1 : this.inWater ? 0.5 : 0.16;
    this.vel.x += (mx - this.vel.x) * Math.min(1, control * dt * 18);
    this.vel.z += (mz - this.vel.z) * Math.min(1, control * dt * 18);

    // --- vertical
    if (this.inWater) {
      this.vel.y += (input.jump ? 5.2 : -3.4) * dt * 6;
      this.vel.y = Math.max(-4, Math.min(4.5, this.vel.y));
      this.vel.y *= 0.86;
    } else {
      this.vel.y -= GRAVITY * dt;
      if (input.jump && this.onGround) {
        this.vel.y = JUMP_V;
        this.onGround = false;
        this.jumped = true;
      }
    }

    this.moveAxis(dt);
    this.unstick();
    return len > 0;
  }

  // Last-resort rescue. If the player somehow ends up inside solid blocks they
  // cannot move at all, which to a seven-year-old just looks like the game
  // broke. Lift them out to the nearest free space above.
  unstick() {
    if (!this.boxHits(this.pos.x, this.pos.y, this.pos.z)) { this.stuckFor = 0; return; }
    this.stuckFor = (this.stuckFor || 0) + 1;
    for (let up = 1; up <= 6; up++) {
      if (!this.boxHits(this.pos.x, this.pos.y + up, this.pos.z)) {
        this.pos.y += up;
        this.vel.set(0, 0, 0);
        this.stuckFor = 0;
        return;
      }
    }
    // Fully buried: put them back on the surface of this column.
    if (this.stuckFor > 20) {
      const top = this.world.highestBlockAt(Math.floor(this.pos.x), Math.floor(this.pos.z));
      if (top > 0) {
        this.pos.y = top + 1.05;
        this.vel.set(0, 0, 0);
        this.stuckFor = 0;
      }
    }
  }

  moveAxis(dt) {
    // --- horizontal, one axis at a time, with a step-up for 1-block ledges
    for (const axis of ['x', 'z']) {
      const delta = this.vel[axis] * dt;
      if (delta === 0) continue;
      const old = this.pos[axis];
      this.pos[axis] += delta;
      if (this.boxHits(this.pos.x, this.pos.y, this.pos.z)) {
        let stepped = false;
        if (this.onGround || this.inWater) {
          const tryY = this.pos.y + 1.02;
          if (!this.boxHits(this.pos.x, tryY, this.pos.z)) {
            this.pos.y = tryY;
            stepped = true;
          }
        }
        if (!stepped) { this.pos[axis] = old; this.vel[axis] = 0; }
      }
    }

    // --- vertical
    const dy = this.vel.y * dt;
    this.pos.y += dy;
    if (this.boxHits(this.pos.x, this.pos.y, this.pos.z)) {
      if (dy < 0) {
        this.pos.y = Math.floor(this.pos.y) + 1;   // feet land on top of the block below
      } else {
        // Bumping a ceiling: the head stops just under it. This has to be
        // measured from the HEAD — measuring from the feet pushes the player
        // down through the floor and leaves them stuck inside the terrain.
        this.pos.y = Math.floor(this.pos.y + HEIGHT) - HEIGHT - 0.001;
      }
      this.vel.y = 0;
    }
    this.onGround = this.groundUnder(this.pos.x, this.pos.y, this.pos.z) && this.vel.y <= 0.001;
    if (this.onGround && this.vel.y < 0) this.vel.y = 0; // otherwise gravity keeps building while stood still
  }
}
