/* KARNA's bow (Vijaya), from the picture: all gold, wide curled ends holding red gems, and carved heads
   with glowing red stones on both sides of the grip.
   The game holds it at the middle (0,0,0); it is upright with its back towards +Z (the opponent). */
import * as THREE from 'three';
import { V, mix, texture, engrave, metal, gold, matte, mesh, rod, merge } from '../shared/wardrobe.js';

const TIP = 0.7;          // the string is tied this far above and below the grip
export function makeBow(){
  const group = new THREE.Group();
  const carved = metal({ map: texture(512, 64, (x, w, h) => { x.fillStyle = '#e0aa38'; x.fillRect(0, 0, w, h); engrave(x, 0, 0, w, h, { seed: 131, count: 70, size: 11, light: '#ffeaa0', dark: '#84580c', width: 2 }); }), color: 0xfff0c4, emissive: 0x2a1a00, metalness: 0.55 });
  const bright = gold({ color: 0xffd25e, emissive: 0x3a2404 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xff3020, emissive: 0xd81808, emissiveIntensity: 1.1, roughness: 0.2 });
  const shine = new THREE.MeshStandardMaterial({ color: 0xffcf66, emissive: 0xff9a14, emissiveIntensity: 0.9, roughness: 0.35 });
  /* one limb from the grip (t = 0) to the string knot (t = 1): sweeps back deeply, then turns forward */
  const z = t => -0.2 * Math.pow(Math.sin(t * Math.PI * 0.56), 2) + 0.06 * Math.exp(-Math.pow((t - 0.36) / 0.17, 2));
  const knot = V(0, TIP, z(1)), string = [];
  for (const s of [1, -1]) {
    group.add(rod(Array.from({ length: 23 }, (_, i) => { const t = i / 22; return V(0, s * t * TIP, z(t)); }), t => mix(0.031, 0.015, t), carved, 66, 12));
    /* curled end with a red gem in its centre */
    const centre = V(0, s * (TIP + 0.052), z(1) + 0.05), curl = [V(0, s * TIP, z(1))];
    for (let i = 1; i <= 30; i++) { const t = i / 30, a = -2.3 + t * 5.6, r = mix(0.074, 0.026, t); curl.push(V(0, centre.y + s * Math.sin(a) * r, centre.z + Math.cos(a + Math.PI * 0.06) * r * 0.95)); }
    group.add(rod(curl, t => mix(0.017, 0.012, t), bright, 60, 10));
    const gem = mesh(new THREE.SphereGeometry(0.021, 16, 12), stone, 0, centre.y, centre.z); gem.scale.set(0.9, 1, 1); group.add(gem);
    for (const x of [-1, 1]) { const ring = mesh(new THREE.TorusGeometry(0.024, 0.005, 8, 22), bright, x * 0.012, centre.y, centre.z); ring.rotation.y = Math.PI / 2; group.add(ring); }
    group.add(mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.03, 12), bright, 0, s * TIP * 0.94, z(0.94)));
    /* carved head beside the grip: a thick golden swelling with a glowing rim and a red stone */
    const head = rod([V(0, s * 0.07, 0.004), V(0, s * 0.13, z(0.18) + 0.012), V(0, s * 0.2, z(0.28) + 0.014), V(0, s * 0.27, z(0.39) + 0.004)], t => 0.014 + 0.042 * Math.sin(Math.PI * Math.min(1, t * 0.94 + 0.05)), carved, 36, 14);
    head.scale.x = 0.75; group.add(head);
    const lip = mesh(new THREE.TorusGeometry(0.036, 0.008, 8, 24), shine, 0, s * 0.082, 0.008); lip.rotation.x = Math.PI / 2; group.add(lip);
    for (const x of [-1, 1]) { const eye = mesh(new THREE.SphereGeometry(0.018, 14, 10), stone, x * 0.036, s * 0.168, z(0.24) + 0.014); eye.scale.set(0.5, 1.6, 0.9); group.add(eye); }
    group.add(rod([V(0, s * 0.18, z(0.26) + 0.055), V(0, s * 0.25, z(0.36) + 0.085), V(0, s * 0.32, z(0.45) + 0.05)], t => 0.017 * (1 - t) + 0.002, bright, 24, 8));
    string.push(knot.clone().setY(s * TIP));
  }
  group.add(mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.14, 14), matte({ color: 0x8a1426, roughness: 0.55 })));
  for (const y of [-0.024, 0.024]) { const r = mesh(new THREE.TorusGeometry(0.029, 0.0045, 8, 20), bright, 0, y, 0); r.rotation.x = Math.PI / 2; group.add(r); }
  merge(group);
  const [top, bottom] = string, rest = V(0, 0, z(1));
  const geometry = new THREE.BufferGeometry().setFromPoints([top, rest, bottom]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffdf8a })); group.add(line);
  return { group, string: line, setString(worldPoint){ geometry.setFromPoints([top, worldPoint ? group.worldToLocal(worldPoint.clone()) : rest, bottom]); } };
}
