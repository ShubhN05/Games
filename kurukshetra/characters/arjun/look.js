/* ARJUN - how he looks. Design description and status: design.md
   Built from the picture in pictures/: gold engraved armour, red-orange sash, orange waist cloth over a cream dhoti,
   gold headband with a red jewel, top-knot and long wavy hair, quiver, gold bracers and armbands, brown pointed shoes. */
import * as THREE from 'three';
import { boundsOf, addCurlyHair } from '../shared/helpers.js';
import { V, mix, clamp01, table, random, texture, engrave, trim, metal, gold, matte, layer, cloth, attach, mesh, rod } from '../shared/wardrobe.js';

export const skinTint = 0xffe6d2;        // fair warm skin over the light skin texture

const C = { gold: '#c8922c', goldLight: '#ffe29a', goldDark: '#74500f', red: '#b92712', orange: '#e0671a', orangeDark: '#a8430a',
  cream: '#ecdcb4', creamDark: '#bfa878', leather: '#6a3b20', leatherDark: '#3c2010' };

/* ---------------- paintings ---------------- */
const goldSheet = (seed, w = 256, h = 256) => texture(w, h, x => {
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d9a63c'); g.addColorStop(0.5, '#b98224'); g.addColorStop(1, '#dcae48'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  engrave(x, 0, 0, w, h, { seed, count: 22, size: 24 });
});

/* armour of the chest: painting left to right goes round the body, the middle is the front */
const TOP = 1.57, BOTTOM = 1.03, CH = { w: 1024, h: 512 };
const px = deg => (deg / 360 + 0.5) * CH.w, py = y => (TOP - y) / (TOP - BOTTOM) * CH.h;
function curve(x, color, width, points){ x.strokeStyle = color; x.lineWidth = width; x.lineCap = 'round'; x.beginPath(); x.moveTo(...points[0]); x.quadraticCurveTo(...points[1], ...points[2]); x.stroke(); }
function ridge(x, points, width = 7){ curve(x, C.goldDark, width + 4, points.map(([a, b]) => [a, b + 3])); curve(x, C.goldLight, width * 0.55, points); }

const armourPaint = () => texture(CH.w, CH.h, x => {
  /* outline: neckline in front and behind, arm openings at the sides */
  x.beginPath(); x.moveTo(0, py(1.535));
  for (let d = -180; d <= 180; d += 3) {
    const side = Math.abs(Math.abs(d) - 90), neck = Math.max(0, 1 - Math.min(Math.abs(d), 180 - Math.abs(d)) / 34);
    const top = side < 34 ? mix(1.36, 1.535, side / 34) : 1.548 - 0.045 * neck * neck;
    x.lineTo(px(d), py(top));
  }
  x.lineTo(CH.w, py(1.058)); x.lineTo(0, py(1.058)); x.closePath();
  const g = x.createLinearGradient(0, 0, 0, CH.h); g.addColorStop(0, '#c4973f'); g.addColorStop(0.45, '#9c6f24'); g.addColorStop(0.7, '#855a1a'); g.addColorStop(1, '#a87c2c');
  x.fillStyle = g; x.fill(); x.save(); x.clip();
  engrave(x, 0, py(1.53), CH.w, py(1.40) - py(1.53), { seed: 3, count: 60, size: 20 });
  for (const s of [-1, 1]) {
    engrave(x, px(s * 38) - 70, py(1.43), 140, 80, { seed: 11 + s, count: 8, size: 30, width: 3 });
    ridge(x, [[px(0), py(1.37)], [px(s * 30), py(1.29)], [px(s * 62), py(1.40)]], 10);               // chest plates
    ridge(x, [[px(s * 4), py(1.46)], [px(s * 34), py(1.47)], [px(s * 55), py(1.51)]], 6);
    ridge(x, [[px(s * 66), py(1.28)], [px(s * 48), py(1.17)], [px(s * 52), py(1.07)]], 8);
  }
  for (let row = 0; row < 3; row++) for (const s of [-1, 1]) {                                         // stomach plates
    const cx = px(s * 13), cy = py(1.255 - row * 0.062), a = x.createRadialGradient(cx - 8, cy - 8, 3, cx, cy, 36); a.addColorStop(0, '#ffe7a8'); a.addColorStop(0.6, '#bd8826'); a.addColorStop(1, '#6e4a10');
    x.fillStyle = a; x.beginPath(); x.ellipse(cx, cy, 33, 25, 0, 0, 6.29); x.fill();
  }
  ridge(x, [[px(0), py(1.36)], [px(0), py(1.22)], [px(0), py(1.08)]], 5);
  trim(x, 0, py(1.088), CH.w, 28);
  x.restore();
  x.strokeStyle = C.goldLight; x.lineWidth = 10; x.beginPath();                                        // raised collar edge
  for (let d = -180; d <= 180; d += 3) { const side = Math.abs(Math.abs(d) - 90), neck = Math.max(0, 1 - Math.min(Math.abs(d), 180 - Math.abs(d)) / 34); const top = side < 34 ? mix(1.36, 1.535, side / 34) : 1.548 - 0.045 * neck * neck; d === -180 ? x.moveTo(px(d), py(top) + 5) : x.lineTo(px(d), py(top) + 5); }
  x.stroke();
});

