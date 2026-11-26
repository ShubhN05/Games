/* ARJUN's bow (Gandiva), from the picture: dark wood, curled gold tips, gold bands and leaf ornaments.
   The game holds it at the middle (0,0,0); it is upright with its back towards +Z (the opponent). */
import * as THREE from 'three';
import { V, mix, gold, matte, mesh, rod } from '../shared/wardrobe.js';

const TIP = 0.76;          // the string is tied this far above and below the grip
export function makeBow(){
  const group = new THREE.Group(), au = gold(), bright = gold({ color: 0xf2c55c }), wood = matte({ color: 0x3a2114, roughness: 0.45, metalness: 0.15 });
  /* shape of one limb from the grip (t = 0) to the string knot (t = 1): bends back, then curls forward */
  const z = t => -0.15 * Math.pow(Math.sin(t * Math.PI * 0.5), 2) + 0.055 * Math.exp(-Math.pow((t - 0.42) / 0.2, 2));
  const limb = s => Array.from({ length: 21 }, (_, i) => { const t = i / 20; return V(0, s * t * TIP, z(t)); });
  const knot = V(0, TIP, z(1)), string = [];
  for (const s of [1, -1]) {
    group.add(rod(limb(s), t => mix(0.026, 0.012, t) * (1 + 0.14 * Math.sin(t * 23)), wood, 60, 10));
    /* curled gold tip */
    const curl = [V(0, s * TIP, z(1))];
    for (let i = 1; i <= 24; i++) { const t = i / 24, a = t * Math.PI * 1.75, r = mix(0.062, 0.016, t); curl.push(V(0, s * (TIP + 0.02 + Math.sin(a) * r), z(1) + 0.055 - Math.cos(a) * r)); }
    group.add(rod(curl, t => mix(0.014, 0.006, t), au, 48, 8));
    group.add(mesh(new THREE.SphereGeometry(0.012, 10, 8), bright, 0, curl[curl.length - 1].y, curl[curl.length - 1].z));
    /* gold bands */
    for (const [t, wide] of [[0.17, 0.05], [0.5, 0.028], [0.62, 0.028], [0.9, 0.06]]) {
      const a = V(0, s * t * TIP, z(t)), dir = V(0, s * (t + 0.02) * TIP, z(t + 0.02)).sub(a).normalize(), r = mix(0.026, 0.012, t) * 1.32;
      const ring = mesh(new THREE.CylinderGeometry(r, r, wide, 14), au); ring.position.copy(a); ring.quaternion.setFromUnitVectors(V(0, 1, 0), dir); group.add(ring);
      for (const e of [-1, 1]) { const lip = mesh(new THREE.TorusGeometry(r, 0.0045, 6, 18), bright); lip.position.copy(a).addScaledVector(dir, e * wide / 2); lip.quaternion.setFromUnitVectors(V(0, 0, 1), dir); group.add(lip); }
    }
    /* leaf ornaments sweeping forward from the middle of each limb */
    for (const [t, len] of [[0.24, 0.13], [0.34, 0.09]]) {
      const from = V(0, s * t * TIP, z(t) + 0.012);
      group.add(rod([from, from.clone().add(V(0, s * len * 0.45, 0.045)), from.clone().add(V(0, s * len, 0.02)), from.clone().add(V(0, s * len * 1.08, -0.002))], k => 0.012 * (1 - k) + 0.002, bright, 24, 8));
    }
    string.push(knot.clone().setY(s * TIP));
  }
  /* grip */
  group.add(mesh(new THREE.CylinderGeometry(0.029, 0.029, 0.14, 14), matte({ color: 0x7a4422, roughness: 0.7 })));
  for (const y of [-0.075, 0.075]) { const r = mesh(new THREE.TorusGeometry(0.031, 0.008, 8, 20), au, 0, y, 0); r.rotation.x = Math.PI / 2; group.add(r); }
  const [top, bottom] = string, rest = V(0, 0, z(1));
  const geometry = new THREE.BufferGeometry().setFromPoints([top, rest, bottom]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xd9bf8a })); group.add(line);
  return { group, string: line, setString(worldPoint){ geometry.setFromPoints([top, worldPoint ? group.worldToLocal(worldPoint.clone()) : rest, bottom]); } };
}
