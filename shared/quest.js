// Word Island · which units have a Treasure Quest island, and when it opens (spec 0009). Used by Word
// Island's sixth card and by the quest page, so both always agree. Classic script: globals.

// Units with an island file in quest/islands/ (tools/check-quests.mjs checks the two match).
const wiQuestIslands = ["u9"];

// The five games a pupil finishes before the island opens, as Word Island's record names them.
const WI_QUEST_GAMES = ["maze", "moles", "hangman", "runner", "planes"];

function wiQuestHasIsland(unitId) {
  return wiQuestIslands.includes(unitId);
}

// True when the unit has an island and either the address opens everything (the teacher's
// ?open=all link) or all five of the unit's games are done in Word Island's record on this device.
// The record is only read, never written; a missing or broken record counts as not finished.
function wiQuestOpen(unitId, search) {
  if (!wiQuestHasIsland(unitId)) return false;
  if (new URLSearchParams(search || "").get("open") === "all") return true;
  let done = {};
  try {
    const saved = JSON.parse(localStorage.getItem(`word-island-${unitId}-v2`) || "null");
    done = (saved && saved.done) || {};
  } catch (err) {
    return false;
  }
  return WI_QUEST_GAMES.every((id) => done[id] === true);
}
