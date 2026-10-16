// Adapted from BlockWords js/sky.js at commit 31a2bf4 (C:/Users/User/Documents/Claude/Minecraft).
// An island is always sunny (spec 0004): the day cycle is fixed and the moon and stars are removed.
// Kept as in BlockWords: the sky colour, the square sun, the sun and ambient lights, the blocky
// clouds and the fog. The clouds keep drifting, unless the device asks for reduced motion.

import * as THREE from 'three';
import { mulberry32 } from './noise.js';

export const DAY_LENGTH = 1200; // seconds for a full cycle in BlockWords

// Mid morning in BlockWords' cycle: full daylight, as bright as noon, with the sun
// up in the sky where pupils can see it (at noon it sits out of view).
const SUNNY = 0.375;

const DAY_SKY = new THREE.Color(0x88ccf5);

function cloudTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const rnd = mulberry32(9182736);
  g.clearRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rnd() * 120), y = Math.floor(rnd() * 120);
    const w = 8 + Math.floor(rnd() * 24), h = 6 + Math.floor(rnd() * 14);
    g.fillRect(x, y, w, h);          // blocky clouds, like the originals
    g.fillRect(x + 4, y - 4, w - 8, h);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  t.repeat.set(6, 6);
  return t;
}

function discTexture(colour, glow) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = colour;
  g.fillRect(8, 8, 48, 48);
  if (glow) {
    g.globalAlpha = 0.35;
    g.fillRect(2, 2, 60, 60);
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  return t;
}

const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)');

export class Sky {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.time = SUNNY * DAY_LENGTH;
    this.drift = 0;               // how far the clouds have moved, in seconds of drift
    this.daylight = 1;

    this.sun = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sun.position.set(60, 100, 30);
    scene.add(this.sun);
    scene.add(this.sun.target);
    this.ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(this.ambient);

    // The sun rides a group set to the time of day.
    this.celestial = new THREE.Group();
    scene.add(this.celestial);
    const sunMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshBasicMaterial({ map: discTexture('#fff6c8', true), transparent: true, depthWrite: false, fog: false })
    );
    sunMesh.position.set(0, 0, -300);
    sunMesh.rotation.y = Math.PI;
    this.celestial.add(sunMesh);
    this.sunMesh = sunMesh;

    // Clouds
    this.clouds = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshBasicMaterial({
        map: cloudTexture(), transparent: true, opacity: 0.75,
        depthWrite: false, side: THREE.DoubleSide, fog: false,
      })
    );
    this.clouds.rotation.x = -Math.PI / 2;
    this.clouds.position.y = 118;
    scene.add(this.clouds);

    this.skyColour = new THREE.Color();
  }

  // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
  get phase() { return (this.time % DAY_LENGTH) / DAY_LENGTH; }

  // The same sums as BlockWords, with the time never moving on.
  update(dt, camera) {
    if (!(still && still.matches)) this.drift += dt;
    const p = this.phase;
    const sunY = -Math.cos(p * Math.PI * 2);
    const day = THREE.MathUtils.clamp(sunY * 2.2 + 0.45, 0, 1);

    this.daylight = 0.22 + 0.78 * day;
    this.materials.sync('uDaylight', this.daylight);

    this.skyColour.copy(DAY_SKY);
    this.scene.background = this.skyColour;
    this.materials.solid.uniforms.uFogColor.value.copy(this.skyColour);

    this.sun.intensity = 0.15 + 0.85 * day;
    this.ambient.intensity = 0.25 + 0.4 * day;
    this.sun.color.setHSL(0.12, 0, 0.5 + 0.5 * day);

    // Everything in the sky rides with the camera so it never gets closer.
    this.celestial.position.copy(camera.position);
    this.celestial.rotation.x = p * Math.PI * 2;
    this.sunMesh.lookAt(this.celestial.position);

    this.sun.position.copy(camera.position).add(
      new THREE.Vector3(Math.sin(p * Math.PI * 2) * 100, Math.max(12, sunY * 120), 40)
    );
    this.sun.target.position.copy(camera.position);

    this.clouds.position.x = camera.position.x;
    this.clouds.position.z = camera.position.z + this.drift * 0.35;
    this.clouds.material.opacity = 0.15 + 0.6 * day;
  }

  setFogDistance(renderDistanceChunks) {
    const far = renderDistanceChunks * 16 - 8;
    this.materials.sync('uFogNear', far * 0.55);
    this.materials.sync('uFogFar', far);
  }
}