/* the red-orange sash (left shoulder to right hip) and the leather quiver strap (right shoulder to left side) */
function band(x, from, to, width, fill, edge){
  for (const shift of [-CH.w, 0, CH.w]) {
    const a = [px(from[0]) + shift, py(from[1])], b = [px(to[0]) + shift, py(to[1])];
    x.lineCap = 'butt';
    x.strokeStyle = edge; x.lineWidth = width; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke();
    x.strokeStyle = fill; x.lineWidth = width * 0.76; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke();
  }
}
const sashPaint = () => texture(CH.w, CH.h, x => {
  const folds = x.createLinearGradient(0, 0, 90, 90); for (let i = 0; i <= 8; i++) folds.addColorStop(i / 8, i % 2 ? C.red : '#e4531a');
  const fill = x.createPattern(tile(90, 90, t => { t.fillStyle = folds; t.fillRect(0, 0, 90, 90); }), 'repeat');
  band(x, [30, 1.575], [-80, 1.06], 140, fill, C.gold);                    // front
  band(x, [150, 1.575], [260, 1.06], 140, fill, C.gold);                   // back
  band(x, [-48, 1.57], [82, 1.13], 34, C.leather, C.leatherDark);
  band(x, [228, 1.57], [98, 1.13], 34, C.leather, C.leatherDark);
});
function tile(w, h, paint){ const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d')); return c; }

/* cloth with soft folds and a gold border along the bottom edge */
const clothPaint = (base, shade, { folds = 14, border = 0.07, topBorder = 0, seed = 2, w = 512, h = 512 } = {}) => texture(w, h, x => {
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  const r = random(seed);
  for (let i = 0; i < folds; i++) {
    const cx = (i + r() * 0.6) / folds * w, wide = w / folds * (0.5 + r() * 0.5), g = x.createLinearGradient(cx - wide, 0, cx + wide, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, shade); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g;
    x.save(); x.translate(cx, 0); x.transform(1, 0, (r() - 0.5) * 0.5, 1, 0, 0); x.translate(-cx, 0); x.fillRect(cx - wide, 0, wide * 2, h); x.restore();
  }
  if (border) { trim(x, 0, h * (1 - border), w, h * border); x.fillStyle = C.goldLight; x.fillRect(0, h * (1 - border) - h * 0.018, w, h * 0.006); }
  if (topBorder) trim(x, 0, 0, w, h * topBorder);
});

const armPaint = (seed, jewel) => texture(512, 256, (x, w, h) => {
  x.fillStyle = '#bd8826'; x.fillRect(0, 8, w, h - 16);
  engrave(x, 0, 30, w, h - 60, { seed, count: 40, size: 20 });
  trim(x, 0, 8, w, 34); trim(x, 0, h - 42, w, 34);
  if (jewel) for (const u of [0.5, 0.0, 1.0]) { x.fillStyle = C.goldLight; x.beginPath(); x.ellipse(u * w, h / 2, 34, 52, 0, 0, 6.29); x.fill(); x.fillStyle = '#c4122a'; x.beginPath(); x.ellipse(u * w, h / 2, 22, 36, 0, 0, 6.29); x.fill(); x.fillStyle = '#ff7a8a'; x.beginPath(); x.arc(u * w - 6, h / 2 - 12, 7, 0, 6.29); x.fill(); }
});

const shoePaint = () => texture(256, 128, (x, w, h) => { x.fillStyle = '#4a2210'; x.fillRect(0, 0, w, h); engrave(x, 0, 30, w, h, { seed: 8, count: 14, size: 12, light: '#7a4422', dark: '#26100a' }); trim(x, 0, 0, w, 34); x.fillStyle = C.gold; x.fillRect(w / 2 - 3, 20, 6, h); });

/* ---------------- dressing ---------------- */
export function dress(root, body){
  root.updateMatrixWorld(true);
  armour(root, body);
  armsAndShoulders(root, body);
  lowerBody(root, body);
  shoes(root, body);
  head(root, body);
  quiver(root);
  root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.name === 'MI_Hair_1') m.color = new THREE.Color(0x1a0f0a); }); });
  const ring = mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 28), gold(), 0, 1.822, -0.045); ring.rotation.x = Math.PI / 2 - 0.2; attach(root, 'Head', ring);   // gold ring round the top-knot
}

