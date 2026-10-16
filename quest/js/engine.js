// Treasure Quest · the engine: renderer, camera, the game loop, pausing, picture quality and lost pictures.
// Later features hand their island scene and game logic to engine.start(), and listen with onPause/onResume
// (to stop sound and speech) and onQuality (to adjust the look).
import * as THREE from "three";

const STEP = 1 / 60;          // game logic runs in fixed steps of 1/60 s
const MAX_STEPS = 5;          // never more catch up steps than this in one frame
const SCALES = [1, 0.75, 0.5]; // render scale steps, highest first
const WARM_UP = 1000;         // ms of play ignored before the frame rate is judged
const WINDOW = 3000;          // ms the frame rate is averaged over
const HITCH = 250;            // ms; a frame this long is a hitch, not the real speed
const STEP_DOWN_BELOW = 24;   // fps
const GIVE_UP_BELOW = 15;     // fps, at the lowest scale
const LOST_WAIT = 5000;       // ms to wait for a lost picture to come back

let renderer = null;
let canvas = null;
let scene = null;
let update = null;
let started = false;
let running = false;
let failed = false;
let last = 0;
let carry = 0;
let scaleIndex = 0;
let lostTimer = 0;
let resizeTimer = 0;

const reasons = new Set();
const listeners = { pause: [], resume: [], quality: [], fail: [] };
const watch = { from: 0, frames: [], lastCheck: 0, fps: 0 };
// What the debug view shows: plain frames in the last second, counted all the time.
const shown = { count: 0, since: 0, fps: 0 };

// BlockWords' first person camera: a 72° view, reaching past the sea to the horizon.
const camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 1000);

function emit(kind, value) {
  listeners[kind].forEach((fn) => {
    try {
      fn(value);
    } catch (err) {
      console.warn("Treasure Quest: listener failed.", err);
    }
  });
}

function fail(kind) {
  if (failed) return;
  failed = true;
  stopLoop();
  emit("fail", kind);
}

// Screen size sharpness: one drawn pixel per CSS pixel at most, so budget phones with sharp
// screens never draw 4 to 9 times the pixels; the quality steps lower it on slow devices (spec 0004).
function pixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 1) * SCALES[scaleIndex];
}

function resize() {
  if (!renderer) return;
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function queueResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
}

// The frame rate watch starts again after every pause and every quality change,
// so a hidden tab or the heavy first second never counts as a slow device.
function resetWatch(now) {
  watch.from = now + WARM_UP;
  watch.frames = [];
  watch.lastCheck = now;
}

function measure(frames) {
  const steady = frames.filter((f) => f.dt <= HITCH);
  // Mostly long frames is not a hitch, it is a slow device: count them all.
  const use = steady.length >= frames.length / 2 ? steady : frames;
  const time = use.reduce((sum, f) => sum + f.dt, 0);
  return time > 0 ? use.length / (time / 1000) : 0;
}

function watchFrame(now, dt) {
  if (now < watch.from) return;
  watch.frames.push({ t: now, dt });
  while (watch.frames.length && watch.frames[0].t < now - WINDOW) watch.frames.shift();
  if (now - watch.lastCheck < 1000) return;
  watch.lastCheck = now;
  watch.fps = measure(watch.frames);
  if (now - watch.from < WINDOW) return;
  if (scaleIndex < SCALES.length - 1 && watch.fps < STEP_DOWN_BELOW) {
    scaleIndex += 1;
    resize();
    resetWatch(now);
    console.warn(`Treasure Quest: running at ${watch.fps.toFixed(1)} fps, render scale now ${SCALES[scaleIndex]}.`);
    emit("quality", SCALES[scaleIndex]);
  } else if (scaleIndex === SCALES.length - 1 && watch.fps < GIVE_UP_BELOW) {
    console.warn(`Treasure Quest: still ${watch.fps.toFixed(1)} fps at the lowest scale.`);
    fail("slow");
  }
}

function frame(nowMs) {
  if (!last) {
    last = nowMs;
    renderer.render(scene, camera);
    return;
  }
  const dt = nowMs - last;
  last = nowMs;
  shown.count += 1;
  if (nowMs - shown.since >= 1000) {
    shown.fps = (shown.count * 1000) / (nowMs - shown.since);
    shown.count = 0;
    shown.since = nowMs;
  }
  watchFrame(nowMs, dt);
  if (failed) return;
  carry = Math.min(carry + dt / 1000, STEP * MAX_STEPS);
  let steps = 0;
  while (carry >= STEP && steps < MAX_STEPS) {
    update(STEP);
    carry -= STEP;
    steps += 1;
  }
  renderer.render(scene, camera);
}

function startLoop() {
  if (running || failed || !started) return;
  running = true;
  last = 0;
  carry = 0;
  shown.count = 0;
  shown.since = performance.now();
  resetWatch(performance.now());
  renderer.setAnimationLoop(frame);
  emit("resume");
}

function stopLoop() {
  if (!running) return;
  running = false;
  if (renderer) renderer.setAnimationLoop(null);
  emit("pause");
}

function settle() {
  if (reasons.size) stopLoop();
  else startLoop();
}

export const engine = {
  THREE,
  camera,

  // Makes the renderer. False when this device can't give us WebGL 2.
  init(target) {
    canvas = target;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch (err) {
      console.warn("Treasure Quest: no WebGL 2.", err);
      return false;
    }
    resize();
    window.addEventListener("resize", queueResize);
    window.addEventListener("orientationchange", queueResize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) engine.pause("hidden");
      else engine.resume("hidden");
    });
    if (document.hidden) reasons.add("hidden");
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      engine.pause("context");
      clearTimeout(lostTimer);
      lostTimer = setTimeout(() => fail("lost"), LOST_WAIT);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      clearTimeout(lostTimer);
      engine.resume("context");
    });
    return true;
  },

  // update(dt) runs at a fixed 60 steps a second while nothing pauses the game.
  start(newScene, newUpdate) {
    scene = newScene;
    update = newUpdate;
    started = true;
    renderer.compile(scene, camera);
    settle();
  },

  // Reasons: loading, hidden, hush, portrait, ask, context. The game runs only when none is left.
  pause(reason) {
    reasons.add(reason);
    settle();
  },
  resume(reason) {
    reasons.delete(reason);
    settle();
  },
  isRunning: () => running,

  onPause: (fn) => listeners.pause.push(fn),
  onResume: (fn) => listeners.resume.push(fn),
  onQuality: (fn) => listeners.quality.push(fn),
  onFail: (fn) => listeners.fail.push(fn),

  stats() {
    const size = renderer ? renderer.getDrawingBufferSize(new THREE.Vector2()) : { x: 0, y: 0 };
    return { fps: running ? shown.fps : 0, judged: watch.fps, scale: SCALES[scaleIndex], drawn: [size.x, size.y], running, reasons: [...reasons] };
  }
};
