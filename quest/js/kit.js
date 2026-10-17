// Treasure Quest · the &kit view: everything the look and sound kit makes, in one place, so it can be
// seen and heard before the real islands use it (spec 0004, AC-18). Sample talk boxes hold real
// puzzles from this island's draw. Loaded with import() only when the address has &kit.
import { drawIsland, TYPES, islandMax, coinsFor } from "./puzzles.js";
import { panel } from "./panel.js";
import { hud } from "./hud.js";
import { sound, EFFECTS } from "./sound.js";
import { voice, CAST } from "./voice.js";
import { atlasCanvas } from "./bw/atlas.js";
import { targets } from "./targets.js";
import { controls } from "./controls.js";

const VOICE_LINES = [
  { by: "", line: "Hello! I am the narrator. Let's find the treasure." },
  { by: "Robo", line: "Hello! I am Robo. Beep beep!" },
  { by: "Ming", line: "Hello! I am Ming. Let's play!" },
  { by: "Mei", line: "Hello! I am Mei. I like the beach." },
  { by: "Jie", line: "Hello! I am Jie. Look at the sea!" },
  { by: "Flash", line: "Hello! I am Flash. I am fast!" }
];

// Blocks for the sample hotbar, so the hand has something to hold.
const SAMPLE_HOTBAR = [
  { item: "sand", count: 12 }, { item: "oak_log", count: 4 }, { item: "oak_planks", count: 16 },
  { item: "cobblestone", count: 8 }, { item: "glass", count: 3 }, { item: "red_wool", count: 5 },
  { item: "rose", count: 1 }, { item: "chest", count: 1 }, null
];

function make(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function button(label, onClick, cls = "btn-small") {
  const b = make("button", cls, label);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

export function showKit(quest) {
  const plan = drawIsland(quest.island, quest.unit, quest.seed, TYPES);
  const samples = ["chest", "riddle", "find"].map((type) => plan.find((p) => p.playAs === type)).filter(Boolean);
  const max = islandMax(quest.island);
  let coins = 0;
  let left = quest.island.spots.length;
  hud.setCoins(coins, max);
  hud.setLeft(left);
  hud.setHotbar(SAMPLE_HOTBAR);
  // The test beach's chest and villager are usable: they open the sample chest and riddle (spec 0005).
  const sample = (type) => samples.find((p) => p.playAs === type);
  if (quest.test && sample("chest")) targets.add({ at: quest.test.chest, label: "Open the chest", onUse: () => play(sample("chest")) });
  if (quest.test && sample("riddle")) targets.add({ at: quest.test.villager, label: "Talk to the villager", onUse: () => play(sample("riddle")) });

  const sheet = make("section", "panel kitsheet");
  sheet.id = "kitsheet";
  sheet.setAttribute("aria-label", "Look and sound kit");
  sheet.hidden = true;

  const note = make("p", "kitnote", `Voice: ${voice.name()} · cast: ${Object.keys(CAST).join(", ")}`);
  const toggle = button("Kit", () => {
    sheet.hidden = !sheet.hidden;
    toggle.setAttribute("aria-expanded", String(!sheet.hidden));
    if (!sheet.hidden) note.textContent = `Voice: ${voice.name()}`;
  }, "btn-small kittoggle");
  toggle.setAttribute("aria-controls", "kitsheet");
  toggle.setAttribute("aria-expanded", "false");

  // K opens and closes the kit sheet, freeing the mouse so its buttons can be clicked (spec 0005).
  window.addEventListener("keydown", (event) => {
    if (event.code !== "KeyK" || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!controls.playing() && sheet.hidden) return;
    controls.release();
    toggle.click();
  });

  const closeSheet = () => {
    sheet.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };

  // A sample puzzle plays as a feature would: 10 coins first time, 5 after one miss, shown after two.
  function play(puzzle) {
    let tries = 0;
    closeSheet();
    panel.open(puzzle, {
      unit: quest.unit.id,
      onChoose(choice) {
        if (choice.ok) {
          const won = coinsFor(tries);
          coins += won;
          left = Math.max(0, left - 1);
          hud.setCoins(coins, max);
          hud.setLeft(left);
          panel.result("right", { coins: won });
          sound.play("coin");
        } else if (tries === 0) {
          tries = 1;
          panel.result("wrong", { text: puzzle.hint });
        } else {
          tries = 2;
          panel.result("shown", { answer: puzzle.answer, text: puzzle.why });
        }
      }
    });
  }

  const puzzles = make("div", "kitrow");
  samples.forEach((puzzle) => {
    const name = { chest: "Chest", riddle: "Riddle", find: "Find" }[puzzle.playAs];
    puzzles.append(button(name, () => play(puzzle), "btn-big"));
  });
  puzzles.append(button("Message", () => {
    closeSheet();
    panel.message({
      title: "Island finished!",
      text: `You found ${coins} coins.`,
      buttons: [{ label: "Play again", act: "again" }, { label: "Close", act: "close" }],
      onButton: () => panel.close()
    });
    sound.play("fanfare");
  }));

  // The block picture sheet, drawn bigger with sharp pixels.
  const tiles = make("canvas", "kittiles");
  tiles.width = atlasCanvas.width;
  tiles.height = atlasCanvas.height;
  tiles.getContext("2d").drawImage(atlasCanvas, 0, 0);
  tiles.setAttribute("role", "img");
  tiles.setAttribute("aria-label", "The block pictures");

  const effects = make("div", "kitrow");
  EFFECTS.forEach((name) => effects.append(button(name, () => sound.play(name, { block: "grass_block" }))));
  // The music button works like Music in the pause menu.
  effects.append(button("music", () => sound.setMusic(!sound.state().music), "btn-big"));

  const voices = make("div", "kitrow");
  VOICE_LINES.forEach(({ by, line }) => {
    voices.append(button(by || "Narrator", () => {
      if (!voice.say(line, { by, fromButton: true })) note.textContent = "Read the words on the screen.";
    }));
  });

  sheet.append(
    make("h2", "", "Puzzles"), puzzles,
    make("h2", "", "Blocks"), tiles,
    make("h2", "", "Sounds"), effects,
    make("h2", "", "Voices"), voices, note
  );
  document.body.append(toggle, sheet);
  return { sheet, toggle };
}