function armour(root, body){
  const torso = /^(spine_0[123]|clavicle_[lr]|neck_01|upperarm_[lr])$/, onTorso = p => Math.abs(p.x) < 0.235 && p.y > 1.01 && p.y < 1.6;
  const wrap = { around: 'y', cz: -0.02, top: TOP, bottom: BOTTOM };
  layer(root, body, { name: 'ArjunArmour', bones: torso, where: onTorso, inflate: 0.022, wrap, material: metal({ map: armourPaint(), metalness: 0.5, roughness: 0.42, envMapIntensity: 0.7 }) });
  layer(root, body, { name: 'ArjunSash', bones: torso, where: onTorso, inflate: 0.036, wrap, material: matte({ map: sashPaint(), roughness: 0.7 }) });
  /* collar ring and chest jewel */
  const ring = mesh(new THREE.TorusGeometry(0.083, 0.009, 8, 40), gold(), 0, 1.545, -0.025); ring.rotation.x = Math.PI / 2 + 0.28; ring.scale.set(1, 1.05, 1); attach(root, 'spine_03', ring);
}

function armsAndShoulders(root, body){
  const wrap = (from, to) => ({ around: 'x', cy: 1.448, cz: -0.082, from, to });
  layer(root, body, { name: 'ArjunArmBands', bones: /^upperarm_/, where: p => Math.abs(p.x) > 0.27 && Math.abs(p.x) < 0.40, inflate: 0.014, wrap: wrap(0.305, 0.365), material: metal({ map: armPaint(21, true) }) });
  layer(root, body, { name: 'ArjunBracers', bones: /^(lowerarm_|hand_)/, where: p => Math.abs(p.x) > 0.43 && Math.abs(p.x) < 0.73, inflate: p => table([[0.47, 0.027], [0.58, 0.018], [0.70, 0.012]], Math.abs(p.x)), wrap: wrap(0.485, 0.69), material: metal({ map: armPaint(33, false) }) });
  const plate = goldSheet(41), rim = gold({ color: 0xd29a34 });
  /* a domed shoulder plate with a raised edge, opening downwards */
  const shell = (rx, ry, rz, open) => { const g = new THREE.Group();
    const dome = mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, open), metal({ map: plate, color: 0xd8c9a8, metalness: 0.6, envMapIntensity: 0.8 })); dome.scale.set(rx, ry, rz); g.add(dome);
    const y = Math.cos(open), s = Math.sin(open), edge = rod(Array.from({ length: 33 }, (_, i) => { const a = i / 32 * Math.PI * 2; return V(Math.cos(a) * s * rx, y * ry, Math.sin(a) * s * rz); }), () => 0.008, rim, 64, 8); g.add(edge); return g; };
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const top = shell(0.105, 0.075, 0.108, 1.5); top.position.set(s * 0.208, 1.505, -0.05); top.rotation.z = -s * 0.28; attach(root, 'clavicle_' + side, top);
    const mid = shell(0.085, 0.08, 0.092, 1.35); mid.position.set(s * 0.272, 1.462, -0.068); mid.rotation.z = -s * 0.72; attach(root, 'upperarm_' + side, mid);
    const curl = mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 24, Math.PI * 1.6), rim, s * 0.2, 1.555, 0.045); curl.rotation.set(-0.5, 0, s * 0.8); attach(root, 'clavicle_' + side, curl);
  }
}

