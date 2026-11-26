/* DRONA - how he looks. Design description and status: design.md
   Built from the picture in pictures/: the old teacher - grey hair in a top-knot tied with cord, grey pointed beard with
   a gold ring, forehead mark, bronze armour with a leather strap and white sacred thread, gold-edged shoulder plates over
   orange sleeves, leather bracers with gold plates, knotted ochre waist cloth with long tails, orange hip cloth, cream and
   saffron dhoti, brown shoes, leather quiver. Uses the shared wardrobe but changes nothing in it. */
import * as THREE from 'three';
import { boundsOf } from '../shared/helpers.js';
import { addHair } from './hair.js';
import { V, mix, clamp01, table, random, texture, engrave, trim, metal, gold, matte, layer, cloth, attach, mesh, rod } from '../shared/wardrobe.js';

export const skinTint = 0xfffaf6;        // weathered tan comes from the skin texture itself

const C = { orange: '#df6a0c', orangeShade: 'rgba(110,34,0,0.55)', ochre: '#a8661c', ochreShade: 'rgba(60,28,0,0.6)', cream: '#e7bd72', creamShade: 'rgba(150,72,8,0.55)',
  leather: '#6a3d22', leatherDark: '#2e1808', gold: '#c8922c', goldLight: '#ffe29a', goldDark: '#6e4a10' };
const TAU = Math.PI * 2;
const band = { base: C.gold, light: C.goldLight, dark: C.goldDark };

/* ---------------- paintings ---------------- */
const folds = (x, w, h, base, shade, count, seed) => {
  x.fillStyle = base; x.fillRect(0, 0, w, h); const r = random(seed);
  for (let i = 0; i < count; i++) { const cx = (i + r() * 0.7) / count * w, wide = w / count * (0.45 + r() * 0.55), g = x.createLinearGradient(cx - wide, 0, cx + wide, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, shade); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.save(); x.translate(cx, 0); x.transform(1, 0, (r() - 0.5) * 0.6, 1, 0, 0); x.translate(-cx, 0); x.fillRect(cx - wide, 0, wide * 2, h); x.restore(); }
};
const clothPaint = (base, shade, { count = 12, seed = 3, border = 0, w = 512, h = 512 } = {}) => texture(w, h, x => { folds(x, w, h, base, shade, count, seed); if (border) trim(x, 0, h * (1 - border), w, h * border, band); });
/* rough, scratched leather or bronze */
const worn = (x, w, h, seed, count) => { const r = random(seed); for (let i = 0; i < count; i++) { x.fillStyle = r() < 0.5 ? 'rgba(20,8,0,0.22)' : 'rgba(255,214,170,0.14)'; x.fillRect(r() * w, r() * h, 2 + r() * 10, 1 + r() * 2); } };

