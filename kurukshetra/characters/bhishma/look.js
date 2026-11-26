/* BHISHMA - how he looks. Design description and status: design.md
   Built from the picture in pictures/: an old warrior with long grey hair tied in a top-knot, full white beard and
   moustache, silver crown with a blue jewel, silver armour with large curled shoulder plates, pale blue sash, leather
   strap, white dhoti with silver borders, great silver clasp and hanging panels, ivory quivers on the back and hip,
   silver-capped boots. Uses the shared wardrobe but changes nothing in it. */
import * as THREE from 'three';
import { boundsOf, addCurlyHair } from '../shared/helpers.js';
import { V, mix, clamp01, table, random, texture, engrave, trim, matte, layer, cloth, attach, mesh, rod } from '../shared/wardrobe.js';
import { silver, silverSheet, SILVER } from './silver.js';

export const skinTint = 0xe4d6d0;        // weathered tan over the light skin texture

const C = { white: '#c9ced6', shade: 'rgba(40,52,72,0.62)', blue: '#6f9fbe', blueShade: 'rgba(30,70,104,0.5)', leather: '#5a3a26', leatherDark: '#2a1a10' };
const TAU = Math.PI * 2;
const band = { base: '#99a6b4', light: '#e8eef5', dark: '#333e4b' };       // colours of a silver trim

/* ---------------- paintings ---------------- */
const folds = (x, w, h, base, shade, count, seed) => {
  x.fillStyle = base; x.fillRect(0, 0, w, h); const r = random(seed);
  for (let i = 0; i < count; i++) { const cx = (i + r() * 0.7) / count * w, wide = w / count * (0.45 + r() * 0.55), g = x.createLinearGradient(cx - wide, 0, cx + wide, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, shade); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.save(); x.translate(cx, 0); x.transform(1, 0, (r() - 0.5) * 0.6, 1, 0, 0); x.translate(-cx, 0); x.fillRect(cx - wide, 0, wide * 2, h); x.restore(); }
};
const clothPaint = (base, shade, { count = 12, seed = 3, border = 0, w = 512, h = 512 } = {}) => texture(w, h, x => { folds(x, w, h, base, shade, count, seed); if (border) trim(x, 0, h * (1 - border), w, h * border, band); });
/* a hanging panel with a silver edge, a pointed end and a fringe below the point; outside the shape stays see-through */
const panelPaint = (w, h, fill, { point = 0.16, border = 16, seed = 4, shade = null, ornament = 0, fringe = true } = {}) => texture(w, h, x => {
  const low = fringe ? h * 0.93 : h - 3;
  const shape = () => { x.beginPath(); x.moveTo(3, 2); x.lineTo(w - 3, 2); x.lineTo(w - 3, low - h * point); x.lineTo(w / 2, low); x.lineTo(3, low - h * point); x.closePath(); };
  shape(); x.save(); x.clip();
  if (shade) folds(x, w, h, fill, shade, 5, seed); else { x.fillStyle = fill; x.fillRect(0, 0, w, h); }
  if (ornament) { engrave(x, w * 0.2, h * 0.08, w * 0.6, h * 0.72, { seed, count: 26, size: w * 0.12, light: SILVER.light, dark: SILVER.dark }); engrave(x, 0, h * (1 - ornament - 0.1), w, h * ornament, { seed: seed + 2, count: 14, size: w * 0.13, light: SILVER.light, dark: SILVER.dark }); }
  x.restore();
  shape(); x.strokeStyle = SILVER.dark; x.lineWidth = border * 1.5; x.stroke(); x.strokeStyle = SILVER.mid; x.lineWidth = border; x.stroke(); x.strokeStyle = SILVER.light; x.lineWidth = border * 0.25; x.stroke();
  if (fringe) for (let px = 10; px < w - 6; px += 12) { const top = low - h * point * Math.abs(px - w / 2) / (w / 2) + border * 0.4; x.strokeStyle = SILVER.mid; x.lineWidth = 6; x.beginPath(); x.moveTo(px, top); x.lineTo(px, top + h * 0.055); x.stroke(); }
});
const cut = material => { material.alphaTest = 0.5; return material; };

