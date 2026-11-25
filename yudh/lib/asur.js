/* ASUR - the fire warrior of YUDH. Built on the Quaternius Superhero Male model:
   fair skin, bare upper body, red trousers, flame-red spiky hair, glowing orange eyes, black belt and arm bands with gold edges.
   (His constant fire glow and embers are drawn by the game.)  Vault note: Games/Fighter Game/Asur/Fighter Game — Asur.md */
import * as THREE from 'three';
import { boundsOf, addShell, addPants } from './look.js';
import { addSpikyHair } from './choo.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function dressAsur(root, body){
  root.updateMatrixWorld(true);
  const red = new THREE.MeshStandardMaterial({ color: 0xb4120c, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, emissive: 0x240302 });
  const black = new THREE.MeshStandardMaterial({ color: 0x17100e, roughness: 0.7, metalness: 0.25, side: THREE.DoubleSide });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9992a, roughness: 0.35, metalness: 0.5, emissive: 0x3a2204, side: THREE.DoubleSide });
  addPants(body, { color: 0xb4120c, hip: 0.030, thigh: 0.036, calf: 0.050 });                                  // red trousers
  addShell(root, body, { name: 'AsurWaistCloth', include: n => n === 'pelvis', inflate: () => 0.042, material: red });
  const pb = boundsOf(root, body, ['pelvis']), top = pb.box.max.y, waist = n => n === 'pelvis' || n === 'spine_01';
  addShell(root, body, { name: 'AsurBelt', include: (n, p) => waist(n) && p.y > top - 0.095 && p.y < top + 0.035, inflate: () => 0.050, material: black });   // wide black sash
  { const wb = boundsOf(root, body, ['pelvis', 'spine_01']), front = (() => { const g = body.geometry.attributes.position, v = V(); let z = -9; for (let i = 0; i < g.count; i++) { v.fromBufferAttribute(g, i); body.localToWorld(v); root.worldToLocal(v); if (Math.abs(v.x - wb.ctr.x) < 0.03 && Math.abs(v.y - (top - 0.03)) < 0.03 && v.z > z) z = v.z; } return z; })();
    const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.016, 8), gold); buckle.rotation.x = Math.PI / 2; buckle.position.set(wb.ctr.x, top - 0.03, front + 0.058); root.add(buckle); root.updateMatrixWorld(true); root.getObjectByName('pelvis').attach(buckle); }   // gold buckle
  const shY = (() => { const b = root.getObjectByName('upperarm_l'), w = V(); b.getWorldPosition(w); root.worldToLocal(w); return w.y; })();
  addShell(root, body, { name: 'AsurArmBands', include: (n, p) => /^upperarm_/.test(n) && p.y < shY - 0.18 && p.y > shY - 0.28, inflate: () => 0.023, material: black });
  addShell(root, body, { name: 'AsurWrists', include: (n, p) => /^lowerarm_/.test(n) && p.y < shY - 0.40, inflate: () => 0.022, material: black });
  addShell(root, body, { name: 'AsurWristEdge', include: (n, p) => /^lowerarm_/.test(n) && p.y < shY - 0.40 && p.y > shY - 0.45, inflate: () => 0.027, material: gold });
  addSpikyHair(root, body, 0x8a1606, 57);                                                                       // flame-red spiky hair
  root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.name === 'MI_Hair_1') m.color = new THREE.Color(0x4a0d04); if (m.name === 'MI_Eyes') { m.color = new THREE.Color(0xff8a10); m.emissive = new THREE.Color(0xff6a00); m.emissiveIntensity = 1.3; } }); });
}
