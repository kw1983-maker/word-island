// Treasure Quest · a temporary test island: grass and sand blocks with a few towers, so the engine has
// something to draw. The real islands (quest content model and the beach island) replace it.
import * as THREE from "three";

const SIZE = 24;
const COLOURS = { grass: 0x5cb85c, grassDark: 0x4ea84e, sand: 0xf2d16b, stone: 0x9a9a9a, water: 0x3c8dde };

export function buildTestScene(camera) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fd3ff);
  scene.fog = new THREE.Fog(0x8fd3ff, 30, 70);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x557755, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(10, 20, 6);
  scene.add(sun);

  // One instanced mesh draws every block in a single call, which keeps budget phones fast.
  const blocks = [];
  for (let x = 0; x < SIZE; x += 1) {
    for (let z = 0; z < SIZE; z += 1) {
      const edge = Math.min(x, z, SIZE - 1 - x, SIZE - 1 - z);
      const kind = edge === 0 ? "water" : edge < 3 ? "sand" : (x + z) % 2 ? "grass" : "grassDark";
      blocks.push({ x, y: kind === "water" ? -1 : 0, z, kind });
    }
  }
  [[6, 6, 3], [17, 8, 5], [9, 16, 2], [15, 15, 4]].forEach(([x, z, height]) => {
    for (let y = 1; y <= height; y += 1) blocks.push({ x, y, z, kind: "stone" });
  });

  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), blocks.length);
  const place = new THREE.Matrix4();
  const colour = new THREE.Color();
  blocks.forEach((block, i) => {
    place.makeTranslation(block.x - SIZE / 2 + 0.5, block.y, block.z - SIZE / 2 + 0.5);
    mesh.setMatrixAt(i, place);
    mesh.setColorAt(i, colour.setHex(COLOURS[block.kind]));
  });
  scene.add(mesh);

  // The camera circles the island slowly, so the frame rate can be judged on a moving picture.
  let angle = 0;
  function update(dt) {
    angle += dt * 0.25;
    camera.position.set(Math.cos(angle) * 22, 14, Math.sin(angle) * 22);
    camera.lookAt(0, 0, 0);
  }
  update(0);

  return { scene, update, blockCount: blocks.length };
}