/* chest: painting left to right goes round the body, the middle is the front */
const TOP = 1.575, BOTTOM = 1.025, CH = { w: 1024, h: 512 };
const px = deg => (deg / 360 + 0.5) * CH.w, py = y => (TOP - y) / (TOP - BOTTOM) * CH.h;
const outline = (x, drop = 0) => {
  for (let d = -180; d <= 180; d += 3) { const side = Math.abs(Math.abs(d) - 90), neck = Math.max(0, 1 - Math.min(Math.abs(d), 180 - Math.abs(d)) / 36), top = side < 34 ? mix(1.36, 1.545, side / 34) : 1.558 - 0.03 * neck * neck; d === -180 ? x.moveTo(px(d), py(top) + drop) : x.lineTo(px(d), py(top) + drop); }
};
const ridge = (x, points, wide = 10) => { for (const [color, w, dy] of [[SILVER.dark, wide + 5, 3], [SILVER.light, wide * 0.55, 0]]) { x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(points[0][0], points[0][1] + dy); x.quadraticCurveTo(points[1][0], points[1][1] + dy, points[2][0], points[2][1] + dy); x.stroke(); } };
const armourPaint = () => texture(CH.w, CH.h, x => {
  x.beginPath(); outline(x); x.lineTo(CH.w, py(1.032)); x.lineTo(0, py(1.032)); x.closePath();
  const g = x.createLinearGradient(0, 0, 0, CH.h); g.addColorStop(0, '#a9c2d8'); g.addColorStop(0.5, '#6f90ac'); g.addColorStop(1, '#93a8bc'); x.fillStyle = g; x.fill(); x.save(); x.clip();
  engrave(x, 0, py(1.54), CH.w, py(1.40) - py(1.54), { seed: 201, count: 50, size: 18, light: SILVER.light, dark: '#3c5266', width: 2.6 });
  for (const s of [-1, 1]) { ridge(x, [[px(s * 6), py(1.36)], [px(s * 34), py(1.32)], [px(s * 66), py(1.39)]]);
    for (const y of [1.27, 1.205, 1.14]) ridge(x, [[px(s * 6), py(y)], [px(s * 40), py(y - 0.025)], [px(s * 74), py(y + 0.015)]], 8);
    ridge(x, [[px(s * 112), py(1.30)], [px(s * 140), py(1.26)], [px(s * 172), py(1.31)]]); }
  ridge(x, [[px(0), py(1.40)], [px(0), py(1.24)], [px(0), py(1.08)]], 7);
  trim(x, 0, py(1.082), CH.w, 28, band);
  x.restore(); x.strokeStyle = SILVER.light; x.lineWidth = 12; x.beginPath(); outline(x, 6); x.stroke();
});
/* the pale blue sash (left shoulder to right hip) and the leather strap over it (right shoulder to left hip) */
function stripe(x, from, to, wide, paints){
  for (const shift of [-CH.w, 0, CH.w]) for (const [color, part] of paints) { x.strokeStyle = color; x.lineWidth = wide * part; x.lineCap = 'butt'; x.beginPath(); x.moveTo(px(from[0]) + shift, py(from[1])); x.lineTo(px(to[0]) + shift, py(to[1])); x.stroke(); }
}
const sashPaint = () => texture(CH.w, CH.h, x => {
  const blue = [[SILVER.dark, 1], [SILVER.mid, 0.92], [C.blue, 0.68], ['rgba(40,90,130,0.45)', 0.34], [C.blue, 0.16]];
  stripe(x, [40, 1.575], [-82, 1.07], 150, blue); stripe(x, [140, 1.575], [262, 1.07], 150, blue);
  const leather = [[C.leatherDark, 1], [C.leather, 0.74], ['#8a6446', 0.12]];
  stripe(x, [-52, 1.57], [82, 1.11], 66, leather); stripe(x, [232, 1.57], [98, 1.11], 66, leather);
});
const armPaint = seed => texture(512, 256, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#7e8b99'); g.addColorStop(0.5, '#c2ccd6'); g.addColorStop(1, '#7e8b99'); x.fillStyle = g; x.fillRect(0, 8, w, h - 16);
  engrave(x, 0, 60, w, 40, { seed, count: 20, size: 14, light: SILVER.light, dark: SILVER.dark });
  for (const y of [8, h - 44]) trim(x, 0, y, w, 36, band);
  x.strokeStyle = SILVER.dark; x.lineWidth = 6; for (const u of [0.25, 0.75]) { x.beginPath(); x.moveTo(u * w - 50, 50); x.lineTo(u * w, 190); x.lineTo(u * w + 50, 50); x.stroke(); }
});
const bootPaint = () => texture(512, 256, (x, w, h) => {
  x.fillStyle = C.leather; x.fillRect(0, 0, w, h); const r = random(211); x.fillStyle = 'rgba(30,18,10,0.25)'; for (let i = 0; i < 200; i++) x.fillRect(r() * w, r() * h, 3 + r() * 8, 2);
  trim(x, 0, 0, w, 40, band); trim(x, 0, h * 0.46, w, 30, band);
  const g = x.createLinearGradient(0, h * 0.7, 0, h); g.addColorStop(0, '#a8b4c0'); g.addColorStop(1, '#4e5a68'); x.fillStyle = g; x.beginPath(); x.ellipse(w / 2, h * 0.86, w * 0.13, h * 0.15, 0, 0, 6.29); x.fill(); x.fillStyle = '#241710'; x.fillRect(0, h * 0.94, w, h * 0.06);
});

