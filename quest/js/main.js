// Treasure Quest · boot: who is playing, which island, may their class open it, and the teacher's Pause.
// Three.js is only downloaded once the pupil and the island check out, so a pupil on a "not open"
// screen never spends mobile data on it.
import { screens } from "./screens.js";
import { drawIsland, randomSeed, tagUnit } from "./puzzles.js";

const UNIT_IDS = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9"];
const WAIT = 8000; // ms for the class list and the unit file, the same patience Word Island has
const params = new URLSearchParams(location.search);

// &seed= fixes the puzzles for testing; otherwise every play draws fresh ones.
function seedFromAddress() {
  const seed = Number.parseInt(params.get("seed") || "", 10);
  return seed > 0 ? seed : randomSeed();
}

// What later features read: the loaded unit bank, its island file, this play's puzzles and the pupil.
export const quest = { unit: null, island: null, plan: null, seed: seedFromAddress(), pupil: null, debug: params.has("debug") };

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

  const enginePart = Promise.all([import("./engine.js"), import("./testscene.js")]).catch((err) => {
    console.warn("Treasure Quest: Three.js did not load.", err);
    return null;
  });
  const islandPart = loadIsland(unitId);
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
  quest.island = island;
  try {
    quest.plan = drawIsland(island, unit, quest.seed);
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

  const parts = await enginePart;
  if (!parts) {
    screens.setBase("unsupported");
    return;
  }
  const [{ engine }, { buildTestScene }] = parts;
  if (!engine.init(document.getElementById("world"))) {
    screens.setBase("unsupported");
    return;
  }
  wireEngine(engine);
  const island = buildTestScene(engine.camera);
  engine.start(island.scene, island.update);
  screens.setBase("running");
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
    (s.base === "loading" ? engine.pause : engine.resume)("loading");
    (s.hush ? engine.pause : engine.resume)("hush");
    (s.portrait ? engine.pause : engine.resume)("portrait");
    (s.leave ? engine.pause : engine.resume)("ask");
  };
  screens.onChange(sync);
  sync(screens.state);
  engine.onFail((kind) => screens.setBase(kind));
  // Later features stop their sound here; speech is stopped for them.
  engine.onPause(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });
}

boot();