/* chest: painting left to right goes round the body, the middle is the front */
const TOP = 1.575, BOTTOM = 1.025, CH = { w: 1024, h: 512 };
const px = deg => (deg / 360 + 0.5) * CH.w, py = y => (TOP - y) / (TOP - BOTTOM) * CH.h;
const outline = (x, drop = 0) => {
  for (let d = -180; d <= 180; d += 3) { const side = Math.abs(Math.abs(d) - 90), neck = Math.max(0, 1 - Math.min(Math.abs(d), 180 - Math.abs(d)) / 36), top = side < 34 ? mix(1.36, 1.535, side / 34) : 1.548 - 0.04 * neck * neck; d === -180 ? x.moveTo(px(d), py(top) + drop) : x.lineTo(px(d), py(top) + drop); }
};
const edge = (x, points, wide = 8) => { for (const [color, w, dy] of [[C.goldDark, wide + 5, 3], [C.gold, wide, 0], [C.goldLight, wide * 0.3, -1]]) { x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(points[0][0], points[0][1] + dy); x.quadraticCurveTo(points[1][0], points[1][1] + dy, points[2][0], points[2][1] + dy); x.stroke(); } };
const armourPaint = () => texture(CH.w, CH.h, x => {
  x.beginPath(); outline(x); x.lineTo(CH.w, py(1.032)); x.lineTo(0, py(1.032)); x.closePath();
  const g = x.createLinearGradient(0, 0, 0, CH.h); g.addColorStop(0, '#96684a'); g.addColorStop(0.45, '#6e4630'); g.addColorStop(0.7, '#553222'); g.addColorStop(1, '#6a442e'); x.fillStyle = g; x.fill(); x.save(); x.clip();
  worn(x, CH.w, CH.h, 501, 700);
  for (const s of [-1, 1]) {
    engrave(x, px(s * 30) - 70, py(1.50), 140, 90, { seed: 511 + s, count: 9, size: 34, light: '#c99c74', dark: '#2c170c', width: 2.6 });
    engrave(x, px(s * 22) - 55, py(1.23), 110, 100, { seed: 521 + s, count: 7, size: 30, light: '#c99c74', dark: '#2c170c', width: 2.6 });
    edge(x, [[px(0), py(1.35)], [px(s * 34), py(1.28)], [px(s * 70), py(1.39)]]);
    edge(x, [[px(0), py(1.275)], [px(s * 36), py(1.22)], [px(s * 76), py(1.27)]], 6);
    edge(x, [[px(s * 58), py(1.25)], [px(s * 42), py(1.16)], [px(s * 48), py(1.07)]], 5);
    edge(x, [[px(s * 112), py(1.30)], [px(s * 140), py(1.25)], [px(s * 174), py(1.31)]], 6);
  }
  x.restore(); x.strokeStyle = C.gold; x.lineWidth = 12; x.beginPath(); outline(x, 6); x.stroke(); x.strokeStyle = C.goldLight; x.lineWidth = 3; x.beginPath(); outline(x, 4); x.stroke();
});
/* the leather strap (right shoulder to left side) and the white sacred thread (left shoulder to right hip) */
function stripe(x, from, to, wide, paints){
  for (const shift of [-CH.w, 0, CH.w]) for (const [color, part] of paints) { x.strokeStyle = color; x.lineWidth = wide * part; x.lineCap = 'butt'; x.beginPath(); x.moveTo(px(from[0]) + shift, py(from[1])); x.lineTo(px(to[0]) + shift, py(to[1])); x.stroke(); }
}
const strapPaint = () => texture(CH.w, CH.h, x => {
  const leather = [[C.leatherDark, 1], ['#7a4a2a', 0.76], ['#9a6a44', 0.1]];
  stripe(x, [-50, 1.57], [86, 1.12], 62, leather); stripe(x, [230, 1.57], [94, 1.12], 62, leather);
  const thread = [['#8a8578', 1], ['#f2eee0', 0.66]];
  stripe(x, [44, 1.575], [-72, 1.065], 14, thread); stripe(x, [136, 1.575], [252, 1.065], 14, thread);
});
const sleevePaint = () => texture(512, 256, (x, w, h) => { x.fillStyle = C.orange; x.fillRect(0, 6, w, h - 12); const r = random(531); for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(110,34,0,0.28)'; x.fillRect(0, 20 + r() * (h - 90), w, 3 + r() * 6); } trim(x, 0, h - 58, w, 52, band); });
const bracerPaint = () => texture(512, 256, (x, w, h) => {
  x.fillStyle = C.leather; x.fillRect(0, 8, w, h - 16); worn(x, w, h, 541, 300);
  /* the gold plate on the outer side (left and right edge of the painting join there) */
  for (const u of [w / 2]) { x.fillStyle = C.gold; x.beginPath(); x.ellipse(u, h / 2, 118, h * 0.46, 0, 0, TAU); x.fill(); x.save(); x.clip(); engrave(x, u - 120, 20, 240, h - 40, { seed: 551, count: 7, size: 48, light: C.goldLight, dark: C.goldDark, width: 4 }); x.restore(); x.strokeStyle = C.goldLight; x.lineWidth = 7; x.beginPath(); x.ellipse(u, h / 2, 112, h * 0.43, 0, 0, TAU); x.stroke(); }
  x.fillStyle = C.leatherDark; for (const y of [58, h - 80]) { x.fillRect(0, y, 130, 22); x.fillRect(w - 130, y, 130, 22); }
  for (const y of [8, h - 30]) { x.fillStyle = C.leatherDark; x.fillRect(0, y, w, 22); x.fillStyle = C.gold; x.fillRect(0, y + 8, w, 5); }
});
/* shoe: across the painting goes round the foot (a quarter of the way = top), down the painting goes heel to toe */
const shoePaint = () => texture(256, 256, (x, w, h) => { x.fillStyle = '#5c2e14'; x.fillRect(0, 0, w, h); worn(x, w, h, 561, 220);
  x.fillStyle = '#2a1408'; x.fillRect(w * 0.6, 0, w * 0.3, h);
  x.fillStyle = C.gold; for (const u of [0.58, 0.92]) x.fillRect(w * u - 3, 0, 6, h); x.fillRect(w * 0.25 - 3, h * 0.42, 6, h * 0.5);
  trim(x, 0, h * 0.3, w, h * 0.1, band);
  for (const u of [0.09, 0.41]) engrave(x, w * u - 20, h * 0.5, 40, h * 0.3, { seed: 571, count: 4, size: 14, light: C.goldLight, dark: C.goldDark, width: 2.5 }); });

/* ---------------- dressing ---------------- */
export function dress(root, body){
  root.updateMatrixWorld(true);
  lowerBody(root, body);
  armour(root, body);
  armsAndShoulders(root, body);
  waist(root, body);
  shoes(root, body);
  head(root, body);
  quiver(root);
  root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.name === 'MI_Hair_1') m.color = new THREE.Color(0xb9bcc0); }); });
}