/* ---------------- dressing ---------------- */
export function dress(root, body){
  root.updateMatrixWorld(true);
  lowerBody(root, body);
  armour(root, body);
  armsAndShoulders(root, body);
  belt(root, body);
  boots(root, body);
  head(root, body);
  quivers(root);
  root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.name === 'MI_Hair_1') m.color = new THREE.Color(0xb9bcc0); }); });
}

const thigh = s => s > 0 ? 'thigh_l' : 'thigh_r', calf = s => s > 0 ? 'calf_l' : 'calf_r';
const hanging = (v, p, hold = 0.8) => { const t = clamp01(v * 1.25) * hold, left = clamp01(0.5 + p.x * 4.5); return [['pelvis', 1 - t], ['thigh_l', t * left], ['thigh_r', t * (1 - left)]]; };

function lowerBody(root, body){
  layer(root, body, { name: 'BhishmaUnderCloth', bones: /^(pelvis|spine_01|spine_02|thigh_[lr]|calf_[lr])$/, where: p => p.y > 0.18 && p.y < 1.16, inflate: p => p.y > 0.96 ? 0.011 : 0.004,
    wrap: { around: 'y', cz: -0.04, top: 1.16, bottom: 0.18 }, material: matte({ color: 0xb4bac4, emissive: 0x0e1014 }) });
  /* white dhoti: a full tube round each leg, silver border at the hem */
  const white = matte({ map: clothPaint(C.white, C.shade, { count: 10, seed: 221, border: 0.08 }), roughness: 0.62 });
  for (const s of [1, -1]) cloth(root, body, { name: 'BhishmaDhoti' + (s > 0 ? 'L' : 'R'), cols: 56, rows: 44, closed: true, material: white,
    at: (u, v) => { const y = mix(1.0, 0.185, v), a = u * TAU;
      const rx = table([[1.0, 0.082], [0.9, 0.102], [0.74, 0.122], [0.55, 0.124], [0.42, 0.118], [0.3, 0.098], [0.185, 0.07]], y);
      const rz = table([[1.0, 0.115], [0.9, 0.124], [0.74, 0.134], [0.55, 0.136], [0.42, 0.14], [0.3, 0.112], [0.185, 0.078]], y);
      const fold = 1 + (0.085 * Math.sin(a * 6 + y * 19 + s) + 0.05 * Math.sin(a * 3 - y * 12)) * clamp01((y - 0.2) * 6) * clamp01((1.0 - y) * 4);
      const cx = s * table([[1.0, 0.07], [0.85, 0.11], [0.5, 0.124], [0.185, 0.115]], y), cz = table([[1.0, -0.03], [0.55, -0.035], [0.35, -0.062], [0.185, -0.08]], y);
      return V(cx + Math.sin(a) * rx * fold, y, cz + Math.cos(a) * rz * fold); },
    weights: (u, v, p) => { if (p.y > 0.88) { const t = clamp01((p.y - 0.88) / 0.11); return [['pelvis', t], [thigh(s), 1 - t]]; } const k = clamp01((0.62 - p.y) / 0.16); return [[thigh(s), 1 - k], [calf(s), k]]; } });
  const joined = matte({ map: clothPaint(C.white, C.shade, { count: 6, seed: 227, border: 0.07, w: 256 }), emissive: 0x14161c });
  for (const [name, side] of [['BhishmaJoinFront', 1], ['BhishmaJoinBack', -1]]) cloth(root, body, { name, cols: 28, rows: 34, material: joined,
    at: (u, v) => { const y = mix(0.98, 0.24 - 0.03 * Math.sin(u * Math.PI), v), half = table([[0, 0.12], [0.5, 0.14], [1, 0.14]], v), x = (u - 0.5) * 2 * half;
      const depth = table([[0, 0.085], [0.4, 0.06], [0.75, 0.028], [1, 0.0]], v) + 0.022 * Math.sin(u * 19 + v * 7) * v + 0.035 * Math.sin(u * Math.PI);
      return V(x, y, mix(-0.035, -0.08, clamp01((v - 0.4) * 1.7)) + side * depth); },
    weights: (u, v, p) => { const left = clamp01(0.5 + p.x * 4.5), low = clamp01((0.6 - p.y) / 0.16), hip = clamp01((p.y - 0.85) / 0.13);
      return [['pelvis', hip], ['thigh_l', (1 - hip) * left * (1 - low)], ['thigh_r', (1 - hip) * (1 - left) * (1 - low)], p.x > 0 ? ['calf_l', (1 - hip) * low] : ['calf_r', (1 - hip) * low]]; } });
  /* white cloth draped round the hips, open in front, its edge falling to one side */
  cloth(root, body, { name: 'BhishmaHipDrape', cols: 64, rows: 20, material: matte({ map: clothPaint(C.white, C.shade, { count: 18, seed: 231, border: 0.13 }) }),
    at: (u, v) => { const a = mix(24, 336, u) * Math.PI / 180, low = 0.76 - 0.1 * Math.sin(a) + 0.03 * Math.cos(a * 2), y = mix(1.045, low, v);
      const wide = table([[0, 0.178], [0.15, 0.214], [0.35, 0.24], [0.65, 0.258], [1, 0.272]], v), deep = table([[0, 0.152], [0.2, 0.18], [0.5, 0.192], [1, 0.204]], v), grow = 1 + 0.06 * Math.sin(a * 10 + v * 5) * v;
      return V(Math.sin(a) * wide * grow, y, -0.032 + Math.cos(a) * deep * grow); },
    weights: (u, v, p) => hanging(v, p, 0.95) });
  /* a pale blue cloth behind the right hip */
  cloth(root, body, { name: 'BhishmaBlueDrape', cols: 20, rows: 30, material: matte({ map: clothPaint(C.blue, C.blueShade, { count: 7, seed: 241, border: 0.1, w: 256 }), emissive: 0x08141c }),
    at: (u, v) => { const a = mix(-172, -88, u) * Math.PI / 180, r = 0.262 + 0.06 * v, y = mix(0.99, 0.46 + 0.14 * u, v); return V(Math.sin(a) * r, y, -0.035 + Math.cos(a) * r * 0.82); },
    weights: (u, v, p) => hanging(v, p, 0.8) });
  /* two hanging panels in front */
  const front = (name, width, bottom, depth, material) => cloth(root, body, { name, cols: 12, rows: 32, material,
    at: (u, v) => V((u - 0.5) * mix(width * 0.72, width, v), mix(1.035, bottom, v), depth + 0.052 * Math.sin(v * Math.PI * 0.82) - 0.02 * v + 0.007 * Math.sin(u * 13 + v * 5) * v),
    weights: (u, v, p) => hanging(v, p, 0.85) });
  front('BhishmaPanelWide', 0.19, 0.38, 0.152, cut(matte({ map: panelPaint(256, 896, C.white, { shade: C.shade, border: 18, seed: 251 }) })));
  front('BhishmaPanelNarrow', 0.1, 0.55, 0.176, cut(silver({ map: panelPaint(192, 640, '#95a4b4', { border: 15, seed: 261, ornament: 0.2 }), metalness: 0.5 })));
}

