// Treasure Quest · the island finish (spec 0008). When the last chest opens (spec 0007's finished
// hook), 1.5 seconds of play later the island ends: the finishing bonus joins the coins, the fanfare
// plays, and a talk box says "Island finished!" with the coins and up to 3 stars, read aloud. Play
// again reloads the island with fresh questions; Back to Word Island goes home. The coins and stars
// go to the teacher's Treasure Quest leaderboard, and the ending shows the class's top five (feature 10).
import { islandMax } from "./puzzles.js";
import { chests } from "./chests.js";
import { panel } from "./panel.js";
import { hud } from "./hud.js";
import { sound } from "./sound.js";
import { voice } from "./voice.js";

const WAIT = 1500;  // ms of play between the last chest opening and the ending
const TICK = 100;
const HOME = "../";

let result = null;
let saving = Promise.resolve(); // the pupil's own score, so the board can wait to include it

const SEND_TRIES = 3;
const SEND_GAP = 5000;  // ms before the first retry; it doubles after each failed try
const BOARD_WAIT = 6000; // ms the board waits for the pupil's own score before loading anyway
const BOARD_GIVE_UP = 10000; // ms before the board says scores are not available
const BOARD_SIZE = 5;

function firebaseReady() {
  return new Promise((resolve) => {
    if (typeof window.wiQuestScore === "function") resolve();
    else window.addEventListener("wi-send-ready", resolve, { once: true });
  });
}

function newKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return "q" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Sends the finished island in the background; a dropped connection gets two more tries.
// The debug view is for testing, so its plays stay off the leaderboard.
async function sendScore(quest) {
  const pupil = quest.pupil || {};
  if (quest.debug || !pupil.name || !pupil.cls) return;
  const run = { key: newKey(), unit: quest.island.unit, cls: pupil.cls, name: pupil.name.slice(0, 39), score: result.coins, stars: result.stars };
  await firebaseReady();
  for (let tryNo = 1, gap = SEND_GAP; tryNo <= SEND_TRIES; tryNo += 1, gap *= 2) {
    try {
      await window.wiQuestScore(run);
      return;
    } catch (err) {
      console.warn(`Treasure Quest: score not saved (try ${tryNo}).`, err);
      if (tryNo < SEND_TRIES) await new Promise((resolve) => setTimeout(resolve, gap));
    }
  }
}

function later(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// The class's best islands for this unit on the ending: one line per pupil, best first, the pupil's
// own line in gold. It waits a little for the pupil's own score so it is usually on the list.
async function loadBoard(quest) {
  const pupil = quest.pupil || {};
  const mine = (pupil.name || "").trim().toLowerCase();
  const fetched = Promise.race([saving, later(BOARD_WAIT)])
    .then(() => firebaseReady())
    .then(() => window.wiLeaderboard(quest.island.unit, pupil.cls, "quest"));
  const rows = await Promise.race([fetched, later(BOARD_GIVE_UP, null)]);
  if (!rows) throw new Error("timed out");
  const seen = new Set();
  return rows.filter((row) => {
    const key = row.name.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, BOARD_SIZE).map((row) => ({ ...row, me: Boolean(mine) && row.name.trim().toLowerCase() === mine }));
}

// Stars for the coins: 3 at 130/140 of the island maximum or more, 2 at 100/140 or more, else 1.
export function starsFor(coins, max) {
  if (coins >= (max * 130) / 140) return 3;
  if (coins >= (max * 100) / 140) return 2;
  return 1;
}

// The same address with a fresh draw: the seed goes, everything else (unit, &debug, &kit) stays.
function againAddress() {
  const kept = location.search.slice(1).split("&").filter((part) => part && !/^seed(=|$)/.test(part));
  return location.pathname + (kept.length ? "?" + kept.join("&") : "");
}

function showEnding(quest) {
  const cls = (quest.pupil && quest.pupil.cls) || "";
  const line = `You found ${result.coins} coins and ${result.stars} ${result.stars === 1 ? "star" : "stars"}.`;
  hud.setCoins(result.coins, result.max, { pop: true });
  sound.play("fanfare");
  panel.message({
    title: "Island finished!",
    text: `+${result.bonus} bonus for finishing! ${line}`,
    stars: { got: result.stars, of: 3 },
    board: cls ? `Top treasure hunters · ${cls} · Unit ${quest.unit.number}` : "",
    buttons: [{ label: "Play again", act: "again" }, { label: "Back to Word Island", act: "home" }],
    onButton(act) {
      if (act === "again") location.assign(againAddress());
      else if (act === "home") location.assign(HOME);
    }
  });
  voice.say(`Island finished! ${line}`);
  if (!cls) return;
  loadBoard(quest)
    .then((rows) => panel.fillBoard(rows.length ? rows : "No scores yet. Be the first!"))
    .catch((err) => {
      console.warn("Treasure Quest: scores not loaded.", err);
      panel.fillBoard("Scores are not available right now.");
    });
}

export const finish = {
  // Listens for the last chest. engine: to count the wait only while the game runs (not paused).
  start({ quest, engine }) {
    chests.onFinished(({ coins: chestCoins }) => {
      if (result) return;
      const max = islandMax(quest.island);
      const bonus = quest.island.bonus;
      const coins = Math.min(chestCoins + bonus, max);
      result = { chestCoins, bonus, coins, max, stars: starsFor(coins, max) };
      saving = sendScore(quest);
      let waited = 0;
      const timer = setInterval(() => {
        if (engine.stats().running) waited += TICK;
        if (waited < WAIT) return;
        clearInterval(timer);
        showEnding(quest);
      }, TICK);
    });
  },

  // The play's result once the island is finished, else null (for feature 10 and the tests).
  result: () => (result ? { ...result } : null)
};
