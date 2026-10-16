// Treasure Quest · the &debug view: frame rate, render scale, unit and question counts.
export function showDebug(engine, quest) {
  const box = document.getElementById("debug");
  box.hidden = false;
  const banks = Object.entries(quest.unit.banks).map(([name, list]) => `${name} ${list.length}`).join(" · ");
  const draw = () => {
    const s = engine.stats();
    box.textContent = [
      `fps ${s.fps.toFixed(1)} (judged ${s.judged.toFixed(1)})`,
      `scale ${s.scale}${s.running ? "" : " · paused: " + s.reasons.join(", ")}`,
      `unit ${quest.unit.id} · ${quest.pupil.cls}`,
      banks
    ].join("\n");
  };
  draw();
  setInterval(draw, 250);
}