function lowerBody(root, body){
  const TAU = Math.PI * 2, thigh = s => s > 0 ? 'thigh_l' : 'thigh_r', calf = s => s > 0 ? 'calf_l' : 'calf_r';
  /* cream dhoti: one soft, full tube round each leg */
  const dhoti = matte({ map: clothPaint(C.cream, 'rgba(150,120,70,0.42)', { folds: 9, border: 0.065, seed: 5 }) });
  for (const s of [1, -1]) cloth(root, body, { name: 'ArjunDhoti' + (s > 0 ? 'L' : 'R'), cols: 56, rows: 44, closed: true, material: dhoti,
    at: (u, v) => { const y = mix(1.0, 0.125, v), a = u * TAU;
      const rx = table([[1.0, 0.08], [0.9, 0.096], [0.74, 0.11], [0.6, 0.108], [0.45, 0.108], [0.3, 0.096], [0.2, 0.072], [0.125, 0.06]], y);
      const rz = table([[1.0, 0.11], [0.9, 0.116], [0.74, 0.12], [0.6, 0.115], [0.45, 0.122], [0.3, 0.108], [0.2, 0.08], [0.125, 0.066]], y);
      const fold = 1 + (0.085 * Math.sin(a * 6 + y * 17 + s) + 0.05 * Math.sin(a * 3 - y * 11)) * clamp01((y - 0.14) * 5) * clamp01((1.0 - y) * 4);
      const cx = s * table([[1.0, 0.07], [0.85, 0.108], [0.5, 0.118], [0.125, 0.115]], y), cz = table([[1.0, -0.03], [0.55, -0.035], [0.35, -0.062], [0.125, -0.085]], y);
      return V(cx + Math.sin(a) * rx * fold, y, cz + Math.cos(a) * rz * fold); },
    weights: (u, v, p) => { if (p.y > 0.88) { const t = clamp01((p.y - 0.88) / 0.11); return [['pelvis', t], [thigh(s), 1 - t]]; } const k = clamp01((0.62 - p.y) / 0.16); return [[thigh(s), 1 - k], [calf(s), k]]; } });
  /* weights for cloth hanging from the hips: pelvis at the top, partly following the thighs lower down */
  const hanging = (v, p, hold = 0.75) => { const t = clamp01(v * 1.25) * hold, left = clamp01(0.5 + p.x * 4); return [['pelvis', 1 - t], ['thigh_l', t * left], ['thigh_r', t * (1 - left)]]; };
  /* orange cloth round the hips, its lower edge slanting */
  cloth(root, body, { name: 'ArjunHipCloth', cols: 72, rows: 20, closed: true, material: matte({ map: clothPaint(C.orange, 'rgba(120,40,0,0.5)', { folds: 18, border: 0.13, seed: 9 }) }),
    at: (u, v) => { const a = (u - 0.5) * TAU, low = 0.76 - 0.07 * Math.sin(a) - 0.035 * Math.cos(a * 2), y = mix(1.07, low, v);
      const grow = 1 + 0.075 * Math.sin(a * 9 + v * 5) * v;
      const wide = table([[0, 0.17], [0.12, 0.2], [0.3, 0.236], [0.6, 0.256], [1, 0.27]], v), deep = table([[0, 0.145], [0.2, 0.175], [0.5, 0.188], [1, 0.2]], v);
      return V(Math.sin(a) * wide * grow, y, -0.032 + Math.cos(a) * deep * grow); },
    weights: (u, v, p) => hanging(v, p, 0.95) });
  for (const [name, side] of [['ArjunDrapeFront', 1], ['ArjunDrapeBack', -1]]) cloth(root, body, { name, cols: 28, rows: 34, material: matte({ map: clothPaint(C.cream, 'rgba(150,120,70,0.45)', { folds: 6, border: 0.06, seed: 14 + side, w: 256 }), emissive: 0x352c1c }),
    at: (u, v) => { const y = mix(0.98, 0.17 - 0.03 * Math.sin(u * Math.PI), v), half = table([[0, 0.12], [0.5, 0.14], [1, 0.145]], v), x = (u - 0.5) * 2 * half;
      const depth = table([[0, 0.085], [0.4, 0.062], [0.75, 0.03], [1, 0.0]], v) + 0.02 * Math.sin(u * 19 + v * 7) * v + 0.035 * Math.sin(u * Math.PI);
      return V(x, y, mix(-0.035, -0.082, clamp01((v - 0.4) * 1.7)) + side * depth); },
    weights: (u, v, p) => { const left = clamp01(0.5 + p.x * 4.5), low = clamp01((0.6 - p.y) / 0.16), hip = clamp01((p.y - 0.85) / 0.13);
      return [['pelvis', hip], ['thigh_l', (1 - hip) * left * (1 - low)], ['thigh_r', (1 - hip) * (1 - left) * (1 - low)], p.x > 0 ? ['calf_l', (1 - hip) * low] : ['calf_r', (1 - hip) * low]]; } });
  /* waist band: cream under, orange over, with a knot in front */
  const bandAt = (y0, y1, r) => (u, v) => { const a = (u - 0.5) * TAU, bulge = 1 + 0.05 * Math.sin(v * Math.PI); return V(Math.sin(a) * r * bulge, mix(y0, y1, v) + 0.006 * Math.sin(a * 3), -0.03 + Math.cos(a) * r * 0.85 * bulge); };
  cloth(root, body, { name: 'ArjunBandCream', cols: 64, rows: 6, closed: true, at: bandAt(1.108, 1.062, 0.176), weights: () => [['pelvis', 0.5], ['spine_01', 0.5]], material: matte({ map: clothPaint(C.cream, 'rgba(150,120,70,0.5)', { folds: 24, border: 0, seed: 3, w: 512, h: 64 }) }) });
  cloth(root, body, { name: 'ArjunBandOrange', cols: 64, rows: 6, closed: true, at: bandAt(1.078, 1.015, 0.188), weights: () => [['pelvis', 1]], material: matte({ map: clothPaint(C.orange, 'rgba(110,35,0,0.55)', { folds: 20, border: 0, seed: 6, w: 512, h: 64 }) }) });
  const knotMat = matte({ color: 0xe46a17 });
  for (const [x, y, rx, ry, rot] of [[0, 1.045, 0.05, 0.038, 0], [-0.028, 1.058, 0.045, 0.018, 0.6], [0.03, 1.038, 0.042, 0.017, -0.5]]) { const k = mesh(new THREE.SphereGeometry(1, 18, 12), knotMat, x, y, 0.142); k.scale.set(rx, ry, 0.032); k.rotation.z = rot; attach(root, 'pelvis', k); }
  /* two tails hanging from the knot */
  const tail = (name, dx, length, width, depth, color) => cloth(root, body, { name, cols: 12, rows: 30, material: matte({ map: clothPaint(color, 'rgba(100,30,0,0.55)', { folds: 5, border: 0.09, seed: length * 100 | 0, w: 128 }) }),
    at: (u, v) => { const point = clamp01((v - 0.82) / 0.18) * 0.09 * (1 - u);      // slanted lower end
      return V(dx * (0.4 + v) + (u - 0.5) * mix(width * 0.45, width, v), 1.04 - v * length - point, depth + 0.045 * Math.sin(v * Math.PI * 0.8) + 0.012 * Math.sin(u * 14 + v * 6) * v); },
    weights: (u, v, p) => hanging(v, p, 0.85) });
  tail('ArjunTailFront', 0.012, 0.50, 0.13, 0.158, C.orange);
  tail('ArjunTailSide', -0.045, 0.34, 0.10, 0.168, '#d4560f');
}

