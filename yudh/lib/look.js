/* Fighter look helpers (shared): black skin + brown pants + curly hair, built on the Quaternius Superhero Male model.
   See vault: Games/Fighter Game/Fighter Game — 3D Pipeline & Assets.md */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* ---------- Ravan's look: black skin, brown pants (painted onto the texture), long curly hair ---------- */
function rand(seed){ let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function findBody(root){ let best = null; root.traverse(o => { if (o.isSkinnedMesh) { const ms = Array.isArray(o.material) ? o.material : [o.material]; if (ms.some(m => m.name === 'MI_Superhero_Male')) best = o; } }); return best; }
export function dominantBones(body){
  const g = body.geometry, names = body.skeleton.bones.map(b => b.name), si = g.attributes.skinIndex, sw = g.attributes.skinWeight, out = new Array(g.attributes.position.count);
  for (let i = 0; i < out.length; i++) { let bi = si.getX(i), bw = sw.getX(i);
    [[si.getY(i), sw.getY(i)], [si.getZ(i), sw.getZ(i)], [si.getW(i), sw.getW(i)]].forEach(([a, b]) => { if (b > bw) { bw = b; bi = a; } }); out[i] = names[bi]; }
  return out;
}
export function paintRavanTexture(body, opts){
  const mats = Array.isArray(body.material) ? body.material : [body.material], m = mats.find(x => x.name === 'MI_Superhero_Male');
  const img = m.map.image, w = img.width, h = img.height, g = body.geometry, uv = g.attributes.uv, dom = dominantBones(body);
  const base = document.createElement('canvas'); base.width = w; base.height = h; const bc = base.getContext('2d'); bc.drawImage(img, 0, 0, w, h);
  const src = bc.getImageData(0, 0, w, h);
  // mask = triangles whose three vertices belong to the legs (thighs + calves) -> pants
  const mk = document.createElement('canvas'); mk.width = w; mk.height = h; const mc = mk.getContext('2d'); mc.fillStyle = '#fff'; mc.strokeStyle = '#fff'; mc.lineWidth = 3; mc.lineJoin = 'round';
  const isLeg = n => /^(thigh|calf)_/.test(n) || n === 'pelvis', idx = g.index.array;
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t+1], c = idx[t+2];
    if (isLeg(dom[a]) && isLeg(dom[b]) && isLeg(dom[c])) { mc.beginPath(); mc.moveTo(uv.getX(a)*w, uv.getY(a)*h); mc.lineTo(uv.getX(b)*w, uv.getY(b)*h); mc.lineTo(uv.getX(c)*w, uv.getY(c)*h); mc.closePath(); mc.fill(); mc.stroke(); } }
  const mask = mc.getImageData(0, 0, w, h).data, d = src.data, [pr, pg, pb] = opts.pants, [sr, sg, sb] = opts.skin;
  for (let p = 0; p < d.length; p += 4) {
    const r = d[p], gg = d[p+1], b = d[p+2], lum = (r + gg + b) / 765, sat = Math.max(r, gg, b) - Math.min(r, gg, b);
    const grey = sat < 22 && lum > 0.12;                                   // the original grey shorts
    if (mask[p] > 100 || grey) {
      const px = (p >> 2) % w, py = (p >> 2) / w | 0, weave = ((px * 7 + py * 13) % 5) / 5 * 0.10 + (((px >> 1) + (py >> 1)) & 1) * 0.05;   // fabric weave
      const k = 0.80 + 0.30 * Math.min(1, lum * 1.5) + weave - 0.06; d[p] = pr * k; d[p+1] = pg * k; d[p+2] = pb * k; }
    else { d[p] = r * sr; d[p+1] = gg * sg; d[p+2] = b * sb; }              // darken skin -> black
  }
  bc.putImageData(src, 0, 0);
  const tex = new THREE.CanvasTexture(base); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  m.map = tex; m.color = new THREE.Color(0xffffff); m.roughnessMap = null; m.roughness = 0.9; m.metalness = 0; m.needsUpdate = true;
}
/* real trousers: a slightly inflated copy of the hip+leg triangles, skinned to the same skeleton (so they move with the legs) */
export function addPants(body, opts){
  const g = body.geometry, dom = dominantBones(body), idx = g.index.array, ng = new THREE.BufferGeometry();
  const isCalf = n => /^calf_/.test(n), isThigh = n => /^thigh_/.test(n), isLeg = n => isCalf(n) || isThigh(n) || n === 'pelvis';
  const pos = g.attributes.position, nor = g.attributes.normal, p = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { const k = isCalf(dom[i]) ? opts.calf : isThigh(dom[i]) ? opts.thigh : opts.hip;
    p[i*3] = pos.getX(i) + nor.getX(i) * k; p[i*3+1] = pos.getY(i) + nor.getY(i) * k; p[i*3+2] = pos.getZ(i) + nor.getZ(i) * k; }
  const keep = []; for (let t = 0; t < idx.length; t += 3) if (isLeg(dom[idx[t]]) && isLeg(dom[idx[t+1]]) && isLeg(dom[idx[t+2]])) keep.push(idx[t], idx[t+1], idx[t+2]);
  ng.setAttribute('position', new THREE.BufferAttribute(p, 3)); ng.setAttribute('normal', nor); ng.setAttribute('uv', g.attributes.uv);
  ng.setAttribute('skinIndex', g.attributes.skinIndex); ng.setAttribute('skinWeight', g.attributes.skinWeight); ng.setIndex(keep);
  const mat = new THREE.MeshStandardMaterial({ color: opts.color, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  const pants = new THREE.SkinnedMesh(ng, mat); pants.name = 'RavanPants'; pants.frustumCulled = false;
  pants.position.copy(body.position); pants.quaternion.copy(body.quaternion); pants.scale.copy(body.scale);
  body.parent.add(pants); pants.bind(body.skeleton, body.bindMatrix);
}
export function addCurlyHair(root, body, opts){
  const dom = dominantBones(body), g = body.geometry, pos = g.attributes.position, box = new THREE.Box3(), v = new THREE.Vector3();
  root.updateMatrixWorld(true);
  for (let i = 0; i < pos.count; i++) if (dom[i] === 'Head') { v.fromBufferAttribute(pos, i); body.localToWorld(v); root.worldToLocal(v); box.expandByPoint(v); }
  const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3()), R = Math.max(size.x, size.z) * 0.5 * 1.06;
  const hc = new THREE.Vector3(ctr.x, box.max.y - size.y * 0.42, ctr.z), rn = rand(opts.seed || 7), geos = [];
  // shoulder height (root space): the hair ends here, nothing hangs below the shoulders
  const shoulderY = (() => { const b = root.getObjectByName('upperarm_l'), w = new THREE.Vector3(); b.getWorldPosition(w); root.worldToLocal(w); return w.y + 0.03; })();
  const mat = new THREE.MeshStandardMaterial({ color: opts.color ?? 0x0c0a0b, roughness: 0.55, metalness: 0.05 });
  const group = new THREE.Group(); group.name = 'RavanHair';
  const cap = (th0, thLen, ph0, phLen) => { const m = new THREE.Mesh(new THREE.SphereGeometry(R, 30, 20, ph0, phLen, th0, thLen), mat); m.position.copy(hc); group.add(m); };
  const FRONT = Math.PI / 2;                                      // +Z is the face direction
  cap(0, opts.topCap ?? 1.0, 0, Math.PI * 2);                     // top of the head
  cap(0.95, 0.95, FRONT + 0.95, Math.PI * 2 - 1.9);               // sides + back (face stays open)
  const up = new THREE.Vector3(0, 1, 0);
  for (let s = 0; s < opts.strands; s++) {
    // long curls start only on the BACK of the head (within ~50 deg of straight behind), so the face / side view stays clear
    const th = 0.6 + rn() * 1.25, ph = FRONT + Math.PI + (rn() * 2 - 1) * 0.95;
    const dir = new THREE.Vector3(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th));
    const p0 = hc.clone().addScaledVector(dir, R * 0.98), o = new THREE.Vector3(dir.x, 0, dir.z).normalize();
    const e1 = new THREE.Vector3().crossVectors(up, o).normalize(), L = opts.toShoulder ? Math.max(0.08, p0.y - (shoulderY + (rn() - 0.5) * 0.04)) : opts.length * (0.7 + rn() * 0.6), rc = R * (0.16 + rn() * 0.14) * (opts.curl ?? 1), turns = 4 + rn() * 3, p = rn() * 6.28, pts = [];
    for (let i = 0; i <= 44; i++) { const t = i / 44, ang = t * turns * 6.2832 + p, grow = Math.min(1, t * 4);
      const q = p0.clone().addScaledVector(up, -L * t).addScaledVector(o, R * 0.12 * Math.sin(Math.PI * Math.min(1, t * 1.3)) + R * 0.1 * t)
        .addScaledVector(e1, rc * Math.cos(ang) * grow).addScaledVector(o, rc * Math.sin(ang) * grow); pts.push(q); }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 70, R * (opts.tube ?? 0.075), 5, false));
  }
  const curls = new THREE.Mesh(mergeGeometries(geos), mat); group.add(curls);
  if (opts.bun) {                                                  // top-knot (hair tied up) with a small gold tie
    const bun = new THREE.Mesh(new THREE.SphereGeometry(R * 0.5, 20, 14), mat); bun.position.set(hc.x, box.max.y + R * 0.12, hc.z - R * 0.18); bun.scale.set(1, 1.05, 1); group.add(bun);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(R * 0.36, 0.01, 8, 24), new THREE.MeshStandardMaterial({ color: 0xd9a93a, metalness: 0.4, roughness: 0.4, emissive: 0x3a2808 })); tie.rotation.x = Math.PI / 2; tie.position.set(hc.x, box.max.y - R * 0.12, hc.z - R * 0.18); group.add(tie);
  }
  root.add(group); root.updateMatrixWorld(true);
  root.getObjectByName('Head').attach(group);                      // follows the head when he moves
}

