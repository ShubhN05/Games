/* KARNA - how he looks. Design description and status: design.md */
import * as THREE from 'three';
import { boundsOf, addShell, addPants } from '../shared/helpers.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...o });
function rand(seed){ let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }


export const skinTint = undefined;       // no tint: the light skin texture as it is

/* short spiky hair swept up and back (the face and the sides stay clear) */
function addSpikyHair(root, body, color = 0x0a0a0d, seed = 21){
  const hb = boundsOf(root, body, ['Head']), R = Math.max(hb.size.x, hb.size.z) * 0.5 * 1.06, hc = V(hb.ctr.x, hb.box.max.y - hb.size.y * 0.42, hb.ctr.z);
  const mat = std(color, { roughness: 0.95 }), group = new THREE.Group(), FRONT = Math.PI / 2, rn = rand(seed);
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

export function dress(root, body){
  root.updateMatrixWorld(true);
  const red = new THREE.MeshStandardMaterial({ color: 0xb4120c, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, emissive: 0x240302 });
  const black = new THREE.MeshStandardMaterial({ color: 0x17100e, roughness: 0.7, metalness: 0.25, side: THREE.DoubleSide });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9992a, roughness: 0.35, metalness: 0.5, emissive: 0x3a2204, side: THREE.DoubleSide });
  addPants(body, { color: 0xb4120c, hip: 0.030, thigh: 0.036, calf: 0.050 });                                  // red trousers
  addShell(root, body, { name: 'KarnaWaistCloth', include: n => n === 'pelvis', inflate: () => 0.042, material: red });
  const pb = boundsOf(root, body, ['pelvis']), top = pb.box.max.y, waist = n => n === 'pelvis' || n === 'spine_01';
  addShell(root, body, { name: 'KarnaBelt', include: (n, p) => waist(n) && p.y > top - 0.095 && p.y < top + 0.035, inflate: () => 0.050, material: black });   // wide black sash
  { const wb = boundsOf(root, body, ['pelvis', 'spine_01']), front = (() => { const g = body.geometry.attributes.position, v = V(); let z = -9; for (let i = 0; i < g.count; i++) { v.fromBufferAttribute(g, i); body.localToWorld(v); root.worldToLocal(v); if (Math.abs(v.x - wb.ctr.x) < 0.03 && Math.abs(v.y - (top - 0.03)) < 0.03 && v.z > z) z = v.z; } return z; })();
    const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.016, 8), gold); buckle.rotation.x = Math.PI / 2; buckle.position.set(wb.ctr.x, top - 0.03, front + 0.058); root.add(buckle); root.updateMatrixWorld(true); root.getObjectByName('pelvis').attach(buckle); }   // gold buckle
  addShell(root, body, { name: 'KarnaArmBands', include: (n, p) => /^upperarm_/.test(n) && Math.abs(p.x) > 0.29 && Math.abs(p.x) < 0.40, inflate: () => 0.023, material: black });
  addShell(root, body, { name: 'KarnaWrists', include: (n, p) => /^lowerarm_/.test(n) && Math.abs(p.x) > 0.58, inflate: () => 0.022, material: black });
  addShell(root, body, { name: 'KarnaWristEdge', include: (n, p) => /^lowerarm_/.test(n) && Math.abs(p.x) > 0.58 && Math.abs(p.x) < 0.64, inflate: () => 0.027, material: gold });
  addSpikyHair(root, body, 0x8a1606, 57);                                                                       // flame-red spiky hair
  root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.name === 'MI_Hair_1') m.color = new THREE.Color(0x4a0d04); if (m.name === 'MI_Eyes') { m.color = new THREE.Color(0xff8a10); m.emissive = new THREE.Color(0xff6a00); m.emissiveIntensity = 1.3; } }); });
}
