// Word Island · "Run and pick", drawn on a canvas.
// A blue robot runs down a neon road. Each question sends red hurdles, then a row of gates, down the
// lanes; the pupil jumps or dodges the hurdles and changes lane to run through the right gate.
// index.html owns the questions, stars and results; this file runs the robot and reports what
// happened through the hooks it is given.
window.RunGame = (() => {
  const FONT = "Lexend, 'Trebuchet MS', sans-serif";
  const ARCADE = "'Black Ops One', Lexend, sans-serif";
  const NEON = ["#00eaff", "#ff2d95", "#ffe14a"];
  const HEARTS = 3;
  const HIT_AT = 0.93;
  const GONE_AT = 1.32;
  const SWIPE = 30;
  // The hurdles run this far ahead of the gates, and the robot is clear of them while it is above CLEAR.
  const LEAD = 0.3;
  const JUMP_SECONDS = 0.6;
  const CLEAR = 0.3;

  let game = null;
  const pictures = new Map();

  function newRound() {
    return { score: 0, combo: 0, bestCombo: 0, hearts: HEARTS, lane: 1 };
  }

  // ---------- sound: short synthesised effects, quieter while the word is being spoken ----------
  const sound = {
    ctx: null,
    unlock() {
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === "suspended") this.ctx.resume();
      } catch (err) {
        this.ctx = null;
      }
    },
    level() {
      if (!this.ctx || !game || !game.hooks.soundOn()) return 0;
      const talking = window.speechSynthesis && window.speechSynthesis.speaking;
      return talking ? 0.25 : 1;
    },
    tone(freq, type, seconds, volume, delay) {
      const level = this.level();
      if (!level) return;
      const at = this.ctx.currentTime + (delay || 0);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(volume * level, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + seconds);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(at);
      osc.stop(at + seconds);
    },
    move() { this.tone(520, "sine", 0.05, 0.025); },
    jump() {
      this.tone(380, "square", 0.08, 0.03);
      this.tone(620, "square", 0.1, 0.03, 0.06);
    },
    clear() { this.tone(900, "sine", 0.1, 0.05); },
    right(combo) {
      const lift = Math.min(6, combo) * 40;
      this.tone(523 + lift, "sine", 0.18, 0.07);
      this.tone(659 + lift, "sine", 0.18, 0.06, 0.07);
      this.tone(784 + lift, "sine", 0.3, 0.06, 0.14);
    },
    wrong() {
      this.tone(160, "sawtooth", 0.3, 0.08);
      this.tone(110, "sawtooth", 0.3, 0.08, 0.05);
    }
  };

  function picture(url) {
    if (!url) return null;
    let img = pictures.get(url);
    if (!img) {
      img = new Image();
      img.decoding = "async";
      img.src = url;
      pictures.set(url, img);
    }
    return img;
  }

  // ---------- start, stop, questions ----------
  function mount(host, round, hooks) {
    stop();
    const canvas = document.createElement("canvas");
    canvas.className = "skycanvas runcanvas";
    canvas.setAttribute("aria-hidden", "true");
    host.prepend(canvas);
    game = {
      host, canvas, ctx: canvas.getContext("2d"), round, hooks,
      w: 0, h: 0, dpr: 1, last: 0, raf: 0, time: 0,
      lanes: 3, fx: round.lane, step: 0, row: null, leaving: [], jumpAt: -1,
      particles: [], rings: [], popups: [], stars: [], shake: 0, flash: 0, hurt: 0, scroll: 0, stride: 0,
      press: null
    };
    fit();
    makeStars();
    listen();
    game.raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (!game) return;
    cancelAnimationFrame(game.raf);
    unlisten();
    game.canvas.remove();
    game = null;
  }

  // gates: [{ ok, text, img, big, label }] in lane order, left to right. A picture gate shows its label
  // until the picture is ready. step: the question number, for speed.
  function ask(gates, step) {
    if (!game) return;
    game.lanes = gates.length;
    game.round.lane = Math.min(game.round.lane, game.lanes - 1);
    game.step = step || 0;
    game.leaving = [];
    game.row = {
      resolved: false, u: -LEAD, delay: 0.05, checked: false, hurdleChecked: false, hurdles: makeHurdles(),
      gates: gates.map((gate, lane) => ({
        lane, ok: gate.ok, text: gate.text || gate.label || "", img: picture(gate.img), big: !!gate.big, state: "live", pop: 0
      }))
    };
  }

  // Half of the time a hurdle fills every lane, so the robot has to jump. Otherwise it fills one or two
  // lanes and the robot can jump or step around it.
  function makeHurdles() {
    const lanes = Array.from({ length: game.lanes }, (_, lane) => lane);
    if (Math.random() < 0.5) return { lanes, cleared: false };
    const blocked = lanes.filter(() => Math.random() < 0.5);
    if (!blocked.length) blocked.push(Math.floor(Math.random() * game.lanes));
    if (blocked.length === game.lanes) blocked.pop();
    return { lanes: blocked, cleared: false };
  }

  function jump() {
    if (!game || game.hooks.isPaused() || game.jumpAt >= 0) return;
    game.jumpAt = 0;
    sound.jump();
  }

  // How high the robot is, from 0 on the road to 1 at the top of the jump.
  function height() {
    if (game.jumpAt < 0) return 0;
    const t = game.jumpAt / JUMP_SECONDS;
    return 4 * t * (1 - t);
  }

  // A keyboard pick runs to that lane. The robot still has to arrive before the gates do.
  function pick(lane) {
    if (!game || game.hooks.isPaused()) return;
    goTo(lane);
  }

  function unlockSound() {
    sound.unlock();
  }

  // ---------- input ----------
  function goTo(lane) {
    const next = Math.max(0, Math.min(game.lanes - 1, lane));
    if (next === game.round.lane) return;
    game.round.lane = next;
    sound.move();
  }

  function laneAt(x) {
    const half = roadHalf();
    const edge = game.w / 2 - half;
    return Math.floor((x - edge) / ((half * 2) / game.lanes));
  }

  function onDown(event) {
    if (!game || game.hooks.isPaused() || event.button > 0) return;
    sound.unlock();
    const rect = game.canvas.getBoundingClientRect();
    game.press = { x: event.clientX, y: event.clientY, from: event.clientX - rect.left, swiped: false };
    try { game.canvas.setPointerCapture(event.pointerId); } catch (err) { /* older browsers */ }
    event.preventDefault();
  }

  function onMove(event) {
    if (!game || !game.press || game.hooks.isPaused()) return;
    const dx = event.clientX - game.press.x;
    const dy = event.clientY - game.press.y;
    // Swipe up to jump, sideways to change lane.
    if (dy <= -SWIPE && -dy > Math.abs(dx)) {
      jump();
      game.press.y = event.clientY;
      game.press.swiped = true;
      return;
    }
    if (Math.abs(dx) < SWIPE) return;
    goTo(game.round.lane + (dx > 0 ? 1 : -1));
    game.press.x = event.clientX;
    game.press.swiped = true;
  }

  function onUp() {
    if (!game || !game.press) return;
    const press = game.press;
    game.press = null;
    if (press.swiped || game.hooks.isPaused()) return;
    // A tap runs to the lane that was tapped; tapping the lane the robot is already in makes it jump.
    const lane = Math.max(0, Math.min(game.lanes - 1, laneAt(press.from)));
    if (lane === game.round.lane) jump();
    else goTo(lane);
  }

  const KEYS = { ArrowLeft: -1, ArrowRight: 1, a: -1, A: -1, d: 1, D: 1 };
  const JUMP_KEYS = ["ArrowUp", "w", "W", " "];

  function onKeyDown(event) {
    if (!game || game.hooks.isPaused() || !(event.key in KEYS || JUMP_KEYS.includes(event.key))) return;
    const target = event.target;
    if (target && target.closest && target.closest("input, select, textarea")) return;
    if (event.key === " " && target && target.closest && target.closest("button, a")) return;
    if (event.key in KEYS) goTo(game.round.lane + KEYS[event.key]);
    else jump();
    event.preventDefault();
  }

  function listen() {
    game.canvas.addEventListener("pointerdown", onDown);
    game.canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onUp);
  }

  function unlisten() {
    game.canvas.removeEventListener("pointerdown", onDown);
    game.canvas.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("blur", onUp);
  }

  // ---------- helpers ----------
  function fit() {
    const w = game.canvas.clientWidth;
    const h = game.canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w === game.w && h === game.h && dpr === game.dpr) return;
    game.w = w;
    game.h = h;
    game.dpr = dpr;
    game.canvas.width = Math.max(1, Math.round(w * dpr));
    game.canvas.height = Math.max(1, Math.round(h * dpr));
  }

  function makeStars() {
    game.stars = Array.from({ length: 70 }, () => ({ fx: Math.random(), fy: Math.random(), size: 0.6 + Math.random() * 1.6, tw: Math.random() * 6.3 }));
  }

  function roadHalf() {
    return Math.min(game.w * 0.46, game.h * 0.6);
  }

  function horizon() {
    return game.h * 0.34;
  }

  function ground() {
    return game.h * 0.86;
  }

  function laneWidth() {
    return (roadHalf() * 2) / game.lanes;
  }

  // Perspective: q is 0 at the horizon and 1 where the robot runs. Gates start part-way up the road
  // (fading in) so that they are big enough to read well before they arrive.
  function depth(u) {
    return 0.12 + 0.88 * Math.pow(u, 1.3);
  }

  function screenY(q) {
    return horizon() + (ground() - horizon()) * q;
  }

  function laneX(lane, q) {
    return game.w / 2 + (lane - (game.lanes - 1) / 2) * laneWidth() * q;
  }

  function burst(x, y, color, count, speed) {
    for (let i = 0; i < count && game.particles.length < 220; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const v = (0.3 + Math.random()) * (speed || 360);
      game.particles.push({ x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, life: 1, color, size: 2 + Math.random() * 4 });
    }
  }

  function popup(x, y, text, color) {
    game.popups.push({ x, y, text, color, life: 1 });
  }

  // ---------- what happens when the robot runs through a gate ----------
  function hitGate(gate) {
    const round = game.round;
    const q = depth(game.row.u);
    const x = laneX(gate.lane, q);
    const y = screenY(q) - laneWidth() * q * 0.4;
    if (gate.ok) {
      gate.state = "right";
      game.row.resolved = true;
      round.combo += 1;
      round.bestCombo = Math.max(round.bestCombo, round.combo);
      const gained = 100 * round.combo;
      round.score += gained;
      burst(x, y, "#4cffb0", 28, 440);
      game.rings.push({ x, y, r: 8, maxR: laneWidth() * 1.2, life: 1, color: "#4cffb0" });
      game.flash = 0.35;
      sound.right(round.combo);
      popup(x, y - 30, "+" + gained, "#4cffb0");
      if (round.combo >= 2) popup(x, y - 62, "COMBO x" + round.combo + "!", "#ffe14a");
      game.leaving = game.row.gates.filter((other) => other !== gate && other.state === "live").map((other) => ({ gate: other, row: game.row, life: 1 }));
      game.hooks.onRight();
      return;
    }
    gate.state = "wrong";
    round.combo = 0;
    round.hearts = Math.max(0, round.hearts - 1);
    round.score = Math.max(0, round.score - 50);
    burst(x, y, "#ff3d3d", 22, 400);
    game.shake = 12;
    game.hurt = 1.2;
    sound.wrong();
    popup(x, y - 30, "-50", "#ff6a55");
    game.hooks.onWrong();
  }

  // ---------- the frame loop ----------
  function loop(now) {
    if (!game) return;
    game.raf = requestAnimationFrame(loop);
    fit();
    const dt = Math.min(0.05, game.last ? (now - game.last) / 1000 : 0.016);
    game.last = now;
    game.time += dt;
    update(dt);
    draw();
  }

  function update(dt) {
    const paused = game.hooks.isPaused();
    game.fx += (game.round.lane - game.fx) * Math.min(1, dt * 16);
    if (game.jumpAt >= 0) {
      game.jumpAt += dt;
      if (game.jumpAt >= JUMP_SECONDS) game.jumpAt = -1;
    }
    if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 40);
    if (game.flash > 0) game.flash = Math.max(0, game.flash - dt);
    if (game.hurt > 0) game.hurt = Math.max(0, game.hurt - dt);
    game.scroll = (game.scroll + dt * (paused ? 0.25 : 1.7)) % 1;
    game.stride += dt * (paused ? 4 : 14);
    game.particles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      p.life -= dt * 1.6;
    });
    game.particles = game.particles.filter((p) => p.life > 0);
    game.rings.forEach((r) => { r.r += (r.maxR - r.r) * Math.min(1, dt * 8); r.life -= dt * 2.4; });
    game.rings = game.rings.filter((r) => r.life > 0);
    game.popups.forEach((p) => { p.y -= 46 * dt; p.life -= dt * 0.9; });
    game.popups = game.popups.filter((p) => p.life > 0);
    game.leaving.forEach((item) => { item.life -= dt * 3; });
    game.leaving = game.leaving.filter((item) => item.life > 0);
    if (paused || !game.row) return;
    const row = game.row;
    if (row.delay > 0) {
      row.delay -= dt;
      return;
    }
    if (row.resolved) return;
    const seconds = Math.max(1.6, 2.5 - game.step * 0.1);
    row.u += dt / seconds;
    if (!row.hurdleChecked && row.u + LEAD >= HIT_AT) {
      row.hurdleChecked = true;
      hitHurdle(row.hurdles);
    }
    if (!row.checked && row.u >= HIT_AT) {
      row.checked = true;
      const gate = row.gates.find((g) => g.lane === game.round.lane && g.state === "live");
      if (gate) hitGate(gate);
    }
    // The row ran past without a right pick. Wrong gates are gone; the rest come round again
    // behind a new hurdle.
    if (row.u >= GONE_AT && !row.resolved) {
      row.gates = row.gates.filter((g) => g.state === "live");
      row.u = -LEAD;
      row.delay = 0.3;
      row.checked = false;
      row.hurdleChecked = false;
      row.hurdles = makeHurdles();
    }
  }

  // The robot is either high enough to clear the hurdle, or it loses a heart.
  function hitHurdle(hurdles) {
    const lane = game.round.lane;
    if (!hurdles.lanes.includes(lane)) return;
    const round = game.round;
    const q = depth(HIT_AT);
    const x = laneX(lane, q);
    const y = screenY(q) - laneWidth() * q * 0.5;
    if (height() > CLEAR) {
      hurdles.cleared = true;
      round.score += 25;
      popup(x, y, "+25 JUMP!", "#ffe14a");
      sound.clear();
      return;
    }
    hurdles.hit = true;
    round.combo = 0;
    round.hearts = Math.max(0, round.hearts - 1);
    round.score = Math.max(0, round.score - 50);
    burst(x, y, "#ff3d3d", 18, 380);
    game.shake = 10;
    game.hurt = 1;
    sound.wrong();
    popup(x, y, "-50", "#ff6a55");
  }

  // ---------- drawing ----------
  function draw() {
    const { ctx, w, h, dpr } = game;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save();
    if (game.shake > 0) ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
    drawSky(ctx, w, h);
    drawFloor(ctx, w, h);
    game.leaving.forEach((item) => drawGate(ctx, item.gate, depth(item.row.u), item.life * 0.8));
    const row = game.row;
    if (row && row.delay <= 0 && !row.resolved) {
      // The gates are farther away than the hurdles, so they are drawn first.
      if (row.u > 0) row.gates.forEach((gate) => drawGate(ctx, gate, depth(row.u), Math.min(1, row.u / 0.12)));
      const ahead = row.u + LEAD;
      if (ahead < GONE_AT) drawHurdles(ctx, row.hurdles, depth(Math.max(0, ahead)), Math.min(1, ahead / 0.12));
    }
    drawRobot(ctx);
    drawEffects(ctx);
    drawHud(ctx, w);
    ctx.restore();
    if (game.flash > 0) {
      ctx.fillStyle = `rgba(76, 255, 176, ${game.flash * 0.4})`;
      ctx.fillRect(0, 0, w, h);
    }
    if (game.hurt > 0) {
      ctx.fillStyle = `rgba(255, 40, 40, ${Math.min(0.28, game.hurt * 0.3)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawSky(ctx, w, h) {
    const hy = horizon();
    const sky = ctx.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, "#050011");
    sky.addColorStop(0.65, "#2a0a52");
    sky.addColorStop(1, "#8a1a78");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, hy + 1);
    game.stars.forEach((star) => {
      const glow = 0.45 + 0.55 * Math.sin(game.time * 2 + star.tw);
      ctx.fillStyle = `rgba(255,255,255,${0.25 + glow * 0.6})`;
      ctx.fillRect(star.fx * w, star.fy * hy * 0.8, star.size, star.size);
    });
    // The sun, with the stripes cut out of its lower half.
    const r = Math.min(w, h) * 0.24;
    const sun = ctx.createLinearGradient(0, hy - r, 0, hy);
    sun.addColorStop(0, "#ffe14a");
    sun.addColorStop(1, "#ff2d95");
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, hy);
    ctx.clip();
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(w / 2, hy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a0f66";
    for (let i = 1; i <= 4; i += 1) ctx.fillRect(w / 2 - r, hy - i * r * 0.2, r * 2, i * 1.6);
    ctx.restore();
  }

  function drawFloor(ctx, w, h) {
    const hy = horizon();
    const gy = ground();
    const floor = ctx.createLinearGradient(0, hy, 0, h);
    floor.addColorStop(0, "#2a0a52");
    floor.addColorStop(1, "#0b0120");
    ctx.fillStyle = floor;
    ctx.fillRect(0, hy, w, h - hy);
    const half = roadHalf();
    const qBottom = (h - hy) / (gy - hy);
    // The road.
    ctx.fillStyle = "rgba(20, 4, 48, .85)";
    ctx.beginPath();
    ctx.moveTo(w / 2 - half * 0.04, hy);
    ctx.lineTo(w / 2 + half * 0.04, hy);
    ctx.lineTo(w / 2 + half * qBottom, h);
    ctx.lineTo(w / 2 - half * qBottom, h);
    ctx.closePath();
    ctx.fill();
    // Grid lines running away: faint across the ground, bright on the lane edges.
    ctx.lineWidth = 1;
    const spacing = (half * 2) / 3;
    for (let k = -9; k <= 9; k += 1) {
      const x = w / 2 + k * spacing;
      const edge = Math.abs(x - w / 2) <= half + 1;
      if (edge) continue;
      ctx.strokeStyle = "rgba(255, 45, 149, .22)";
      ctx.beginPath();
      ctx.moveTo(w / 2, hy);
      ctx.lineTo(w / 2 + (x - w / 2) * qBottom, h);
      ctx.stroke();
    }
    const lw = laneWidth();
    for (let k = 0; k <= game.lanes; k += 1) {
      const outer = k === 0 || k === game.lanes;
      const x = w / 2 + (k - game.lanes / 2) * lw;
      ctx.strokeStyle = outer ? "#00eaff" : "rgba(0, 234, 255, .45)";
      ctx.lineWidth = outer ? 3 : 1.5;
      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = outer ? 10 : 0;
      ctx.beginPath();
      ctx.moveTo(w / 2 + (x - w / 2) * 0.04, hy);
      ctx.lineTo(w / 2 + (x - w / 2) * qBottom, h);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // Cross lines scroll toward the robot.
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i += 1) {
      const t = (i + game.scroll) / 14;
      const q = 0.04 + Math.pow(t, 2.3) * (qBottom - 0.04);
      const y = hy + (gy - hy) * q;
      const span = half * q;
      ctx.strokeStyle = `rgba(255, 45, 149, ${0.18 + t * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(w / 2 - span, y);
      ctx.lineTo(w / 2 + span, y);
      ctx.stroke();
    }
  }

  function drawGate(ctx, gate, q, fade) {
    if (gate.state === "right" || fade <= 0) return;
    const lw = laneWidth();
    const x = laneX(gate.lane, q);
    const y = screenY(q);
    const gw = lw * q * 0.94;
    const gh = gw * 0.88;
    const color = gate.state === "wrong" ? "#ff3d3d" : NEON[gate.lane % NEON.length];
    ctx.save();
    ctx.globalAlpha = fade * (gate.state === "wrong" ? 0.45 : 1);
    ctx.shadowColor = color;
    ctx.shadowBlur = 6 + 14 * q;
    ctx.fillStyle = "rgba(8, 0, 30, .92)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 + 3 * q;
    roundRect(ctx, x - gw / 2, y - gh, gw, gh, Math.max(4, gw * 0.12));
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    // A glowing base line where the gate stands on the road.
    ctx.fillStyle = color;
    ctx.fillRect(x - gw / 2, y - 2 - q * 2, gw, 3 + q * 2);
    const pad = gw * 0.07;
    if (gate.img && gate.img.complete && gate.img.naturalWidth) {
      const box = Math.min(gw - pad * 2, gh - pad * 2);
      const ratio = gate.img.naturalWidth / gate.img.naturalHeight;
      const dw = ratio >= 1 ? box : box * ratio;
      const dh = ratio >= 1 ? box / ratio : box;
      ctx.drawImage(gate.img, x - dw / 2, y - gh / 2 - dh / 2, dw, dh);
    } else if (gate.text) {
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      fitText(ctx, gate.text, x, y - gh / 2, gw - pad * 2, gh - pad * 2, gate.big);
    }
    ctx.restore();
  }

  // Red hurdles across some or all of the lanes. Jump them, or step into a free lane.
  function drawHurdles(ctx, hurdles, q, fade) {
    if (hurdles.hit || fade <= 0) return;
    const lw = laneWidth();
    const y = screenY(q);
    const bw = lw * q * 0.92;
    const bh = lw * q * 0.3;
    hurdles.lanes.forEach((lane) => {
      const x = laneX(lane, q);
      ctx.save();
      ctx.globalAlpha = fade * (hurdles.cleared ? 0.45 : 1);
      ctx.shadowColor = "#ff2d2d";
      ctx.shadowBlur = 6 + 12 * q;
      const body = ctx.createLinearGradient(0, y - bh, 0, y);
      body.addColorStop(0, "#ff6a55");
      body.addColorStop(1, "#b3121e");
      ctx.fillStyle = body;
      roundRect(ctx, x - bw / 2, y - bh, bw, bh, Math.max(2, bh * 0.25));
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 255, 255, .85)";
      ctx.fillRect(x - bw / 2 + bw * 0.08, y - bh * 0.62, bw * 0.84, Math.max(1.5, bh * 0.14));
      if (q > 0.25 && !hurdles.cleared) {
        ctx.fillStyle = "#ffe14a";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = `700 ${Math.round(10 + 16 * q)}px ${FONT}`;
        ctx.fillText("▲", x, y - bh - 4 - 3 * Math.sin(game.time * 9));
      }
      ctx.restore();
    });
  }

  function drawRobot(ctx) {
    const lw = laneWidth();
    const x = game.w / 2 + (game.fx - (game.lanes - 1) / 2) * lw;
    const y = ground();
    const s = Math.min(game.h * 0.21, lw * 1.15);
    const air = height();
    const swing = Math.sin(game.stride) * (1 - air);
    const lean = (game.round.lane - game.fx) * 0.12;
    const blink = game.hurt > 0 && Math.floor(game.hurt * 12) % 2 === 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = blink ? 0.35 : 1;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.45 - air * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(0, 2, s * (0.32 - air * 0.1), s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(0, -air * s * 0.75);
    ctx.rotate(lean);
    ctx.lineCap = "round";
    // Legs.
    [-1, 1].forEach((side) => {
      const lift = swing * side * s * 0.07;
      ctx.fillStyle = "#17324d";
      roundRect(ctx, side * s * 0.11 - s * 0.07, -s * 0.32 - Math.max(0, lift), s * 0.14, s * 0.3, s * 0.05);
      ctx.fill();
      ctx.fillStyle = "#00eaff";
      ctx.fillRect(side * s * 0.11 - s * 0.07, -s * 0.12 - Math.max(0, lift), s * 0.14, s * 0.025);
    });
    // Arms.
    ctx.strokeStyle = "#2f6fed";
    ctx.lineWidth = s * 0.1;
    [-1, 1].forEach((side) => {
      const reach = swing * -side * s * 0.12 - air * s * 0.2;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.23, -s * 0.58);
      ctx.lineTo(side * s * 0.29, -s * 0.4 + reach);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(side * s * 0.29, -s * 0.38 + reach, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
    });
    // Body and the glowing panel on its back.
    ctx.fillStyle = "#2f6fed";
    roundRect(ctx, -s * 0.21, -s * 0.64, s * 0.42, s * 0.36, s * 0.09);
    ctx.fill();
    ctx.fillStyle = "#1b4aa8";
    roundRect(ctx, -s * 0.14, -s * 0.58, s * 0.28, s * 0.24, s * 0.05);
    ctx.fill();
    ctx.fillStyle = "#00eaff";
    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, -s * 0.46, s * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Head: seen from behind, with ear lights and an antenna.
    ctx.fillStyle = "#4a86f5";
    roundRect(ctx, -s * 0.17, -s * 0.9, s * 0.34, s * 0.27, s * 0.09);
    ctx.fill();
    ctx.fillStyle = "#00eaff";
    ctx.fillRect(-s * 0.2, -s * 0.8, s * 0.04, s * 0.1);
    ctx.fillRect(s * 0.16, -s * 0.8, s * 0.04, s * 0.1);
    ctx.strokeStyle = "#14213d";
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(0, -s * 0.99);
    ctx.stroke();
    ctx.fillStyle = "#ff3d3d";
    ctx.beginPath();
    ctx.arc(0, -s * 1.0, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawEffects(ctx) {
    game.rings.forEach((r) => {
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.life);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    game.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    game.popups.forEach((p) => {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.font = `700 ${Math.round(20 * Math.max(0.8, game.w / 600))}px ${ARCADE}`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,.7)";
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1;
  }

  function drawHud(ctx, w) {
    const round = game.round;
    const small = Math.max(14, Math.min(20, w / 28));
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `${Math.round(small * 1.3)}px ${FONT}`;
    for (let i = 0; i < HEARTS; i += 1) {
      ctx.fillStyle = i < round.hearts ? "#ff2d95" : "rgba(255,255,255,.2)";
      ctx.fillText("♥", 12 + i * small * 1.5, 22);
    }
    ctx.textAlign = "right";
    ctx.fillStyle = "#e8f4ff";
    ctx.font = `${Math.round(small * 1.15)}px ${ARCADE}`;
    ctx.fillText("SCORE " + round.score, w - 12, 22);
    if (round.combo >= 2) {
      ctx.fillStyle = "#ffe14a";
      ctx.fillText("COMBO x" + round.combo, w - 12, 22 + small * 1.5);
    }
    // Without sound, the word to run to is written at the top.
    const target = game.hooks.target();
    if (target) {
      ctx.textAlign = "center";
      ctx.font = `700 ${Math.round(small * 1.3)}px ${FONT}`;
      const text = "Run to: " + target;
      const width = Math.min(w - 24, ctx.measureText(text).width + 28);
      ctx.fillStyle = "rgba(5, 0, 20, .78)";
      roundRect(ctx, (w - width) / 2, 40, width, small * 2, small);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, w / 2, 40 + small, width - 16);
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  // Writes the label as large as fits in the box, wrapping on spaces.
  function fitText(ctx, text, cx, cy, maxW, maxH, big) {
    let size = Math.min(maxH * (big ? 0.8 : 0.5), big ? 80 : 40);
    const min = 8;
    while (size > min) {
      ctx.font = `700 ${size}px ${FONT}`;
      const lines = wrap(ctx, text, maxW);
      if (lines.length * size * 1.15 <= maxH && lines.every((line) => ctx.measureText(line).width <= maxW)) {
        const top = cy - ((lines.length - 1) * size * 1.15) / 2;
        lines.forEach((line, i) => ctx.fillText(line, cx, top + i * size * 1.15));
        return;
      }
      size -= 1;
    }
    ctx.font = `700 ${min}px ${FONT}`;
    ctx.fillText(text, cx, cy, maxW);
  }

  function wrap(ctx, text, maxW) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const trial = line ? line + " " + word : word;
      if (line && ctx.measureText(trial).width > maxW) {
        lines.push(line);
        line = word;
      } else {
        line = trial;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  return { newRound, mount, stop, ask, pick, unlockSound };
})();
