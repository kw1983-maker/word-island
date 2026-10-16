// Treasure Quest · island checker: checks every quest/islands/uN.js against the rules in spec 0002
// before it goes live. Prints one plain line per problem and exits with an error when there is one.
//
//   node tools/check-quests.mjs          every island
//   node tools/check-quests.mjs u9       one island
//   node tools/check-quests.mjs path.js  a copy of an island file (for testing the checker)
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
    return [...new Set(problems)];
  }, (err) => {
    say(`the file could not be read: ${err.message}`);
    return problems;
  });
}

const arg = process.argv[2];
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
if (total) {
  console.log(`${total} problem${total === 1 ? "" : "s"} found.`);
  process.exitCode = 1;
}
