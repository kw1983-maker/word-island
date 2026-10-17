// Treasure Quest · controls: what the pupil is asking the player to do, from the keyboard and mouse
// on a laptop (spec 0005). The phone joystick and buttons (touchpad.js) write into the same state.
// WASD walk and step sideways, the arrows walk and turn, Space jumps and E uses (BlockWords' keys,
// plus arrows that turn so a child can play with the keyboard alone). The mouse is captured after a
// click, as in BlockWords (pointer lock); if the browser refuses, holding the button and dragging looks.
import { screens } from "./screens.js";
import { panel } from "./panel.js";

const TURN = 2.4;      // radians a second for the Left and Right arrows
const MOUSE = 0.0022;  // BlockWords' mouse speed, radians per pixel
const fine = typeof matchMedia === "function" && matchMedia("(pointer: fine)");

let canvas = null;
let dragOnly = false;     // the browser refused capture: drag to look instead
let dragging = false;
let lostAt = 0;           // when capture was lost by Esc (or the browser), to tell Esc apart
let freeing = false;      // true while we free the mouse on purpose (a talk box, the kit)
let hadLock = false;      // the browser really gave us the mouse (so losing it means Esc)
const el = {};

const keys = new Set();
const input = { forward: 0, strafe: 0, turn: 0, jump: false, use: false };
// The phone joystick and buttons add to the keys (touchpad.js).
const touch = { forward: 0, strafe: 0, jump: false };
const lookListeners = [];
const useListeners = [];

const isLaptop = () => Boolean(fine && fine.matches);
const captured = () => Boolean(canvas) && document.pointerLockElement === canvas;

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

// The crosshair and the "Click to look around" hint follow what is on screen.
function paint() {
  if (!canvas) return;
  const show = playing() && isLaptop();
  el.cross.hidden = !show;
  el.hint.hidden = !show || captured();
  el.hint.textContent = dragOnly ? "Drag to look around" : "Click to look around";
}

function attachMouse() {
  document.addEventListener("pointerlockchange", () => {
    if (captured()) {
      hadLock = true;
    } else if (!hadLock) {
      // The browser never really gave us the mouse (some refuse, or give it and take it straight
      // back): that is a refusal, not Esc, so drag to look instead of pausing.
      dragOnly = true;
    } else {
      hadLock = false;
      if (!freeing && playing()) {
        // Esc (or the browser) took the mouse back: open the pause menu, as BlockWords does.
        lostAt = performance.now();
        screens.setPause(true);
      }
    }
    freeing = false;
    paint();
  });
  document.addEventListener("pointerlockerror", () => {
    dragOnly = true;
    paint();
  });
  canvas.addEventListener("mousedown", (event) => {
    if (!playing() || !isLaptop()) return;
    if (captured()) {
      if (event.button === 0) controls.use();
      return;
    }
    if (dragOnly) {
      dragging = true;
      return;
    }
    controls.capture();
  });
  window.addEventListener("mouseup", () => { dragging = false; });
  document.addEventListener("mousemove", (event) => {
    if (!playing()) return;
    if (captured() || (dragOnly && dragging)) {
      lookListeners.forEach((fn) => fn(event.movementX * MOUSE, event.movementY * MOUSE));
    }
  });
  // Coming back to the island after a pause or a screen: take the mouse again (the click or key that
  // closed it lets the browser allow this).
  // Anything covering the island (the pause menu, Stop and listen, a screen) frees the mouse so its
  // buttons can be clicked; some browsers keep it captured after an Esc that opened the menu.
  let wasPlaying = false;
  screens.onChange(() => {
    const now = playing();
    if (now && !wasPlaying && isLaptop()) controls.capture();
    if (!now && captured()) controls.release();
    wasPlaying = now;
    paint();
  });
}

export const controls = {
  input,

  // Sets up the mouse, the crosshair and the hint (call once, with the island's canvas).
  attach(target) {
    canvas = target;
    el.cross = document.createElement("div");
    el.cross.id = "crosshair";
    el.cross.hidden = true;
    el.hint = document.createElement("p");
    el.hint.className = "clickhint";
    el.hint.hidden = true;
    document.body.append(el.cross, el.hint);
    attachMouse();
    paint();
  },

  // Captures the mouse on a laptop. Browsers allow this only from a click or key press.
  capture() {
    if (!canvas || !isLaptop() || dragOnly || captured() || !playing()) return;
    if (typeof canvas.requestPointerLock !== "function") {
      dragOnly = true;
      paint();
      return;
    }
    try {
      const asked = canvas.requestPointerLock();
      if (asked && typeof asked.catch === "function") asked.catch(() => {});
    } catch (err) {
      dragOnly = true;
    }
    paint();
  },

  // Frees the mouse on purpose (a talk box or the kit), without opening the pause menu.
  release() {
    if (!captured()) return;
    freeing = true;
    document.exitPointerLock();
  },

  captured,
  isLaptop,
  // True for a moment after Esc took the mouse back, so that same Esc does not also close the menu.
  justLost: () => performance.now() - lostAt < 400,
  paint,

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