function shoes(root, body){
  layer(root, body, { name: 'ArjunShoes', bones: /^(foot_|ball_|calf_)/, where: p => p.y < 0.088, inflate: 0.013, wrap: { around: 'y', cz: -0.03, top: 0.088, bottom: -0.012 }, material: matte({ map: shoePaint(), roughness: 0.55 }) });
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const x = s * 0.128, curl = rod([V(x, 0.018, 0.105), V(x, 0.014, 0.15), V(x, 0.032, 0.172), V(x, 0.055, 0.166), V(x, 0.058, 0.148)], t => mix(0.026, 0.004, t), matte({ color: 0x4a2210, roughness: 0.55 }), 32, 10);
    attach(root, 'ball_' + side, curl);
    const tip = mesh(new THREE.SphereGeometry(0.007, 10, 8), gold(), x, 0.058, 0.147); attach(root, 'ball_' + side, tip);
  }
}

function head(root, body){
  addCurlyHair(root, body, { strands: 260, toShoulder: true, seed: 5, curl: 0.11, bun: true, color: 0x1e130d, topCap: 0.72, tube: 0.105, faceGap: 1.5 });
  const hb = boundsOf(root, body, ['Head']), g = new THREE.Group(), au = gold(), bright = gold({ color: 0xf0c056 });
  const R = hb.size.x / 2, cz = hb.ctr.z - 0.004, depth = hb.size.z / 2 * 0.93, bandY = hb.box.max.y - hb.size.y * 0.285;
  const onBand = (a, lift = 0) => V(Math.sin(a) * (R * 1.06 + lift), bandY - 0.014 * (1 - Math.cos(a)) / 2, cz + Math.cos(a) * (depth * 1.05 + lift));
  const ring = h => rod(Array.from({ length: 49 }, (_, i) => onBand(i / 48 * Math.PI * 2).add(V(0, h, 0))), () => 0.0055, au, 96, 8);
  g.add(ring(0.008), ring(-0.012));
  for (let i = -9; i <= 9; i++) { const bead = mesh(new THREE.SphereGeometry(0.0065, 8, 6), bright); bead.position.copy(onBand(i * 0.17, 0.004)).add(V(0, -0.002, 0)); g.add(bead); }
  /* the front peak with the red jewel */
  const shape = new THREE.Shape(); shape.moveTo(-0.045, -0.016); shape.quadraticCurveTo(-0.032, 0.012, -0.02, 0.016); shape.quadraticCurveTo(-0.008, 0.026, 0, 0.056); shape.quadraticCurveTo(0.008, 0.026, 0.02, 0.016); shape.quadraticCurveTo(0.032, 0.012, 0.045, -0.016); shape.closePath();
  const front = cz + depth * 1.05 + 0.002, peak = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1 }), bright, 0, bandY, front); peak.rotation.x = -0.16; g.add(peak);
  const jewel = mesh(new THREE.SphereGeometry(0.0125, 16, 12), metal({ color: 0xc2102a, emissive: 0x50000c, metalness: 0.3, roughness: 0.15 }), 0, bandY + 0.011, front + 0.012); jewel.scale.set(0.85, 1.35, 0.55); g.add(jewel);
  /* tilak and earrings */
  const white = matte({ color: 0xf4ead4, emissive: 0x403828 });
  for (const s of [-1, 1]) g.add(rod([V(s * 0.0085, bandY - 0.018, front - 0.006), V(s * 0.007, bandY - 0.04, front - 0.004), V(0, bandY - 0.052, front - 0.004)], () => 0.0016, white, 16, 6));
  g.add(rod([V(0, bandY - 0.022, front - 0.005), V(0, bandY - 0.046, front - 0.003)], () => 0.0018, matte({ color: 0xc4261a, emissive: 0x300400 }), 8, 6));
  for (const s of [-1, 1]) { const x = s * (R + 0.004), y = bandY - 0.078;
    g.add(mesh(new THREE.SphereGeometry(0.0075, 10, 8), bright, x, y, hb.ctr.z + 0.004), mesh(new THREE.SphereGeometry(0.015, 14, 10), bright, x * 1.02, y - 0.032, hb.ctr.z + 0.004));
    g.add(rod([V(x, y, hb.ctr.z + 0.004), V(x * 1.02, y - 0.022, hb.ctr.z + 0.004)], () => 0.002, au, 4, 6)); }
  attach(root, 'Head', g);
}

