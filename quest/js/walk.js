// Treasure Quest · walking: BlockWords' player (bw/player.js) moved by the controls, with the camera
// at its eye (spec 0005). Runs inside the engine's fixed 60 steps a second.
// The safety net: shallow water is fine to paddle in, but deep water (water with more water under it)
// or leaving the island puts the pupil back on the last dry ground they stood on.
import { Player, PLAYER_CONST } from "./bw/player.js";
import { B, BLOCKS } from "./bw/blocks.js";
import { ISLAND_SIZE } from "./bw/world.js";
import { controls } from "./controls.js";
import { sound } from "./sound.js";
import { notice } from "./notice.js";

let player = null;
let camera = null;
let world = null;
let lastSafe = null;   // the last feet position on dry, solid ground
let rescues = 0;
let stepTimer = 0;     // seconds walked since the last step sound
let bobPhase = 0;      // where the gentle head bob is in its swing
const STEP_EVERY = 0.4;
const BOB = 0.045;     // blocks up and down
const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)");

function blockAt(x, y, z) {
  return world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
}

// Feet in water with more water under them, or off the 64 by 64 island.
function inDanger(pos) {
  if (pos.x < 0 || pos.z < 0 || pos.x >= ISLAND_SIZE || pos.z >= ISLAND_SIZE) return true;
  return blockAt(pos.x, pos.y, pos.z) === B.WATER && blockAt(pos.x, pos.y - 1, pos.z) === B.WATER;
}

function rememberSafe() {
  if (!player.onGround || player.inWater) return;
  const under = blockAt(player.pos.x, player.pos.y - 0.08, player.pos.z);
  // The middle of the dry block, so a rescue never leaves the pupil on the very edge of the water.
  if (under !== B.WATER && BLOCKS[under].solid) {
    lastSafe.set(Math.floor(player.pos.x) + 0.5, player.pos.y, Math.floor(player.pos.z) + 0.5);
  }
}

function rescue() {
  player.pos.copy(lastSafe);
  player.vel.set(0, 0, 0);
  // Stop: the pupil presses again to walk on, rather than walking straight back into the sea.
  controls.clear();
  rescues += 1;
  sound.play("splash");
  notice("Back to the beach!");
}

export const walk = {
  // island start: { x, y, z } feet position and yaw (facing).
  start(islandWorld, start, cam) {
    camera = cam;
    world = islandWorld;
    player = new Player(world);
    player.pos.set(start.x, start.y, start.z);
    player.yaw = start.yaw || 0;
    player.pitch = start.pitch || 0;
    lastSafe = player.pos.clone();
    controls.onLook((dx, dy) => player.look(dx, dy));
    place();
    return player;
  },

  update(dt) {
    if (!player) return;
    controls.step(dt);
    const moving = player.update(dt, controls.input);
    if (player.jumped) sound.play("jump");
    if (inDanger(player.pos)) rescue();
    else rememberSafe();
    feel(dt, moving);
    place();
  },

  player: () => player,
  // For the debug view.
  state: () => ({ lastSafe, rescues })
};

// Steps sound like the block underfoot (BlockWords' step sounds), and the view bobs a little while
// walking on the ground, unless the device asks for reduced motion.
function feel(dt, moving) {
  const walking = moving && player.onGround && !player.inWater;
  if (!walking) {
    stepTimer = STEP_EVERY * 0.75; // the first step sounds soon after setting off
    bobPhase = 0;
    return;
  }
  stepTimer += dt;
  if (stepTimer >= STEP_EVERY) {
    stepTimer = 0;
    const id = blockAt(player.pos.x, player.pos.y - 0.08, player.pos.z);
    sound.play("step", { block: BLOCKS[id].name });
  }
  bobPhase += dt * 8;
}

// The camera sits at the eye, looking where the player looks.
function place() {
  player.eye(camera.position);
  if (!(still && still.matches)) camera.position.y += Math.sin(bobPhase * 2) * BOB;
  camera.rotation.order = "YXZ";
  camera.rotation.set(player.pitch, player.yaw, 0);
}

export { PLAYER_CONST };
