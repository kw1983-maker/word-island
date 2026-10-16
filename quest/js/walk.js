// Treasure Quest · walking: BlockWords' player (bw/player.js) moved by the controls, with the camera
// at its eye (spec 0005). Runs inside the engine's fixed 60 steps a second.
import { Player, PLAYER_CONST } from "./bw/player.js";
import { controls } from "./controls.js";

let player = null;
let camera = null;

export const walk = {
  // island start: { x, y, z } feet position and yaw (facing).
  start(world, start, cam) {
    camera = cam;
    player = new Player(world);
    player.pos.set(start.x, start.y, start.z);
    player.yaw = start.yaw || 0;
    player.pitch = start.pitch || 0;
    controls.onLook((dx, dy) => player.look(dx, dy));
    place();
    return player;
  },

  update(dt) {
    if (!player) return;
    controls.step(dt);
    player.update(dt, controls.input);
    place();
  },

  player: () => player
};

// The camera sits at the eye, looking where the player looks.
function place() {
  player.eye(camera.position);
  camera.rotation.order = "YXZ";
  camera.rotation.set(player.pitch, player.yaw, 0);
}

export { PLAYER_CONST };
