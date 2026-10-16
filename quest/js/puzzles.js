// Treasure Quest · puzzles: turns an island file (quest/islands/uN.js) and its unit bank (units/uN.js)
// into one fresh puzzle per spot. Pure: no page, no sound, and no unit is named here, so a new island
// is a data file only (spec 0002).

// The puzzle types the game can play so far. A spot of any other type is played as a chest.
// Features 11 to 13 add "riddle", "find" and "blocks" here.
export const SUPPORTED = ["chest"];
export const TYPES = ["chest", "riddle", "find", "blocks"];

const SPOTS = 12;
const COINS = 10;
const YEAR_RULES = {
  1: { choices: 2, challenges: 0, letters: 5, sentence: false },
  2: { choices: 3, challenges: 2, letters: 8, sentence: true }
};

// The most coins an island can give, the same in every release.
export function islandMax(island) {
  return SPOTS * COINS + island.bonus;
}

// tries: wrong tries before the right answer, or 2 when the answer had to be shown.
export function coinsFor(tries) {
  if (tries === 0) return 10;
  if (tries === 1) return 5;
  return 0;
}

// A small seeded random number generator, so the same seed always gives the same island.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed() {
  return Math.floor(Math.random() * 2147483647) + 1;
}

function shuffle(list, rand) {
  const row = list.slice();
  for (let i = row.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [row[i], row[j]] = [row[j], row[i]];
  }
  return row;
}

// Word Island marks every bank item with its unit and game when it loads; the quest does the same,
// because the picture drawer finds pictures by item.unit.
export function tagUnit(unit) {
  Object.entries(unit.banks).forEach(([game, list]) => list.forEach((item) => {
    item.unit = unit.id;
    item.game = game;
  }));
  return unit;
}

const hasPictureChoices = (item) => Boolean(item.pics || item.icons);
const spellable = (rules) => (item) => !/\s/.test(item.word) && item.word.length <= rules.letters;

// The questions each spot type can draw from.
function candidates(island, unit, rules) {
  const { maze, moles, hangman, runner, planes } = unit.banks;
  return {
    chest: maze.concat(moles),
    find: runner.concat(planes).filter(hasPictureChoices),
    spelling: hangman.filter(spellable(rules)),
    riddle: island.riddles,
    sentence: rules.sentence ? island.sentences : []
  };
}

// How many different puzzles each type could draw in one play (challenge questions count up to the year's limit).
export function poolSizes(island, unit) {
  const rules = YEAR_RULES[island.year];
  const pools = candidates(island, unit, rules);
  const size = (list) => {
    const hard = list.filter((item) => item.challenge).length;
    return list.length - hard + Math.min(hard, rules.challenges);
  };
  return {
    chest: size(pools.chest),
    find: size(pools.find),
    spelling: size(pools.spelling),
    riddle: pools.riddle.length,
    sentence: pools.sentence.length
  };
}

// Takes items in turn from each topic (topics in a random order), so one play covers the unit.
function topicPicker(list, rand) {
  const byTopic = {};
  shuffle(list, rand).forEach((item) => {
    (byTopic[item.topic] = byTopic[item.topic] || []).push(item);
  });
  const topics = shuffle(Object.keys(byTopic), rand);
  let turn = 0;
  return (allowed) => {
    for (let n = 0; n < topics.length; n += 1) {
      const row = byTopic[topics[(turn + n) % topics.length]];
      const at = row.findIndex(allowed);
      if (at >= 0) {
        turn += n + 1;
        return row.splice(at, 1)[0];
      }
    }
    return null;
  };
}

// The right choice plus the wrong ones (one wrong one, picked at random, on Year 1), in a shuffled order.
function makeChoices(choices, label, count, rand) {
  const wrong = shuffle(choices.slice(1), rand).slice(0, count - 1);
  return shuffle([choices[0], ...wrong], rand).map((value) => ({ value, label: label(value), ok: value === choices[0] }));
}

function choiceLook(item) {
  if (item.pics) return "pic";
  return item.icons ? "icon" : "text";
}

function note(unit, id) {
  return (unit.notes && unit.notes[id]) || {};
}

function spelledOut(word) {
  return `${word}: ${word.split("").join(", ")}.`;
}

