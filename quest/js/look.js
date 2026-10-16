// Treasure Quest · looking around the test beach before walking exists: the view turns slowly by
// itself, and dragging with a finger or the mouse turns it by hand (spec 0004). Feature 6 (movement
// and controls) replaces this with the real controls.

const TURN = 0.08;        // radians a second of slow automatic turning
const DRAG = 0.005;       // radians per CSS pixel dragged
const REST = 4;           // seconds after a drag before the slow turn starts again
const PITCH = 1.2;        // how far up or down you may look, in radians

export function attachLook(camera, canvas, { yaw = 0, pitch = 0 } = {}) {
  const view = { yaw, pitch, rest: 0 };
  let last = null;

  const apply = () => {
    camera.rotation.order = "YXZ";
    camera.rotation.set(view.pitch, view.yaw, 0);
  };

  canvas.addEventListener("pointerdown", (event) => {
    last = { x: event.clientX, y: event.clientY, id: event.pointerId };
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (err) {
      // a pointer that has already gone needs no capture
    }
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!last || event.pointerId !== last.id) return;
    view.yaw -= (event.clientX - last.x) * DRAG;
    view.pitch = Math.max(-PITCH, Math.min(PITCH, view.pitch - (event.clientY - last.y) * DRAG));
    last.x = event.clientX;
    last.y = event.clientY;
    view.rest = REST;
    apply();
  });
  const stop = () => { last = null; };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  apply();
  return {
    update(dt) {
      if (last) return;
      if (view.rest > 0) {
        view.rest -= dt;
        return;
      }
      view.yaw -= dt * TURN;
      apply();
    }
  };
}
