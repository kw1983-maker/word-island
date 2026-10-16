// Word Island · shared class list and Pause rules, used by Word Island and by Treasure Quest.
// Classic script: both functions are globals.

// The teacher's class list: class name → unit ids this page knows. Null when there is no list.
function wiCleanClasses(raw, units) {
  if (!raw || typeof raw !== "object") return null;
  const out = {};
  Object.keys(raw).slice(0, 40).forEach((name) => {
    const ids = Array.isArray(raw[name]) ? raw[name] : [];
    out[name.slice(0, 19)] = ids.filter((id) => typeof id === "string" && units[id]);
  });
  return out;
}

// The classes the teacher has paused, from the settings document.
function wiPausedClasses(data) {
  const raw = data && typeof data.paused === "object" && data.paused ? data.paused : {};
  const paused = {};
  Object.keys(raw).slice(0, 40).forEach((name) => { if (raw[name] === true) paused[name] = true; });
  return paused;
}
