// Treasure Quest · the screens over the island. One shows at a time:
// Stop and listen first, then a screen that ends the visit (not open, can't run…), then turn your phone,
// then the pause menu, then loading or the Play card. While any shows, the game is paused.

const HOME = "../";

// The exact words for each screen (spec 0001).
const TEXT = {
  loading: { title: "Treasure Quest", body: "Getting the island ready…", buttons: [] },
  // Phones only allow sound after a tap, so the island waits for this one (spec 0003).
  ready: { title: "Treasure Quest", body: "The island is ready.", buttons: [{ label: "Play", act: "play", gold: true, big: true }] },
  needsPupil: {
    title: "Start in Word Island first",
    body: "Open Word Island, type your name and tap your class. Then come back to the quest.",
    buttons: [{ label: "Go to Word Island", href: HOME, gold: true }]
  },
  // The island opens after the unit's five Word Island games (spec 0009).
  finishGames: {
    title: "Finish the five games first",
    body: () => `Play all five Word Island games for Unit ${unitNumber}, then come back for the treasure.`,
    buttons: [{ label: "Back to Word Island", href: HOME, gold: true }]
  },
  notOpen: {
    title: "This island is not open",
    body: "Your teacher has not opened this island for your class yet.",
    buttons: [{ label: "Back to Word Island", href: HOME, gold: true }]
  },
  unsupported: {
    title: "This device can't run the quest",
    body: "Try the other Word Island games, or ask a grown up to update the browser.",
    buttons: [{ label: "Play other games", href: HOME, gold: true }]
  },
  slow: {
    title: "The quest is too slow on this device",
    body: "Try the other Word Island games instead.",
    buttons: [{ label: "Play other games", href: HOME, gold: true }]
  },
  lost: {
    title: "The quest stopped",
    body: "Something went wrong with the picture.",
    buttons: [{ label: "Try again", act: "reload", gold: true }, { label: "Play other games", href: HOME }]
  },
  turn: { title: "Turn your phone sideways", body: "The island needs a wide screen.", buttons: [] },
  // BlockWords' pause menu (spec 0004); pause.js fills in its buttons, which show Music and Sound on or off.
  pause: { title: "Paused", body: "", buttons: () => [{ label: "Carry on", act: "stay", gold: true }] }
};

const END_SCREENS = ["needsPupil", "notOpen", "finishGames", "unsupported", "slow", "lost"];
let unitNumber = "";  // for the finishGames text

const el = {
  screen: document.getElementById("screen"),
  title: document.getElementById("screentitle"),
  text: document.getElementById("screentext"),
  buttons: document.getElementById("screenbtns"),
  hush: document.getElementById("hush"),
  hushTitle: document.getElementById("hushtitle"),
  back: document.getElementById("back"),
  world: document.getElementById("world")
};

// The probe in index.html may already have found that this browser can't run the quest.
const state = { base: window.QUEST_PROBE === false ? "unsupported" : "loading", hush: false, portrait: false, pause: false };
let shownKey = null;
const listeners = [];
const acts = {
  reload: () => location.reload(),
  stay: () => screens.setPause(false),
  play: () => {}
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function buttonHtml(button) {
  // BlockWords' buttons: the main one green, the others grey.
  const cls = button.gold ? (button.big ? "btn-big play" : "btn-big") : "btn-small";
  return button.href
    ? `<a class="${cls}" href="${esc(button.href)}">${esc(button.label)}</a>`
    : `<button type="button" class="${cls}" data-act="${esc(button.act)}">${esc(button.label)}</button>`;
}

// Which card shows now, if any.
function cardKey() {
  if (END_SCREENS.includes(state.base)) return state.base;
  if (state.portrait) return "turn";
  if (state.pause) return "pause";
  if (state.base === "loading" || state.base === "ready") return state.base;
  return null;
}

function paintButtons() {
  const text = TEXT[shownKey];
  const list = typeof text.buttons === "function" ? text.buttons() : text.buttons;
  el.buttons.innerHTML = list.map(buttonHtml).join("");
}

function render() {
  el.hush.hidden = !state.hush;
  const key = state.hush ? null : cardKey();
  if (key !== shownKey) {
    shownKey = key;
    el.screen.dataset.key = key || "";
    if (key) {
      const text = TEXT[key];
      el.title.textContent = text.title;
      const body = typeof text.body === "function" ? text.body() : text.body;
      el.text.textContent = body;
      el.text.hidden = !body;
      paintButtons();
      const first = el.buttons.querySelector("a, button");
      (first || el.title).focus({ preventScroll: true });
    }
  }
  el.screen.hidden = !key;
  const covered = state.hush || Boolean(key);
  el.back.hidden = state.base !== "running" || covered;
  el.world.inert = covered;
  el.back.inert = covered;
  el.screen.inert = state.hush;
  listeners.forEach((fn) => fn({ ...state, covered }));
}

el.buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-act]");
  if (!button || !acts[button.dataset.act]) return;
  acts[button.dataset.act]();
});
el.back.addEventListener("click", () => screens.setPause(true));

// While the teacher has paused the class, no key reaches the game.
window.addEventListener("keydown", (event) => {
  if (!state.hush) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

export const screens = {
  // The unit's number, for screens that name it (finishGames).
  setUnit(number) {
    unitNumber = String(number);
  },
  // base: loading, ready (the Play card), running, or an end screen (needsPupil, notOpen, finishGames,
  // unsupported, slow, lost).
  setBase(base) {
    if (END_SCREENS.includes(state.base)) return; // an end screen stays
    state.base = base;
    if (base !== "running") state.pause = false;
    render();
  },
  setHush(on) {
    if (on === state.hush) return;
    state.hush = on;
    render();
    if (on) el.hushTitle.focus({ preventScroll: true });
  },
  setPortrait(on) {
    if (on === state.portrait) return;
    state.portrait = on;
    render();
  },
  setPause(on) {
    if (on && state.base !== "running") return;
    if (on === state.pause) return;
    state.pause = on;
    render();
    if (!on && !el.back.hidden) el.back.focus({ preventScroll: true });
  },
  // Paints the shown card's buttons again (the pause menu after Music or Sound changes), keeping focus in place.
  refresh() {
    if (!shownKey) return;
    const at = [...el.buttons.children].indexOf(document.activeElement);
    paintButtons();
    const again = el.buttons.children[at];
    if (again) again.focus({ preventScroll: true });
  },
  // pause.js gives the pause menu its buttons (a function, so they are read fresh each time).
  setPauseButtons: (fn) => { TEXT.pause.buttons = fn; },
  // A card button with data-act="name" runs fn (pause.js adds music and sound).
  onAct: (name, fn) => { acts[name] = fn; },
  onChange: (fn) => listeners.push(fn),
  // Runs inside the Play tap, so it may start sound and speech.
  onPlay: (fn) => { acts.play = fn; },
  get state() {
    return { ...state, covered: state.hush || Boolean(cardKey()) };
  }
};

render();
