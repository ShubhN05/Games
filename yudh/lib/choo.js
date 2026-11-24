/* CHOO - the kung-fu master of YUDH (Chinese, Tekken-3 "Bruce Lee" style). Built on the Quaternius Superhero Male model:
   tan skin, bare chest with three claw scratches, black kung-fu trousers, yellow sash, black wrist wraps + slippers, spiky black hair.
   Vault note: Games/Fighter Game/Choo/Fighter Game — Choo.md */
import * as THREE from 'three';
import { boundsOf, addShell, addPants } from './look.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...o });
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
function rand(seed){ let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* short spiky black hair swept up and back (the face and the sides stay clear) */
function addSpikyHair(root, body){
  const hb = boundsOf(root, body, ['Head']), R = Math.max(hb.size.x, hb.size.z) * 0.5 * 1.06, hc = V(hb.ctr.x, hb.box.max.y - hb.size.y * 0.42, hb.ctr.z);
  const mat = std(0x0a0a0d, { roughness: 0.95 }), group = new THREE.Group(), FRONT = Math.PI / 2, rn = rand(21);
  const cap = (th0, thLen, ph0, phLen) => { const m = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 18, ph0, phLen, th0, thLen), mat); m.position.copy(hc); group.add(m); };
  cap(0, 0.95, 0, Math.PI * 2); cap(0.9, 0.9, FRONT + 0.95, Math.PI * 2 - 1.9);
  const up = V(0, 1, 0);
  for (let i = 0; i < 30; i++) {
    const th = 0.1 + rn() * 1.0, ph = FRONT + Math.PI + (rn() * 2 - 1) * 1.5, dir = V(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th)).normalize();
    const spike = new THREE.Mesh(new THREE.ConeGeometry(R * 0.27, R * (0.8 + rn() * 0.6), 6), mat);
    spike.position.copy(hc).addScaledVector(dir, R * 0.92);
    const aim = dir.clone().multiplyScalar(0.7).addScaledVector(up, 0.55).add(V(0, 0, -0.25)).normalize(); spike.quaternion.setFromUnitVectors(up, aim); spike.position.addScaledVector(aim, R * 0.25); group.add(spike);
  }
  root.add(group); root.updateMatrixWorld(true); root.getObjectByName('Head').attach(group);
}

export function dressChoo(root, body){
  root.updateMatrixWorld(true);
  const black = std(0x14141a, { roughness: 0.9, side: THREE.DoubleSide }), yellow = std(0xf0c010, { roughness: 0.8, side: THREE.DoubleSide }), wrap = std(0x1b1b22, { roughness: 0.9, side: THREE.DoubleSide });
  addPants(body, { color: 0x14141a, hip: 0.030, thigh: 0.036, calf: 0.052 });                       // loose black kung-fu trousers
  const pb = boundsOf(root, body, ['pelvis']);
  addShell(root, body, { name: 'ChooSash', include: (n, p) => n === 'pelvis' && p.y > pb.box.max.y - pb.size.y * 0.42, inflate: () => 0.05, material: yellow });   // yellow sash
  addShell(root, body, { name: 'ChooWraps', include: n => /^lowerarm_/.test(n), inflate: () => 0.024, material: wrap });                                           // wrist-to-elbow wraps
  addShell(root, body, { name: 'ChooSlippers', include: n => /^(foot|ball)_/.test(n), inflate: () => 0.02, material: black });                                      // kung-fu slippers
  addSpikyHair(root, body);
  /* three claw scratches on the chest */
  const ch = boundsOf(root, body, ['spine_02', 'spine_03']), g = new THREE.Group(), red = new THREE.MeshBasicMaterial({ color: 0x7a1010 });
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.2, 0.004), red); m.position.set(ch.ctr.x - 0.07 + i * 0.045, ch.ctr.y + 0.05, ch.box.max.z + 0.012); m.rotation.z = -0.35; g.add(m); }
  root.add(g); root.updateMatrixWorld(true); root.getObjectByName('spine_03').attach(g);
}
