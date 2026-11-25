/* INDRA - king of the gods, lord of thunder and lightning. Built on the Quaternius Superhero Male model:
   fair skin, bare upper body, white trousers, long dark hair, golden crown, belt and armlets.
   (His constant lightning aura and glow are drawn by the game.)  Vault note: Games/Fighter Game/Indra/Fighter Game — Indra.md */
import * as THREE from 'three';
import { boundsOf, addShell, addPants, addCurlyHair } from './look.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function dressIndra(root, body){
  root.updateMatrixWorld(true);
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f2ea, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, emissive: 0x1c1b16 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe4b23c, metalness: 0.5, roughness: 0.32, emissive: 0x4a3408, side: THREE.DoubleSide });
  const gem = new THREE.MeshStandardMaterial({ color: 0x2aa8ff, emissive: 0x1060c0, roughness: 0.25 });
  addPants(body, { color: 0xf4f2ea, hip: 0.030, thigh: 0.036, calf: 0.048 });                                  // white trousers
  addShell(root, body, { name: 'IndraWaistCloth', include: n => n === 'pelvis', inflate: () => 0.042, material: white });
  const pb = boundsOf(root, body, ['pelvis']);
  addShell(root, body, { name: 'IndraBelt', include: (n, p) => n === 'pelvis' && p.y > pb.box.max.y - pb.size.y * 0.32, inflate: () => 0.056, material: gold });
  const shY = (() => { const b = root.getObjectByName('upperarm_l'), w = V(); b.getWorldPosition(w); root.worldToLocal(w); return w.y; })();
  addShell(root, body, { name: 'IndraArmlets', include: (n, p) => /^upperarm_/.test(n) && p.y < shY - 0.19 && p.y > shY - 0.27, inflate: () => 0.024, material: gold });
  addShell(root, body, { name: 'IndraWrists', include: (n, p) => /^lowerarm_/.test(n) && p.y < shY - 0.46, inflate: () => 0.022, material: gold });
  addCurlyHair(root, body, { strands: 170, toShoulder: true, seed: 17, curl: 0.12, color: 0x170d07, topCap: 0.8, tube: 0.1 });

  /* crown (mukut) */
  const hb = boundsOf(root, body, ['Head']), R = Math.max(hb.size.x, hb.size.z) / 2, top = hb.box.max.y, cg = new THREE.Group();
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.92, R * 1.06, 0.055, 28, 1, true), gold); band.position.set(hb.ctr.x, top - hb.size.y * 0.17, hb.ctr.z); cg.add(band);
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.6, R * 0.9, 0.055, 24, 1, true), gold); dome.position.set(hb.ctr.x, band.position.y + 0.052, hb.ctr.z); cg.add(dome);
  const spire = new THREE.Mesh(new THREE.SphereGeometry(R * 0.6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), gold); spire.scale.y = 0.55; spire.position.set(hb.ctr.x, dome.position.y + 0.027, hb.ctr.z); cg.add(spire);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), gem); knob.position.set(hb.ctr.x, spire.position.y + R * 0.37, hb.ctr.z); cg.add(knob);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + Math.PI / 2, tip = new THREE.Mesh(new THREE.ConeGeometry(0.017, 0.065, 6), gold); tip.position.set(hb.ctr.x + Math.cos(a) * R * 0.94, band.position.y + 0.052, hb.ctr.z + Math.sin(a) * R * 0.94); cg.add(tip); }
  const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.024), gem); jewel.scale.set(0.9, 1.3, 0.6); jewel.position.set(hb.ctr.x, band.position.y, hb.ctr.z + R * 1.04); cg.add(jewel);
  root.add(cg); root.updateMatrixWorld(true); root.getObjectByName('Head').attach(cg);
}
