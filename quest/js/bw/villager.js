// Adapted from BlockWords js/entities.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// Only the villager's look is kept (its boxes and the floating "!"); walking, quests and other
// animals stay in BlockWords. Riddle characters (feature 11) give it a job.

import * as THREE from 'three';

function box(w, h, d, colour, x, y, z) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color: colour })
  );
  m.position.set(x, y, z);
  return m;
}

// A villager standing at its feet position, facing -z (where its nose points).
export function villagerModel() {
  const g = new THREE.Group();
  const robe = 0x6b4a30, skin = 0xc9a07a;
  g.add(box(0.5, 0.9, 0.34, robe, 0, 0.9, 0));       // robe
  g.add(box(0.52, 0.2, 0.36, 0x4a3220, 0, 1.02, 0));  // sash
  g.add(box(0.46, 0.46, 0.42, skin, 0, 1.58, 0));     // head
  g.add(box(0.12, 0.2, 0.16, skin, 0, 1.54, -0.26));  // the famous nose
  g.add(box(0.08, 0.08, 0.04, 0x2a2a3a, -0.13, 1.66, -0.22));
  g.add(box(0.08, 0.08, 0.04, 0x2a2a3a, 0.13, 1.66, -0.22));
  g.add(box(0.12, 0.6, 0.12, robe, -0.3, 0.95, 0));
  g.add(box(0.12, 0.6, 0.12, robe, 0.3, 0.95, 0));
  g.add(box(0.16, 0.5, 0.16, 0x3a2a1c, -0.13, 0.25, 0));
  g.add(box(0.16, 0.5, 0.16, 0x3a2a1c, 0.13, 0.25, 0));

  // A floating "!" so children can spot who to talk to.
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#3a2a08';
  ctx.lineWidth = 6;
  ctx.strokeText('!', 32, 50);
  ctx.fillText('!', 32, 50);
  const tex = new THREE.CanvasTexture(c);
  const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  marker.scale.set(0.5, 0.5, 0.5);
  marker.position.y = 2.3;
  g.add(marker);
  g.userData.marker = marker;
  return g;
}
