/* ARJUN - how he looks. Design description and status: design.md */
import * as THREE from 'three';
import { boundsOf, addShell, addCurlyHair } from '../shared/helpers.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...o });
const goldMat = () => new THREE.MeshStandardMaterial({ color: 0xd9a93a, metalness: 0.45, roughness: 0.38, emissive: 0x3a2808 });
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export const skinTint = 0xc7a88f;        // colour laid over the light skin texture

export function dress(root, body){
  root.updateMatrixWorld(true);
  const gold = goldMat(), cloth = std(0xc8501a, { roughness: 0.9, side: THREE.DoubleSide }), cream = std(0xe9dfcf, { roughness: 0.95, side: THREE.DoubleSide });

  addShell(root, body, { name: 'ArjunWaist',     include: n => n === 'pelvis', inflate: () => 0.05, material: cloth });
  addShell(root, body, { name: 'ArjunDhoti',     include: n => /^(thigh|calf)_/.test(n), inflate: n => /^calf/.test(n) ? 0.055 : 0.04, material: cream });

  /* hair: top-knot + long hair down the back (never in front of the face) */
  addCurlyHair(root, body, { strands: 220, toShoulder: true, seed: 5, curl: 0.1, bun: true, color: 0x140c09, topCap: 0.8, tube: 0.1 });

  /* head ornaments */
  const hb = boundsOf(root, body, ['Head']), R = Math.max(hb.size.x, hb.size.z) / 2, bandY = hb.box.max.y - hb.size.y * 0.30, hg = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(R * 1.03, 0.013, 8, 44), gold); band.rotation.x = Math.PI / 2 - 0.1; band.scale.set(hb.size.x / (2 * R), hb.size.z / (2 * R), 1); band.position.set(hb.ctr.x, bandY, hb.ctr.z); hg.add(band);
  const plate = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), gold); plate.scale.set(0.8, 1.3, 0.5); plate.position.set(hb.ctr.x, bandY + 0.018, hb.ctr.z + hb.size.z / 2 * 1.03); hg.add(plate);
  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 10), std(0xd01830, { emissive: 0x600010, roughness: 0.3 })); gem.position.copy(plate.position).add(V(0, 0, 0.014)); hg.add(gem);
  const tilak = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.055, 0.004), std(0xf2e8d0, { emissive: 0x403828 })); tilak.position.set(hb.ctr.x, bandY - 0.05, hb.ctr.z + hb.size.z / 2 * 1.0); hg.add(tilak);
  for (const s of [-1, 1]) { const ring = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), gold); ring.position.set(hb.ctr.x + s * hb.size.x / 2 * 1.0, bandY - hb.size.y * 0.3, hb.ctr.z); hg.add(ring);
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), std(0xf5efe0, { emissive: 0x303030 })); pearl.position.copy(ring.position).add(V(0, -0.02, 0)); hg.add(pearl); }
  root.add(hg); root.updateMatrixWorld(true); root.getObjectByName('Head').attach(hg);


  /* belt buckle */
  const pb = boundsOf(root, body, ['pelvis']), bg = new THREE.Group();
  const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.016, 20), gold); buckle.rotation.x = Math.PI / 2; buckle.position.set(pb.ctr.x, pb.ctr.y + pb.size.y * 0.18, pb.box.max.z + 0.058); bg.add(buckle);
  const bgem = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), std(0xd01830, { emissive: 0x500010 })); bgem.position.copy(buckle.position).add(V(0, 0, 0.012)); bg.add(bgem);
  root.add(bg); root.updateMatrixWorld(true); root.getObjectByName('pelvis').attach(bg);
}
