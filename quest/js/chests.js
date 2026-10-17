// Treasure Quest · treasure chests (spec 0007). Every placed spot gets a chest block at its anchor.
// Using one opens the talk box with that spot's puzzle; the coins follow spec 0002 (10, 5 after the
// hint, 0 when the answer had to be shown) and arrive at once. When the talk box closes on a finished
// puzzle the chest is done: it opens, "N left" goes down, and it can't be used again.
// Nothing is saved: a reload starts a new play.
import { B } from "./bw/blocks.js";
import { coinsFor, islandMax } from "./puzzles.js";
import { panel } from "./panel.js";
import { hud } from "./hud.js";
import { sound } from "./sound.js";
import { targets } from "./targets.js";

const list = [];         // one state per placed spot
let world = null;
let unit = null;
let max = 0;

function state() {
  const coins = list.reduce((sum, chest) => sum + (chest.coins || 0), 0);
  const done = list.filter((chest) => chest.done).length;
  return { coins: Math.min(coins, max), left: list.length - done, max, done, total: list.length };
}

function paint() {
  const now = state();
  hud.setCoins(now.coins, now.max);
  hud.setLeft(now.left);
}

// The puzzle is finished (right, or the answer shown): its coins are decided now, once.
function answered(chest) {
  chest.coins = coinsFor(chest.tries);
  paint();
}

// The talk box closed on a finished puzzle: the chest is done and can't be used again.
function finish(chest) {
  if (chest.done) return;
  chest.done = true;
  chest.remove();
  sound.play("chest");
  paint();
}

function open(chest) {
  if (chest.done) return;
  panel.open(chest.puzzle, {
    unit,
    onChoose(choice) {
      if (chest.coins !== null) return;
      if (choice.ok) {
        answered(chest);
        panel.result("right", { coins: chest.coins });
        sound.play("coin");
      } else if (chest.tries === 0) {
        chest.tries = 1;
        panel.result("wrong", { text: chest.puzzle.hint });
      } else {
        chest.tries = 2;
        answered(chest);
        // When the explanation only repeats the answer, say it once.
        const why = chest.puzzle.why && chest.puzzle.why !== chest.puzzle.answer ? chest.puzzle.why : "";
        panel.result("shown", { answer: chest.puzzle.answer, text: why });
      }
    },
    onClose() {
      if (chest.coins !== null) finish(chest);
    }
  });
}

export const chests = {
  // Places a chest at every placed spot's anchor and makes it usable. quest: the loaded quest (plan,
  // island, anchors, unit); world: the island's world.
  start({ quest, world: islandWorld }) {
    world = islandWorld;
    unit = quest.unit.id;
    max = islandMax(quest.island);
    quest.island.spots.forEach((spot) => {
      const anchor = quest.anchors.get(spot.anchor);
      const puzzle = quest.plan.find((p) => p.spot === spot.id);
      if (!anchor || !puzzle) return;
      const { x, y, z } = anchor.at;
      const chest = { spot: spot.id, puzzle, at: { x, y, z }, gold: Boolean(puzzle.challenge), tries: 0, coins: null, done: false };
      world.setBlock(x, y, z, B.CHEST);
      chest.remove = targets.add({ at: chest.at, label: "Open the chest", onUse: () => open(chest) });
      list.push(chest);
    });
    world.rebuildDirty();
    paint();
  },

  state
};
