// Treasure Quest · the island finish (spec 0008). When the last chest opens (spec 0007's finished
// hook), 1.5 seconds of play later the island ends: the finishing bonus joins the coins, the fanfare
// plays, and a talk box says "Island finished!" with the coins and up to 3 stars, read aloud. Play
// again reloads the island with fresh questions; Back to Word Island goes home. Nothing is saved yet.
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

function showEnding() {
  const line = `You found ${result.coins} coins and ${result.stars} ${result.stars === 1 ? "star" : "stars"}.`;
  hud.setCoins(result.coins, result.max, { pop: true });
  sound.play("fanfare");
  panel.message({
    title: "Island finished!",
    text: `+${result.bonus} bonus for finishing! ${line}`,
    buttons: [{ label: "Play again", act: "again" }, { label: "Back to Word Island", act: "home" }],
    onButton(act) {
      if (act === "again") location.assign(againAddress());
      else if (act === "home") location.assign(HOME);
    }
  });
  voice.say(`Island finished! ${line}`);
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
      let waited = 0;
      const timer = setInterval(() => {
        if (engine.stats().running) waited += TICK;
        if (waited < WAIT) return;
        clearInterval(timer);
        showEnding();
      }, TICK);
    });
  },

  // The play's result once the island is finished, else null (for feature 10 and the tests).
  result: () => (result ? { ...result } : null)
};
