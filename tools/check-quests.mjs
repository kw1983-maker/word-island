// Treasure Quest · island checker: checks every quest/islands/uN.js against the rules in spec 0002
// before it goes live. Prints one plain line per problem and exits with an error when there is one.
//
//   node tools/check-quests.mjs          every island
//   node tools/check-quests.mjs u9       one island
//   node tools/check-quests.mjs path.js  a copy of an island file (for testing the checker)
//   add --map path.js                    check against a copy of the island's map (for testing)
//   add --list path.js                   check against a copy of shared/quest.js (for testing)
//
// Each island's map (quest/islands/uN-map.js, spec 0006) is walked too: every anchor the island
// names must exist and be reachable from the start on foot, and nowhere may trap a pupil.
//
// The island list in shared/quest.js (spec 0009) must name exactly the units with an island file,
// or Word Island would show a card for a missing island, or hide one that exists.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ISLANDS = join(ROOT, "quest", "islands");

// The unit files are classic browser scripts. Run them here as the browser would, with the shared
// helpers first. Top level const names become var so they stay visible between the files.
function runScript(file) {
  const code = readFileSync(join(ROOT, file), "utf8").replace(/^const (\w+)\b/gm, "var $1");
  vm.runInThisContext(code, { filename: file });
}
runScript("shared/bank.js");
runScript("shared/picture.js");

const { TYPES, SUPPORTED, drawIsland, poolSizes, tagUnit } = await import(pathToFileURL(join(ROOT, "quest", "js", "puzzles.js")).href);
const { B, BLOCKS } = await import(pathToFileURL(join(ROOT, "quest", "js", "bw", "blocks.js")).href);
const { MAP_SIZE, MAP_HEIGHT } = await import(pathToFileURL(join(ROOT, "quest", "js", "mapkit.js")).href);

const SPOT_COUNT = { chest: 6, riddle: 2, find: 2, blocks: 2 };
const FIELDS = {
  island: ["unit", "year", "bonus", "spots", "riddles", "sentences"],
  spot: ["id", "type", "anchor"],
  riddle: ["id", "topic", "lines", "choices", "pics", "alts", "hint", "why", "by"],
  sentence: ["id", "text", "topic"]
};

const isText = (value) => typeof value === "string" && value.trim() !== "";
const isTextList = (value, n) => Array.isArray(value) && value.length === n && value.every(isText);