function armour(root, body){
  const torso = /^(spine_0[123]|clavicle_[lr]|neck_01|upperarm_[lr])$/, onTorso = p => Math.abs(p.x) < 0.235 && p.y > 1.01 && p.y < 1.6;
  const wrap = { around: 'y', cz: -0.02, top: TOP, bottom: BOTTOM };
  layer(root, body, { name: 'BhishmaArmour', bones: torso, where: onTorso, inflate: 0.026, wrap, material: silver({ map: armourPaint(), color: 0xc4d8ec, metalness: 0.5, roughness: 0.4 }) });
  layer(root, body, { name: 'BhishmaSash', bones: torso, where: onTorso, inflate: 0.04, wrap, material: matte({ map: sashPaint(), roughness: 0.66, emissive: 0x06080a }) });
  const rim = silver(), collar = mesh(new THREE.TorusGeometry(0.092, 0.013, 8, 44), rim, 0, 1.548, -0.027); collar.rotation.x = Math.PI / 2 + 0.28; collar.scale.set(1.04, 1.06, 1); attach(root, 'spine_03', collar);
  /* the buckle on the strap */
  const buckle = new THREE.Group(), frame = mesh(new THREE.TorusGeometry(0.027, 0.0065, 8, 4), rim); frame.rotation.z = Math.PI / 4; frame.scale.set(1, 1.25, 1); buckle.add(frame, mesh(new THREE.BoxGeometry(0.006, 0.045, 0.006), rim));
  buckle.position.set(0.062, 1.285, 0.158); buckle.rotation.set(0, 0.38, 0.84); attach(root, 'spine_03', buckle);
}

