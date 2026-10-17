// Treasure Quest · the talk box: BlockWords' quest dialog over the island, showing one puzzle from
// spec 0002, its picture, 2 or 3 answers and a speak button (Hear it). It only shows and reports: the
// calling feature decides right or wrong and the coins, then tells it through result() (specs 0003, 0004).
// Text is always set with textContent; only the shared picture drawer's own markup is used as HTML.
import { sound } from "./sound.js";
import { voice } from "./voice.js";

const LABELS = { chest: "Treasure chest", find: "Listen and find", riddle: "Riddle" };
const NO_VOICE = "Read the words on the screen.";
// A five point star, drawn gold when earned and grey when not (the island finish, spec 0008).
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,1 15,9 23,9 17,14 19,23 12,18 5,23 7,14 1,9 9,9"/></svg>';

let root = null;
let el = {};
let current = null; // { puzzle, unit, onChoose, onClose, onLeave, onButton, chosen }
let opener = null;  // what had focus before, to give it back on close
const changeListeners = []; // told when the talk box opens or closes (controls stop and the mouse is freed)

function tellChange() {
  changeListeners.forEach((fn) => {
    try {
      fn(Boolean(root && !root.hidden));
    } catch (err) {
      console.warn("Treasure Quest: talk box listener failed.", err);
    }
  });
}

function make(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function build() {
  root = make("div", "panelwrap");
  root.hidden = true;
  const panel = make("div", "panel talk");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "panelq");
  const head = make("div", "quest-head");
  const label = make("p", "quest-name");
  label.id = "panellabel";
  // BlockWords' speak button: a speaker you tap to hear it again.
  const hear = make("button", "speak-btn", "🔊");
  hear.type = "button";
  hear.title = "Hear it";
  hear.setAttribute("aria-label", "Hear it");
  hear.setAttribute("aria-keyshortcuts", "H");
  head.append(label, hear);
  const question = make("h2", "quest-text");
  question.id = "panelq";
  question.tabIndex = -1;
  const body = make("div", "talk-body");
  const pic = make("div", "quest-visual");
  const choices = make("div", "answers");
  body.append(pic, choices);
  const text = make("p", "quest-sub");
  const stars = make("div", "stars");
  stars.setAttribute("role", "img");
  stars.hidden = true;
  const foot = make("div", "talk-foot");
  const line = make("p", "result");
  line.setAttribute("role", "status");
  const buttons = make("div", "talk-buttons");
  foot.append(line, buttons);
  panel.append(head, question, text, stars, body, foot);
  root.append(panel);
  document.body.append(root);
  el = { panel, head, label, hear, question, text, stars, body, pic, choices, line, buttons };

  hear.addEventListener("click", () => {
    if (!current || !current.puzzle) return;
    sound.play("click");
    const ok = voice.say(current.puzzle.say, { by: current.puzzle.by, fromButton: true });
    if (!ok) setLine(NO_VOICE, "tip");
  });
  choices.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-at]");
    if (!button || button.disabled || !current || !current.onChoose) return;
    const choice = current.puzzle.choices[Number(button.dataset.at)];
    current.chosen = button;
    sound.play("click");
    current.onChoose({ value: choice.value, label: choice.label, ok: choice.ok });
  });
  buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-act]");
    if (!button || !current) return;
    if (button.dataset.act === "carryon") {
      const done = current.onClose;
      panelApi.close();
      if (done) done();
    } else if (button.dataset.act === "leave") {
      const left = current.onLeave;
      panelApi.close();
      if (left) left();
    } else if (current.onButton) {
      sound.play("click");
      current.onButton(button.dataset.act);
    }
  });
  // Keys 1, 2, 3 pick a choice and H reads the puzzle again; Tab stays inside the panel.
  document.addEventListener("keydown", onKey);
}

function onKey(event) {
  if (!current || root.hidden || root.inert || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "Tab") {
    const stops = [...el.panel.querySelectorAll("button:not([disabled]):not([hidden])")]
      .filter((b) => b.offsetParent !== null);
    if (!stops.length) return;
    const at = stops.indexOf(document.activeElement);
    const next = event.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : (at === stops.length - 1 ? 0 : at + 1);
    event.preventDefault();
    stops[next].focus();
    return;
  }
  if (!current.puzzle) return;
  if (/^[1-3]$/.test(event.key)) {
    const button = el.choices.querySelectorAll("button")[Number(event.key) - 1];
    if (button && !button.disabled) {
      event.preventDefault();
      button.click();
    }
  } else if (event.key === "h" || event.key === "H") {
    event.preventDefault();
    el.hear.click();
  }
}

function setLine(text, kind) {
  el.line.textContent = text;
  el.line.className = "result" + (kind ? " " + kind : "");
}

function setButtons(list) {
  el.buttons.replaceChildren(...list.map((b, i) => {
    const button = make("button", i === 0 && !b.small ? "btn-big" : "btn-small", b.label);
    button.type = "button";
    button.dataset.act = b.act;
    return button;
  }));
}