function checkIsland(file) {
  const problems = [];
  const name = basename(file);
  const say = (line) => problems.push(`${name}: ${line}`);
  return import(pathToFileURL(file).href).then((mod) => {
    const island = mod.default;
    if (!island || typeof island !== "object") {
      say("there is no `export default { … }` island.");
      return problems;
    }
    const unitId = island.unit;
    const fileUnit = name.replace(/\.js$/, "");
    if (!/^u[1-9]$/.test(unitId)) say(`unit must be "u1" to "u9", not ${JSON.stringify(unitId)}.`);
    else if (/^u[1-9]$/.test(fileUnit) && unitId !== fileUnit) say(`unit is "${unitId}" but the file is ${name}.`);
    Object.keys(island).filter((key) => !FIELDS.island.includes(key)).forEach((key) => say(`unknown field "${key}".`));
    if (island.year !== 1 && island.year !== 2) say("year must be 1 or 2.");
    if (island.bonus !== 20) say("bonus must be 20.");

    if (!/^u[1-9]$/.test(unitId)) return problems;
    runScript(`units/${unitId}.js`);
    const unit = WORD_ISLAND_UNITS[unitId];
    if (!unit) {
      say(`units/${unitId}.js did not load.`);
      return problems;
    }
    tagUnit(unit);
    const topics = Object.keys(unit.topics);
    const bankIds = new Set(Object.values(unit.banks).flat().map((item) => item.id));
    const picsDir = join(ROOT, "img", unitId);

    // Spots
    const spots = Array.isArray(island.spots) ? island.spots : [];
    if (!Array.isArray(island.spots)) say("spots must be a list.");
    else if (spots.length !== 12) say(`there are ${spots.length} spots; an island needs 12.`);
    const spotIds = new Set();
    spots.forEach((spot, i) => {
      const where = `spot ${i + 1}`;
      Object.keys(spot).filter((key) => !FIELDS.spot.includes(key)).forEach((key) => say(`${where}: unknown field "${key}".`));
      if (!/^s([1-9]|1[0-2])$/.test(spot.id)) say(`${where}: id must be "s1" to "s12", not ${JSON.stringify(spot.id)}.`);
      else if (spotIds.has(spot.id)) say(`${where}: id "${spot.id}" is used twice.`);
      spotIds.add(spot.id);
      if (!TYPES.includes(spot.type)) say(`${where}: type must be one of ${TYPES.join(", ")}, not ${JSON.stringify(spot.type)}.`);
      if (!isText(spot.anchor)) say(`${where}: anchor (the place name) is missing.`);
    });
    Object.entries(SPOT_COUNT).forEach(([type, n]) => {
      const found = spots.filter((spot) => spot.type === type).length;
      if (found !== n) say(`there are ${found} ${type} spots; an island needs ${n}.`);
    });

    // Riddles and sentences: their ids must not clash with each other or with the bank.
    const puzzleIds = new Set();
    const checkId = (id, kind, where) => {
      if (!new RegExp(`^${unitId}q-${kind}-[a-z0-9-]+$`).test(String(id))) say(`${where}: id must look like "${unitId}q-${kind}-name", not ${JSON.stringify(id)}.`);
      else if (puzzleIds.has(id) || bankIds.has(id)) say(`${where}: id "${id}" is used twice.`);
      puzzleIds.add(id);
    };

    const riddles = Array.isArray(island.riddles) ? island.riddles : [];
    if (!Array.isArray(island.riddles)) say("riddles must be a list.");
    else if (riddles.length < 4 || riddles.length > 6) say(`there are ${riddles.length} riddles; an island needs 4 to 6.`);
    riddles.forEach((riddle, i) => {
      const where = `riddle ${riddle.id || i + 1}`;
      Object.keys(riddle).filter((key) => !FIELDS.riddle.includes(key)).forEach((key) => say(`${where}: unknown field "${key}".`));
      checkId(riddle.id, "r", where);
      if (!topics.includes(riddle.topic)) say(`${where}: topic "${riddle.topic}" is not a Unit ${unit.number} topic (${topics.join(", ")}).`);
      if (!Array.isArray(riddle.lines) || riddle.lines.length < 2 || riddle.lines.length > 3 || !riddle.lines.every(isText)) say(`${where}: lines must be 2 or 3 sentences.`);
      if (!isTextList(riddle.choices, 3)) say(`${where}: choices must be 3 words (the right one first).`);
      else if (new Set(riddle.choices).size !== 3) say(`${where}: the 3 choices must be different.`);
      if (riddle.pics !== undefined && typeof riddle.pics !== "boolean") say(`${where}: pics must be true or false.`);
      if (riddle.pics) {
        if (!isTextList(riddle.alts, 3)) say(`${where}: a picture riddle needs 3 alts (what each picture shows).`);
        (riddle.choices || []).forEach((pic) => {
          if (!existsSync(join(picsDir, `${pic}.webp`))) say(`${where}: there is no picture img/${unitId}/${pic}.webp.`);
        });
      } else if (riddle.alts !== undefined) {
        say(`${where}: alts are only for picture riddles (pics: true).`);
      }
      if (!isText(riddle.hint)) say(`${where}: hint is missing.`);
      if (!isText(riddle.why)) say(`${where}: why (the explanation) is missing.`);
      if (riddle.by !== undefined && !isText(riddle.by)) say(`${where}: by must be a name.`);
    });

    const sentences = Array.isArray(island.sentences) ? island.sentences : [];
    if (!Array.isArray(island.sentences)) say("sentences must be a list.");
    else if (island.year === 1 && sentences.length) say("a Year 1 island has no sentences.");
    else if (island.year === 2 && (sentences.length < 3 || sentences.length > 6)) say(`there are ${sentences.length} sentences; a Year 2 island needs 3 to 6.`);
    sentences.forEach((sentence, i) => {
      const where = `sentence ${sentence.id || i + 1}`;
      Object.keys(sentence).filter((key) => !FIELDS.sentence.includes(key)).forEach((key) => say(`${where}: unknown field "${key}".`));
      checkId(sentence.id, "s", where);
      if (!topics.includes(sentence.topic)) say(`${where}: topic "${sentence.topic}" is not a Unit ${unit.number} topic (${topics.join(", ")}).`);
      const text = String(sentence.text || "");
      const words = text.split(" ").filter(Boolean).length;
      if (words < 3 || words > 6) say(`${where}: "${text}" has ${words} words; a sentence needs 3 to 6.`);
      if (!/^[A-Za-z'’]+( [A-Za-z'’]+)*[.!?]$/.test(text)) say(`${where}: "${text}" may only use letters, apostrophes, single spaces and one . ! or ? at the end.`);
    });

    if (problems.length) return problems;

    // Enough questions for a whole play, both as Release 1 (all chests) and as the full mix.
    const pools = poolSizes(island, unit);
    if (pools.chest < 12) say(`only ${pools.chest} chest questions; Release 1 needs 12.`);
    const full = { chest: 6, riddle: 2, find: 2, spelling: island.year === 2 ? 1 : 2, sentence: island.year === 2 ? 1 : 0 };
    Object.entries(full).forEach(([type, n]) => {
      if (pools[type] < n) say(`only ${pools[type]} ${type} puzzles; the full mix needs ${n}.`);
    });

    // 20 sample plays of each kind must work and never repeat a question.
    for (const supported of [SUPPORTED, TYPES]) {
      for (let seed = 1; seed <= 20; seed += 1) {
        try {
          const plan = drawIsland(island, unit, seed, supported);
          const ids = plan.map((p) => p.id);
          if (new Set(ids).size !== ids.length) say(`seed ${seed} (${supported.join(", ")}): a question appears twice.`);
        } catch (err) {
          say(`seed ${seed} (${supported.join(", ")}): ${err.message}`);
        }
      }
    }
    return checkMap(island, unit, mapFile || join(dirname(file), `${unitId}-map.js`)).then((lines) => {
      lines.forEach(say);
      return [...new Set(problems)];
    });
  }, (err) => {
    say(`the file could not be read: ${err.message}`);
    return problems;
  });
}