function armsAndShoulders(root, body){
  const wrap = (from, to) => ({ around: 'x', cy: 1.448, cz: -0.082, from, to });
  layer(root, body, { name: 'BhishmaArmBands', bones: /^upperarm_/, where: p => Math.abs(p.x) > 0.28 && Math.abs(p.x) < 0.42, inflate: 0.014, wrap: wrap(0.335, 0.38), material: silver({ map: armPaint(271) }) });
  layer(root, body, { name: 'BhishmaBracers', bones: /^(lowerarm_|hand_)/, where: p => Math.abs(p.x) > 0.43 && Math.abs(p.x) < 0.73, inflate: p => table([[0.47, 0.032], [0.57, 0.022], [0.70, 0.013]], Math.abs(p.x)), wrap: wrap(0.48, 0.69), material: silver({ map: armPaint(281) }) });
  const plate = silver({ map: silverSheet(291) }), rim = silver({ color: 0xf2f8ff });
  const dome = (rx, ry, rz, open) => { const g = new THREE.Group(), d = mesh(new THREE.SphereGeometry(1, 28, 14, 0, TAU, 0, open), plate); d.scale.set(rx, ry, rz); g.add(d);
    const y = Math.cos(open), s = Math.sin(open); g.add(rod(Array.from({ length: 33 }, (_, i) => { const a = i / 32 * TAU; return V(Math.cos(a) * s * rx, y * ry, Math.sin(a) * s * rz); }), () => 0.012, rim, 64, 8)); return g; };
  const scroll = (s, rx, ry, rz) => rod(Array.from({ length: 34 }, (_, i) => { const t = i / 33, a = t * 8.4, r = 0.058 * (1 - t * 0.84), lift = 0.5 + Math.sin(a) * r * 5.4, turn = s * (0.75 + Math.cos(a) * r * 8.6);
    return V(Math.sin(turn) * Math.cos(lift) * rx * 1.04, Math.sin(lift) * ry * 1.04, Math.cos(turn) * Math.cos(lift) * rz * 1.04); }), t => mix(0.012, 0.004, t), rim, 68, 8);
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const top = dome(0.138, 0.112, 0.138, 1.5); top.add(scroll(s, 0.138, 0.112, 0.138)); top.position.set(s * 0.226, 1.51, -0.052); top.rotation.z = -s * 0.3; attach(root, 'clavicle_' + side, top);
    const mid = dome(0.114, 0.095, 0.122, 1.38); mid.position.set(s * 0.296, 1.466, -0.068); mid.rotation.z = -s * 0.72; attach(root, 'upperarm_' + side, mid);
    const low = dome(0.09, 0.08, 0.1, 1.3); low.position.set(s * 0.34, 1.438, -0.074); low.rotation.z = -s * 1.0; attach(root, 'upperarm_' + side, low);
    /* raised guard beside the neck */
    const guard = rod([V(s * 0.12, 1.545, 0.045), V(s * 0.145, 1.6, 0.0), V(s * 0.15, 1.618, -0.06), V(s * 0.13, 1.585, -0.11)], t => 0.011 + 0.008 * Math.sin(Math.PI * t), plate, 28, 8); attach(root, 'clavicle_' + side, guard);
  }
}

function belt(root, body){
  const wound = matte({ map: clothPaint(C.white, C.shade, { count: 24, seed: 301, w: 512, h: 96 }) });
  cloth(root, body, { name: 'BhishmaBelt', cols: 72, rows: 12, closed: true, material: wound,
    at: (u, v) => { const a = (u - 0.5) * TAU, wrinkle = 1 + 0.03 * Math.sin(v * Math.PI * 5 + a * 2); return V(Math.sin(a) * 0.196 * wrinkle, mix(1.122, 1.008, v) + 0.005 * Math.sin(a * 2), -0.03 + Math.cos(a) * 0.167 * wrinkle); },
    weights: (u, v) => [['pelvis', 0.55 + 0.45 * v], ['spine_01', 0.45 * (1 - v)]] });
  const clasp = new THREE.Group(), rim = silver({ color: 0xf2f8ff }), face = silver({ map: silverSheet(311) });
  const disc = mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.016, 28), face); disc.rotation.x = Math.PI / 2; clasp.add(disc);
  for (const r of [0.062, 0.038]) clasp.add(mesh(new THREE.TorusGeometry(r, 0.007, 10, 40), rim, 0, 0, 0.01));
  const boss = mesh(new THREE.SphereGeometry(0.024, 20, 14), rim, 0, 0, 0.012); boss.scale.z = 0.6; clasp.add(boss);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; clasp.add(mesh(new THREE.SphereGeometry(0.012, 10, 8), rim, Math.cos(a) * 0.072, Math.sin(a) * 0.058, 0)); }
  for (const s of [-1, 1]) clasp.add(mesh(new THREE.TorusGeometry(0.026, 0.008, 8, 24, Math.PI * 1.5), rim, s * 0.085, -0.005, -0.012));
  const drop = mesh(new THREE.ConeGeometry(0.036, 0.075, 4), face, 0, -0.09, -0.002); drop.rotation.x = Math.PI; drop.scale.z = 0.35; clasp.add(drop);
  clasp.position.set(0, 1.052, 0.19); attach(root, 'pelvis', clasp);
}

