/* THE WARDROBE: tools for dressing the base body. Shared by characters that choose to import it.
   All positions are in the body's rest pose: arms straight out along X, face towards +Z, height about 1.81.

   layer()  - a skin-tight copy of part of the body (armour, bands, shoes) with a painted texture;
              transparent paint = nothing there, so edges are as sharp as the painting
   cloth()  - a free-form sheet or tube (dhoti, drapes, tails) that moves with the bones
   attach() - fix a solid object (crown, pauldron, quiver) to one bone */
import * as THREE from 'three';
import { dominantBones } from './helpers.js';

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const mix = (a, b, t) => a + (b - a) * t;
export const clamp01 = t => Math.max(0, Math.min(1, t));
/* value from a table [[x, y], ...] with x going up or down */
export function table(rows, x){
  const up = rows[rows.length - 1][0] > rows[0][0];
  if (up ? x <= rows[0][0] : x >= rows[0][0]) return rows[0][1];
  for (let i = 1; i < rows.length; i++) { const [a, ya] = rows[i - 1], [b, yb] = rows[i]; if (up ? x <= b : x >= b) return mix(ya, yb, (x - a) / (b - a)); }
  return rows[rows.length - 1][1];
}
export function random(seed){ let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------------- painting ---------------- */
export function texture(w, h, paint){
  const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
/* curling engraved lines inside a rectangle (used on armour and borders) */
export function engrave(x, left, top, w, h, { seed = 1, count = 14, size = 22, light = '#ffe9a8', dark = '#6a4510', width = 2.4 } = {}){
  const r = random(seed);
  x.save(); x.beginPath(); x.rect(left, top, w, h); x.clip(); x.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const cx = left + r() * w, cy = top + r() * h, s = size * (0.6 + r() * 0.8), turn = r() < 0.5 ? 1 : -1, start = r() * 6.28;
    for (const [color, off] of [[dark, 1.6], [light, 0]]) {
      x.strokeStyle = color; x.lineWidth = width; x.beginPath();
      for (let k = 0; k <= 40; k++) { const t = k / 40, a = start + turn * t * 8.5, rad = s * (1 - t * 0.85); const px = cx + Math.cos(a) * rad + off, py = cy + Math.sin(a) * rad * 0.75 + off; k ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
    }
  }
  x.restore();
}
/* a gold trim band with beads */
export function trim(x, left, top, w, h, { base = '#c9942e', light = '#ffe7a0', dark = '#6a4510' } = {}){
  x.fillStyle = base; x.fillRect(left, top, w, h);
  x.fillStyle = dark; x.fillRect(left, top, w, Math.max(1, h * 0.12)); x.fillRect(left, top + h * 0.88, w, Math.max(1, h * 0.12));
  x.fillStyle = light; x.fillRect(left, top + h * 0.14, w, Math.max(1, h * 0.08));
  const step = h * 0.9;
  for (let px = left + step / 2; px < left + w; px += step) {
    x.fillStyle = dark; x.beginPath(); x.moveTo(px, top + h * 0.26); x.lineTo(px + h * 0.26, top + h * 0.52); x.lineTo(px, top + h * 0.78); x.lineTo(px - h * 0.26, top + h * 0.52); x.fill();
    x.fillStyle = light; x.beginPath(); x.arc(px, top + h * 0.52, h * 0.09, 0, 6.29); x.fill();
  }
}

/* ---------------- materials ---------------- */
/* a painted studio for metal to reflect, so gold shines */
let studio = null;
function reflections(){
  if (studio) return studio;
  studio = texture(256, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff3d8'); g.addColorStop(0.35, '#c9a878'); g.addColorStop(0.55, '#4a3020'); g.addColorStop(1, '#1a1210'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; for (const [px, py, pw, ph] of [[20, 18, 34, 26], [118, 8, 26, 18], [196, 30, 22, 30]]) x.fillRect(px, py, pw, ph);
  });
  studio.flipY = false; studio.mapping = THREE.EquirectangularReflectionMapping; return studio;
}
export const metal = (o = {}) => new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.75, roughness: 0.36, envMap: reflections(), envMapIntensity: 1.05, side: THREE.DoubleSide, ...o });
export const gold = (o = {}) => metal({ color: 0xe0aa3c, emissive: 0x2a1a04, ...o });
export const matte = (o = {}) => new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.04, roughness: 0.82, side: THREE.DoubleSide, ...o });

/* ---------------- putting things on the body ---------------- */
function restPose(root, body){
  root.updateMatrixWorld(true);
  const pos = body.geometry.attributes.position, v = V();
  return Array.from({ length: pos.count }, (_, i) => { v.fromBufferAttribute(pos, i); body.localToWorld(v); root.worldToLocal(v); return v.clone(); });
}
function skinned(body, geometry, material, name){
  const m = new THREE.SkinnedMesh(geometry, material); m.name = name; m.frustumCulled = false;
  m.position.copy(body.position); m.quaternion.copy(body.quaternion); m.scale.copy(body.scale);
  body.parent.add(m); m.bind(body.skeleton, body.bindMatrix); return m;
}

