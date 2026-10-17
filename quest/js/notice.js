// Treasure Quest · a short line above the hotbar in BlockWords' hint bar style, such as
// "Back to the beach!" or "Walk closer." (spec 0005). It fades on its own; the newest line wins.
let el = null;
let timer = 0;

export function notice(text, ms = 2000) {
  if (!el) {
    el = document.createElement("p");
    el.className = "notice";
    el.setAttribute("role", "status");
    el.hidden = true;
    document.body.append(el);
  }
  el.textContent = text;
  el.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => { el.hidden = true; }, ms);
}
