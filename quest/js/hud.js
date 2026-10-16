// Treasure Quest · the top bar next to the Back button: coins, puzzles left, and the Music and Sound
// buttons. The calling feature gives the numbers; the buttons save through sound.js (spec 0003).
import { sound } from "./sound.js";

// Small pixel drawings, so the buttons show on or off without words alone.
const NOTE = '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M5 0h1v6H5z M6 0h1v1h1v2H7V1H6z M2 5h4v3H2z" fill="currentColor"/></svg>';
const SPEAKER = '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M0 3h2l2-2h1v6H4L2 5H0z M6 2h1v4H6z" fill="currentColor"/></svg>';
const COIN = '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1z" fill="#c99400"/><path d="M2 1h4v1h1v4H6v1H2V6H1V2h1z" fill="#ffe14a"/><path d="M3 2h2v4H3z" fill="#c99400"/></svg>';

let root = null;
let el = {};

function make(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html) node.innerHTML = html; // fixed drawings only
  return node;
}

function toggle(name, drawing) {
  const button = make("button", "hbtn", drawing);
  button.type = "button";
  const word = make("span", "hword");
  button.append(word);
  button.dataset.name = name;
  return { button, word };
}

function build() {
  root = make("div", "hud");
  root.hidden = true;
  const coins = make("p", "hcount", COIN);
  const coinText = document.createElement("span");
  coins.append(coinText);
  const left = make("p", "hcount hleft");
  const music = toggle("Music", NOTE);
  const soundBtn = toggle("Sound", SPEAKER);
  root.append(coins, left, music.button, soundBtn.button);
  document.body.append(root);
  el = { coins, coinText, left, music, sound: soundBtn };
  music.button.addEventListener("click", () => {
    sound.setMusic(!sound.state().music);
    sound.play("click");
  });
  soundBtn.button.addEventListener("click", () => {
    const on = !sound.state().sound;
    sound.setSound(on);
    sound.play("click");
  });
  sound.onChange(paint);
  paint(sound.state());
}

// Music shows as off while Sound is off, because Sound off silences the tune too.
function paint(now) {
  const set = (part, on, label) => {
    part.button.setAttribute("aria-pressed", String(on));
    part.button.classList.toggle("off", !on);
    part.word.textContent = `${label} ${on ? "on" : "off"}`;
  };
  set(el.music, now.music, "Music");
  set(el.sound, now.sound, "Sound");
  el.music.button.classList.toggle("muted", !now.sound);
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
  }
};
