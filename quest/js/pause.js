// Treasure Quest · the pause menu, as in BlockWords: the Pause button (or Esc on a laptop) opens it,
// with Carry on, Music on or off, Sound on or off, and Leave the quest (spec 0004). screens.js shows
// it over the island and pauses the game while it is open; this file gives it its buttons.
import { screens } from "./screens.js";
import { sound } from "./sound.js";

const onOff = (on) => (on ? "on" : "off");

screens.onAct("music", () => {
  sound.setMusic(!sound.state().music);
  sound.play("click");
});
screens.onAct("sound", () => {
  sound.setSound(!sound.state().sound);
  sound.play("click");
});

export const pause = {
  open: () => screens.setPause(true),
  close: () => screens.setPause(false),
  isOpen: () => screens.state.pause,

  // The buttons, read fresh each time so Music and Sound say what they are now.
  buttons() {
    const now = sound.state();
    return [
      { label: "Carry on", act: "stay", gold: true },
      { label: `Music: ${onOff(now.music)}`, act: "music" },
      { label: `Sound: ${onOff(now.sound)}`, act: "sound" },
      { label: "Leave the quest", href: "../" }
    ];
  }
};

screens.setPauseButtons(pause.buttons);
sound.onChange(() => {
  if (screens.state.pause) screens.refresh();
});

// Esc opens and closes the menu while the island is running (never over another screen).
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const now = screens.state;
  if (now.base !== "running" || now.hush || now.portrait) return;
  event.preventDefault();
  screens.setPause(!now.pause);
});
