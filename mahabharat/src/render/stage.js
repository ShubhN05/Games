/* Renderer, scene, camera, lights and the arena backdrop. */
import * as THREE from 'three';

const canvas = document.getElementById('c');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1280, 720, false); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
export const scene = new THREE.Scene();
const CAM_Y = 2.0, CAM_Z = 14.7;
export const camera = new THREE.PerspectiveCamera(28, 16 / 9, 0.1, 100); camera.position.set(0, CAM_Y, CAM_Z); camera.lookAt(0, 1.7, 0);
scene.add(new THREE.HemisphereLight(0xb0a0c0, 0x2a1810, 1.1));
const key = new THREE.DirectionalLight(0xffe6c8, 2.2); key.position.set(2.5, 4, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0xff8a3a, 2.0); rim.position.set(-3, 3, -4); scene.add(rim);

/* keep the 16:9 picture and the HUD on top of it fitted to the window */
export function fitToWindow(hud){
  const fit = () => { const s = Math.min(innerWidth / 1280, innerHeight / 720), w = 1280 * s, h = 720 * s, l = (innerWidth - w) / 2, t = (innerHeight - h) / 2;
    Object.assign(canvas.style, { width: w + 'px', height: h + 'px', left: l + 'px', top: t + 'px' }); Object.assign(hud.style, { left: l + 'px', top: t + 'px', transform: 'scale(' + s + ')' }); };
  addEventListener('resize', fit); fit();
}

export async function setArena(arena){
  const c = document.createElement('canvas'); c.width = 960; c.height = 540; const x = c.getContext('2d');
  await arena.paint(x);
  if (arena.dim) { x.fillStyle = 'rgba(8,6,16,' + arena.dim + ')'; x.fillRect(0, 0, 960, 540); }
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  scene.background?.dispose?.(); scene.background = texture;
}

export function render(shake = 0){
  camera.position.set((Math.random() - 0.5) * shake, CAM_Y + (Math.random() - 0.5) * shake, CAM_Z);
  renderer.render(scene, camera);
}
