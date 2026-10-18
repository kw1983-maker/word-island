// Word Island · Live word search (spec 0015): the race screen the teacher starts for a whole class.
// It only draws the race and reports back through the hooks it is given; index.html owns the pupil,
// Firebase and the pause. Times are the server's, from hooks.now(), so every pupil stops together.
window.LiveRace = (() => {
  // The countdown before the grid shows; the teacher's page and the Firestore rules use the same 5 seconds.
  const READY_MS = 5000;
  const COLOURS = ["#ffe14a", "#9fe0b8", "#a9c8ff", "#ffc2a8", "#e3c4ff", "#ffd27a", "#b8f0f0", "#ffb3c7", "#d4e88c", "#f5d0a0", "#c4d4ff", "#ffcf9e"];

  function norm(text) {
    return String(text || "").toLowerCase().replace(/[^a-z]/g, "");
  }

  // Where each word sits in the grid: across (left to right) or down. The teacher's page placed them there.
  function locate(grid, word) {
    const up = word.toUpperCase();
    for (let r = 0; r < grid.length; r++) {
      const c = grid[r].indexOf(up);
      if (c >= 0) return [...up].map((_, i) => [r, c + i]);
    }
    for (let c = 0; c < (grid[0] || "").length; c++) {
      const column = grid.map((row) => row[c]).join("");
      const r = column.indexOf(up);
      if (r >= 0) return [...up].map((_, i) => [r + i, c]);
    }
    return [];
  }

  function clock(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  // host: the empty overlay element. race: { id, unit, unitNumber, words, grid, duration, startAt (ms), stopped }.
  // hooks: now() server ms, found (words already found, after a reload), clue(word) picture HTML or "",
  // onFound(list), say(word), onClose(), esc(text).
  function open(host, race, hooks) {
    const esc = hooks.esc;
    const words = race.words.map(norm);
    const goAt = race.startAt + READY_MS;
    const endAt = goAt + race.duration * 1000;
    const found = hooks.found.filter((w) => words.includes(w));
    const spots = {};
    words.forEach((w) => { spots[w] = locate(race.grid, w); });
    let stopped = Boolean(race.stopped);
    let phase = "";
    let tick = 0;
    let closed = false;

    function cellsHtml() {
      const colour = {};
      found.forEach((w) => spots[w].forEach(([r, c]) => { colour[`${r},${c}`] = COLOURS[words.indexOf(w) % COLOURS.length]; }));
      return race.grid.map((row, r) => [...row].map((ch, c) => {
        const hit = colour[`${r},${c}`];
        return `<span class="lcell${hit ? " hit" : ""}" data-cell="${r},${c}"${hit ? ` style="background:${hit}"` : ""}>${esc(ch)}</span>`;
      }).join("")).join("");
    }

    function cluesHtml() {
      return words.map((w) => {
        const got = found.includes(w);
        const pic = got ? hooks.clue(w) : "";
        return `<li class="lclue${got ? " got" : ""}">
          ${got ? `<span class="lpic">${pic || ""}</span><b>${esc(w)}</b>`
            : `<span class="lblank" aria-label="${w.length} letters">${"_ ".repeat(w.length).trim()}</span><small>${w.length} letters</small>`}
        </li>`;
      }).join("");
    }

    function countText() {
      return `Found ${found.length} of ${words.length}`;
    }

    function top(timeText) {
      return `<header class="livetop">
        <p class="pill">Live word search · Unit ${esc(race.unitNumber)}</p>
        <b class="livetime" id="livetime">${timeText}</b>
        <b class="livecount" id="livecount">${countText()}</b>
      </header>`;
    }

    function showReady() {
      phase = "ready";
      host.innerHTML = `<div class="livebox ready">
        ${top(clock(race.duration * 1000))}
        <h2 id="livetitle" tabindex="-1">Live word search!</h2>
        <p class="livecd" id="livecd" aria-live="assertive">${Math.ceil((goAt - hooks.now()) / 1000)}</p>
        <p class="lede">${words.length} words from Unit ${esc(race.unitNumber)} are hiding in the letters, across → and down ↓. Find a word, type it, press Check.</p>
      </div>`;
      host.querySelector("#livetitle").focus({ preventScroll: true });
      hooks.say(`Live word search! Get ready. Find the words and type them.`);
    }

    function showGo() {
      phase = "go";
      host.innerHTML = `<div class="livebox">
        ${top(clock(endAt - hooks.now()))}
        <form class="liveform" data-live="check" autocomplete="off">
          <label for="liveword">I found</label>
          <input id="liveword" maxlength="20" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go">
          <button type="submit" class="btn gold">Check</button>
        </form>
        <p class="livemsg" id="livemsg" role="status"></p>
        <div class="lgrid" id="lgrid" style="--n:${race.grid[0].length}" aria-label="Letter grid">${cellsHtml()}</div>
        <ul class="lclues" id="lclues" aria-label="Words to find">${cluesHtml()}</ul>
      </div>`;
      const input = host.querySelector("#liveword");
      host.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        check(input.value);
        input.value = "";
        input.focus();
      });
      input.focus({ preventScroll: true });
    }

    function showEnd() {
      phase = "end";
      const early = stopped && hooks.now() < endAt;
      host.innerHTML = `<div class="livebox end">
        ${top("0:00")}
        <h2 id="livetitle" tabindex="-1">${early ? "Your teacher stopped the race." : "Time's up!"}</h2>
        <p class="livescore">You found <b>${found.length}</b> of ${words.length} words.</p>
        ${found.length ? `<p class="lede">${found.map((w) => `<b>${esc(w)}</b>`).join(" · ")}</p>` : `<p class="lede">Good try!</p>`}
        <p class="lede">Look at your teacher's screen for the winners.</p>
        <div class="lgrid small" style="--n:${race.grid[0].length}" aria-hidden="true">${cellsHtml()}</div>
        <button type="button" class="btn gold" data-live="close">Back to Word Island</button>
      </div>`;
      host.querySelector("[data-live=close]").addEventListener("click", close);
      host.querySelector("#livetitle").focus({ preventScroll: true });
      hooks.say(`${early ? "Your teacher stopped the race." : "Time's up!"} You found ${found.length} words.`);
    }

    function say(text, kind) {
      const msg = host.querySelector("#livemsg");
      if (!msg) return;
      msg.textContent = text;
      msg.className = `livemsg ${kind || ""}`;
    }

    function check(typed) {
      if (phase !== "go") return;
      const word = norm(typed);
      if (!word) return;
      if (found.includes(word)) {
        say(`You found that one already!`, "tip");
        return;
      }
      if (!words.includes(word)) {
        say("Not one of the hidden words. Try again.", "bad");
        const form = host.querySelector(".liveform");
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
        return;
      }
      found.push(word);
      hooks.onFound(found.slice());
      hooks.say(word);
      say(found.length === words.length ? `${word}! You found them all!` : `Yes! ${word}!`, "good");
      host.querySelector("#lgrid").innerHTML = cellsHtml();
      host.querySelector("#lclues").innerHTML = cluesHtml();
      host.querySelector("#livecount").textContent = countText();
      spots[word].forEach(([r, c]) => {
        const cell = host.querySelector(`[data-cell="${r},${c}"]`);
        if (cell) cell.classList.add("pop");
      });
    }

    function step() {
      if (closed) return;
      const now = hooks.now();
      const want = stopped || now >= endAt ? "end" : now < goAt ? "ready" : "go";
      if (want !== phase) {
        if (want === "ready") showReady();
        else if (want === "go") showGo();
        else showEnd();
      }
      if (phase === "ready") {
        const cd = host.querySelector("#livecd");
        const n = String(Math.max(1, Math.ceil((goAt - now) / 1000)));
        if (cd && cd.textContent !== n) cd.textContent = n;
      } else if (phase === "go") {
        const t = host.querySelector("#livetime");
        const text = clock(endAt - now);
        if (t && t.textContent !== text) {
          t.textContent = text;
          t.classList.toggle("low", endAt - now <= 30000);
        }
      }
      if (phase === "end") {
        clearInterval(tick);
        tick = 0;
      }
    }

    function close() {
      if (closed) return;
      closed = true;
      clearInterval(tick);
      host.innerHTML = "";
      hooks.onClose();
    }

    step();
    tick = setInterval(step, 200);

    return {
      // The race document changed: the teacher may have pressed Stop.
      update(next) {
        if (next && next.stopped && !stopped) {
          stopped = true;
          step();
        }
      },
      // Back from the teacher's Pause: put the cursor back in the word box.
      focus() {
        const input = host.querySelector("#liveword");
        if (input) input.focus({ preventScroll: true });
      },
      close,
      get open() { return !closed; }
    };
  }

  return { open, norm, READY_MS };
})();
