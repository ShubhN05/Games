/* BHISHMA's bow, from the picture: very tall, ivory limbs, silver tips curled like shells, broad carved silver
   guards with a curl on both sides of the brown grip.
   The game holds it at the middle (0,0,0); it is upright with its back towards +Z (the opponent). */
import * as THREE from 'three';
import { V, mix, matte, mesh, rod, merge } from '../shared/wardrobe.js';
import { silver, silverSheet } from './silver.js';

const TIP = 0.8;          // the string is tied this far above and below the grip
export function makeBow(){
  const group = new THREE.Group();
  const ivory = matte({ color: 0xe9dec2, roughness: 0.34, emissive: 0x201a10 }), carved = silver({ map: silverSheet(401, 512, 64, 60) }), bright = silver({ color: 0xf2f8ff });
  /* one limb from the grip (t = 0) to the string knot (t = 1) */
  const z = t => -0.17 * Math.pow(Math.sin(t * Math.PI * 0.54), 2) + 0.075 * Math.exp(-Math.pow((t - 0.38) / 0.18, 2));
  const part = (s, from, to, radius, material, n = 16) => group.add(rod(Array.from({ length: n + 1 }, (_, i) => { const t = mix(from, to, i / n); return V(0, s * t * TIP, z(t)); }), radius, material, n * 3, 12));
  const knot = V(0, TIP, z(1)), string = [];
  for (const s of [1, -1]) {
    part(s, 0.05, 0.76, t => mix(0.03, 0.022, t), ivory);
    part(s, 0.74, 1, t => mix(0.026, 0.017, t), carved, 8);
    for (const t of [0.75, 0.9]) { const ring = mesh(new THREE.TorusGeometry(0.027, 0.0065, 8, 20), bright, 0, s * t * TIP, z(t)); ring.rotation.x = Math.PI / 2; group.add(ring); }
    /* the shell-like curl at the tip */
    const centre = V(0, s * (TIP + 0.062), z(1) + 0.052), curl = [V(0, s * TIP, z(1))];
    for (let i = 1; i <= 40; i++) { const t = i / 40, a = -2.25 + t * 8.2, r = mix(0.083, 0.012, t); curl.push(V(0, centre.y + s * Math.sin(a) * r, centre.z + Math.cos(a) * r * 0.95)); }
    group.add(rod(curl, t => mix(0.019, 0.007, t), bright, 90, 10));
    /* broad guard: a flattened silver blade with a curl sweeping forward */
    const blade = rod([V(0, s * 0.085, 0.0), V(0, s * 0.16, z(0.2) + 0.012), V(0, s * 0.25, z(0.31) + 0.02), V(0, s * 0.36, z(0.45) + 0.006), V(0, s * 0.44, z(0.55))], t => 0.016 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 0.92 + 0.04)), carved, 48, 16);
    blade.scale.x = 0.55; group.add(blade);
    const eye = V(0, s * 0.2, z(0.25) + 0.085), swirl = [V(0, s * 0.31, z(0.39) + 0.04)];
    for (let i = 1; i <= 30; i++) { const t = i / 30, a = 1.35 - t * 6.9, r = mix(0.072, 0.012, t); swirl.push(V(0, eye.y + s * Math.sin(a) * r, eye.z + Math.cos(a) * r)); }
    group.add(rod(swirl, t => mix(0.015, 0.006, t), bright, 72, 8));
    const lip = rod([V(0, s * 0.092, -0.035), V(0, s * 0.088, 0.02), V(0, s * 0.08, 0.075)], t => 0.014 * (1 - t) + 0.003, bright, 16, 8); group.add(lip);
    string.push(knot.clone().setY(s * TIP));
  }
  group.add(mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.18, 14), matte({ color: 0x5e3a22, roughness: 0.75 })));
  for (const y of [-0.05, -0.025, 0, 0.025, 0.05]) { const r = mesh(new THREE.TorusGeometry(0.0268, 0.0028, 6, 18), matte({ color: 0x8a6040, roughness: 0.7 }), 0, y, 0); r.rotation.x = Math.PI / 2 + 0.2; group.add(r); }
  for (const y of [-0.095, 0.095]) { const r = mesh(new THREE.TorusGeometry(0.029, 0.007, 8, 20), bright, 0, y, 0); r.rotation.x = Math.PI / 2; group.add(r); }
  merge(group);
  const [top, bottom] = string, rest = V(0, 0, z(1));
  const geometry = new THREE.BufferGeometry().setFromPoints([top, rest, bottom]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xe6edf4 })); group.add(line);
  return { group, string: line, setString(worldPoint){ geometry.setFromPoints([top, worldPoint ? group.worldToLocal(worldPoint.clone()) : rest, bottom]); } };
}