const thigh = s => s > 0 ? 'thigh_l' : 'thigh_r', calf = s => s > 0 ? 'calf_l' : 'calf_r';
const hanging = (v, p, hold = 0.8) => { const t = clamp01(v * 1.25) * hold, left = clamp01(0.5 + p.x * 4.5); return [['pelvis', 1 - t], ['thigh_l', t * left], ['thigh_r', t * (1 - left)]]; };

function lowerBody(root, body){
  layer(root, body, { name: 'DronaUnderCloth', bones: /^(pelvis|spine_01|spine_02|thigh_[lr]|calf_[lr])$/, where: p => p.y > 0.13 && p.y < 1.16, inflate: p => p.y > 0.96 ? 0.011 : 0.004,
    wrap: { around: 'y', cz: -0.04, top: 1.16, bottom: 0.13 }, material: matte({ color: 0xcf9448, emissive: 0x201004 }) });
  const dhoti = matte({ map: clothPaint(C.cream, C.creamShade, { count: 9, seed: 601, border: 0.075 }), roughness: 0.66, emissive: 0x150a00 });
  for (const s of [1, -1]) cloth(root, body, { name: 'DronaDhoti' + (s > 0 ? 'L' : 'R'), cols: 56, rows: 44, closed: true, material: dhoti,
    at: (u, v) => { const y = mix(1.0, 0.135, v), a = u * TAU;
      const rx = table([[1.0, 0.082], [0.9, 0.1], [0.74, 0.12], [0.55, 0.12], [0.42, 0.112], [0.3, 0.095], [0.2, 0.072], [0.135, 0.06]], y);
      const rz = table([[1.0, 0.113], [0.9, 0.122], [0.74, 0.132], [0.55, 0.132], [0.42, 0.138], [0.3, 0.11], [0.2, 0.08], [0.135, 0.067]], y);
      const fold = 1 + (0.085 * Math.sin(a * 6 + y * 18 + s) + 0.05 * Math.sin(a * 3 - y * 12)) * clamp01((y - 0.16) * 5) * clamp01((1.0 - y) * 4);
      const cx = s * table([[1.0, 0.07], [0.85, 0.108], [0.5, 0.12], [0.135, 0.115]], y), cz = table([[1.0, -0.03], [0.55, -0.035], [0.35, -0.062], [0.135, -0.084]], y);
      return V(cx + Math.sin(a) * rx * fold, y, cz + Math.cos(a) * rz * fold); },
    weights: (u, v, p) => { if (p.y > 0.88) { const t = clamp01((p.y - 0.88) / 0.11); return [['pelvis', t], [thigh(s), 1 - t]]; } const k = clamp01((0.62 - p.y) / 0.16); return [[thigh(s), 1 - k], [calf(s), k]]; } });
  const joined = matte({ map: clothPaint(C.cream, C.creamShade, { count: 6, seed: 611, border: 0.065, w: 256 }), emissive: 0x2a1804 });
  for (const [name, side] of [['DronaJoinFront', 1], ['DronaJoinBack', -1]]) cloth(root, body, { name, cols: 28, rows: 34, material: joined,
    at: (u, v) => { const y = mix(0.98, 0.2 - 0.04 * Math.sin(u * Math.PI), v), half = table([[0, 0.12], [0.5, 0.135], [1, 0.135]], v), x = (u - 0.5) * 2 * half;
      const depth = table([[0, 0.085], [0.4, 0.06], [0.75, 0.028], [1, 0.0]], v) + 0.022 * Math.sin(u * 19 + v * 7) * v + 0.035 * Math.sin(u * Math.PI);
      return V(x, y, mix(-0.035, -0.08, clamp01((v - 0.4) * 1.7)) + side * depth); },
    weights: (u, v, p) => { const left = clamp01(0.5 + p.x * 4.5), low = clamp01((0.6 - p.y) / 0.16), hip = clamp01((p.y - 0.85) / 0.13);
      return [['pelvis', hip], ['thigh_l', (1 - hip) * left * (1 - low)], ['thigh_r', (1 - hip) * (1 - left) * (1 - low)], p.x > 0 ? ['calf_l', (1 - hip) * low] : ['calf_r', (1 - hip) * low]]; } });
  /* orange cloth round the hips, open in front, its lower edge slanting */
  cloth(root, body, { name: 'DronaHipCloth', cols: 64, rows: 20, material: matte({ map: clothPaint(C.orange, C.orangeShade, { count: 18, seed: 621, border: 0.14 }), emissive: 0x1e0a00 }),
    at: (u, v) => { const a = mix(14, 346, u) * Math.PI / 180, low = 0.72 - 0.09 * Math.sin(a) - 0.02 * Math.cos(a * 2), y = mix(1.05, low, v);
      const wide = table([[0, 0.178], [0.15, 0.214], [0.35, 0.24], [0.65, 0.256], [1, 0.27]], v), deep = table([[0, 0.15], [0.2, 0.178], [0.5, 0.19], [1, 0.202]], v), grow = 1 + 0.065 * Math.sin(a * 10 + v * 5) * v;
      return V(Math.sin(a) * wide * grow, y, -0.032 + Math.cos(a) * deep * grow); },
    weights: (u, v, p) => hanging(v, p, 0.95) });
}

