// Treasure Quest · the &debug view: frame rate, render scale and drawn size, unit and question counts,
// and this play's drawn puzzles (add &seed=N to get the same ones again).
export function showDebug(engine, quest) {
  const box = document.getElementById("debug");
  box.hidden = false;
  const banks = Object.entries(quest.unit.banks).map(([name, list]) => `${name} ${list.length}`).join(" · ");
  const plan = (quest.plan || []).map((p) => {
    const as = p.playAs === p.type ? p.type : `${p.type} as ${p.playAs}`;
    return `${p.spot.padEnd(3)} ${as.padEnd(15)} ${p.id}${p.challenge ? " ★" : ""}`;
  });
  const draw = () => {
    const s = engine.stats();
    box.textContent = [
      `fps ${s.fps.toFixed(1)} (judged ${s.judged.toFixed(1)})`,
      `scale ${s.scale} · drawn ${s.drawn[0]}×${s.drawn[1]}${s.running ? "" : " · paused: " + s.reasons.join(", ")}`,
      `unit ${quest.unit.id} · ${quest.pupil.cls}`,
      banks,
      `island year ${quest.island.year} · seed ${quest.seed}`,
      ...plan
    ].join("\n");
  };
  draw();
  setInterval(draw, 250);
}
