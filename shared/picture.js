// Word Island · shared picture drawer: how a question's picture and choice labels look.
// Loaded as a classic script after shared/bank.js, by Word Island and by Treasure Quest,
// so every question looks the same in both. The quest passes "../img/" as the image folder.
const HEX = {
  red: "#d62828", yellow: "#ffd60a", orange: "#f77f00", purple: "#7b2cbf",
  blue: "#1d6fe0", green: "#2a9d3a", black: "#1b1b1b", white: "#ffffff"
};
const THING = {
  pen: "a pen", pencil: "a pencil", ruler: "a ruler", rubber: "a rubber", book: "a book",
  notebook: "a notebook", bag: "a bag", desk: "a desk", pencilcase: "a pencil case"
};

const ICONS = {
  pen: '<rect x="28" y="10" width="24" height="40" rx="6" fill="#2f6fed"/><rect x="28" y="10" width="24" height="10" rx="4" fill="#14213d"/><rect x="46" y="18" width="6" height="22" rx="2" fill="#9db7f5"/><polygon points="28,50 52,50 40,70" fill="#d5deee"/><circle cx="40" cy="66" r="2.5" fill="#14213d"/>',
  pencil: '<rect x="30" y="4" width="20" height="12" rx="2" fill="#f2a7b8"/><rect x="30" y="16" width="20" height="6" fill="#9aa3ad"/><rect x="30" y="22" width="20" height="30" fill="#ffe14a"/><polygon points="30,52 50,52 40,74" fill="#e7c39a"/><polygon points="35,58 45,58 40,74" fill="#2a2a2a"/>',
  ruler: '<rect x="8" y="32" width="64" height="16" rx="3" fill="#e7b15a" stroke="#8a5a20" stroke-width="2"/><path d="M16 32 v8 M26 32 v5 M36 32 v8 M46 32 v5 M56 32 v8 M66 32 v5" stroke="#8a5a20" stroke-width="2"/>',
  book: '<path d="M14 16 h24 v48 h-24 z" fill="#c81e1e"/><path d="M42 16 h24 v48 h-24 z" fill="#157a3a"/><path d="M38 16 h4 v48 h-4 z" fill="#f3eee4"/>',
  bag: '<rect x="18" y="30" width="44" height="36" rx="10" fill="#157a3a"/><path d="M30 30 v-6 a10 10 0 0 1 20 0 v6" fill="none" stroke="#0e4a24" stroke-width="4"/>',
  notebook: '<rect x="18" y="12" width="46" height="56" rx="4" fill="#2f6fed"/><rect x="28" y="12" width="36" height="56" fill="#f7fbff"/><circle cx="24" cy="24" r="3" fill="#d5e1f2"/><circle cx="24" cy="36" r="3" fill="#d5e1f2"/><circle cx="24" cy="48" r="3" fill="#d5e1f2"/><circle cx="24" cy="60" r="3" fill="#d5e1f2"/><path d="M34 26 h24 M34 36 h24 M34 46 h24" stroke="#9db4d6" stroke-width="2"/>',
  desk: '<rect x="8" y="28" width="64" height="12" rx="2" fill="#c4843c"/><rect x="16" y="40" width="8" height="26" fill="#8a5a20"/><rect x="56" y="40" width="8" height="26" fill="#8a5a20"/>',
  rubber: '<rect x="16" y="30" width="48" height="22" rx="4" fill="#f2a7b8"/><rect x="16" y="30" width="16" height="22" rx="4" fill="#7eb6e6"/>',
  pencilcase: '<rect x="8" y="28" width="64" height="28" rx="14" fill="#5b3fb5"/><path d="M16 30 h48" stroke="#c81e1e" stroke-width="3"/><rect x="44" y="24" width="6" height="10" rx="2" fill="#c9ced6"/><rect x="58" y="14" width="5" height="18" fill="#ffe14a"/><rect x="64" y="17" width="5" height="15" fill="#2a9d3a"/>'
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function icon(name) {
  return `<svg class="ico" viewBox="0 0 80 80" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

function balloonSvg(colour, cls) {
  const fill = HEX[colour] || colour;
  return `<svg class="${cls || "balloon"}" viewBox="0 0 60 88" aria-hidden="true">
    <path d="M30 60 q-4 10 2 26" fill="none" stroke="#14213d" stroke-width="2"/>
    <ellipse cx="30" cy="30" rx="24" ry="28" fill="${fill}" stroke="#14213d" stroke-width="3"/>
    <polygon points="26,58 34,58 30,64" fill="${fill}" stroke="#14213d" stroke-width="2"/>
    <ellipse cx="21" cy="19" rx="5" ry="8" fill="#fff" opacity=".45"/>
  </svg>`;
}

const EAR = '<svg class="ear" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="28" width="16" height="24" rx="3" fill="#14213d"/><polygon points="28,28 46,14 46,66 28,52" fill="#14213d"/><path d="M54 30 q8 10 0 20 M60 22 q16 18 0 36" fill="none" stroke="#2f6fed" stroke-width="5" stroke-linecap="round"/></svg>';

// base is the image folder as seen from the page: "img/" in Word Island, "../img/" in the quest.
function picture(item, small, base = "img/") {
  const pic = item.pic;
  let inner = "";
  let alt = item.alt || "";
  if (!pic) {
    inner = EAR;
    alt = "Listen";
  } else if (pic.img) {
    inner = `<img class="photo" src="${base}${item.unit}/${pic.img}.webp" alt="">`;
  } else if (pic.i) {
    inner = icon(pic.i);
  } else if (pic.balloon) {
    inner = balloonSvg(pic.balloon);
  } else if (pic.count) {
    inner = `<span class="tally">${Array.from({ length: pic.count }, () => icon("pencil")).join("")}</span>`;
  } else if (pic.mix) {
    inner = `<span class="mix"><span class="blob" style="background:${HEX[pic.mix[0]]}"></span>+<span class="blob" style="background:${HEX[pic.mix[1]]}"></span>=<span class="q">?</span></span>`;
  } else if (pic.abc) {
    inner = `<span class="letters">${pic.abc.split(" ").map((l) => `<span class="tile">${l}</span>`).join("")}<span class="tile q">?</span></span>`;
  } else if (pic.num != null) {
    inner = `<span class="numbadge">${pic.num}</span>`;
  } else if (pic.quote) {
    inner = `<span class="quote">“${esc(pic.quote)}”</span>`;
  } else if (pic.days) {
    inner = `<span class="letters">${pic.days.map((d) => `<span class="tile word">${esc(d)}</span>`).join("")}<span class="tile q">?</span></span>`;
  } else if (pic.cal) {
    inner = `<span class="cal"><i></i>${esc(pic.cal)}</span>`;
  }
  return `<div class="pic${small ? " small" : ""}" role="img" aria-label="${esc(alt)}">${inner}</div>`;
}

function choiceText(item, choice) {
  if (item.pics) return item.alts[item.choices.indexOf(choice)];
  return item.icons ? THING[choice] : choice;
}

function answerText(item) {
  if (item.word) return item.word;
  return choiceText(item, item.choices[0]);
}