// ------------------------------------------------------------------ the island map (spec 0006)
const MAP_FIELDS = ["unit", "seaLevel", "start", "blocks", "anchors", "things", "villagers", "kit"];
const ANCHOR_NEAR = 2;    // a standing place this close to an anchor lets a pupil use it
const PATH_NEAR = 3;      // the path passes this close to every anchor
const KEEP_CLEAR = 3;     // word things and villagers stay this far from every anchor
const PATH_LENGTH = [150, 350];

// The map's blocks in one grid, so it can be walked.
function gridOf(placed, say) {
  const cells = new Uint8Array(MAP_SIZE * MAP_HEIGHT * MAP_SIZE);
  const inside = (x, y, z) => x >= 0 && z >= 0 && y >= 0 && x < MAP_SIZE && z < MAP_SIZE && y < MAP_HEIGHT;
  const at = (x, y, z) => (x * MAP_SIZE + z) * MAP_HEIGHT + y;
  placed.forEach((block) => {
    const id = B[String(block.kind).toUpperCase()];
    if (id === undefined) {
      say(`there is no block called "${block.kind}".`);
      return;
    }
    const box = block.x0 !== undefined ? block : { x0: block.x, x1: block.x, y0: block.y, y1: block.y, z0: block.z, z1: block.z };
    for (let x = box.x0; x <= box.x1; x += 1) {
      for (let y = box.y0; y <= box.y1; y += 1) {
        for (let z = box.z0; z <= box.z1; z += 1) if (inside(x, y, z)) cells[at(x, y, z)] = id;
      }
    }
  });
  const get = (x, y, z) => (inside(x, y, z) ? cells[at(x, y, z)] : B.AIR);
  const solid = (x, y, z) => BLOCKS[get(x, y, z)].solid;
  // A standing place: feet and head in open cells, solid ground under the feet, and not deep water
  // (water at the feet with more water over it, which walk.js rescues the pupil from).
  const stand = (x, y, z) => inside(x, y, z) && y > 0 && !solid(x, y, z) && !solid(x, y + 1, z) && solid(x, y - 1, z) &&
    !(get(x, y, z) === B.WATER && get(x, y + 1, z) === B.WATER);
  return { get, solid, stand };
}

