// Treasure Quest · boot: who is playing, which island, may their class open it, and the teacher's Pause.
// Three.js is only downloaded once the pupil and the island check out, so a pupil on a "not open"
// screen never spends mobile data on it.
import { screens } from "./screens.js";
import { drawIsland, randomSeed, tagUnit } from "./puzzles.js";
import { sound } from "./sound.js";
import { voice } from "./voice.js";
import { hud } from "./hud.js";
import { panel } from "./panel.js";
import "./pause.js";
import { controls } from "./controls.js";

const UNIT_IDS = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9"];
const WAIT = 8000; // ms for the class list and the unit file, the same patience Word Island has
const params = new URLSearchParams(location.search);

// &seed= fixes the puzzles for testing; otherwise every play draws fresh ones.
function seedFromAddress() {
  const seed = Number.parseInt(params.get("seed") || "", 10);
  return seed > 0 ? seed : randomSeed();
}

// What later features read: the loaded unit bank, its island file, this play's puzzles and the pupil.
export const quest = { unit: null, island: null, map: null, plan: null, world: null, scene: null, anchors: null, kitPlaces: null, seed: seedFromAddress(), pupil: null, debug: params.has("debug") };

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (err) {
    return null; // private windows can block storage
  }
}

// Word Island saves the pupil; before units, Unit 1 kept it inside its own record.
function readPupil() {
  const saved = readJson("word-island-pupil") || readJson("word-island-u1-v2") || {};
  return {
    name: typeof saved.name === "string" ? saved.name : "",
    cls: typeof saved.cls === "string" ? saved.cls : "",
    sound: saved.sound !== false
  };
}

function unitFromAddress() {
  const id = (params.get("unit") || "").trim().toLowerCase();
  return UNIT_IDS.includes(id) ? id : null;
}

function later(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Adds the one unit file this island needs, after shared/bank.js (already run: modules wait for classic scripts).
function loadUnit(id) {
  const loaded = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = new URL(`../units/${id}.js`, document.baseURI).href;
    tag.onload = () => resolve(WORD_ISLAND_UNITS[id] || null);
    tag.onerror = () => resolve(null);
    document.body.appendChild(tag);
  });
  return Promise.race([loaded, later(WAIT, null)]);
}

// A unit without an island file (quest/islands/uN.js) is not open in the quest yet.
function loadIsland(id) {
  const loaded = import(`../islands/${id}.js`).then((mod) => mod.default || null, () => null);
  return Promise.race([loaded, later(WAIT, null)]);
}

// A spot whose anchor the map does not have is left out, so the island still plays and the coins and
// "N left" count only the spots that are there. tools/check-quests.mjs stops this before going live.
function placedSpots(island, map) {
  const names = new Set(map.anchors.map((anchor) => anchor.name));
  const missing = island.spots.filter((spot) => !names.has(spot.anchor));
  if (!missing.length) return island;
  console.warn(`Treasure Quest: the map has no anchor for ${missing.map((spot) => `${spot.id} (${spot.anchor})`).join(", ")}; left out.`);
  return { ...island, spots: island.spots.filter((spot) => names.has(spot.anchor)) };
}

// The island's map (quest/islands/uN-map.js, spec 0006): its land, buildings and puzzle anchors.
function loadMap(id) {
  const loaded = import(`../islands/${id}-map.js`).then((mod) => mod.default || null, () => null);
  return Promise.race([loaded, later(WAIT, null)]);
}

function firebaseReady() {
  return new Promise((resolve) => {
    if (typeof window.wiWatchSettings === "function") resolve();
    else window.addEventListener("wi-send-ready", resolve, { once: true });
  });
}