function quiver(root){
  const q = new THREE.Group(), leather = matte({ color: 0x6a3a1e, roughness: 0.65 }), au = gold(), r = random(12);
  q.add(mesh(new THREE.CylinderGeometry(0.075, 0.052, 0.52, 24, 1, true), leather));
  q.add(mesh(new THREE.CircleGeometry(0.052, 24), leather, 0, -0.26, 0).rotateX(Math.PI / 2));
  for (const [y, rad, t] of [[0.26, 0.077, 0.012], [0.215, 0.073, 0.006], [-0.05, 0.063, 0.007], [-0.25, 0.054, 0.01]]) { const ring = mesh(new THREE.TorusGeometry(rad, t, 8, 32), au, 0, y, 0); ring.rotation.x = Math.PI / 2; q.add(ring); }
  const wood = matte({ color: 0x9a6c38 }), feather = matte({ color: 0xcdbfa6 }), vane = new THREE.Shape();
  vane.moveTo(0, -0.07); vane.quadraticCurveTo(0.03, -0.03, 0.02, 0.05); vane.lineTo(0, 0.075); vane.lineTo(-0.02, 0.05); vane.quadraticCurveTo(-0.03, -0.03, 0, -0.07);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2, arrow = new THREE.Group(), lean = 0.1 + r() * 0.08;
    arrow.add(mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.36, 6), wood, 0, 0.18, 0));
    for (let k = 0; k < 3; k++) { const f = mesh(new THREE.ShapeGeometry(vane), feather, 0, 0.30 + r() * 0.02, 0); f.rotation.y = k * Math.PI / 3 + a; arrow.add(f); }
    arrow.add(mesh(new THREE.SphereGeometry(0.0075, 8, 6), au, 0, 0.39, 0));
    arrow.position.set(Math.cos(a) * 0.035, 0.18, Math.sin(a) * 0.035); arrow.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean); q.add(arrow);
  }
  q.position.set(-0.075, 1.34, -0.235); q.rotation.set(-0.06, 0, 0.52); attach(root, 'spine_03', q);
}