// Walking as the pupil can without jumping: to the four neighbours on the same level, up one block
// (with room for the head), or down any height.
function walkGraph(grid) {
  const key = (x, y, z) => `${x},${y},${z}`;
  const moves = (x, y, z) => {
    const out = [];
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => {
      const nx = x + dx;
      const nz = z + dz;
      if (grid.stand(nx, y, nz)) out.push([nx, y, nz]);
      else if (grid.stand(nx, y + 1, nz) && !grid.solid(x, y + 2, z)) out.push([nx, y + 1, nz]);
      else if (!grid.solid(nx, y, nz) && !grid.solid(nx, y + 1, nz)) {
        for (let ny = y - 1; ny > 0; ny -= 1) {
          if (grid.solid(nx, ny, nz)) break;
          if (grid.stand(nx, ny, nz)) {
            out.push([nx, ny, nz]);
            break;
          }
        }
      }
    });
    return out;
  };
  // Everywhere the start can walk to, and for each place the places one move before it.
  const reach = (from) => {
    const seen = new Map([[key(...from), from]]);
    const back = new Map();
    const queue = [from];
    while (queue.length) {
      const here = queue.shift();
      moves(...here).forEach((next) => {
        const k = key(...next);
        if (!back.has(k)) back.set(k, []);
        back.get(k).push(here);
        if (!seen.has(k)) {
          seen.set(k, next);
          queue.push(next);
        }
      });
    }
    return { seen, back };
  };
  return { key, reach };
}

