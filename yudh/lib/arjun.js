/* ARJUN - hero of YUDH. Built on the Quaternius Superhero Male model, dressed in code to match Shubham's reference picture:
   golden armor (chest, shoulders, bracers), red-orange sash, cream dhoti with orange waist cloth, gold headband with a red jewel,
   top-knot with long hair, gold earrings, quiver of arrows on the back, and a bow.
   Vault note: Games/Fighter Game/Arjun/Fighter Game — Arjun.md */
import * as THREE from 'three';
import { boundsOf, addShell, addCurlyHair } from './look.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...o });
const goldMat = () => new THREE.MeshStandardMaterial({ color: 0xd9a93a, metalness: 0.45, roughness: 0.38, emissive: 0x3a2808 });
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function dressArjun(root, body, opts = {}){
  const upper = !!opts.upper;      // upper-body armor, sash and quiver are OFF by default (Shubham: bare upper body; bow + arrows only appear when he uses them)
  root.updateMatrixWorld(true);
  const gold = goldMat(), cloth = std(0xc8501a, { roughness: 0.9, side: THREE.DoubleSide }), cream = std(0xe9dfcf, { roughness: 0.95, side: THREE.DoubleSide });
  const shY = (() => { const b = root.getObjectByName('upperarm_l'), w = V(); b.getWorldPosition(w); root.worldToLocal(w); return w.y; })();

  /* armor + clothes (skinned shells: they bend with the body) */
  if (upper) {
  addShell(root, body, { name: 'ArjunCuirass',   include: n => n === 'spine_01' || n === 'spine_02' || n === 'spine_03', inflate: () => 0.022, material: gold });
  addShell(root, body, { name: 'ArjunPauldrons', include: (n, p) => /^(clavicle|upperarm)_/.test(n) && p.y > shY - 0.12, inflate: () => 0.05, material: gold });
  addShell(root, body, { name: 'ArjunArmBands',  include: (n, p) => /^upperarm_/.test(n) && p.y < shY - 0.20 && p.y > shY - 0.27, inflate: () => 0.03, material: gold });
  addShell(root, body, { name: 'ArjunBracers',   include: n => /^lowerarm_/.test(n), inflate: () => 0.026, material: gold });
  }
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

  /* chest: red-orange sash + leather strap + quiver on the back */
  if (upper) {
  const ch = boundsOf(root, body, ['spine_02', 'spine_03']), cg = new THREE.Group();
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.8, 0.014), std(0xc8501a, { roughness: 0.8 })); sash.position.set(ch.ctr.x, ch.ctr.y - 0.02, ch.box.max.z + 0.05); sash.rotation.z = 0.62; cg.add(sash);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.85, 0.012), std(0x6a3a22, { roughness: 0.8 })); strap.position.set(ch.ctr.x, ch.ctr.y - 0.02, ch.box.max.z + 0.056); strap.rotation.z = -0.62; cg.add(strap);
  const q = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.05, 0.55, 18, 1, true), std(0x6a3a1e, { roughness: 0.7, side: THREE.DoubleSide })); q.add(tube);
  for (const yy of [0.27, -0.0, -0.26]) { const r = new THREE.Mesh(new THREE.TorusGeometry(yy === 0.27 ? 0.06 : 0.054, 0.008, 6, 20), gold); r.rotation.x = Math.PI / 2; r.position.y = yy; q.add(r); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28, shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.34, 5), std(0x8a5a2a)); shaft.position.set(Math.cos(a) * 0.025, 0.36, Math.sin(a) * 0.025); shaft.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); q.add(shaft);
    const fea = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.07, 5), std(i % 2 ? 0xeeeeee : 0xc02020)); fea.position.set(Math.cos(a) * 0.035, 0.5, Math.sin(a) * 0.035); q.add(fea); }
  q.position.set(ch.ctr.x + 0.09, ch.ctr.y + 0.1, ch.box.min.z - 0.1); q.rotation.z = -0.35; cg.add(q);
  root.add(cg); root.updateMatrixWorld(true); root.getObjectByName('spine_03').attach(cg);
  }

  /* belt buckle */
  const pb = boundsOf(root, body, ['pelvis']), bg = new THREE.Group();
  const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.016, 20), gold); buckle.rotation.x = Math.PI / 2; buckle.position.set(pb.ctr.x, pb.ctr.y + pb.size.y * 0.18, pb.box.max.z + 0.058); bg.add(buckle);
  const bgem = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), std(0xd01830, { emissive: 0x500010 })); bgem.position.copy(buckle.position).add(V(0, 0, 0.012)); bg.add(bgem);
  root.add(bg); root.updateMatrixWorld(true); root.getObjectByName('pelvis').attach(bg);
}

/* the bow: vertical, belly pointing along local +Z (the game turns it to face the opponent) */
export function makeBow(){
  const group = new THREE.Group(), pts = [];
  for (let i = 0; i <= 28; i++) { const t = i / 28 * 2 - 1; pts.push(V(0, t * 0.64, 0.13 * (1 - t * t))); }
  group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.017, 8, false), std(0x8a5524, { roughness: 0.5, metalness: 0.2 })));
  const gold = goldMat(), grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.16, 12), gold); grip.position.set(0, 0, 0.13); group.add(grip);
  for (const s of [-1, 1]) { const tip = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), gold); tip.position.set(0, s * 0.64, 0); group.add(tip);
    const orn = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 14), gold); orn.position.set(0, s * 0.5, 0.06); orn.rotation.y = Math.PI / 2; group.add(orn); }
  const sg = new THREE.BufferGeometry().setFromPoints([V(0, 0.64, 0), V(0, 0, 0), V(0, -0.64, 0)]);
  const string = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: 0xf0e2c0 })); group.add(string);
  return { group, string, setString(worldPoint){ const mid = worldPoint ? group.worldToLocal(worldPoint.clone()) : V(0, 0, 0); sg.setFromPoints([V(0, 0.64, 0), mid, V(0, -0.64, 0)]); } };
}

/* an arrow along local +X (nock at the origin, tip at +length) */
export function makeArrow(fire = false, len = 0.8){
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, len, 6), std(fire ? 0x5a3a1a : 0x9a6a30, { emissive: fire ? 0x401800 : 0x000000 })); shaft.rotation.z = Math.PI / 2; shaft.position.x = len / 2; g.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.1, 8), std(fire ? 0xff8a1a : 0xc8d0dc, { metalness: 0.5, roughness: 0.3, emissive: fire ? 0xff5a10 : 0x000000 })); tip.rotation.z = -Math.PI / 2; tip.position.x = len + 0.04; g.add(tip);
  for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.032, 0.003), std(i === 0 ? 0xc02020 : 0xf0f0f0)); f.position.x = 0.07; f.rotation.x = i * 2.094; g.add(f); }
  return g;
}
