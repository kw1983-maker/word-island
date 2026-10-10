// Word Island · "Listen and shoot", drawn on a canvas.
// It plays like Class Rules Defender: a chrome jet, enemy planes that take three hits, explosions,
// combos, weapon upgrades and power-ups. index.html owns the questions, stars and results;
// this file flies the planes and reports what happened through the hooks it is given.
window.SkyGame = (() => {
  const HITS = 3;
  const POWER_SECONDS = 6;
  const UPGRADES = [800, 2000];
  const POWERS = {
    shield: { color: "#00eaff", label: "SHIELD", glyph: "⛨" },
    rapid: { color: "#ff5577", label: "RAPID", glyph: "»" },
    triple: { color: "#ffcc00", label: "TRIPLE", glyph: "☲" },
    slow: { color: "#9b7bff", label: "SLOW-MO", glyph: "◷" }
  };
  const FONT = "Lexend, 'Trebuchet MS', sans-serif";
  const ARCADE = "'Black Ops One', Lexend, sans-serif";

  let game = null;
  const pictures = new Map();

  function newRound() {
    return {
      score: 0, combo: 0, bestCombo: 0, weapon: 1,
      timers: { shield: 0, rapid: 0, triple: 0, slow: 0 },
      jet: null
    };
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
    noise(seconds, volume) {
      const level = this.level();
      if (!level) return;
      const size = Math.floor(this.ctx.sampleRate * seconds);
      const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i += 1) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume * level, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + seconds);
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
    },
    shoot() { this.tone(820, "square", 0.06, 0.025); },
    hit() { this.tone(220, "sawtooth", 0.08, 0.05); },
    boom() { this.noise(0.45, 0.16); },
    wrong() { this.tone(150, "sawtooth", 0.35, 0.09); this.tone(100, "sawtooth", 0.35, 0.09); },
    combo(n) {
      const freq = Math.min(1600, 500 + n * 120);
      this.tone(freq, "square", 0.08, 0.05);
      this.tone(freq * 1.5, "sine", 0.1, 0.05, 0.06);
    },
    power() {
      this.tone(400, "sine", 0.1, 0.07);
      this.tone(600, "sine", 0.1, 0.07, 0.1);
      this.tone(1200, "square", 0.3, 0.05, 0.2);
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
    canvas.className = "skycanvas";
    canvas.setAttribute("aria-hidden", "true");
    host.prepend(canvas);
    game = {
      host, canvas, ctx: canvas.getContext("2d"), round, hooks,
      w: 0, h: 0, dpr: 1, frame: 0, last: 0, raf: 0,
      wave: null, enemies: [], bullets: [], particles: [], shockwaves: [], popups: [], powerups: [], trail: [],
      stars: [], clouds: [], shake: 0, banner: null, aim: null, holding: false, keys: new Set(), shotAt: 0
    };
    fit();
    if (!round.jet) round.jet = { fx: 0.5, fy: 0.84, tilt: 0 };
    makeSky();
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

  // planes: [{ ok, text, img, big }] in lane order, left to right. step: the question number, for speed.
  function ask(planes, step) {
    if (!game) return;
    const lanes = planes.length === 2 ? [0.3, 0.7] : [0.18, 0.5, 0.82];
    const drops = shuffle([0, 1, 2]).map((k) => -40 - k * 120);
    game.enemies.forEach((foe) => { foe.fleeing = true; });
    game.wave = { step: step || 0, resolved: false };
    game.enemies = game.enemies.filter((foe) => foe.y < game.h + 80).concat(planes.map((plane, lane) => ({
      lane, fx: lanes[lane], x: lanes[lane] * game.w, y: drops[lane % 3],
      ok: plane.ok, text: plane.text || "", img: picture(plane.img), big: !!plane.big,
      hp: HITS, flash: 0, prop: Math.random() * 6, gone: false, fleeing: false, alpha: 1, layout: null
    })));
  }

  // A keyboard pick counts like shooting that plane down.
  function pick(lane) {
    if (!game || !game.wave || game.wave.resolved || game.hooks.isPaused()) return;
    const foe = game.enemies.find((e) => e.lane === lane && !e.gone && !e.fleeing);
    if (foe) downed(foe);
  }

  function unlockSound() {
    sound.unlock();
  }

  // ---------- input ----------
  function aimAt(event) {
    const rect = game.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    game.aim = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onMove(event) {
    if (!game || game.hooks.isPaused()) return;
    if (event.pointerType === "mouse" || game.holding) aimAt(event);
  }

  function onDown(event) {
    if (!game || game.hooks.isPaused() || event.button > 0) return;
    sound.unlock();
    game.holding = true;
    aimAt(event);
    try { game.canvas.setPointerCapture(event.pointerId); } catch (err) { /* older browsers */ }
    event.preventDefault();
  }

  function onUp() {
    if (game) game.holding = false;
  }

  const MOVE_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "];

  function onKeyDown(event) {
    if (!game || game.hooks.isPaused() || !MOVE_KEYS.includes(event.key)) return;
    const target = event.target;
    if (target && target.closest && target.closest("input, select, textarea")) return;
    if (event.key === " " && target && target.closest && target.closest("button, a")) return;
    game.keys.add(event.key);
    event.preventDefault();
  }

  function onKeyUp(event) {
    if (game) game.keys.delete(event.key);
  }

  function listen() {
    game.canvas.addEventListener("pointermove", onMove);
    game.canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onUp);
  }

  function unlisten() {
    game.canvas.removeEventListener("pointermove", onMove);
    game.canvas.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onUp);
  }

  // ---------- helpers ----------
  function shuffle(list) {
    const row = list.slice();
    for (let i = row.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [row[i], row[j]] = [row[j], row[i]];
    }
    return row;
  }

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
    game.enemies.forEach((foe) => { foe.layout = null; });
  }

  function makeSky() {
    const area = game.w * game.h;
    const count = Math.max(40, Math.min(120, Math.round(area / 5000)));
    const layers = [{ share: 0.5, speed: 30, size: 1, bright: 0.4 }, { share: 0.33, speed: 70, size: 1.6, bright: 0.7 }, { share: 0.17, speed: 130, size: 2.4, bright: 1 }];
    game.stars = [];
    layers.forEach((layer) => {
      for (let i = 0; i < Math.round(count * layer.share); i += 1) {
        game.stars.push({ fx: Math.random(), fy: Math.random(), speed: layer.speed, size: layer.size, bright: layer.bright, tw: Math.random() * 6.3 });
      }
    });
    game.clouds = Array.from({ length: 5 }, () => ({ fx: Math.random(), fy: Math.random(), speed: 10 + Math.random() * 25, size: 50 + Math.random() * 80, hue: 200 + Math.random() * 60 }));
  }

  function scale() {
    return Math.max(0.7, Math.min(1.1, game.w / 600));
  }

  function burst(x, y, color, count, speed) {
    for (let i = 0; i < count && game.particles.length < 260; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const v = (0.3 + Math.random()) * (speed || 420);
      game.particles.push({ x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, life: 1, color, size: 2 + Math.random() * 4 });
    }
  }

  function ring(x, y, color, maxR) {
    game.shockwaves.push({ x, y, r: 6, maxR, life: 1, color });
  }

  function popup(x, y, text, color) {
    game.popups.push({ x, y, text, color, life: 1 });
  }

  function shakeBy(amount) {
    game.shake = Math.min(22, game.shake + amount);
  }

  function showBanner(text, color) {
    game.banner = { text, color, life: 1.8 };
  }

  // ---------- what happens when a plane goes down, gets away or rams the jet ----------
  function downed(foe) {
    const round = game.round;
    foe.gone = true;
    if (foe.ok) {
      game.wave.resolved = true;
      round.combo += 1;
      round.bestCombo = Math.max(round.bestCombo, round.combo);
      const gained = 100 * round.combo;
      round.score += gained;
      burst(foe.x, foe.y, "#00ffea", 26, 480);
      ring(foe.x, foe.y, "#00ffea", 150 * scale());
      shakeBy(8);
      sound.boom();
      popup(foe.x, foe.y - 30, "+" + gained, "#00ffea");
      if (round.combo >= 2) {
        popup(foe.x, foe.y - 58, "COMBO x" + round.combo + "!", "#ffcc00");
        sound.combo(round.combo);
      }
      if (Math.random() < 0.4) dropPower(foe.x, foe.y);
      upgrade();
      game.enemies.forEach((other) => { if (other !== foe) other.fleeing = true; });
      game.hooks.onRight();
      return;
    }
    round.combo = 0;
    round.score = Math.max(0, round.score - 50);
    burst(foe.x, foe.y, "#ff3300", 20, 420);
    ring(foe.x, foe.y, "#ff3300", 110 * scale());
    shakeBy(6);
    sound.wrong();
    popup(foe.x, foe.y - 30, "-50", "#ff6a55");
    game.hooks.onWrong();
  }

  function escaped() {
    game.wave.resolved = true;
    game.round.combo = 0;
    sound.wrong();
    showBanner("MISSED!", "#ff6a55");
    game.enemies.forEach((foe) => { foe.fleeing = true; });
    game.hooks.onEscape();
  }

  function rammed(foe, jet) {
    foe.gone = true;
    if (game.round.timers.shield > 0) {
      burst(foe.x, foe.y, "#00eaff", 14, 360);
      shakeBy(5);
      sound.boom();
      if (foe.ok) escaped();
      return;
    }
    game.round.combo = 0;
    game.round.score = Math.max(0, game.round.score - 50);
    burst(jet.x, jet.y - 20, "#ff0000", 16, 380);
    shakeBy(12);
    sound.wrong();
    popup(jet.x, jet.y - 50, "-50", "#ff6a55");
    if (foe.ok) escaped();
  }

  function upgrade() {
    const round = game.round;
    const level = 1 + UPGRADES.filter((score) => round.score >= score).length;
    if (level > round.weapon) {
      round.weapon = level;
      sound.power();
      showBanner("WEAPON UPGRADE!", "#00ff88");
    }
  }

  function dropPower(x, y) {
    const types = Object.keys(POWERS);
    game.powerups.push({ x, y, type: types[Math.floor(Math.random() * types.length)], bob: Math.random() * 6 });
  }

  function takePower(type, jet) {
    game.round.timers[type] = POWER_SECONDS;
    sound.power();
    popup(jet.x, jet.y - 56, POWERS[type].label + "!", POWERS[type].color);
  }

  function fire(jet) {
    const round = game.round;
    const level = round.timers.triple > 0 ? 3 : round.weapon;
    const y = jet.y - 30;
    const speed = -760;
    game.bullets.push({ x: jet.x, y, vx: 0, vy: speed, kind: "main" });
    if (level >= 2) {
      game.bullets.push({ x: jet.x - 15, y: y + 10, vx: -50, vy: speed, kind: "wing" });
      game.bullets.push({ x: jet.x + 15, y: y + 10, vx: 50, vy: speed, kind: "wing" });
    }
    if (level >= 3) {
      game.bullets.push({ x: jet.x - 25, y: y + 15, vx: -170, vy: speed * 0.85, kind: "spread" });
      game.bullets.push({ x: jet.x + 25, y: y + 15, vx: 170, vy: speed * 0.85, kind: "spread" });
    }
    for (let i = 0; i < 3; i += 1) {
      game.particles.push({ x: jet.x, y, vx: (Math.random() - 0.5) * 180, vy: -Math.random() * 240 - 60, life: 0.5, color: "#fff3aa", size: 1 + Math.random() * 2.5 });
    }
    sound.shoot();
  }

  // ---------- layout of a plane's answer label ----------
  function wrap(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 4);
  }

  function layout(foe) {
    if (foe.layout) return foe.layout;
    const ctx = game.ctx;
    const s = scale();
    const laneWidth = game.w / (game.enemies.filter((e) => !e.fleeing).length === 2 ? 2.4 : 3.2);
    const maxWidth = Math.max(70, Math.min(190, laneWidth - 8));
    if (foe.img) {
      const size = Math.round(Math.min(maxWidth - 8, 92 * s));
      foe.layout = { width: size + 10, height: size + 10, size, lines: null };
      return foe.layout;
    }
    const fontSize = foe.big ? Math.round(30 * s) : Math.round(15 * s);
    ctx.font = `700 ${fontSize}px ${FONT}`;
    const lines = wrap(ctx, foe.text, maxWidth - 14);
    const width = Math.min(maxWidth, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 16);
    const lineHeight = Math.round(fontSize * 1.18);
    foe.layout = { width, height: lines.length * lineHeight + 10, lines, fontSize, lineHeight };
    return foe.layout;
  }

  // The plane body sits at (x, y); its label floats above it.
  function box(foe) {
    const s = scale();
    const l = layout(foe);
    const bottom = foe.y - 30 * s;
    return { left: foe.x - Math.max(40 * s, l.width / 2), right: foe.x + Math.max(40 * s, l.width / 2), top: bottom - l.height - 6, bottom: foe.y + 32 * s, labelBottom: bottom };
  }

  // ---------- the loop ----------
  function loop(now) {
    if (!game) return;
    game.raf = requestAnimationFrame(loop);
    fit();
    if (game.w < 10 || game.h < 10) return;
    const dt = game.last ? Math.min(0.05, (now - game.last) / 1000) : 0;
    game.last = now;
    if (!game.hooks.isPaused()) update(dt, now);
    draw(now);
  }

  function update(dt, now) {
    game.frame += 1;
    const { w, h, round } = game;
    const s = scale();
    const jet = { x: round.jet.fx * w, y: round.jet.fy * h };

    // Move the jet towards the pointer, or with the arrow keys.
    const keys = game.keys;
    if (keys.size) {
      const step = 0.75 * dt;
      if (keys.has("ArrowLeft")) round.jet.fx -= step;
      if (keys.has("ArrowRight")) round.jet.fx += step;
      if (keys.has("ArrowUp")) round.jet.fy -= step;
      if (keys.has("ArrowDown")) round.jet.fy += step;
    } else if (game.aim) {
      const ease = Math.min(1, dt * 9);
      round.jet.fx += (game.aim.x / w - round.jet.fx) * ease;
      round.jet.fy += (game.aim.y / h - round.jet.fy) * ease;
    }
    round.jet.fx = Math.min(1 - 30 / w, Math.max(30 / w, round.jet.fx));
    round.jet.fy = Math.min(1 - 40 / h, Math.max(0.5, round.jet.fy));
    const newX = round.jet.fx * w;
    round.jet.tilt = Math.max(-1, Math.min(1, (newX - jet.x) * 0.08));
    jet.x = newX;
    jet.y = round.jet.fy * h;

    // Hold to shoot (pointer, Space or an arrow key).
    const timers = round.timers;
    if (game.holding || keys.size) {
      const gap = timers.rapid > 0 ? 0.06 : 0.14;
      if (now - game.shotAt > gap * 1000) {
        game.shotAt = now;
        fire(jet);
      }
    }

    Object.keys(timers).forEach((key) => { timers[key] = Math.max(0, timers[key] - dt); });

    if (game.frame % 2 === 0) game.trail.push({ x: jet.x + (Math.random() - 0.5) * 8, y: jet.y + 36 * s, life: 1, size: 3 + Math.random() * 4 });
    game.trail.forEach((t) => { t.y += 70 * dt; t.life -= 3.6 * dt; });
    game.trail = game.trail.filter((t) => t.life > 0);

    game.stars.forEach((star) => {
      star.fy += (star.speed * dt) / h;
      star.tw += 3 * dt;
      if (star.fy > 1) { star.fy = 0; star.fx = Math.random(); }
    });
    game.clouds.forEach((cloud) => {
      cloud.fy += (cloud.speed * dt) / h;
      if (cloud.fy * h > h + cloud.size) { cloud.fy = -cloud.size / h; cloud.fx = Math.random(); }
    });

    game.bullets.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; });
    game.bullets = game.bullets.filter((b) => b.y > -30 && b.x > -30 && b.x < w + 30);

    // Planes fall a little faster each question; slow-mo halves it.
    const wave = game.wave;
    const fall = h * 0.15 * (1 + 0.04 * (wave ? wave.step : 0)) * (timers.slow > 0 ? 0.5 : 1);
    game.enemies.forEach((foe) => {
      foe.x = foe.fx * w + Math.sin(now / 600 + foe.lane * 2) * 6 * s;
      foe.y += (foe.fleeing ? fall * 2.6 : fall) * dt;
      foe.prop += 30 * dt;
      if (foe.fleeing) foe.alpha = Math.max(0, foe.alpha - dt * 1.2);
      if (foe.flash > 0) foe.flash -= dt;
    });

    if (wave && !wave.resolved) {
      for (const foe of game.enemies) {
        if (foe.gone || foe.fleeing) continue;
        const b = box(foe);
        // A plane can only be hit once its answer is fully in view, so pupils read before they shoot.
        if (b.top < 0) continue;
        for (let i = game.bullets.length - 1; i >= 0; i -= 1) {
          const bullet = game.bullets[i];
          if (bullet.x > b.left && bullet.x < b.right && bullet.y > b.top && bullet.y < b.bottom) {
            game.bullets.splice(i, 1);
            foe.hp -= 1;
            foe.flash = 0.06;
            sound.hit();
            burst(bullet.x, bullet.y, "#ffcc00", 3, 200);
            if (foe.hp <= 0) {
              downed(foe);
              break;
            }
          }
        }
        if (wave.resolved) break;
        if (!foe.gone && Math.abs(foe.x - jet.x) < 42 * s && Math.abs(foe.y - jet.y) < 42 * s) {
          rammed(foe, jet);
          if (wave.resolved) break;
        }
      }
      const rightOne = game.enemies.find((foe) => foe.ok && !foe.gone && !foe.fleeing);
      if (!wave.resolved && rightOne && box(rightOne).top > h + 10) escaped();
    }
    game.enemies = game.enemies.filter((foe) => !foe.gone && foe.alpha > 0 && box(foe).top < h + 40);

    game.powerups.forEach((p) => { p.y += 130 * dt; p.bob += 9 * dt; });
    game.powerups = game.powerups.filter((p) => {
      if (Math.abs(p.x - jet.x) < 38 * s && Math.abs(p.y - jet.y) < 42 * s) {
        takePower(p.type, jet);
        return false;
      }
      return p.y < h + 30;
    });

    game.shockwaves.forEach((r) => { r.r += (r.maxR - r.r) * Math.min(1, 9 * dt); r.life -= 2.4 * dt; });
    game.shockwaves = game.shockwaves.filter((r) => r.life > 0);
    game.popups.forEach((p) => { p.y -= 70 * dt; p.life -= 1.1 * dt; });
    game.popups = game.popups.filter((p) => p.life > 0);
    game.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy *= 0.97; p.life -= 1.8 * dt; });
    game.particles = game.particles.filter((p) => p.life > 0);
    if (game.banner) {
      game.banner.life -= dt;
      if (game.banner.life <= 0) game.banner = null;
    }
    if (game.shake > 0) {
      game.shake *= Math.pow(0.0001, dt);
      if (game.shake < 0.3) game.shake = 0;
    }
  }

  // ---------- drawing ----------
  function draw(now) {
    const { ctx, w, h, dpr, round } = game;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#070b1a");
    bg.addColorStop(1, "#02030a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    if (game.shake > 0) ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);

    game.clouds.forEach((cloud) => {
      ctx.fillStyle = `hsla(${cloud.hue}, 70%, 55%, 0.07)`;
      ctx.beginPath();
      ctx.arc(cloud.fx * w, cloud.fy * h, cloud.size, 0, Math.PI * 2);
      ctx.fill();
    });
    game.stars.forEach((star) => {
      ctx.fillStyle = `rgba(255,255,255,${star.bright * (0.55 + 0.45 * Math.sin(star.tw))})`;
      ctx.fillRect(star.fx * w, star.fy * h, star.size, star.size);
    });

    game.trail.forEach((t) => {
      ctx.globalAlpha = t.life * 0.55;
      ctx.fillStyle = "#33ddff";
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const jet = { x: round.jet.fx * w, y: round.jet.fy * h };
    drawJet(jet.x, jet.y, round.jet.tilt);

    game.bullets.forEach((b) => {
      const color = b.kind === "spread" ? "#00ffea" : "#ffaa00";
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    game.enemies.forEach((foe) => drawEnemy(foe, now));
    game.powerups.forEach((p) => drawPower(p));

    game.shockwaves.forEach((r) => {
      ctx.globalAlpha = Math.max(0, r.life);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    game.particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    game.popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.fillStyle = p.color;
      ctx.font = `${Math.round(22 * scale())}px ${ARCADE}`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fillText(p.text, p.x, p.y);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    ctx.restore();

    drawHud(now);
  }

  function drawJet(x, y, tilt) {
    const { ctx, round } = game;
    const s = scale();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.rotate(tilt * 0.2);
    const boost = round.timers.rapid > 0 ? 1.6 : 1;
    [-9, 9].forEach((ex) => {
      const flame = (18 + Math.random() * 14) * boost;
      const g = ctx.createLinearGradient(0, 38, 0, 38 + flame);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.4, "rgba(255,200,60,0.85)");
      g.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ex - 5, 38);
      ctx.lineTo(ex + 5, 38);
      ctx.lineTo(ex, 38 + flame);
      ctx.closePath();
      ctx.fill();
    });

    const wing = ctx.createLinearGradient(-42, 0, 42, 0);
    wing.addColorStop(0, "#3a4456");
    wing.addColorStop(0.5, "#e8eef5");
    wing.addColorStop(1, "#3a4456");
    ctx.fillStyle = wing;
    ctx.strokeStyle = "#1b2230";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(42, 28); ctx.lineTo(42, 36); ctx.lineTo(8, 26);
    ctx.lineTo(0, 30); ctx.lineTo(-8, 26); ctx.lineTo(-42, 36); ctx.lineTo(-42, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#8a97a8";
    ctx.beginPath(); ctx.moveTo(-6, 30); ctx.lineTo(-16, 44); ctx.lineTo(-4, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 30); ctx.lineTo(16, 44); ctx.lineTo(4, 40); ctx.closePath(); ctx.fill(); ctx.stroke();

    const body = ctx.createLinearGradient(-12, 0, 12, 0);
    body.addColorStop(0, "#2b3340");
    body.addColorStop(0.35, "#9fb0c4");
    body.addColorStop(0.5, "#ffffff");
    body.addColorStop(0.65, "#9fb0c4");
    body.addColorStop(1, "#2b3340");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.quadraticCurveTo(11, -10, 9, 40);
    ctx.lineTo(-9, 40);
    ctx.quadraticCurveTo(-11, -10, 0, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, 30); ctx.stroke();

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#00eaff";
    const glass = ctx.createLinearGradient(0, -22, 0, 2);
    glass.addColorStop(0, "#bff6ff");
    glass.addColorStop(1, "#0088aa");
    ctx.fillStyle = glass;
    ctx.beginPath(); ctx.ellipse(0, -12, 5, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    const blink = Math.floor(game.frame / 15) % 2 === 0;
    ctx.fillStyle = blink ? "#ff3344" : "#330000";
    ctx.beginPath(); ctx.arc(-42, 32, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blink ? "#33ff66" : "#003300";
    ctx.beginPath(); ctx.arc(42, 32, 2.5, 0, Math.PI * 2); ctx.fill();

    const shield = round.timers.shield;
    if (shield > 0) {
      const a = shield < 1 && Math.floor(game.frame / 4) % 2 === 0 ? 0.15 : 0.45;
      ctx.strokeStyle = `rgba(0, 234, 255, ${a})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawEnemy(foe) {
    const { ctx } = game;
    const s = scale();
    const l = layout(foe);
    ctx.save();
    ctx.globalAlpha = foe.alpha;
    ctx.translate(foe.x, foe.y);

    ctx.save();
    ctx.scale(s, s);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(50, 10); ctx.lineTo(-50, 10); ctx.fill();
    if (foe.flash > 0) ctx.fillStyle = "#fff";
    else {
      const grad = ctx.createLinearGradient(-20, 0, 20, 0);
      grad.addColorStop(0, "#2b3a1a");
      grad.addColorStop(0.5, "#5b6e30");
      grad.addColorStop(1, "#2b3a1a");
      ctx.fillStyle = grad;
    }
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 20); ctx.lineTo(40, -10); ctx.lineTo(40, -25); ctx.lineTo(0, -10);
    ctx.lineTo(-40, -25); ctx.lineTo(-40, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -5, 10, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save();
    ctx.translate(0, 28);
    ctx.rotate(foe.prop);
    ctx.fillStyle = "rgba(200,200,200,0.55)";
    ctx.fillRect(-22, -2, 44, 4);
    ctx.fillRect(-2, -22, 4, 44);
    ctx.restore();
    ctx.restore();

    // The answer rides above the plane.
    const bottom = -30 * s;
    const top = bottom - l.height;
    const left = -l.width / 2;
    ctx.fillStyle = foe.fleeing && foe.ok ? "rgba(0, 120, 90, 0.95)" : "rgba(10, 30, 50, 0.92)";
    ctx.strokeStyle = foe.fleeing && foe.ok ? "#00ffea" : "#00b4d8";
    ctx.lineWidth = 2;
    roundRect(ctx, left, top, l.width, l.height, 8);
    ctx.fill();
    ctx.stroke();
    if (foe.img) {
      if (foe.img.complete && foe.img.naturalWidth) {
        const ratio = foe.img.naturalWidth / foe.img.naturalHeight;
        const iw = ratio >= 1 ? l.size : l.size * ratio;
        const ih = ratio >= 1 ? l.size / ratio : l.size;
        ctx.save();
        roundRect(ctx, -l.size / 2, top + 5, l.size, l.size, 6);
        ctx.clip();
        ctx.fillStyle = "#fff";
        ctx.fillRect(-l.size / 2, top + 5, l.size, l.size);
        ctx.drawImage(foe.img, -iw / 2, top + 5 + (l.size - ih) / 2, iw, ih);
        ctx.restore();
      }
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = `700 ${l.fontSize}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      l.lines.forEach((line, i) => ctx.fillText(line, 0, top + 5 + l.lineHeight * (i + 0.5)));
    }

    if (!foe.fleeing) {
      const barW = 44 * s;
      ctx.fillStyle = "#c00";
      ctx.fillRect(-barW / 2, top - 9, barW, 4);
      ctx.fillStyle = "#0f0";
      ctx.fillRect(-barW / 2, top - 9, barW * (foe.hp / HITS), 4);
    }
    ctx.restore();
  }

  function drawPower(p) {
    const { ctx } = game;
    const info = POWERS[p.type];
    ctx.save();
    ctx.translate(p.x, p.y + Math.sin(p.bob) * 3);
    ctx.shadowBlur = 14;
    ctx.shadowColor = info.color;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = info.color;
    ctx.font = `700 16px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(info.glyph, 0, 1);
    ctx.restore();
  }

  function drawHud(now) {
    const { ctx, w, h, round } = game;
    const s = scale();
    // A dark band keeps the score and target readable when a picture flies behind them.
    const band = ctx.createLinearGradient(0, 0, 0, 96 * s);
    band.addColorStop(0, "rgba(2, 3, 10, 0.88)");
    band.addColorStop(0.65, "rgba(2, 3, 10, 0.6)");
    band.addColorStop(1, "rgba(2, 3, 10, 0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, w, 96 * s);
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 0;

    ctx.font = `${Math.round(17 * s)}px ${ARCADE}`;
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.fillText("SCORE " + round.score, 12, 26);
    if (round.combo >= 2) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffcc00";
      ctx.fillText("COMBO x" + round.combo, w - 12, 26);
    }

    const target = game.hooks.target();
    ctx.textAlign = "center";
    ctx.font = `600 ${Math.round(12 * s)}px ${FONT}`;
    ctx.fillStyle = "#00eaff";
    ctx.fillText(target ? "TARGET" : "LISTEN!", w / 2, 50);
    if (target) {
      ctx.font = `${Math.round(26 * s)}px ${ARCADE}`;
      ctx.fillStyle = "#ffcc00";
      ctx.shadowColor = "rgba(255, 204, 0, 0.6)";
      ctx.shadowBlur = 12;
      ctx.fillText(fitText(ctx, target, w - 40), w / 2, 50 + 30 * s);
      ctx.shadowBlur = 0;
    } else {
      const pulse = 0.6 + 0.4 * Math.sin(now / 250);
      ctx.globalAlpha = pulse;
      ctx.font = `${Math.round(24 * s)}px ${FONT}`;
      ctx.fillText("🔊", w / 2, 50 + 28 * s);
      ctx.globalAlpha = 1;
    }

    const chips = Object.keys(POWERS).filter((key) => round.timers[key] > 0);
    if (chips.length) {
      ctx.font = `700 ${Math.round(11 * s)}px ${FONT}`;
      const widths = chips.map((key) => ctx.measureText(POWERS[key].label).width + 16);
      let x = w / 2 - (widths.reduce((a, b) => a + b, 0) + 8 * (chips.length - 1)) / 2;
      chips.forEach((key, i) => {
        const info = POWERS[key];
        ctx.strokeStyle = info.color;
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, h - 30, widths[i], 20, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = info.color;
        ctx.textAlign = "center";
        ctx.fillText(info.label, x + widths[i] / 2, h - 16);
        x += widths[i] + 8;
      });
    }

    if (round.weapon > 1) {
      ctx.textAlign = "left";
      ctx.font = `700 ${Math.round(11 * s)}px ${FONT}`;
      ctx.fillStyle = "#00ff88";
      ctx.fillText("GUNS " + "▮".repeat(round.weapon), 12, 46);
    }

    if (game.banner) {
      ctx.globalAlpha = Math.min(1, game.banner.life);
      ctx.textAlign = "center";
      ctx.font = `${Math.round(34 * s)}px ${ARCADE}`;
      ctx.fillStyle = game.banner.color;
      ctx.shadowColor = game.banner.color;
      ctx.shadowBlur = 20;
      ctx.fillText(game.banner.text, w / 2, h * 0.42);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function fitText(ctx, text, maxWidth) {
    let out = String(text);
    while (out.length > 4 && ctx.measureText(out).width > maxWidth) out = out.slice(0, -2) + "…";
    return out;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  return { newRound, mount, stop, ask, pick, unlockSound };
})();