async function checkMap(island, unit, mapFile) {
  const problems = [];
  const say = (line) => problems.push(`map: ${line}`);
  if (!existsSync(mapFile)) return [`there is no map file ${basename(mapFile)}.`];
  let map;
  try {
    map = (await import(pathToFileURL(mapFile).href)).default;
  } catch (err) {
    return [`the map ${basename(mapFile)} could not be read: ${err.message}`];
  }
  if (!map || typeof map !== "object") return [`the map ${basename(mapFile)} has no "export default { … }".`];
  Object.keys(map).filter((k) => !MAP_FIELDS.includes(k)).forEach((k) => say(`unknown field "${k}".`));
  if (map.unit !== island.unit) say(`unit is ${JSON.stringify(map.unit)}, not "${island.unit}".`);
  if (!Number.isInteger(map.seaLevel)) say("seaLevel must be a whole number.");
  if (typeof map.blocks !== "function") return [...problems, "map: blocks() is missing."];
  const anchors = Array.isArray(map.anchors) ? map.anchors : [];
  const things = Array.isArray(map.things) ? map.things : [];
  const villagers = Array.isArray(map.villagers) ? map.villagers : [];

  let placed;
  try {
    placed = map.blocks();
  } catch (err) {
    return [...problems, `map: blocks() failed: ${err.message}`];
  }
  const grid = gridOf(placed, say);
  const cell = (p) => [Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)];
  const where = (p) => cell(p).join(", ");
  const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  // Anchors: one per spot, each an empty block on solid ground, off the path.
  const names = new Map();
  anchors.forEach((anchor) => {
    if (names.has(anchor.name)) say(`anchor "${anchor.name}" is defined twice.`);
    names.set(anchor.name, anchor);
    const { x, y, z } = anchor.at || {};
    if (![x, y, z].every(Number.isInteger)) say(`anchor "${anchor.name}": at needs whole x, y and z.`);
    else if (grid.get(x, y, z) !== B.AIR) say(`anchor "${anchor.name}" at ${x}, ${y}, ${z} is inside a ${BLOCKS[grid.get(x, y, z)].name} block, not open air.`);
    else if (!grid.solid(x, y - 1, z)) say(`anchor "${anchor.name}" at ${x}, ${y}, ${z} has nothing solid under it.`);
    else if (grid.get(x, y - 1, z) === B.DIRT_PATH) say(`anchor "${anchor.name}" at ${x}, ${y}, ${z} sits on the path and would block it.`);
    if (typeof anchor.face !== "number") say(`anchor "${anchor.name}": face (which way it faces) must be a number.`);
  });
  island.spots.forEach((spot) => {
    if (!names.has(spot.anchor)) say(`${spot.id} needs anchor "${spot.anchor}", which the map does not have.`);
  });

  // Walking from the start.
  const start = map.start || {};
  if (![start.x, start.y, start.z, start.yaw].every((v) => typeof v === "number")) {
    say("start needs x, y, z and yaw.");
    return problems;
  }
  const from = cell(start);
  if (!grid.stand(...from)) {
    say(`the start ${where(start)} is not a place a pupil can stand.`);
    return problems;
  }
  const walk = walkGraph(grid);
  const { seen, back } = walk.reach(from);
  const places = [...seen.values()];

  anchors.forEach((anchor) => {
    const a = anchor.at || {};
    const near = places.some(([x, y, z]) => Math.abs(x - a.x) <= ANCHOR_NEAR && Math.abs(z - a.z) <= ANCHOR_NEAR && Math.abs(y - a.y) <= 1);
    if (!near) say(`anchor "${anchor.name}" at ${where(a)} can't be reached on foot from the start (no jumping).`);
  });

  // No traps: from everywhere a pupil can walk to, they can walk back to the start.
  const home = new Set([walk.key(...from)]);
  const queue = [from];
  while (queue.length) {
    const here = queue.shift();
    (back.get(walk.key(...here)) || []).forEach((prev) => {
      const k = walk.key(...prev);
      if (!home.has(k)) {
        home.add(k);
        queue.push(prev);
      }
    });
  }
  const traps = places.filter((c) => !home.has(walk.key(...c)));
  traps.slice(0, 5).forEach((c) => say(`a pupil can walk to ${c.join(", ")} but can't walk back to the start from there.`));
  if (traps.length > 5) say(`… and ${traps.length - 5} more places like that.`);

  // The path: path blocks joined into one line from the start, near every anchor.
  const pathCells = [];
  for (let x = 0; x < MAP_SIZE; x += 1) {
    for (let z = 0; z < MAP_SIZE; z += 1) {
      for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
        if (grid.get(x, y, z) === B.DIRT_PATH && !grid.solid(x, y + 1, z)) pathCells.push({ x: x + 0.5, y: y + 1, z: z + 0.5 });
      }
    }
  }
  if (pathCells.length < PATH_LENGTH[0] || pathCells.length > PATH_LENGTH[1]) {
    say(`the path is ${pathCells.length} blocks long; it should be ${PATH_LENGTH[0]} to ${PATH_LENGTH[1]}.`);
  }
  const flatKey = (p) => `${Math.floor(p.x)},${Math.floor(p.z)}`;
  const onPath = new Set(pathCells.map(flatKey));
  const first = pathCells.find((p) => flat(p, start) < 1.5);
  if (!first) say(`the path does not start at the start ${where(start)}.`);
  else {
    const linked = new Set([flatKey(first)]);
    const todo = [first];
    while (todo.length) {
      const p = todo.pop();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => {
        const next = { x: p.x + dx, z: p.z + dz };
        if (onPath.has(flatKey(next)) && !linked.has(flatKey(next))) {
          linked.add(flatKey(next));
          todo.push(next);
        }
      });
    }
    if (linked.size < onPath.size) say(`${onPath.size - linked.size} path blocks are not joined to the path from the start.`);
  }
  pathCells.forEach((p) => {
    if (!seen.has(walk.key(...cell(p)))) say(`the path at ${where(p)} can't be walked to from the start.`);
  });
  anchors.forEach((anchor) => {
    if (!anchor.at) return;
    const centre = { x: anchor.at.x + 0.5, z: anchor.at.z + 0.5 };
    if (!pathCells.some((p) => flat(p, centre) <= PATH_NEAR)) say(`the path does not pass within ${PATH_NEAR} blocks of anchor "${anchor.name}".`);
  });

  // Word things say a Unit word; word things and villagers stay clear of the puzzles.
  const bankText = JSON.stringify(unit.banks).toLowerCase();
  const tooClose = (p) => anchors.find((a) => a.at && flat({ x: a.at.x + 0.5, z: a.at.z + 0.5 }, p) < KEEP_CLEAR);
  things.forEach((thing, i) => {
    const what = `word thing ${JSON.stringify(thing.word || i + 1)}`;
    if (!isText(thing.word)) say(`${what}: word is missing.`);
    else if (!bankText.includes(thing.word.toLowerCase())) say(`${what}: "${thing.word}" is not in the Unit ${unit.number} questions.`);
    if (thing.say !== undefined && !isText(thing.say)) say(`${what}: say must be text.`);
    const { x, y, z } = thing.at || {};
    if (![x, y, z].every(Number.isInteger)) say(`${what}: at needs whole x, y and z.`);
    else {
      if (grid.get(x, y, z) === B.AIR) say(`${what} at ${x}, ${y}, ${z} has no block there to look at.`);
      const close = tooClose({ x: x + 0.5, z: z + 0.5 });
      if (close) say(`${what} at ${x}, ${y}, ${z} is closer than ${KEEP_CLEAR} blocks to anchor "${close.name}".`);
    }
  });
  villagers.forEach((villager, i) => {
    const what = `villager ${i + 1}`;
    const p = villager.at || {};
    if (![p.x, p.y, p.z, villager.yaw].every((v) => typeof v === "number")) {
      say(`${what}: needs at { x, y, z } and yaw.`);
      return;
    }
    if (!grid.stand(...cell(p))) say(`${what} at ${where(p)} is not standing on open ground.`);
    if (onPath.has(flatKey(p))) say(`${what} at ${where(p)} stands on the path.`);
    const close = tooClose(p);
    if (close) say(`${what} at ${where(p)} is closer than ${KEEP_CLEAR} blocks to anchor "${close.name}".`);
  });
  return problems;
}