// One live watch on the teacher's settings: the first answer settles the class list once,
// every answer updates Pause. If nothing arrives in time, every island is open (as in Word Island).
function watchSettings(cls) {
  let firstSettled = false;
  let settle;
  const first = new Promise((resolve) => { settle = resolve; });
  const settleOnce = (value) => {
    if (firstSettled) return;
    firstSettled = true;
    settle(value);
  };
  setTimeout(() => settleOnce({ classes: null }), WAIT);
  firebaseReady()
    .then(() => window.wiWatchSettings((data) => {
      screens.setHush(Boolean(cls) && wiPausedClasses(data)[cls] === true);
      settleOnce({ classes: data && data.classes });
    }))
    .catch((err) => {
      console.warn("Treasure Quest: teacher settings not loaded.", err);
      settleOnce({ classes: null });
    });
  return first;
}

// Needs the unit loaded first, because only known units count.
function classCheck(rawClasses, cls, unitId) {
  const found = wiCleanClasses(rawClasses, WORD_ISLAND_UNITS);
  const classes = found && Object.keys(found).length ? found : null;
  if (!classes) return "open";
  if (!classes[cls]) return "needsPupil";
  return classes[cls].includes(unitId) ? "open" : "notOpen";
}

async function boot() {
  if (window.QUEST_PROBE === false) return;

  const pupil = readPupil();
  const unitId = unitFromAddress();
  quest.pupil = pupil;
  if (!pupil.name || !pupil.cls) {
    screens.setBase("needsPupil");
    watchSettings(pupil.cls);
    return;
  }
  const settings = watchSettings(pupil.cls);
  if (!unitId) {
    screens.setBase("notOpen");
    return;
  }

  const enginePart = Promise.all([import("./engine.js"), import("./island.js"), import("./hand.js"), import("./walk.js")]).catch((err) => {
    console.warn("Treasure Quest: Three.js did not load.", err);
    return null;
  });
  const islandPart = loadIsland(unitId);
  const mapPart = loadMap(unitId);
  const unit = await loadUnit(unitId);
  if (!unit) {
    console.warn(`Treasure Quest: units/${unitId}.js did not load.`);
    screens.setBase("notOpen");
    return;
  }
  quest.unit = tagUnit(unit);
  const island = await islandPart;
  if (!island) {
    console.warn(`Treasure Quest: quest/islands/${unitId}.js did not load.`);
    screens.setBase("notOpen");
    return;
  }
  const map = await mapPart;
  if (!map) {
    console.warn(`Treasure Quest: quest/islands/${unitId}-map.js did not load.`);
    screens.setBase("notOpen");
    return;
  }
  quest.map = map;
  quest.island = placedSpots(island, map);
  try {
    quest.plan = drawIsland(quest.island, unit, quest.seed);
  } catch (err) {
    // tools/check-quests.mjs stops this before an island goes live; never show pupils a broken island.
    console.warn("Treasure Quest: the island's puzzles could not be drawn.", err);
    screens.setBase("notOpen");
    return;
  }
  const { classes } = await settings;
  const access = classCheck(classes, pupil.cls, unitId);
  if (access !== "open") {
    screens.setBase(access);
    return;
  }
  // The island opens once the pupil has finished the unit's five Word Island games on this device;
  // the teacher's ?open=all link opens it anyway (spec 0009, shared/quest.js).
  if (!wiQuestOpen(unitId, location.search)) {
    screens.setUnit(unit.number);
    screens.setBase("finishGames");
    return;
  }

  const parts = await enginePart;
  if (!parts) {
    screens.setBase("unsupported");
    return;
  }
  const [{ engine }, { buildIsland }, { hand }, { walk }] = parts;
  if (!engine.init(document.getElementById("world"))) {
    screens.setBase("unsupported");
    return;
  }
  wireEngine(engine);
  const built = buildIsland(engine.camera, map, { kit: params.has("kit") });
  quest.world = built.world;
  quest.scene = built.scene;
  quest.anchors = built.anchors;
  quest.kitPlaces = built.kit;
  // The pupil walks from the island's start point (spec 0005); the sky follows the camera.
  walk.start(built.world, built.start, engine.camera);
  controls.attach(document.getElementById("world"));
  const { touchpad } = await import("./touchpad.js");
  touchpad.attach(document.getElementById("world"));
  // Using things: chests, villagers and later finds (spec 0005).
  const { targets } = await import("./targets.js");
  targets.attach(built.scene, engine.camera, built.world);
  // Word things: use one to see its word in the hint bar and hear it read aloud. No coins (spec 0006).
  const { notice } = await import("./notice.js");
  map.things.forEach((thing) => targets.add({
    at: thing.at,
    label: thing.word,
    onUse: () => {
      notice(thing.word);
      voice.say(thing.say || thing.word);
    }
  }));
  // Treasure chests at every puzzle spot (spec 0007); they keep the coin counter and "N left".
  const { chests } = await import("./chests.js");
  chests.start({ quest, world: built.world });
  // Mining after the chests, so their blocks are already in the world (spec 0010).
  const { mining } = await import("./mining.js");
  mining.start({ quest, world: built.world, scene: built.scene, camera: engine.camera });
  // The island ending after the last chest (spec 0008).
  const { finish } = await import("./finish.js");
  finish.start({ quest, engine });
  // Every click, E or Use swings the hand, as in BlockWords, even with nothing in front.
  controls.onUse(() => hand.swing());
  const update = (dt) => {
    walk.update(dt);
    targets.update();
    mining.update(dt);
    hand.update(dt, walk.state().bob);
    built.update(dt);
  };
  update(0);
  engine.start(built.scene, update, { overlay: hand });
  // The hotbar and the hand: the selected slot is what the hand holds.
  hud.onSelect((item) => hand.setItem(item));
  hud.blockWhile(() => screens.state.covered || panel.isOpen());
  const kit = params.has("kit") ? await import("./kit.js") : null;
  // The island waits behind the Play card; the tap itself switches on sound and voice.
  screens.onPlay(() => {
    sound.unlock();
    voice.unlock();
    sound.play("click");
    screens.setBase("running");
    // Coins and puzzles left, as the chests keep them.
    hud.show();
    if (kit) kit.showKit(quest);
    // On a laptop, take the mouse now: the Play tap lets the browser allow it.
    controls.capture();
  });
  screens.setBase("ready");
  if (quest.debug) {
    const { showDebug } = await import("./debug.js");
    showDebug(engine, quest);
  }
}

