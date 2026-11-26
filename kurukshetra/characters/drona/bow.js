/* DRONA's bow, from the picture: dark weathered wood, curled knotted tips bound with cord, broad carved gold bands.
   The game holds it at the middle (0,0,0); it is upright with its back towards +Z (the opponent). */
import * as THREE from 'three';
import { V, mix, texture, engrave, metal, gold, matte, mesh, rod, merge, random } from '../shared/wardrobe.js';

const TIP = 0.72;          // the string is tied this far above and below the grip
export function makeBow(){
  const group = new THREE.Group();
  const wood = matte({ map: texture(512, 64, (x, w, h) => { x.fillStyle = '#4a3020'; x.fillRect(0, 0, w, h); const r = random(701); for (let i = 0; i < 220; i++) { x.fillStyle = r() < 0.5 ? 'rgba(16,8,2,0.5)' : 'rgba(170,128,88,0.35)'; x.fillRect(r() * w, r() * h, 20 + r() * 90, 0.8 + r() * 1.8); } }), roughness: 0.6, metalness: 0.08 });
  const carved = metal({ map: texture(256, 64, (x, w, h) => { x.fillStyle = '#b8842a'; x.fillRect(0, 0, w, h); engrave(x, 0, 0, w, h, { seed: 711, count: 36, size: 12, light: '#ffe29a', dark: '#5a3a0a', width: 2 }); }), metalness: 0.6 });
  const lip = gold({ color: 0xe0ac40 }), cord = matte({ color: 0xa8824e, roughness: 0.85 });
  const z = t => -0.18 * Math.pow(Math.sin(t * Math.PI * 0.52), 2) + 0.05 * Math.exp(-Math.pow((t - 0.35) / 0.18, 2));
  const knot = V(0, TIP, z(1)), string = [];
  for (const s of [1, -1]) {
    group.add(rod(Array.from({ length: 23 }, (_, i) => { const t = i / 22; return V(0, s * t * TIP, z(t)); }), t => mix(0.029, 0.017, t) * (1 + 0.1 * Math.sin(t * 31)), wood, 66, 12));
    /* the curled, thickened tip */
    const centre = V(0, s * (TIP + 0.038), z(1) + 0.032), curl = [V(0, s * TIP, z(1))];
    for (let i = 1; i <= 28; i++) { const t = i / 28, a = -2.2 + t * 5.4, r = mix(0.052, 0.016, t); curl.push(V(0, centre.y + s * Math.sin(a) * r, centre.z + Math.cos(a) * r)); }
    group.add(rod(curl, t => mix(0.019, 0.012, t), wood, 56, 10));
    for (let i = 0; i < 4; i++) { const t = 0.955 + i * 0.012, wrap = mesh(new THREE.TorusGeometry(0.021, 0.0045, 8, 18), cord, 0, s * t * TIP, z(t)); wrap.rotation.x = Math.PI / 2; group.add(wrap); }
    for (const [t, wide] of [[0.15, 0.075], [0.43, 0.055], [0.86, 0.05]]) {
      const a = V(0, s * t * TIP, z(t)), dir = V(0, s * (t + 0.02) * TIP, z(t + 0.02)).sub(a).normalize(), r = mix(0.029, 0.017, t) * 1.3;
      const ring = mesh(new THREE.CylinderGeometry(r, r, wide, 16), carved); ring.position.copy(a); ring.quaternion.setFromUnitVectors(V(0, 1, 0), dir); group.add(ring);
      for (const e of [-1, 1]) { const edge = mesh(new THREE.TorusGeometry(r, 0.0045, 6, 20), lip); edge.position.copy(a).addScaledVector(dir, e * wide / 2); edge.quaternion.setFromUnitVectors(V(0, 0, 1), dir); group.add(edge); }
    }
    /* a gold curl lying along the limb beside the grip */
    const eye = V(0, s * 0.215, z(0.3) + 0.036), swirl = [V(0, s * 0.13, z(0.18) + 0.026)];
    for (let i = 1; i <= 24; i++) { const t = i / 24, a = -1.9 + t * 5.6, r = mix(0.034, 0.008, t); swirl.push(V(0, eye.y + s * Math.sin(a) * r, eye.z + Math.cos(a) * r * 0.8)); }
    group.add(rod(swirl, t => mix(0.01, 0.004, t), lip, 48, 8));
    string.push(knot.clone().setY(s * TIP));
  }
  group.add(mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.13, 14), matte({ color: 0x7a3e20, roughness: 0.75 })));
  for (const y of [-0.03, 0, 0.03]) { const r = mesh(new THREE.TorusGeometry(0.029, 0.003, 6, 18), cord, 0, y, 0); r.rotation.x = Math.PI / 2 + 0.15; group.add(r); }
  merge(group);
  const [top, bottom] = string, rest = V(0, 0, z(1));
  const geometry = new THREE.BufferGeometry().setFromPoints([top, rest, bottom]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xc8a878 })); group.add(line);
  return { group, string: line, setString(worldPoint){ geometry.setFromPoints([top, worldPoint ? group.worldToLocal(worldPoint.clone()) : rest, bottom]); } };
}