/* ---------- reusable body helpers (used for Arjun's armor, clothes, ornaments) ---------- */
export function boundsOf(root, body, names){
  const dom = dominantBones(body), pos = body.geometry.attributes.position, box = new THREE.Box3(), v = new THREE.Vector3();
  root.updateMatrixWorld(true);
  for (let i = 0; i < pos.count; i++) if (names.includes(dom[i])) { v.fromBufferAttribute(pos, i); body.localToWorld(v); root.worldToLocal(v); box.expandByPoint(v); }
  return { box, size: box.getSize(new THREE.Vector3()), ctr: box.getCenter(new THREE.Vector3()) };
}
/* a slightly inflated copy of part of the body (armor / cloth), skinned to the same skeleton so it moves with the body.
   include(boneName, pointInRootSpace) picks the vertices; inflate(boneName, point) = how far to push them outward */
export function addShell(root, body, o){
  const g = body.geometry, dom = dominantBones(body), pos = g.attributes.position, nor = g.attributes.normal, idx = g.index.array, n = pos.count, v = new THREE.Vector3();
  root.updateMatrixWorld(true);
  const wp = new Array(n); for (let i = 0; i < n; i++) { v.fromBufferAttribute(pos, i); body.localToWorld(v); root.worldToLocal(v); wp[i] = v.clone(); }
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const k = o.inflate(dom[i], wp[i]); p[i*3] = pos.getX(i) + nor.getX(i) * k; p[i*3+1] = pos.getY(i) + nor.getY(i) * k; p[i*3+2] = pos.getZ(i) + nor.getZ(i) * k; }
  const ok = i => o.include(dom[i], wp[i]), keep = [];
  for (let t = 0; t < idx.length; t += 3) if (ok(idx[t]) && ok(idx[t+1]) && ok(idx[t+2])) keep.push(idx[t], idx[t+1], idx[t+2]);
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.BufferAttribute(p, 3)); ng.setAttribute('normal', nor); ng.setAttribute('uv', g.attributes.uv);
  ng.setAttribute('skinIndex', g.attributes.skinIndex); ng.setAttribute('skinWeight', g.attributes.skinWeight); ng.setIndex(keep);
  const m = new THREE.SkinnedMesh(ng, o.material); m.name = o.name || 'Shell'; m.frustumCulled = false;
  m.position.copy(body.position); m.quaternion.copy(body.quaternion); m.scale.copy(body.scale);
  body.parent.add(m); m.bind(body.skeleton, body.bindMatrix); return m;
}