// The screens and the engine stay in step: any covering screen pauses the game.
function wireEngine(engine) {
  engine.pause("loading");
  const portrait = window.matchMedia("(orientation: portrait) and (pointer: coarse)");
  const follow = () => screens.setPortrait(portrait.matches);
  // Some browsers skip the media change event on a turn, so check on every resize too.
  portrait.addEventListener("change", follow);
  window.addEventListener("resize", follow);
  window.addEventListener("orientationchange", follow);
  follow();
  const sync = (s) => {
    (s.base === "running" ? engine.resume : engine.pause)("loading");
    (s.hush ? engine.pause : engine.resume)("hush");
    (s.portrait ? engine.pause : engine.resume)("portrait");
    (s.pause ? engine.pause : engine.resume)("ask");
  };
  screens.onChange(sync);
  // The kit's top bar, panels and &kit sheet can't be reached while a screen covers the game.
  screens.onChange((s) => {
    document.querySelectorAll(".hud, .panelwrap, .kittoggle, .kitsheet").forEach((node) => { node.inert = s.covered; });
  });
  sync(screens.state);
  engine.onFail((kind) => screens.setBase(kind));
  // Nothing plays or speaks while the game is paused (teacher Pause, hidden tab, turn your phone, Leave box).
  engine.onPause(() => {
    sound.pause();
    voice.pause();
    // Nothing keeps walking after play resumes (spec 0005).
    controls.clear();
  });
  engine.onResume(() => {
    sound.resume();
    voice.resume();
  });
}

boot();