function boots(root, body){
  layer(root, body, { name: 'BhishmaBoots', bones: /^(foot_|ball_|calf_)/, where: p => p.y < 0.215, inflate: p => p.y < 0.09 ? 0.016 : 0.013, wrap: { around: 'y', cz: -0.03, top: 0.215, bottom: -0.012 }, material: matte({ map: bootPaint(), roughness: 0.5, metalness: 0.2 }) });
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const x = s * 0.128, cap = new THREE.Group(), dome = mesh(new THREE.SphereGeometry(0.044, 20, 14, 0, TAU, 0, Math.PI / 2), silver()); dome.scale.set(1, 0.85, 1.15); dome.position.set(x, 0.006, 0.11);
    const edge = mesh(new THREE.TorusGeometry(0.043, 0.0055, 8, 28), silver({ color: 0xf2f8ff }), x, 0.012, 0.11); edge.rotation.x = Math.PI / 2; edge.scale.y = 1.15; cap.add(dome, edge); attach(root, 'ball_' + side, cap);
    const cuff = new THREE.Group(); for (const y of [0.205, 0.12]) { const r = mesh(new THREE.TorusGeometry(y > 0.15 ? 0.068 : 0.056, 0.009, 8, 28), silver(), s * 0.115, y, y > 0.15 ? -0.078 : -0.085); r.rotation.x = Math.PI / 2; cuff.add(r); } attach(root, calf(s), cuff);
  }
}

function head(root, body){
  const grey = 0x9ea2a8;
  addCurlyHair(root, body, { strands: 120, segments: 26, sides: 4, toShoulder: false, length: 0.36, seed: 41, curl: 0.045, bun: true, color: grey, topCap: 0.74, tube: 0.15, faceGap: 1.5 });
  const hb = boundsOf(root, body, ['Head']), R = hb.size.x / 2, cz = hb.ctr.z - 0.004, depth = hb.size.z / 2 * 0.93, bandY = hb.box.max.y - hb.size.y * 0.225;
  const g = new THREE.Group(), au = silver(), bright = silver({ color: 0xf2f8ff });
  const onBand = (a, lift = 0) => V(Math.sin(a) * (R * 1.07 + lift), bandY - 0.012 * (1 - Math.cos(a)) / 2, cz + Math.cos(a) * (depth * 1.06 + lift));
  const ring = (h, t) => rod(Array.from({ length: 49 }, (_, i) => onBand(i / 48 * TAU).add(V(0, h, 0))), () => t, au, 96, 8);
  g.add(ring(0.012, 0.0055), ring(-0.012, 0.0055));
  g.add(rod(Array.from({ length: 49 }, (_, i) => onBand(i / 48 * TAU, -0.002)), () => 0.0105, silver({ map: silverSheet(321, 512, 64, 40) }), 96, 8));
  for (let i = -8; i <= 8; i++) { const bead = mesh(new THREE.SphereGeometry(0.0058, 8, 6), bright); bead.position.copy(onBand(i * 0.19, 0.008)); g.add(bead); }
  const shape = new THREE.Shape(); shape.moveTo(-0.048, -0.018); shape.quadraticCurveTo(-0.036, 0.016, -0.022, 0.018); shape.quadraticCurveTo(-0.014, 0.034, 0, 0.056); shape.quadraticCurveTo(0.014, 0.034, 0.022, 0.018); shape.quadraticCurveTo(0.036, 0.016, 0.048, -0.018); shape.closePath();
  const front = cz + depth * 1.06 + 0.004, peak = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1 }), bright, 0, bandY, front); peak.rotation.x = -0.18; g.add(peak);
  const sapphire = silver({ color: 0x1f66d8, emissive: 0x061c50, metalness: 0.35, roughness: 0.12 }), jewel = mesh(new THREE.SphereGeometry(0.0135, 16, 12), sapphire, 0, bandY + 0.012, front + 0.012); jewel.scale.set(0.85, 1.35, 0.55); g.add(jewel);
  g.add(mesh(new THREE.TorusGeometry(0.0155, 0.0035, 8, 24), bright, 0, bandY + 0.012, front + 0.012));
  const tuft = matte({ color: 0x8d9198, emissive: 0x101112 }), top = V(0, hb.box.max.y + R * 0.12, hb.ctr.z - R * 0.18);
  for (let i = 0; i < 14; i++) { const turn = i / 14 * Math.PI; g.add(rod(Array.from({ length: 13 }, (_, k) => { const a = k / 12 * Math.PI * 1.5 - 0.4, rad = R * 0.52; return top.clone().add(V(Math.cos(turn) * Math.cos(a) * rad, Math.sin(a) * rad * 1.05, Math.sin(turn) * Math.cos(a) * rad)); }), () => 0.0028, tuft, 24, 4)); }
  /* silver ring round the top-knot */
  const knot = mesh(new THREE.TorusGeometry(0.046, 0.0135, 10, 30), au, 0, hb.box.max.y - 0.012, hb.ctr.z - R * 0.18); knot.rotation.x = Math.PI / 2; g.add(knot);
  /* forehead marks: three pale lines and a red one */
  const pale = matte({ color: 0xf1e6d8, emissive: 0x302820 });
  for (const [y, wide] of [[1.732, 0.026], [1.7405, 0.029], [1.749, 0.026]]) g.add(rod([V(-wide, y, 0.087), V(0, y + 0.001, 0.0975), V(wide, y, 0.087)], () => 0.0014, pale, 18, 5));
  g.add(rod([V(0, 1.727, 0.0995), V(0, 1.752, 0.0985)], () => 0.0023, matte({ color: 0xc04030, emissive: 0x300800 }), 8, 6));
  attach(root, 'Head', g);
  beard(root);
}

