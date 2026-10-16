// Treasure Quest · the bottom of the screen, as in BlockWords: the hotbar (9 slots) and, just above
// it, the coins and the puzzles left (spec 0004). The calling feature gives the numbers and the
// slots; feature 23 (mining) fills the slots. Keys 1 to 9 and the mouse wheel pick a slot on a
// laptop and a tap picks one on a phone, except while something covers the game.
import { blockIconUrl, blockLabel } from "./bw/icons.js";

const SLOTS = 9;
const COIN = '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1z" fill="#8a6200"/><path d="M2 1h4v1h1v4H6v1H2V6H1V2h1z" fill="#ffd23f"/><path d="M3 2h2v4H3z" fill="#c99400"/></svg>';

let root = null;
let el = {};
let slots = Array(SLOTS).fill(null);   // { item, count } or null
let selected = 0;
let blocked = () => false;
const listeners = [];

function make(tag, cls) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  return node;
}

function build() {
  root = make("div", "hud");
  root.id = "hud";
  root.hidden = true;
  const counter = make("div", "counter");
  const coins = make("p", "coins");
  coins.innerHTML = COIN; // a fixed drawing
  const coinText = make("span");
  coins.append(coinText);
  const left = make("p", "left");
  counter.append(coins, left);
  const bar = make("div", "hotbar");
  bar.id = "hotbar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Hotbar");
  root.append(counter, bar);
  document.body.append(root);
  el = { coins, coinText, left, bar };

  bar.addEventListener("click", (event) => {
    const slot = event.target.closest("button[data-at]");
    if (slot && !blocked()) select(Number(slot.dataset.at));
  });
  window.addEventListener("keydown", (event) => {
    if (root.hidden || blocked() || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^[1-9]$/.test(event.key)) select(Number(event.key) - 1);
  });
  window.addEventListener("wheel", (event) => {
    if (root.hidden || blocked() || !event.deltaY) return;
    select((selected + (event.deltaY > 0 ? 1 : SLOTS - 1)) % SLOTS);
  }, { passive: true });
  paint();
}

// BlockWords' slot: the item's picture and, above one, how many.
function slotButton(stack, at) {
  const b = make("button", "slot" + (at === selected ? " sel" : ""));
  b.type = "button";
  b.dataset.at = String(at);
  b.setAttribute("aria-pressed", String(at === selected));
  const label = stack ? blockLabel(stack.item) : "empty";
  b.setAttribute("aria-label", `Slot ${at + 1}: ${label}`);
  const url = stack && blockIconUrl(stack.item);
  if (url) {
    const img = make("img");
    img.src = url;
    img.alt = "";
    b.append(img);
    if (stack.count > 1) {
      const count = make("span", "count");
      count.textContent = String(stack.count);
      b.append(count);
    }
  }
  return b;
}

function paint() {
  el.bar.replaceChildren(...slots.map(slotButton));
}

function tell() {
  const stack = slots[selected];
  listeners.forEach((fn) => fn(stack ? stack.item : null, selected));
}

function select(at) {
  if (at === selected) return;
  selected = at;
  paint();
  tell();
}

export const hud = {
  show() {
    if (!root) build();
    root.hidden = false;
  },
  hide() {
    if (root) root.hidden = true;
  },
  setCoins(n, max) {
    if (!root) build();
    el.coinText.textContent = `${n} / ${max}`;
    el.coins.setAttribute("aria-label", `${n} coins out of ${max}`);
  },
  setLeft(n) {
    if (!root) build();
    el.left.textContent = `${n} left`;
    el.left.setAttribute("aria-label", `${n} puzzles left`);
  },
  // slots: up to 9 of { item: a block name, count } or null.
  setHotbar(list) {
    if (!root) build();
    slots = Array.from({ length: SLOTS }, (_, i) => (list && list[i]) || null);
    paint();
    tell();
  },
  select: (at) => select(at),
  selected: () => selected,
  onSelect: (fn) => listeners.push(fn),
  // While this says true (a talk box, the pause panel or a screen is open), keys, wheel and taps leave the hotbar alone.
  blockWhile(fn) {
    blocked = fn;
  }
};
