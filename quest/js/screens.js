// Treasure Quest · the screens over the island. One shows at a time:
// Stop and listen first, then a screen that ends the visit (not open, can't run…), then turn your phone,
// then the leave box, then loading or the Play card. While any shows, the game is paused.

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
  leave: {
    title: "Leave the quest?",
    body: "",
    buttons: [{ label: "Yes, leave", href: HOME, gold: true }, { label: "No, keep playing", act: "stay" }]
  }
};

const END_SCREENS = ["needsPupil", "notOpen", "unsupported", "slow", "lost"];

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
const state = { base: window.QUEST_PROBE === false ? "unsupported" : "loading", hush: false, portrait: false, leave: false };
let shownKey = null;
const listeners = [];
let playHandler = null;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function buttonHtml(button) {
  const cls = ["btn", button.gold && "gold", button.big && "big"].filter(Boolean).join(" ");
  return button.href
    ? `<a class="${cls}" href="${esc(button.href)}">${esc(button.label)}</a>`
    : `<button type="button" class="${cls}" data-act="${esc(button.act)}">${esc(button.label)}</button>`;
}

// Which card shows now, if any.
function cardKey() {
  if (END_SCREENS.includes(state.base)) return state.base;
  if (state.portrait) return "turn";
  if (state.leave) return "leave";
  if (state.base === "loading" || state.base === "ready") return state.base;
  return null;
}

function render() {
  el.hush.hidden = !state.hush;
  const key = state.hush ? null : cardKey();
  if (key !== shownKey) {
    shownKey = key;
    if (key) {
      const text = TEXT[key];
      el.title.textContent = text.title;
      el.text.textContent = text.body;
      el.text.hidden = !text.body;
      el.buttons.innerHTML = text.buttons.map(buttonHtml).join("");
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
  if (!button) return;
  if (button.dataset.act === "reload") location.reload();
  if (button.dataset.act === "stay") screens.setLeave(false);
  if (button.dataset.act === "play" && playHandler) playHandler();
});
el.back.addEventListener("click", () => screens.setLeave(true));

// While the teacher has paused the class, no key reaches the game.
window.addEventListener("keydown", (event) => {
  if (!state.hush) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

export const screens = {
  // base: loading, ready (the Play card), running, or an end screen (needsPupil, notOpen, unsupported, slow, lost).
  setBase(base) {
    if (END_SCREENS.includes(state.base)) return; // an end screen stays
    state.base = base;
    if (base !== "running") state.leave = false;
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
  setLeave(on) {
    if (on && state.base !== "running") return;
    state.leave = on;
    render();
    if (!on && !el.back.hidden) el.back.focus({ preventScroll: true });
  },
  onChange: (fn) => listeners.push(fn),
  // Runs inside the Play tap, so it may start sound and speech.
  onPlay: (fn) => { playHandler = fn; },
  get state() {
    return { ...state, covered: state.hush || Boolean(cardKey()) };
  }
};

render();