// A picture choice uses the book picture; an icon choice uses the shared icon; a word choice has none.
function choiceButton(choice, at, look, unit) {
  const button = make("button", "btn-small answer");
  button.type = "button";
  button.dataset.at = String(at);
  const key = make("span", "key", String(at + 1));
  key.setAttribute("aria-hidden", "true");
  button.append(key);
  if (look === "pic") {
    const img = make("img", "thumb");
    img.alt = "";
    img.src = `../img/${unit}/${choice.value}.webp`;
    button.append(img);
  } else if (look === "icon" && typeof icon === "function") {
    const box = make("span", "thumb");
    box.innerHTML = icon(choice.value); // a fixed drawing from shared/picture.js, never bank text
    button.append(box);
  }
  button.append(make("span", "word", choice.label));
  return button;
}

function show() {
  opener = document.activeElement;
  root.hidden = false;
  sound.play("open");
  tellChange();
}

const panelApi = {
  // Opens a puzzle. onChoose gets { value, label, ok } for each pick; onClose runs after Carry on.
  // title replaces the usual title ("Gold chest"). With onLeave, a Not now button closes the talk box
  // before the puzzle is finished and then calls onLeave (spec 0007).
  open(puzzle, { unit, title, onChoose, onClose, onLeave } = {}) {
    if (!root) build();
    current = { puzzle, unit, onChoose, onClose, onLeave, chosen: null };
    el.panel.className = "panel talk puzzle";
    const kind = puzzle.playAs || puzzle.type;
    el.label.textContent = title || puzzle.by || LABELS[kind] || LABELS.chest;
    el.head.hidden = false;
    el.question.textContent = puzzle.show;
    el.text.hidden = true;
    el.stars.hidden = true;
    el.body.hidden = false;
    el.pic.hidden = !puzzle.pic;
    if (puzzle.pic && typeof picture === "function") el.pic.innerHTML = picture(puzzle.pic, true, "../img/");
    else el.pic.replaceChildren();
    el.body.classList.toggle("nopic", !puzzle.pic);
    el.choices.replaceChildren(...puzzle.choices.map((choice, at) => choiceButton(choice, at, puzzle.look, unit)));
    // Picture answers are cards side by side; word answers are full width buttons.
    el.choices.className = puzzle.look === "pic" || puzzle.look === "icon" ? "answers cards" : "answers";
    setLine("", "");
    setButtons(onLeave ? [{ label: "Not now", act: "leave", small: true }] : []);
    show();
    el.panel.setAttribute("aria-describedby", "panellabel");
    el.choices.querySelector("button").focus({ preventScroll: true });
    voice.say(puzzle.say, { by: puzzle.by });
  },

  // What the calling feature decided: right, wrong (choices stay open) or shown (the answer is marked).
  result(kind, { text = "", coins = 0, answer = "" } = {}) {
    if (!current || !current.puzzle) return;
    const buttons = [...el.choices.querySelectorAll("button")];
    if (kind === "wrong") {
      if (current.chosen) current.chosen.classList.add("wrong");
      setLine(["Try again.", text].filter(Boolean).join(" "), "wrong");
      sound.play("wrong");
      return;
    }
    buttons.forEach((button) => {
      button.disabled = true;
      const choice = current.puzzle.choices[Number(button.dataset.at)];
      if (choice.ok) button.classList.add("right");
    });
    if (kind === "right") {
      setLine(`Well done! +${coins} coins`, "right");
      sound.play("right");
    } else {
      const stop = /[.!?]$/.test(answer) ? "" : ".";
      setLine([`The answer is: ${answer}${stop}`, text].filter(Boolean).join(" "), "shown");
      sound.play("hint");
    }
    setButtons([{ label: "Carry on", act: "carryon" }]);
    el.buttons.querySelector("button").focus({ preventScroll: true });
  },

  // A plain talk box with buttons, for the island finish and other features.
  // onButton(act) runs when a button is tapped; the caller closes the panel.
  // stars: { got, of } shows a row of `of` stars, `got` of them gold (spec 0008).
  message({ title = "", text = "", stars = null, buttons = [], onButton } = {}) {
    if (!root) build();
    current = { puzzle: null, onButton };
    el.panel.className = "panel talk message";
    el.head.hidden = true;
    el.question.textContent = title;
    el.text.textContent = text;
    el.text.hidden = !text;
    el.stars.hidden = !stars;
    if (stars) {
      el.stars.innerHTML = Array.from({ length: stars.of }, (_, i) => STAR.replace("<svg", `<svg class="${i < stars.got ? "on" : "off"}"`)).join("");
      el.stars.setAttribute("aria-label", `${stars.got} of ${stars.of} stars`);
    }
    el.body.hidden = true;
    setLine("", "");
    setButtons(buttons);
    show();
    el.panel.setAttribute("aria-describedby", "panelq");
    const first = el.buttons.querySelector("button");
    (first || el.question).focus({ preventScroll: true });
  },

  close() {
    if (!root || root.hidden) return;
    root.hidden = true;
    current = null;
    voice.stop();
    sound.play("close");
    if (opener && document.contains(opener) && typeof opener.focus === "function") opener.focus({ preventScroll: true });
    opener = null;
    tellChange();
  },

  // fn(open): runs when the talk box opens (true) or closes (false).
  onChange: (fn) => changeListeners.push(fn),

  isOpen: () => Boolean(root && !root.hidden)
};

export const panel = panelApi;