/* eyebrows, moustache and the long beard */
function beard(root){
  const g = new THREE.Group(), r = random(331);
  const strandPaint = texture(256, 256, (x, w, h) => { x.fillStyle = '#a4a8ae'; x.fillRect(0, 0, w, h); for (let i = 0; i < 380; i++) { const sx = r() * w; x.strokeStyle = r() < 0.55 ? 'rgba(236,238,242,0.75)' : 'rgba(58,62,72,0.65)'; x.lineWidth = 0.8 + r() * 1.6; x.beginPath(); x.moveTo(sx, r() * h * 0.7); x.bezierCurveTo(sx + 8, h * 0.4, sx - 8, h * 0.7, sx + (r() - 0.5) * 14, h); x.stroke(); } });
  const hair = matte({ map: strandPaint, emissive: 0x141518, roughness: 0.75 }), white = matte({ color: 0xc8cbd0, emissive: 0x16181a, roughness: 0.65 }), grey = matte({ color: 0x84888f, emissive: 0x0c0d0e, roughness: 0.7 });
  /* the body of the beard: rings from the chin down on to the chest [height, half width, front, back] */
  const rows = [[1.614, 0.064, 0.1, 0.044], [1.598, 0.092, 0.114, 0.022], [1.558, 0.108, 0.126, 0.03], [1.51, 0.114, 0.142, 0.048], [1.46, 0.108, 0.168, 0.082], [1.41, 0.09, 0.19, 0.116], [1.362, 0.064, 0.196, 0.14], [1.322, 0.036, 0.188, 0.156], [1.295, 0.004, 0.176, 0.168]];
  const surface = (a, t) => { const i = Math.min(rows.length - 2, Math.floor(t * (rows.length - 1))), k = t * (rows.length - 1) - i, m = n => mix(rows[i][n], rows[i + 1][n], k), rz = (m(2) - m(3)) / 2, zc = (m(2) + m(3)) / 2, wave = 1 + 0.11 * Math.sin(a * 9 + t * 11) + 0.07 * Math.sin(a * 17 - t * 23);
    return V(Math.sin(a) * m(1) * wave, m(0), zc + Math.cos(a) * rz * wave); };
  const cols = 40, steps = 32, P = [], U = [], F = [];
  for (let s = 0; s <= steps; s++) for (let c = 0; c <= cols; c++) { const p = surface(c / cols * TAU, s / steps); P.push(p.x, p.y, p.z); U.push(c / cols * 2, s / steps); }
  for (let s = 0; s < steps; s++) for (let c = 0; c < cols; c++) { const a = s * (cols + 1) + c, b = a + cols + 1; F.push(a, b, a + 1, a + 1, b, b + 1); }
  const shell = new THREE.BufferGeometry(); shell.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); shell.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); shell.setIndex(F); shell.computeVertexNormals(); g.add(mesh(shell, hair));
  /* loose locks over it */
  for (let i = 0; i < 120; i++) { const a = (r() - 0.5) * 4.2, from = r() * 0.5, to = Math.min(1.06, from + 0.4 + r() * 0.55), phase = r() * 6;
    const pts = Array.from({ length: 12 }, (_, k) => { const t = mix(from, to, k / 11), p = surface(a + 0.2 * Math.sin(k * 0.9 + phase), Math.min(1, t)); p.z += 0.006; p.x *= 1.07 + 0.05 * Math.sin(k + phase); if (k > 8) p.y -= 0.007 * (k - 8); return p; });
    g.add(rod(pts, t => mix(0.0062, 0.0008, t), i % 3 ? white : grey, 18, 4)); }
  for (const s of [-1, 1]) {
    /* sideburns joining the hair to the beard */
    for (let i = 0; i < 7; i++) g.add(rod([V(s * (0.074 + r() * 0.006), 1.668 - i * 0.004, 0.012 + i * 0.006), V(s * (0.072 + r() * 0.006), 1.628 - i * 0.004, 0.026 + i * 0.008), V(s * (0.052 + r() * 0.01), 1.585, 0.062 + i * 0.006)], t => mix(0.007, 0.002, t), i % 2 ? white : grey, 14, 4));
    /* moustache sweeping out from under the nose */
    for (let i = 0; i < 6; i++) { const d = i * 0.0028; g.add(rod([V(s * 0.003, 1.639 - d * 0.5, 0.113), V(s * 0.028, 1.634 - d, 0.108), V(s * (0.05 + d), 1.615 - d * 1.4, 0.092), V(s * (0.072 + d * 2), 1.596 - d * 2.2, 0.074), V(s * (0.086 + d * 2), 1.606 - d * 3, 0.062)], t => 0.0058 * Math.sin(Math.PI * (0.12 + t * 0.86)) + 0.0006, i % 3 === 2 ? grey : white, 26, 5)); }
    /* heavy eyebrows */
    for (let i = 0; i < 3; i++) g.add(rod([V(s * 0.008, 1.7155 - i * 0.0022, 0.0975), V(s * 0.032, 1.7235 - i * 0.0024, 0.092), V(s * 0.056, 1.7165 - i * 0.003, 0.074)], t => 0.0033 * (1 - t) + 0.0007, white, 14, 4));
  }
  attach(root, 'Head', g);
}