/* bones: which bones' skin to copy (RegExp). inflate: distance from the skin (number or p => number).
   wrap: how the painting is wrapped -
     { around: 'y', cz, top, bottom }          painting left-to-right goes round the body (front = middle)
     { around: 'x', cy, cz, from, to }         for arms: top of painting at |x| = from, round the arm */
export function layer(root, body, { name, bones, where = () => true, inflate = 0.02, wrap, material }){
  const g = body.geometry, dom = dominantBones(body), rest = restPose(root, body), idx = g.index.array;
  const pos = g.attributes.position, nor = g.attributes.normal, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const wanted = i => bones.test(dom[i]) && where(rest[i], dom[i]);
  const P = [], N = [], U = [], I = [], W = [];
  for (let t = 0; t < idx.length; t += 3) {
    const tri = [idx[t], idx[t + 1], idx[t + 2]]; if (!tri.every(wanted)) continue;
    const uv = tri.map(i => { const p = rest[i];
      if (wrap.around === 'y') return [Math.atan2(p.x, p.z - wrap.cz) / (2 * Math.PI) + 0.5, (wrap.top - p.y) / (wrap.top - wrap.bottom)];
      return [Math.atan2(p.z - wrap.cz, p.y - wrap.cy) / (2 * Math.PI) + 0.5, (Math.abs(p.x) - wrap.from) / (wrap.to - wrap.from)]; });
    const us = uv.map(a => a[0]); if (Math.max(...us) - Math.min(...us) > 0.5) uv.forEach(a => { if (a[0] < 0.5) a[0] += 1; });      // the seam at the back
    tri.forEach((i, k) => { const d = typeof inflate === 'function' ? inflate(rest[i]) : inflate;
      P.push(pos.getX(i) + nor.getX(i) * d, pos.getY(i) + nor.getY(i) * d, pos.getZ(i) + nor.getZ(i) * d);
      N.push(nor.getX(i), nor.getY(i), nor.getZ(i)); U.push(...uv[k]);
      I.push(si.getX(i), si.getY(i), si.getZ(i), si.getW(i)); W.push(sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)); });
  }
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ng.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); ng.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  ng.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(I, 4)); ng.setAttribute('skinWeight', new THREE.Float32BufferAttribute(W, 4));
  if (material.map) material.alphaTest = 0.5;
  return skinned(body, ng, material, name);
}

/* at(u, v) -> point; weights(u, v, point) -> [[boneName, weight], ...] (up to 4). closed = the left and right edges meet */
export function cloth(root, body, { name, cols = 48, rows = 24, closed = false, at, weights, material }){
  root.updateMatrixWorld(true);
  const toLocal = new THREE.Matrix4().multiplyMatrices(body.matrixWorld.clone().invert(), root.matrixWorld);
  const names = body.skeleton.bones.map(b => b.name), P = [], U = [], I = [], W = [], F = [];
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
    const u = c / cols, v = r / rows, p = at(u, v), list = weights(u, v, p).filter(([, w]) => w > 0).slice(0, 4), sum = list.reduce((s, [, w]) => s + w, 0);
    const q = p.clone().applyMatrix4(toLocal); P.push(q.x, q.y, q.z); U.push(u, v);
    for (let k = 0; k < 4; k++) { const e = list[k]; if (e && names.indexOf(e[0]) < 0) throw new Error('no bone ' + e[0]); I.push(e ? names.indexOf(e[0]) : 0); W.push(e ? e[1] / sum : 0); }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = r * (cols + 1) + c, b = a + cols + 1; F.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(I, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(W, 4));
  g.setIndex(F); g.computeVertexNormals();
  if (closed) { const n = g.attributes.normal; for (let r = 0; r <= rows; r++) { const a = r * (cols + 1), b = a + cols; const m = V().fromBufferAttribute(n, a).add(V().fromBufferAttribute(n, b)).normalize(); n.setXYZ(a, m.x, m.y, m.z); n.setXYZ(b, m.x, m.y, m.z); } }
  return skinned(body, g, material, name);
}

export function attach(root, boneName, object){
  const bone = root.getObjectByName(boneName); if (!bone) throw new Error('no bone ' + boneName);
  root.add(object); root.updateMatrixWorld(true); bone.attach(object); return object;
}
export const mesh = (geometry, material, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.frustumCulled = false; return m; };
/* a smooth rod along a list of points whose thickness follows radius(t) */
export function rod(points, radius, material, segments = 48, sides = 10){
  const curve = new THREE.CatmullRomCurve3(points), g = new THREE.TubeGeometry(curve, segments, 1, sides, false), p = g.attributes.position;
  for (let i = 0; i <= segments; i++) { const t = i / segments, c = curve.getPointAt(t), r = radius(t);
    for (let k = 0; k <= sides; k++) { const n = i * (sides + 1) + k, v = V().fromBufferAttribute(p, n).sub(c).multiplyScalar(r).add(c); p.setXYZ(n, v.x, v.y, v.z); } }
  g.computeVertexNormals(); return mesh(g, material);
}
