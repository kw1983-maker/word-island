// Treasure Quest · phone controls (spec 0005): a joystick appears under the left thumb and walks the
// player, dragging on the right half turns the view, and Jump and Use buttons sit at the bottom right.
// Two thumbs work at once (each touch is followed by its own pointer id). Touches that start on the
// hotbar, Pause or any button never reach here, because those are not the island's canvas.
import { controls } from "./controls.js";
import { screens } from "./screens.js";
import { panel } from "./panel.js";

const coarse = typeof matchMedia === "function" && matchMedia("(pointer: coarse)");
const RADIUS = 50;     // CSS pixels from the centre to a full push
const DEAD = 0.15;     // a push smaller than this does not walk
const LOOK = 0.005;    // radians per CSS pixel dragged (spec 0004's drag speed)
const TAP_MS = 250;    // a touch shorter than this that hardly moves is a tap
const TAP_MOVE = 10;

let root = null;
let el = {};
let stick = null;      // { id, x, y } of the thumb on the joystick
let lookers = new Map(); // pointer id → { x, y } of a thumb dragging to look
let jumpHeld = false;
const starts = new Map(); // pointer id → { x, y, t } for spotting taps
const tapListeners = [];

const isPhone = () => Boolean(coarse && coarse.matches);

function make(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function send() {
  let forward = 0;
  let strafe = 0;
  if (stick && stick.dx !== undefined) {
    const len = Math.hypot(stick.dx, stick.dy);
    const push = Math.min(1, len / RADIUS);
    if (push > DEAD && len > 0) {
      forward = (-stick.dy / len) * push;
      strafe = (stick.dx / len) * push;
    }
  }
  controls.setTouch(forward, strafe, jumpHeld);
}

function showStick(x, y) {
  el.base.style.left = `${x}px`;
  el.base.style.top = `${y}px`;
  el.knob.style.transform = "translate(-50%, -50%)";
  el.base.hidden = false;
}

function moveKnob(dx, dy) {
  const len = Math.hypot(dx, dy);
  const k = len > RADIUS ? RADIUS / len : 1;
  el.knob.style.transform = `translate(calc(-50% + ${dx * k}px), calc(-50% + ${dy * k}px))`;
}

// Lets go of every thumb, so nothing keeps walking or turning after a pause or a talk box.
function reset() {
  stick = null;
  lookers = new Map();
  jumpHeld = false;
  starts.clear();
  if (el.base) el.base.hidden = true;
  send();
}

function paint() {
  if (!root) return;
  root.hidden = !controls.playing();
  if (root.hidden) reset();
}

function onDown(event) {
  if (event.pointerType === "mouse" || !controls.playing()) return;
  starts.set(event.pointerId, { x: event.clientX, y: event.clientY, t: performance.now() });
  if (event.clientX < innerWidth / 2 && !stick) {
    stick = { id: event.pointerId, x: event.clientX, y: event.clientY };
    showStick(stick.x, stick.y);
  } else {
    lookers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }
}

function onMove(event) {
  if (stick && event.pointerId === stick.id) {
    stick.dx = event.clientX - stick.x;
    stick.dy = event.clientY - stick.y;
    moveKnob(stick.dx, stick.dy);
    send();
    return;
  }
  const look = lookers.get(event.pointerId);
  if (look) {
    controls.look((event.clientX - look.x) * LOOK, (event.clientY - look.y) * LOOK);
    look.x = event.clientX;
    look.y = event.clientY;
  }
}

function onUp(event) {
  const start = starts.get(event.pointerId);
  starts.delete(event.pointerId);
  if (stick && event.pointerId === stick.id) {
    stick = null;
    el.base.hidden = true;
    send();
  }
  lookers.delete(event.pointerId);
  // A quick touch that hardly moved is a tap on the island (to use the thing tapped).
  if (start && event.type === "pointerup" && performance.now() - start.t < TAP_MS &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) < TAP_MOVE) {
    tapListeners.forEach((fn) => fn(event.clientX, event.clientY));
  }
}

function holdButton(button, down, up) {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    down();
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((type) => button.addEventListener(type, () => up && up()));
}

export const touchpad = {
  // Sets up the phone controls over the island's canvas (only on touch devices).
  attach(canvas) {
    if (!isPhone()) return;
    root = make("div", "touchpad");
    root.hidden = true;
    el.base = make("div", "stick");
    el.base.hidden = true;
    el.knob = make("div", "knob");
    el.base.append(el.knob);
    el.jump = make("button", "padbtn jump", "Jump");
    el.jump.type = "button";
    el.use = make("button", "padbtn use", "Use");
    el.use.type = "button";
    el.use.hidden = true;
    root.append(el.base, el.use, el.jump);
    document.body.append(root);

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    holdButton(el.jump, () => { jumpHeld = true; send(); }, () => { jumpHeld = false; send(); });
    holdButton(el.use, () => controls.use());
    screens.onChange(paint);
    panel.onChange(paint);
    paint();
  },

  // The Use button shows only while something usable is in front (targets.js).
  setUse(on) {
    if (el.use) el.use.hidden = !on;
  },

  // fn(x, y): the pupil tapped this point of the island.
  onTap: (fn) => tapListeners.push(fn),
  isPhone,
  reset
};