function quivers(root){
  const ivory = matte({ color: 0xe8dcc0, roughness: 0.4, emissive: 0x1c180e }), work = silver({ map: silverSheet(341) }), rim = silver({ color: 0xf2f8ff }), wood = matte({ color: 0x8a6a48 }), feather = matte({ color: 0xd8d6d0, emissive: 0x1a1a18 }), r = random(351);
  const vane = new THREE.Shape(); vane.moveTo(0, -0.08); vane.quadraticCurveTo(0.034, -0.034, 0.024, 0.056); vane.lineTo(0, 0.086); vane.lineTo(-0.024, 0.056); vane.quadraticCurveTo(-0.034, -0.034, 0, -0.08);
  const quiver = (mouth, foot, length, arrows) => {
    const q = new THREE.Group();
    q.add(mesh(new THREE.CylinderGeometry(mouth, foot, length, 24, 1, true), ivory), mesh(new THREE.CircleGeometry(foot, 24).rotateX(Math.PI / 2), ivory, 0, -length / 2, 0));
    for (const [at, high] of [[0.44, 0.11], [-0.45, 0.09]]) { const rad = mix(foot, mouth, at + 0.5) + 0.004; q.add(mesh(new THREE.CylinderGeometry(rad + 0.003, rad - 0.002, high * length, 24, 1, true), work, 0, at * length, 0));
      for (const e of [-0.5, 0.5]) { const ring = mesh(new THREE.TorusGeometry(rad + 0.002, 0.0075, 8, 32), rim, 0, (at + e * high) * length, 0); ring.rotation.x = Math.PI / 2; q.add(ring); } }
    const middle = (mouth + foot) / 2 + 0.003; q.add(mesh(new THREE.CylinderGeometry(middle + 0.002, middle - 0.002, 0.07 * length, 24, 1, true), work, 0, 0.02 * length, 0));
    for (let i = 0; i < arrows; i++) { const a = i / arrows * TAU, arrow = new THREE.Group(), lean = 0.08 + r() * 0.09;
      arrow.add(mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.32, 6), wood, 0, 0.15, 0));
      for (let k = 0; k < 3; k++) { const f = mesh(new THREE.ShapeGeometry(vane), feather, 0, 0.26 + r() * 0.025, 0); f.rotation.y = k * Math.PI / 3 + a; arrow.add(f); }
      arrow.add(mesh(new THREE.SphereGeometry(0.007, 8, 6), rim, 0, 0.35, 0));
      arrow.position.set(Math.cos(a) * mouth * 0.45, length / 2 - 0.08, Math.sin(a) * mouth * 0.45); arrow.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean); q.add(arrow); }
    return q;
  };
  const back = quiver(0.092, 0.062, 0.66, 9); back.position.set(0.085, 1.33, -0.255); back.rotation.set(-0.06, 0, -0.52); attach(root, 'spine_03', back);
  const hip = quiver(0.07, 0.048, 0.5, 6); hip.position.set(0.285, 0.9, -0.04); hip.quaternion.setFromUnitVectors(V(0, 1, 0), V(0.06, 0.52, 0.85).normalize()); attach(root, 'pelvis', hip);
}
