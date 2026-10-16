// Treasure Quest · the &kit view: everything the look and sound kit makes, in one place, so it can be
// seen and heard before the real islands use it. Sample panels hold real puzzles from this island's draw.
// Loaded with import() only when the address has &kit (spec 0003, AC-14).
import { drawIsland, TYPES, islandMax, coinsFor } from "./puzzles.js";
import { panel } from "./panel.js";
import { hud } from "./hud.js";
import { sound, EFFECTS } from "./sound.js";
import { voice, CAST } from "./voice.js";

const VOICE_LINES = [
  { by: "", line: "Hello! I am the narrator. Let's find the treasure." },
  { by: "Robo", line: "Hello! I am Robo. Beep beep!" },
  { by: "Ming", line: "Hello! I am Ming. Let's play!" },
  { by: "Mei", line: "Hello! I am Mei. I like the beach." },
  { by: "Jie", line: "Hello! I am Jie. Look at the sea!" },
  { by: "Flash", line: "Hello! I am Flash. I am fast!" }
];

function make(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function button(label, onClick, cls = "wbtn stone") {
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
  hud.show();
  hud.setCoins(coins, max);
  hud.setLeft(left);

  // A sample puzzle plays as a feature would: 10 coins first time, 5 after one miss, shown after two.
  function play(puzzle) {
    let tries = 0;
    sheet.hidden = true;
    toggleBtn.setAttribute("aria-expanded", "false");
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

  const sheet = make("section", "kitsheet");
  sheet.id = "kitsheet";
  sheet.setAttribute("aria-label", "Look and sound kit");
  sheet.hidden = true;

  const puzzles = make("div", "kitrow");
  samples.forEach((puzzle) => {
    const name = { chest: "Chest", riddle: "Riddle", find: "Find" }[puzzle.playAs];
    puzzles.append(button(name, () => play(puzzle), "wbtn grass"));
  });
  puzzles.append(button("Message", () => {
    sheet.hidden = true;
    panel.message({
      title: "Island finished!",
      text: `You found ${coins} coins.`,
      buttons: [{ label: "Play again", act: "again" }, { label: "Close", act: "close" }],
      onButton: () => panel.close()
    });
    sound.play("fanfare");
  }));

  const effects = make("div", "kitrow");
  Object.keys(EFFECTS).forEach((name) => effects.append(button(name, () => sound.play(name))));

  const voices = make("div", "kitrow");
  VOICE_LINES.forEach(({ by, line }) => {
    voices.append(button(by || "Narrator", () => {
      if (!voice.say(line, { by, fromButton: true })) note.textContent = "Read the words on the screen.";
    }));
  });
  const note = make("p", "kitnote", `Voice: ${voice.name()} · cast: ${Object.keys(CAST).join(", ")}`);

  sheet.append(
    make("h2", "", "Puzzles"), puzzles,
    make("h2", "", "Sounds"), effects,
    make("h2", "", "Voices"), voices, note
  );

  const toggleBtn = button("Kit", () => {
    sheet.hidden = !sheet.hidden;
    toggleBtn.setAttribute("aria-expanded", String(!sheet.hidden));
    if (!sheet.hidden) note.textContent = `Voice: ${voice.name()}`;
  }, "wbtn grass kittoggle");
  toggleBtn.setAttribute("aria-controls", "kitsheet");
  toggleBtn.setAttribute("aria-expanded", "false");
  document.body.append(toggleBtn, sheet);
  return { sheet, toggle: toggleBtn };
}