// Every island file's unit must be in the island list, and every unit in the list must have a file.
// `only` limits it to one unit, when one island is checked.
function checkIslandList(listFile, only) {
  const problems = [];
  const say = (line) => problems.push(`island list: ${line}`);
  const code = readFileSync(listFile, "utf8").replace(/^const (\w+)\b/gm, "var $1");
  const box = {};
  vm.runInNewContext(`${code}
;this.list = wiQuestIslands;`, box, { filename: basename(listFile) });
  const list = box.list;
  if (!Array.isArray(list)) return [`island list: wiQuestIslands is missing from ${basename(listFile)}.`];
  const files = readdirSync(ISLANDS).filter((f) => /^u[1-9]\.js$/.test(f)).map((f) => f.replace(/\.js$/, ""));
  const keep = (id) => !only || id === only;
  files.filter(keep).filter((id) => !list.includes(id))
    .forEach((id) => say(`${id} has an island file but is not in wiQuestIslands (shared/quest.js), so Word Island shows no card for it.`));
  list.filter(keep).filter((id) => !files.includes(id))
    .forEach((id) => say(`${id} is in wiQuestIslands (shared/quest.js) but has no island file quest/islands/${id}.js.`));
  return problems;
}

const args = process.argv.slice(2);
const mapAt = args.indexOf("--map");
const mapFile = mapAt >= 0 ? resolve(args.splice(mapAt, 2)[1]) : null;
const listAt = args.indexOf("--list");
const listFile = listAt >= 0 ? resolve(args.splice(listAt, 2)[1]) : join(ROOT, "shared", "quest.js");
const arg = args[0];
let files;
if (!arg) files = readdirSync(ISLANDS).filter((f) => /^u[1-9]\.js$/.test(f)).sort().map((f) => join(ISLANDS, f));
else if (/^u[1-9]$/.test(arg)) files = [join(ISLANDS, `${arg}.js`)];
else files = [resolve(arg)];

let total = 0;
for (const file of files) {
  if (!existsSync(file)) {
    console.log(`${basename(file)}: there is no such island file.`);
    total += 1;
    continue;
  }
  const problems = await checkIsland(file);
  problems.forEach((line) => console.log(line));
  if (!problems.length) console.log(`${basename(file)}: OK`);
  total += problems.length;
}
// A copy of an island file is a test of the checker, so only the real islands are held to the list.
if (!arg || /^u[1-9]$/.test(arg)) {
  const listProblems = checkIslandList(listFile, arg || null);
  listProblems.forEach((line) => console.log(line));
  if (!listProblems.length) console.log("island list: OK");
  total += listProblems.length;
}
if (total) {
  console.log(`${total} problem${total === 1 ? "" : "s"} found.`);
  process.exitCode = 1;
}