function armour(root, body){
  const torso = /^(spine_0[123]|clavicle_[lr]|neck_01|upperarm_[lr])$/, onTorso = p => Math.abs(p.x) < 0.235 && p.y > 1.01 && p.y < 1.6;
  const wrap = { around: 'y', cz: -0.02, top: TOP, bottom: BOTTOM };
  layer(root, body, { name: 'DronaArmour', bones: torso, where: onTorso, inflate: 0.023, wrap, material: metal({ map: armourPaint(), metalness: 0.5, roughness: 0.44, envMapIntensity: 0.75 }) });
  layer(root, body, { name: 'DronaStrap', bones: torso, where: onTorso, inflate: 0.037, wrap, material: matte({ map: strapPaint(), roughness: 0.62 }) });
  const beads = mesh(new THREE.TorusGeometry(0.078, 0.0065, 8, 40), matte({ color: 0x6a3418, roughness: 0.5 }), 0, 1.545, -0.022); beads.rotation.x = Math.PI / 2 + 0.34; attach(root, 'spine_03', beads);
}

function armsAndShoulders(root, body){
  const wrap = (from, to) => ({ around: 'x', cy: 1.448, cz: -0.082, from, to });
  layer(root, body, { name: 'DronaSleeves', bones: /^(upperarm_[lr]|clavicle_[lr])$/, where: p => Math.abs(p.x) > 0.16 && Math.abs(p.x) < 0.38, inflate: 0.018, wrap: wrap(0.18, 0.35), material: matte({ map: sleevePaint(), emissive: 0x200a00 }) });
  layer(root, body, { name: 'DronaBracers', bones: /^(lowerarm_|hand_)/, where: p => Math.abs(p.x) > 0.43 && Math.abs(p.x) < 0.73, inflate: p => table([[0.47, 0.027], [0.57, 0.019], [0.70, 0.013]], Math.abs(p.x)), wrap: wrap(0.485, 0.69), material: metal({ map: bracerPaint(), metalness: 0.45, roughness: 0.46, envMapIntensity: 0.7 }) });
  const bronze = metal({ map: texture(256, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#8a5e42'); g.addColorStop(0.5, '#5e3a28'); g.addColorStop(1, '#8e6446'); x.fillStyle = g; x.fillRect(0, 0, w, h); worn(x, w, h, 631, 260); }), metalness: 0.5, roughness: 0.42 });
  const rim = gold({ color: 0xd8a438 });
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const plate = new THREE.Group(), dome = mesh(new THREE.SphereGeometry(1, 28, 14, 0, TAU, 0, 1.42), bronze); dome.scale.set(0.12, 0.085, 0.12); plate.add(dome);
    const y = Math.cos(1.42), r = Math.sin(1.42);
    plate.add(rod(Array.from({ length: 33 }, (_, i) => { const a = i / 32 * TAU; return V(Math.cos(a) * r * 0.12, y * 0.085, Math.sin(a) * r * 0.12); }), () => 0.014, rim, 64, 8));
    plate.position.set(s * 0.225, 1.51, -0.052); plate.rotation.z = -s * 0.34; attach(root, 'clavicle_' + side, plate);
    /* the gold edge sweeping up beside the neck */
    attach(root, 'clavicle_' + side, rod([V(s * 0.24, 1.545, 0.07), V(s * 0.145, 1.57, 0.045), V(s * 0.122, 1.605, -0.02), V(s * 0.135, 1.6, -0.09), V(s * 0.2, 1.565, -0.14)], t => 0.007 + 0.011 * Math.sin(Math.PI * t), rim, 36, 8));
  }
}

function waist(root, body){
  const wound = matte({ map: clothPaint(C.ochre, C.ochreShade, { count: 22, seed: 641, w: 512, h: 128 }), roughness: 0.85, emissive: 0x140900 });
  cloth(root, body, { name: 'DronaWaistCloth', cols: 72, rows: 16, closed: true, material: wound,
    at: (u, v) => { const a = (u - 0.5) * TAU, twist = 1 + 0.045 * Math.sin(v * Math.PI * 6 + a * 3); return V(Math.sin(a) * 0.19 * twist, mix(1.13, 1.005, v) + 0.012 * Math.sin(a * 2 + 1), -0.03 + Math.cos(a) * 0.163 * twist); },
    weights: (u, v) => [['pelvis', 0.55 + 0.45 * v], ['spine_01', 0.45 * (1 - v)]] });
  /* the knot: loops of cloth wound round each other */
  const knot = new THREE.Group(), fabric = matte({ color: 0xa8661c, roughness: 0.85, emissive: 0x160a00 });
  for (const [rx, ry, rz, radius] of [[0.2, 0.4, 0.5, 0.034], [1.1, -0.3, -0.7, 0.032], [-0.6, 0.9, 1.7, 0.029]]) { const loop = mesh(new THREE.TorusGeometry(radius, 0.018, 10, 28), fabric); loop.rotation.set(rx, ry, rz); knot.add(loop); }
  knot.add(mesh(new THREE.SphereGeometry(0.034, 16, 12), fabric)); knot.position.set(0.005, 1.058, 0.162); knot.scale.set(1.15, 0.95, 0.75); attach(root, 'pelvis', knot);
  const tail = (name, dx, bottom, width, depth, seed) => cloth(root, body, { name, cols: 12, rows: 30, material: matte({ map: clothPaint(C.ochre, C.ochreShade, { count: 5, seed, border: 0.13, w: 128 }), emissive: 0x160a00 }),
    at: (u, v) => { const point = clamp01((v - 0.82) / 0.18) * 0.08 * u; return V(dx * (0.4 + v) + (u - 0.5) * mix(width * 0.45, width, v), mix(1.045, bottom, v) - point, depth + 0.05 * Math.sin(v * Math.PI * 0.8) - 0.015 * v + 0.012 * Math.sin(u * 14 + v * 6) * v); },
    weights: (u, v, p) => hanging(v, p, 0.85) });
  tail('DronaTailLong', 0.02, 0.44, 0.115, 0.168, 651);
  tail('DronaTailShort', -0.04, 0.62, 0.085, 0.182, 652);
}

function shoes(root, body){
  layer(root, body, { name: 'DronaShoeAnkle', bones: /^(foot_|ball_|calf_)/, where: p => p.y < 0.1, inflate: 0.008, wrap: { around: 'y', cz: -0.03, top: 0.1, bottom: -0.012 }, material: matte({ color: 0x5c2e14, roughness: 0.6 }) });
  /* closed leather shoes: [heel to toe, middle x, half width, top, sole] */
  const last = [[-0.153, 0.121, 0.008, 0.055, 0.014], [-0.14, 0.121, 0.03, 0.086, -0.008], [-0.105, 0.122, 0.043, 0.092, -0.012], [-0.055, 0.123, 0.05, 0.102, -0.012], [-0.012, 0.129, 0.055, 0.094, -0.012],
    [0.03, 0.134, 0.062, 0.078, -0.013], [0.07, 0.132, 0.063, 0.062, -0.014], [0.105, 0.123, 0.054, 0.052, -0.012], [0.135, 0.118, 0.04, 0.045, -0.01], [0.155, 0.117, 0.022, 0.042, -0.002], [0.166, 0.117, 0.003, 0.034, 0.018]];
  const leather = matte({ map: shoePaint(), roughness: 0.55, metalness: 0.12, emissive: 0x0c0501 }), tip = matte({ color: 0x5c2e14, roughness: 0.55 });
  const round = c => Math.sign(c) * Math.pow(Math.abs(c), 0.65);
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    cloth(root, body, { name: 'DronaShoe_' + side, cols: 32, rows: 40, closed: true, material: leather,
      at: (u, v) => { const t = v * (last.length - 1), i = Math.min(last.length - 2, Math.floor(t)), k = t - i, m = n => mix(last[i][n], last[i + 1][n], k), a = u * TAU, top = m(3), sole = m(4);
        return V(s * (m(1) + m(2) * round(Math.cos(a))), (top + sole) / 2 + (top - sole) / 2 * round(Math.sin(a)), m(0)); },
      weights: (u, v, p) => { const toe = clamp01((p.z - 0.0) / 0.07); return [['foot_' + side, 1 - toe], ['ball_' + side, toe]]; } });
    const x = s * 0.117; attach(root, 'ball_' + side, rod([V(x, 0.016, 0.14), V(x, 0.018, 0.172), V(x, 0.038, 0.19), V(x, 0.06, 0.182)], t => mix(0.019, 0.004, t), tip, 24, 10));
  }
}

function head(root, body){
  addHair(root, body);
  const hb = boundsOf(root, body, ['Head']), R = hb.size.x / 2, g = new THREE.Group();
  /* forehead mark: two pale lines curving into a U, a red line between and a pale line across */
  const pale = matte({ color: 0xf4e2b0, emissive: 0x403010 }), red = matte({ color: 0xc23a1c, emissive: 0x380a00 });
  for (const s of [-1, 1]) g.add(rod([V(s * 0.011, 1.757, 0.0975), V(s * 0.009, 1.734, 0.0985), V(0, 1.7255, 0.0995)], () => 0.0019, pale, 16, 6));
  g.add(rod([V(0, 1.73, 0.1005), V(0, 1.756, 0.099)], () => 0.0022, red, 8, 6), rod([V(-0.027, 1.7335, 0.087), V(0, 1.7345, 0.0975), V(0.027, 1.7335, 0.087)], () => 0.0013, pale, 16, 5));
  /* gold drop earrings */
  const au = gold({ color: 0xe0aa3c });
  for (const s of [-1, 1]) { const x = s * (R + 0.006); g.add(mesh(new THREE.TorusGeometry(0.011, 0.0035, 8, 20), au, x, 1.665, hb.ctr.z + 0.004).rotateY(Math.PI / 2), mesh(new THREE.SphereGeometry(0.0095, 12, 10), au, x, 1.646, hb.ctr.z + 0.004)); }
  attach(root, 'Head', g);
  beard(root);
}

/* eyebrows, moustache and a pointed beard held by a gold ring */
function beard(root){
  const g = new THREE.Group(), r = random(671);
  const strandPaint = texture(256, 256, (x, w, h) => { x.fillStyle = '#b4b8be'; x.fillRect(0, 0, w, h); for (let i = 0; i < 380; i++) { const sx = r() * w; x.strokeStyle = r() < 0.55 ? 'rgba(244,246,250,0.75)' : 'rgba(70,74,84,0.6)'; x.lineWidth = 0.8 + r() * 1.6; x.beginPath(); x.moveTo(sx, r() * h * 0.7); x.bezierCurveTo(sx + 8, h * 0.4, sx - 8, h * 0.7, sx + (r() - 0.5) * 14, h); x.stroke(); } });
  const hair = matte({ map: strandPaint, emissive: 0x18191c, roughness: 0.75 }), white = matte({ color: 0xd8dbdf, emissive: 0x1a1c1e, roughness: 0.65 }), grey = matte({ color: 0x90949a, emissive: 0x0e0f10, roughness: 0.7 });
  /* [height, half width, front, back] from under the lip to the ring, then the small tail below it */
  const rows = [[1.598, 0.05, 0.094, 0.044], [1.578, 0.072, 0.106, 0.026], [1.548, 0.072, 0.116, 0.036], [1.52, 0.056, 0.128, 0.058], [1.495, 0.036, 0.144, 0.09], [1.474, 0.016, 0.152, 0.124], [1.456, 0.021, 0.164, 0.126], [1.428, 0.014, 0.17, 0.14], [1.405, 0.002, 0.164, 0.158]];
  const surface = (a, t) => { const i = Math.min(rows.length - 2, Math.floor(t * (rows.length - 1))), k = t * (rows.length - 1) - i, m = n => mix(rows[i][n], rows[i + 1][n], k), rz = (m(2) - m(3)) / 2, zc = (m(2) + m(3)) / 2, wave = 1 + 0.04 * Math.sin(a * 9 + t * 11);
    return V(Math.sin(a) * m(1) * wave, m(0), zc + Math.cos(a) * rz * wave); };
  const cols = 40, steps = 32, P = [], U = [], F = [];
  for (let s = 0; s <= steps; s++) for (let c = 0; c <= cols; c++) { const p = surface(c / cols * TAU, s / steps); P.push(p.x, p.y, p.z); U.push(c / cols * 2, s / steps); }
  for (let s = 0; s < steps; s++) for (let c = 0; c < cols; c++) { const a = s * (cols + 1) + c, b = a + cols + 1; F.push(a, b, a + 1, a + 1, b, b + 1); }
  const shell = new THREE.BufferGeometry(); shell.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); shell.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); shell.setIndex(F); shell.computeVertexNormals(); g.add(mesh(shell, hair));
  for (let i = 0; i < 170; i++) { const a = (r() - 0.5) * 4.2, from = 0.03 + r() * 0.55, to = Math.min(1, from + 0.3 + r() * 0.4), phase = r() * 6;
    const pts = Array.from({ length: 9 }, (_, k) => { const p = surface(a + 0.1 * Math.sin(k * 0.9 + phase), mix(from, to, k / 8)); p.z += 0.003; p.x *= 1.03; return p; });
    g.add(rod(pts, t => mix(0.0024, 0.0004, t), i % 3 ? white : grey, 12, 3)); }
  const ring = mesh(new THREE.CylinderGeometry(0.02, 0.019, 0.02, 20, 1, true), gold({ color: 0xe8b440 }), 0, 1.47, 0.138); ring.scale.z = 0.85; ring.rotation.x = -0.35; g.add(ring);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 7; i++) { const d = i * 0.0016; g.add(rod([V(s * 0.003, 1.634 - d * 0.5, 0.108), V(s * 0.025, 1.627 - d, 0.104), V(s * (0.044 + d), 1.61 - d * 1.4, 0.093), V(s * (0.064 + d * 2), 1.598 - d * 2, 0.08), V(s * (0.078 + d * 2), 1.61 - d * 2.6, 0.068)], t => 0.0032 * Math.sin(Math.PI * (0.12 + t * 0.86)) + 0.0004, i % 3 === 2 ? grey : white, 22, 4)); }
    for (let i = 0; i < 3; i++) g.add(rod([V(s * 0.008, 1.7155 - i * 0.0022, 0.0975), V(s * 0.032, 1.7225 - i * 0.0024, 0.092), V(s * 0.056, 1.717 - i * 0.003, 0.074)], t => 0.0028 * (1 - t) + 0.0006, white, 14, 4));
  }
  attach(root, 'Head', g);
}