function chestPuzzle(item, unit, rules, rand) {
  const quote = item.pic && item.pic.quote;
  return {
    id: item.id,
    show: quote ? `“${quote}” ${item.q}` : item.q,
    say: item.speakQ || item.q,
    look: choiceLook(item),
    choices: makeChoices(item.choices, (choice) => choiceText(item, choice), rules.choices, rand),
    answer: answerText(item),
    pic: item,
    hint: note(unit, item.id).hint || "Look at the picture again.",
    why: note(unit, item.id).why || item.say,
    challenge: item.challenge === true
  };
}

function findPuzzle(item, unit, rules, rand) {
  return {
    id: item.id,
    // As Word Island's Listen games: pupils without sound can read the words.
    show: "Listen: " + (item.show || item.say),
    say: item.say,
    look: choiceLook(item),
    choices: makeChoices(item.choices, (choice) => choiceText(item, choice), rules.choices, rand),
    answer: answerText(item),
    hint: note(unit, item.id).hint || "Listen again.",
    why: note(unit, item.id).why || item.say,
    challenge: item.challenge === true
  };
}

function riddlePuzzle(riddle, rules, rand) {
  const text = riddle.lines.join(" ");
  const label = (choice) => (riddle.pics ? riddle.alts[riddle.choices.indexOf(choice)] : choice);
  return {
    id: riddle.id,
    show: text,
    say: text,
    by: riddle.by || "",
    look: riddle.pics ? "pic" : "text",
    choices: makeChoices(riddle.choices, label, rules.choices, rand),
    answer: label(riddle.choices[0]),
    hint: riddle.hint,
    why: riddle.why,
    challenge: false
  };
}

function spellingPuzzle(item, unit) {
  const word = item.word;
  return {
    id: item.id,
    show: "Spell the word.",
    say: word,
    pieces: word.split(""),
    answer: word,
    pic: item,
    hint: note(unit, item.id).hint || `It starts with “${word[0]}”.`,
    why: note(unit, item.id).why || spelledOut(word),
    challenge: item.challenge === true
  };
}

// The words are the blocks; the closing mark stays on the last word.
function sentencePuzzle(sentence) {
  const words = sentence.text.split(" ");
  return {
    id: sentence.id,
    show: "Make the sentence.",
    say: sentence.text,
    pieces: words,
    answer: sentence.text,
    hint: `It starts with “${words[0]}”.`,
    why: sentence.text,
    challenge: false
  };
}

// One puzzle per spot, in spot order. The same island, unit and seed always give the same puzzles.
// supported is only changed by tests and the review page, to see the full mix before Release 3.
export function drawIsland(island, unit, seed, supported = SUPPORTED) {
  const rules = YEAR_RULES[island.year];
  if (!rules) throw new Error(`${island.unit}: year must be 1 or 2.`);
  const rand = mulberry32(seed);
  const pools = candidates(island, unit, rules);
  const used = new Set();
  let challenges = 0;
  const allowed = (item) => !used.has(item.id) && (!item.challenge || challenges < rules.challenges);
  const pick = {
    chest: topicPicker(pools.chest, rand),
    find: topicPicker(pools.find, rand),
    spelling: topicPicker(pools.spelling, rand),
    riddle: topicPicker(pools.riddle, rand),
    sentence: topicPicker(pools.sentence, rand)
  };
  const take = (pool, what) => {
    const item = pick[pool](allowed);
    if (!item) throw new Error(`${island.unit}: not enough ${what} for one play.`);
    used.add(item.id);
    if (item.challenge) challenges += 1;
    return item;
  };

  // On Year 2, the first word block spot is a sentence and the other is a spelling word.
  const sentenceSpot = rules.sentence ? (island.spots.find((spot) => spot.type === "blocks") || {}).id : null;

  return island.spots.map((spot) => {
    const playAs = supported.includes(spot.type) ? spot.type : "chest";
    let puzzle;
    if (playAs === "riddle") puzzle = riddlePuzzle(take("riddle", "riddles"), rules, rand);
    else if (playAs === "find") puzzle = findPuzzle(take("find", "listen and find questions"), unit, rules, rand);
    else if (playAs === "blocks" && spot.id === sentenceSpot) puzzle = sentencePuzzle(take("sentence", "sentences"));
    else if (playAs === "blocks") puzzle = spellingPuzzle(take("spelling", "spelling words"), unit);
    else puzzle = chestPuzzle(take("chest", "chest questions"), unit, rules, rand);
    return { spot: spot.id, type: spot.type, playAs, anchor: spot.anchor, ...puzzle };
  });
}
