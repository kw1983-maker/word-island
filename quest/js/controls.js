// Treasure Quest · controls: what the pupil is asking the player to do, from the keyboard and mouse
// on a laptop (spec 0005). The phone joystick and buttons (touchpad.js) write into the same state.
// WASD walk and step sideways, the arrows walk and turn, Space jumps and E uses (BlockWords' keys,
// plus arrows that turn so a child can play with the keyboard alone).
import { screens } from "./screens.js";
import { panel } from "./panel.js";

const TURN = 2.4; // radians a second for the Left and Right arrows

const keys = new Set();
const input = { forward: 0, strafe: 0, turn: 0, jump: false, use: false };
// The phone joystick and buttons add to the keys (touchpad.js).
const touch = { forward: 0, strafe: 0, jump: false };
const lookListeners = [];
const useListeners = [];

// Keys reach the island only while it is running with nothing over it.
function playing() {
  const s = screens.state;
  return s.base === "running" && !s.covered && !panel.isOpen();
}

function axis(plus, minus) {
  return (plus ? 1 : 0) - (minus ? 1 : 0);
}

function read() {
  const has = (code) => keys.has(code);
  input.forward = Math.max(-1, Math.min(1, axis(has("KeyW") || has("ArrowUp"), has("KeyS") || has("ArrowDown")) + touch.forward));
  input.strafe = Math.max(-1, Math.min(1, axis(has("KeyD"), has("KeyA")) + touch.strafe));
  input.turn = axis(has("ArrowRight"), has("ArrowLeft"));
  input.jump = has("Space") || touch.jump;
}

const MOVE_KEYS = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];

window.addEventListener("keydown", (event) => {
  if (!playing() || event.ctrlKey || event.metaKey || event.altKey) return;
  if (MOVE_KEYS.includes(event.code)) {
    event.preventDefault(); // arrows and Space must not scroll or press a focused button
    keys.add(event.code);
    read();
  } else if (event.code === "KeyE" && !event.repeat) {
    useListeners.forEach((fn) => fn());
  }
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
  read();
});
// A key let go while the window is in the background never sends keyup.
window.addEventListener("blur", () => controls.clear());

export const controls = {
  input,

  // Called every game step: the arrows turn the player.
  step(dt) {
    read();
    if (input.turn) lookListeners.forEach((fn) => fn(input.turn * TURN * dt, 0));
  },

  // Empties every held key and thumb, so nothing keeps walking after a pause or a talk box.
  clear() {
    keys.clear();
    touch.forward = 0;
    touch.strafe = 0;
    touch.jump = false;
    read();
  },

  // The phone joystick and Jump button (touchpad.js).
  setTouch(forward, strafe, jump) {
    touch.forward = forward;
    touch.strafe = strafe;
    touch.jump = jump;
    read();
  },

  // fn(dx, dy): turn the view by these many radians (right and down are positive).
  onLook: (fn) => lookListeners.push(fn),
  // fn(): the pupil asked to use the thing in front (E, a click or the Use button).
  onUse: (fn) => useListeners.push(fn),
  use: () => useListeners.forEach((fn) => fn()),
  playing
};
