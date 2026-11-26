/* Glows, sparks and shadows. */
import * as THREE from 'three';
import { scene } from './stage.js';
import { V } from './layout.js';

const GLOW = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();

/* a soft glow not yet in the scene (for putting inside a group) */
export function glow(color, size, opacity = 1, blending = THREE.AdditiveBlending){
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, depthWrite: false, blending })); s.scale.setScalar(size); return s;
}
export function sprite(color, size, opacity = 1){ const s = glow(color, size, opacity); scene.add(s); return s; }
export const drop = o => { scene.remove(o); o.traverse?.(c => { if (c.material) c.material.dispose(); if (c.geometry && c.isMesh) c.geometry.dispose(); }); };

export function shadowDisc(radius, opacity){
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.01; scene.add(m); return m;
}

const parts = [];
export function burst(p, n, color, speed = 3, life = 0.6, size = 0.22){
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = Math.random() * speed, sp = sprite(color, size * (0.6 + Math.random())); sp.position.copy(p); parts.push({ sp, v: V(Math.cos(a) * s, Math.sin(a) * s, (Math.random() - 0.5)), life, max: life }); }
}
export function stepParticles(dt){
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; p.sp.position.addScaledVector(p.v, dt); p.v.y -= 3 * dt; p.sp.material.opacity = Math.max(0, p.life / p.max); if (p.life <= 0) { drop(p.sp); parts.splice(i, 1); } }
}
export function clearParticles(){ parts.splice(0).forEach(p => drop(p.sp)); }