function quiver(root){
  const q = new THREE.Group(), leather = matte({ color: 0x6a3a1e, roughness: 0.7, emissive: 0x100600 }), au = gold({ color: 0xd8a438 }), r = random(681);
  q.add(mesh(new THREE.CylinderGeometry(0.074, 0.05, 0.54, 24, 1, true), leather), mesh(new THREE.CircleGeometry(0.05, 24).rotateX(Math.PI / 2), leather, 0, -0.27, 0));
  q.add(mesh(new THREE.CylinderGeometry(0.08, 0.077, 0.05, 24, 1, true), leather, 0, 0.255, 0), mesh(new THREE.CylinderGeometry(0.077, 0.074, 0.045, 24, 1, true), au, 0, 0.19, 0));
  for (const [y, rad] of [[0.282, 0.081], [-0.12, 0.062], [-0.262, 0.052]]) { const ring = mesh(new THREE.TorusGeometry(rad, 0.0075, 8, 32), y > 0 ? leather : au, 0, y, 0); ring.rotation.x = Math.PI / 2; q.add(ring); }
  const wood = matte({ color: 0x7a5230 }), feather = matte({ color: 0x6e5236, emissive: 0x0e0904 }), vane = new THREE.Shape();
  vane.moveTo(0, -0.062); vane.quadraticCurveTo(0.019, -0.026, 0.013, 0.042); vane.lineTo(0, 0.062); vane.lineTo(-0.013, 0.042); vane.quadraticCurveTo(-0.019, -0.026, 0, -0.062);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, arrow = new THREE.Group(), lean = 0.08 + r() * 0.09;
    arrow.add(mesh(new THREE.CylinderGeometry(0.0048, 0.0048, 0.36, 6), wood, 0, 0.17, 0), mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.025, 8), au, 0, 0.2, 0));
    for (let k = 0; k < 3; k++) { const f = mesh(new THREE.ShapeGeometry(vane), feather, 0, 0.3 + r() * 0.02, 0); f.rotation.y = k * Math.PI / 3 + a; arrow.add(f); }
    arrow.position.set(Math.cos(a) * 0.035, 0.2, Math.sin(a) * 0.035); arrow.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean); q.add(arrow); }
  q.position.set(0.08, 1.33, -0.235); q.rotation.set(-0.06, 0, -0.5); attach(root, 'spine_03', q);
}
