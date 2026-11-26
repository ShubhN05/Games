/* ASHVATTHAMA's bow, from the picture: black horn, broad bronze bands, two spiked bronze guards beside the grip and
   hooked blades at the tips. The game holds it at the middle (0,0,0); it is upright with its back towards +Z (the opponent). */
import * as THREE from 'three';
import { V, mix, texture, engrave, matte, mesh, rod, merge, random } from '../shared/wardrobe.js';
import { steel, bronze } from './metals.js';

const TIP = 0.72;          // the string is tied this far above and below the grip
export function makeBow(){
  const group = new THREE.Group();
  const horn = steel({ map: texture(512, 64, (x, w, h) => { x.fillStyle = '#34323a'; x.fillRect(0, 0, w, h); const r = random(931); for (let i = 0; i < 220; i++) { x.fillStyle = r() < 0.6 ? 'rgba(0,0,0,0.55)' : 'rgba(190,196,214,0.3)'; x.fillRect(r() * w, r() * h, 18 + r() * 80, 0.8 + r() * 1.8); } }), color: 0xcfd2dc, metalness: 0.45, roughness: 0.5 });
  const carved = steel({ map: texture(256, 64, (x, w, h) => { x.fillStyle = '#9a7630'; x.fillRect(0, 0, w, h); engrave(x, 0, 0, w, h, { seed: 933, count: 34, size: 12, light: '#f3d890', dark: '#3e2a08', width: 2 }); }), color: 0xfff0d0, metalness: 0.58 });
  const brass = bronze(), iron = steel({ color: 0x9aa0ac }), cord = matte({ color: 0x32201a, roughness: 0.85 });
  const inlaid = steel({ map: texture(256, 64, (x, w, h) => { x.fillStyle = '#3b3a42'; x.fillRect(0, 0, w, h); engrave(x, 0, 0, w, h, { seed: 937, count: 14, size: 15, light: '#b99245', dark: '#0e0c0c', width: 2.2 }); }), color: 0xe0e0ea, metalness: 0.55, roughness: 0.46 });
  const z = t => -0.2 * Math.pow(Math.sin(t * Math.PI * 0.52), 2) + 0.07 * Math.exp(-Math.pow((t - 0.36) / 0.17, 2));
  const cone = (at, towards, long, wide, material) => { const dir = towards.clone().normalize(), c = mesh(new THREE.ConeGeometry(wide, long, 10), material); c.position.copy(at).addScaledVector(dir, long / 2); c.quaternion.setFromUnitVectors(V(0, 1, 0), dir); return c; };
  const string = [];
  for (const s of [1, -1]) {
    const point = t => V(0, s * t * TIP, z(t));
    group.add(rod(Array.from({ length: 23 }, (_, i) => point(i / 22)), t => mix(0.03, 0.019, t), horn, 66, 12));
    /* the hooked blade at the tip, curving forward */
    const end = point(1);
    group.add(rod([end, V(0, s * (TIP + 0.05), end.z + 0.012), V(0, s * (TIP + 0.083), end.z + 0.055), V(0, s * (TIP + 0.082), end.z + 0.115)], t => mix(0.02, 0.0015, t), horn, 40, 8));
    group.add(rod([V(0, s * (TIP + 0.004), end.z - 0.012), V(0, s * (TIP + 0.05), end.z - 0.006), V(0, s * (TIP + 0.09), end.z + 0.03)], t => mix(0.008, 0.002, t), brass, 20, 6));
    for (let i = 0; i < 4; i++) { const t = 0.952 + i * 0.013, wrap = mesh(new THREE.TorusGeometry(0.022, 0.0048, 8, 18), cord, 0, s * t * TIP, z(t)); wrap.rotation.x = Math.PI / 2; group.add(wrap); }
    const band = (t, wide, grow, material = carved) => { const a = point(t), dir = point(t + 0.02).sub(a).normalize(), r = mix(0.03, 0.019, t) * grow;
      const ring = mesh(new THREE.CylinderGeometry(r, r, wide, 16), material); ring.position.copy(a); ring.quaternion.setFromUnitVectors(V(0, 1, 0), dir); group.add(ring);
      for (const e of [-1, 1]) { const lip = mesh(new THREE.TorusGeometry(r, 0.0048, 6, 20), brass); lip.position.copy(a).addScaledVector(dir, e * wide / 2); lip.quaternion.setFromUnitVectors(V(0, 0, 1), dir); group.add(lip); } };
    band(0.62, 0.04, 1.3); band(0.78, 0.036, 1.3); band(0.9, 0.03, 1.3, brass);
    /* the flared guard beside the grip, with spikes towards the opponent */
    const guard = Array.from({ length: 9 }, (_, i) => point(mix(0.15, 0.47, i / 8)));
    group.add(rod(guard, t => 0.034 + 0.015 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.05)), inlaid, 40, 14));
    band(0.15, 0.02, 1.85, carved); band(0.31, 0.012, 1.95, brass); band(0.47, 0.02, 1.6, carved);
    for (const [t, long, lean] of [[0.2, 0.075, -0.35], [0.31, 0.095, 0], [0.43, 0.075, 0.45]]) group.add(cone(point(t).add(V(0, 0, 0.044)), V(0, s * lean, 1), long, 0.015, iron));
    group.add(cone(point(0.46).add(V(0, 0, 0.03)), V(0, s * 1, 0.75), 0.1, 0.014, brass));
    for (const x of [-1, 1]) for (const t of [0.24, 0.39]) { const knob = mesh(new THREE.SphereGeometry(0.0085, 8, 6), iron, x * 0.049, s * t * TIP, z(t)); group.add(knob); }
    string.push(V(0, s * TIP, z(1)));
  }
  group.add(mesh(new THREE.CylinderGeometry(0.029, 0.029, 0.2, 14), matte({ color: 0x3c241a, roughness: 0.75 })));
  for (const y of [-0.06, -0.02, 0.02, 0.06]) { const r = mesh(new THREE.TorusGeometry(0.03, 0.0034, 6, 18), cord, 0, y, 0); r.rotation.x = Math.PI / 2 + 0.2; group.add(r); }
  merge(group);
  const [top, bottom] = string, rest = V(0, 0, z(1));
  const geometry = new THREE.BufferGeometry().setFromPoints([top, rest, bottom]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x8a8078 })); group.add(line);
  return { group, string: line, setString(worldPoint){ geometry.setFromPoints([top, worldPoint ? group.worldToLocal(worldPoint.clone()) : rest, bottom]); } };
}
