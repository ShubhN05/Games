/* KARNA - how he looks. Design description and status: design.md
   Built from the picture in pictures/: golden skin, tall gold crown with a red jewel, glowing crescent earrings,
   glowing sun armour (kavach) with a red gem, scrolled shoulder plates, gold gauntlets, orange waist sash with a
   large gold clasp and hanging panels, gold hip plates, maroon trousers with gold ankle cuffs, maroon pointed shoes.
   Uses the shared wardrobe but changes nothing in it. */
import * as THREE from 'three';
import { boundsOf, addCurlyHair } from '../shared/helpers.js';
import { V, mix, clamp01, table, random, texture, engrave, trim, metal, gold, matte, layer, cloth, attach, mesh, rod } from '../shared/wardrobe.js';

export const skinTint = 0xffdc9c;        // golden skin over the light skin texture

const C = { gold: '#d9a22f', goldLight: '#ffe89c', goldDark: '#7c530c', maroon: '#8c1740', maroonShade: 'rgba(30,0,10,0.62)', orange: '#ee7d10', orangeShade: 'rgba(130,40,0,0.5)' };
const TAU = Math.PI * 2;

/* ---------------- materials ---------------- */
const goldSheet = (seed, w = 256, h = 256) => texture(w, h, x => {
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e8b94a'); g.addColorStop(0.5, '#c58e24'); g.addColorStop(1, '#eec35a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  engrave(x, 0, 0, w, h, { seed, count: 20, size: 24, light: C.goldLight, dark: C.goldDark });
});
/* things that give their own light */
const glowGold = () => new THREE.MeshStandardMaterial({ color: 0xffd36a, emissive: 0xffa81c, emissiveIntensity: 1.1, roughness: 0.35, metalness: 0.2 });
const ruby = () => metal({ color: 0xd1123a, emissive: 0x6a0414, metalness: 0.25, roughness: 0.12 });

/* a painting and, over it, the same size painting of what glows (black = no glow) */
function glowing(w, h, paint, lines){
  const map = texture(w, h, x => { paint(x); lines(x, '#ffd95e', '#fff6cc'); });
  const light = texture(w, h, x => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); lines(x, '#c9760a', '#ffd070'); });
  return metal({ map, emissive: 0xffffff, emissiveMap: light, emissiveIntensity: 0.95, metalness: 0.5, roughness: 0.36, envMapIntensity: 0.9 });
}
const stroke = (x, points, wide, color, core) => {
  for (const [c, w] of [[color, wide], [core, wide * 0.4]]) { x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(...points[0]); for (let i = 1; i < points.length; i++) x.lineTo(...points[i]); x.stroke(); }
};

/* ---------------- chest armour: painting left to right goes round the body, the middle is the front ---------------- */
const TOP = 1.575, BOTTOM = 1.025, CH = { w: 1024, h: 512 };
const px = deg => (deg / 360 + 0.5) * CH.w, py = y => (TOP - y) / (TOP - BOTTOM) * CH.h;
const outline = (x, drop = 0) => {
  for (let d = -180; d <= 180; d += 3) {
    const side = Math.abs(Math.abs(d) - 90), neck = Math.max(0, 1 - Math.min(Math.abs(d), 180 - Math.abs(d)) / 36);
    const top = side < 34 ? mix(1.36, 1.54, side / 34) : 1.552 - 0.034 * neck * neck;
    d === -180 ? x.moveTo(px(d), py(top) + drop) : x.lineTo(px(d), py(top) + drop);
  }
};
const SUN = [px(0), py(1.39)];
const armourMaterial = () => glowing(CH.w, CH.h, x => {
  x.beginPath(); outline(x); x.lineTo(CH.w, py(1.032)); x.lineTo(0, py(1.032)); x.closePath();
  const g = x.createLinearGradient(0, 0, 0, CH.h); g.addColorStop(0, '#f2c653'); g.addColorStop(0.45, '#d29a2a'); g.addColorStop(0.7, '#b37d1c'); g.addColorStop(1, '#d6a032'); x.fillStyle = g; x.fill(); x.save(); x.clip();
  engrave(x, 0, py(1.30), CH.w, py(1.10) - py(1.30), { seed: 17, count: 14, size: 26, light: '#ffe08a', dark: '#92620f', width: 2 });
  /* the sun round the gem */
  const [cx, cy] = SUN;
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, long = i % 2 ? 62 : 90, bend = 0.17;
    x.beginPath(); x.moveTo(cx + Math.cos(a - 0.13) * 34, cy + Math.sin(a - 0.13) * 34); x.quadraticCurveTo(cx + Math.cos(a + bend) * long * 0.7, cy + Math.sin(a + bend) * long * 0.7, cx + Math.cos(a) * long, cy + Math.sin(a) * long);
    x.quadraticCurveTo(cx + Math.cos(a + 0.1) * long * 0.6, cy + Math.sin(a + 0.1) * long * 0.6, cx + Math.cos(a + 0.13) * 34, cy + Math.sin(a + 0.13) * 34); x.closePath(); x.fillStyle = C.goldLight; x.fill(); x.strokeStyle = C.goldDark; x.lineWidth = 2.5; x.stroke(); }
  /* raised plate edges */
  for (const s of [-1, 1]) {
    stroke(x, [[px(s * 4), py(1.285)], [px(s * 26), py(1.315)], [px(s * 56), py(1.36)], [px(s * 80), py(1.34)]], 16, C.goldDark, C.goldLight);
    stroke(x, [[px(s * 70), py(1.27)], [px(s * 42), py(1.17)], [px(s * 44), py(1.075)]], 12, C.goldDark, C.goldLight);
  }
  trim(x, 0, py(1.078), CH.w, 26, { base: C.gold, light: C.goldLight, dark: C.goldDark });
  x.restore();
  x.strokeStyle = C.goldLight; x.lineWidth = 13; x.beginPath(); outline(x, 6); x.stroke();
}, (x, color, core) => {
  for (const s of [-1, 1]) {
    stroke(x, [[px(s * 26), py(1.425)], [px(s * 40), py(1.455)], [px(s * 38), py(1.48)], [px(s * 58), py(1.505)]], 7, color, core);
    stroke(x, [[px(s * 28), py(1.365)], [px(s * 52), py(1.395)], [px(s * 76), py(1.375)]], 7, color, core);
    stroke(x, [[px(s * 3), py(1.272)], [px(s * 24), py(1.298)], [px(s * 52), py(1.325)]], 8, color, core);
    for (const [y, wide] of [[1.235, 30], [1.185, 27], [1.135, 23]]) stroke(x, [[px(s * 4), py(y - 0.022)], [px(s * 15), py(y + 0.012)], [px(s * wide), py(y)]], 8, color, core);
  }
  stroke(x, [[px(0), py(1.285)], [px(0), py(1.09)]], 8, color, core);
});

/* ---------------- arms ---------------- */
const bandMaterial = () => metal({ map: texture(512, 256, (x, w, h) => { x.fillStyle = C.gold; x.fillRect(0, 8, w, h - 16); engrave(x, 0, 40, w, h - 80, { seed: 61, count: 34, size: 20, light: C.goldLight, dark: C.goldDark }); trim(x, 0, 8, w, 44, { base: C.gold, light: C.goldLight, dark: C.goldDark }); trim(x, 0, h - 52, w, 44, { base: C.gold, light: C.goldLight, dark: C.goldDark }); }) });
const gauntletMaterial = () => glowing(512, 256, x => {
  const g = x.createLinearGradient(0, 0, 512, 0); g.addColorStop(0, '#d39b2c'); g.addColorStop(0.5, '#efc152'); g.addColorStop(1, '#d39b2c'); x.fillStyle = g; x.fillRect(0, 8, 512, 240);
  for (const [y, h] of [[8, 30], [216, 32]]) trim(x, 0, y, 512, h, { base: C.gold, light: C.goldLight, dark: C.goldDark });
}, (x, color, core) => {
  for (const u of [0, 256, 512]) { stroke(x, [[u - 70, 60], [u - 20, 100], [u - 34, 150], [u + 6, 200]], 9, color, core); stroke(x, [[u + 40, 56], [u + 72, 110], [u + 50, 190]], 8, color, core); }
  for (const u of [128, 384]) { x.fillStyle = core; x.beginPath(); x.ellipse(u, 96, 22, 40, 0, 0, TAU); x.fill(); x.fillStyle = color; x.beginPath(); x.arc(u, 178, 9, 0, TAU); x.fill(); }
});

/* ---------------- cloth paintings ---------------- */
const folds = (x, w, h, base, shade, count, seed) => {
  x.fillStyle = base; x.fillRect(0, 0, w, h); const r = random(seed);
  for (let i = 0; i < count; i++) { const cx = (i + r() * 0.7) / count * w, wide = w / count * (0.45 + r() * 0.55), g = x.createLinearGradient(cx - wide, 0, cx + wide, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, shade); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.save(); x.translate(cx, 0); x.transform(1, 0, (r() - 0.5) * 0.7, 1, 0, 0); x.translate(-cx, 0); x.fillRect(cx - wide, 0, wide * 2, h); x.restore(); }
};
const clothPaint = (base, shade, count, seed, w = 512, h = 512) => texture(w, h, x => folds(x, w, h, base, shade, count, seed));
/* a hanging panel or plate with a gold edge and a pointed end; outside the shape stays see-through */
const panelPaint = (w, h, point, fill, { shade = null, border = 16, seed = 4, ornament = 0 } = {}) => texture(w, h, x => {
  const shape = () => { x.beginPath(); x.moveTo(3, 2); x.lineTo(w - 3, 2); x.lineTo(w - 3, h * (1 - point)); x.lineTo(w / 2, h - 3); x.lineTo(3, h * (1 - point)); x.closePath(); };
  shape(); x.save(); x.clip();
  if (shade) folds(x, w, h, fill, shade, 5, seed); else { x.fillStyle = fill; x.fillRect(0, 0, w, h); engrave(x, 0, 0, w, h, { seed, count: 12, size: 30, light: C.goldLight, dark: C.goldDark }); }
  if (ornament) { x.fillStyle = C.gold; x.beginPath(); x.moveTo(0, h * (1 - ornament)); x.lineTo(w / 2, h * (1 - ornament) + h * 0.05); x.lineTo(w, h * (1 - ornament)); x.lineTo(w, h); x.lineTo(0, h); x.fill(); engrave(x, 0, h * (1 - ornament) + h * 0.05, w, h * ornament, { seed: seed + 1, count: 10, size: 18, light: C.goldLight, dark: C.goldDark }); }
  x.restore();
  shape(); x.lineJoin = 'miter'; x.strokeStyle = C.goldDark; x.lineWidth = border * 1.5; x.stroke(); x.strokeStyle = C.gold; x.lineWidth = border; x.stroke(); x.strokeStyle = C.goldLight; x.lineWidth = border * 0.25; x.stroke();
});
const cut = material => { material.alphaTest = 0.5; return material; };

const shoePaint = () => texture(256, 128, (x, w, h) => { x.fillStyle = C.maroon; x.fillRect(0, 0, w, h); trim(x, 0, 0, w, 40, { base: C.gold, light: C.goldLight, dark: C.goldDark }); x.fillStyle = C.gold; x.fillRect(w / 2 - 5, 30, 10, h); });

/* ---------------- dressing ---------------- */
export function dress(root, body){
  root.updateMatrixWorld(true);
  trousers(root, body);
  armour(root, body);
  armsAndShoulders(root, body);
  waist(root, body);
  shoes(root, body);
  head(root, body);
  root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
    if (m.name === 'MI_Superhero_Male') m.emissive = new THREE.Color(0x754600);        // the faint golden light of his skin
    if (m.name === 'MI_Hair_1') m.color = new THREE.Color(0x24140a); }); });
}

const thigh = s => s > 0 ? 'thigh_l' : 'thigh_r', calf = s => s > 0 ? 'calf_l' : 'calf_r';

function trousers(root, body){
  /* cloth next to the skin so no gap ever shows the body */
  layer(root, body, { name: 'KarnaUnderCloth', bones: /^(pelvis|spine_01|spine_02|thigh_[lr]|calf_[lr])$/, where: p => p.y > 0.14 && p.y < 1.16, inflate: p => p.y > 0.96 ? 0.011 : 0.004,
    wrap: { around: 'y', cz: -0.04, top: 1.16, bottom: 0.14 }, material: matte({ color: 0x66102a, emissive: 0x17020a }) });
  /* full maroon trousers, gathered at the ankles */
  const silk = matte({ map: clothPaint(C.maroon, C.maroonShade, 11, 21), roughness: 0.5, metalness: 0.15, emissive: 0x2c0614 });
  for (const s of [1, -1]) cloth(root, body, { name: 'KarnaTrouser' + (s > 0 ? 'L' : 'R'), cols: 56, rows: 44, closed: true, material: silk,
    at: (u, v) => { const y = mix(1.0, 0.14, v), a = u * TAU;
      const rx = table([[1.0, 0.08], [0.9, 0.096], [0.74, 0.114], [0.55, 0.12], [0.4, 0.118], [0.28, 0.1], [0.19, 0.074], [0.14, 0.062]], y);
      const rz = table([[1.0, 0.11], [0.9, 0.118], [0.74, 0.124], [0.55, 0.13], [0.4, 0.138], [0.28, 0.114], [0.19, 0.082], [0.14, 0.068]], y);
      const fold = 1 + (0.09 * Math.sin(a * 5 + y * 21 + s) + 0.05 * Math.sin(a * 2 - y * 15)) * clamp01((y - 0.16) * 6) * clamp01((1.0 - y) * 4);
      const cx = s * table([[1.0, 0.07], [0.85, 0.11], [0.5, 0.126], [0.14, 0.115]], y), cz = table([[1.0, -0.03], [0.55, -0.035], [0.35, -0.062], [0.14, -0.083]], y);
      return V(cx + Math.sin(a) * rx * fold, y, cz + Math.cos(a) * rz * fold); },
    weights: (u, v, p) => { if (p.y > 0.88) { const t = clamp01((p.y - 0.88) / 0.11); return [['pelvis', t], [thigh(s), 1 - t]]; } const k = clamp01((0.62 - p.y) / 0.16); return [[thigh(s), 1 - k], [calf(s), k]]; } });
  const cuffMat = metal({ map: goldSheet(71, 256, 64) });
  for (const s of [1, -1]) { const cuff = new THREE.Group();
    cuff.add(mesh(new THREE.CylinderGeometry(0.066, 0.062, 0.06, 28, 1, true), cuffMat));
    for (const y of [-0.03, 0.03]) { const r = mesh(new THREE.TorusGeometry(y > 0 ? 0.067 : 0.063, 0.007, 8, 32), gold({ color: 0xe9b544 }), 0, y, 0); r.rotation.x = Math.PI / 2; cuff.add(r); }
    cuff.position.set(s * 0.115, 0.155, -0.082); attach(root, calf(s), cuff); }
}

function armour(root, body){
  const torso = /^(spine_0[123]|clavicle_[lr]|neck_01|upperarm_[lr])$/, onTorso = p => Math.abs(p.x) < 0.235 && p.y > 1.01 && p.y < 1.6;
  layer(root, body, { name: 'KarnaArmour', bones: torso, where: onTorso, inflate: 0.024, wrap: { around: 'y', cz: -0.02, top: TOP, bottom: BOTTOM }, material: armourMaterial() });
  /* the gem in the middle of the sun */
  const g = new THREE.Group(), rim = gold({ color: 0xf0c04e });
  const stone = mesh(new THREE.SphereGeometry(0.03, 24, 18), ruby()); stone.scale.set(1, 1.05, 0.55); g.add(stone, mesh(new THREE.TorusGeometry(0.034, 0.0075, 10, 36), rim));
  g.position.set(0, 1.39, 0.141); g.rotation.x = -0.12; attach(root, 'spine_03', g);
  const collar = mesh(new THREE.TorusGeometry(0.088, 0.012, 8, 44), rim, 0, 1.543, -0.027); collar.rotation.x = Math.PI / 2 + 0.28; collar.scale.set(1.03, 1.05, 1); attach(root, 'spine_03', collar);
}

function armsAndShoulders(root, body){
  const wrap = (from, to) => ({ around: 'x', cy: 1.448, cz: -0.082, from, to });
  layer(root, body, { name: 'KarnaArmBands', bones: /^upperarm_/, where: p => Math.abs(p.x) > 0.27 && Math.abs(p.x) < 0.41, inflate: 0.014, wrap: wrap(0.315, 0.37), material: bandMaterial() });
  layer(root, body, { name: 'KarnaGauntlets', bones: /^(lowerarm_|hand_)/, where: p => Math.abs(p.x) > 0.43 && Math.abs(p.x) < 0.73, inflate: p => table([[0.47, 0.034], [0.57, 0.022], [0.70, 0.013]], Math.abs(p.x)), wrap: wrap(0.478, 0.692), material: gauntletMaterial() });
  const plate = metal({ map: goldSheet(83), color: 0xfff0cc, metalness: 0.55, emissive: 0x241600 }), rim = gold({ color: 0xf2c552 }), lamp = glowGold();
  const dome = (rx, ry, rz, open) => { const g = new THREE.Group(), d = mesh(new THREE.SphereGeometry(1, 28, 14, 0, TAU, 0, open), plate); d.scale.set(rx, ry, rz); g.add(d);
    const y = Math.cos(open), s = Math.sin(open); g.add(rod(Array.from({ length: 33 }, (_, i) => { const a = i / 32 * TAU; return V(Math.cos(a) * s * rx, y * ry, Math.sin(a) * s * rz); }), () => 0.011, rim, 64, 8)); return g; };
  /* a curl of raised gold on the front of a shoulder plate */
  const scroll = (s, rx, ry, rz) => rod(Array.from({ length: 30 }, (_, i) => { const t = i / 29, a = t * 7.2, r = 0.05 * (1 - t * 0.82), lift = 0.42 + Math.sin(a) * r * 5;
    const turn = s * (0.55 + Math.cos(a) * r * 8); return V(Math.sin(turn) * Math.cos(lift) * rx * 1.03, Math.sin(lift) * ry * 1.03, Math.cos(turn) * Math.cos(lift) * rz * 1.03); }), t => mix(0.01, 0.004, t), rim, 60, 8);
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const top = dome(0.122, 0.095, 0.122, 1.52); top.add(scroll(s, 0.122, 0.095, 0.122));
    const light = mesh(new THREE.SphereGeometry(0.026, 18, 12), lamp, s * 0.055, 0.075, 0.035); light.scale.set(1, 0.5, 1); light.rotation.z = -s * 0.6; top.add(light);
    top.position.set(s * 0.215, 1.505, -0.052); top.rotation.z = -s * 0.34; attach(root, 'clavicle_' + side, top);
    const low = dome(0.094, 0.09, 0.098, 1.38); low.position.set(s * 0.285, 1.458, -0.068); low.rotation.z = -s * 0.78; attach(root, 'upperarm_' + side, low);
  }
}

function waist(root, body){
  const hanging = (v, p, hold = 0.8) => { const t = clamp01(v * 1.25) * hold, left = clamp01(0.5 + p.x * 4.5); return [['pelvis', 1 - t], ['thigh_l', t * left], ['thigh_r', t * (1 - left)]]; };
  /* orange sash wound round the waist */
  const sash = matte({ map: clothPaint(C.orange, C.orangeShade, 22, 33, 512, 96), emissive: 0x6a2800, roughness: 0.6 });
  cloth(root, body, { name: 'KarnaSash', cols: 72, rows: 12, closed: true, material: sash,
    at: (u, v) => { const a = (u - 0.5) * TAU, wrinkle = 1 + 0.035 * Math.sin(v * Math.PI * 5 + a * 2); return V(Math.sin(a) * 0.19 * wrinkle, mix(1.118, 1.012, v) + 0.008 * Math.sin(a * 2), -0.03 + Math.cos(a) * 0.162 * wrinkle); },
    weights: (u, v) => [['pelvis', 0.55 + 0.45 * v], ['spine_01', 0.45 * (1 - v)]] });
  /* a sheet hanging from the hips, between two angles round the body */
  const hang = (name, from, to, top, bottom, radius, material, { cols = 14, rows = 28, hold = 0.8, flare = 0.05 } = {}) => cloth(root, body, { name, cols, rows, material,
    at: (u, v) => { const a = mix(from, to, u) * Math.PI / 180, r = radius + flare * Math.sin(v * Math.PI * 0.85); return V(Math.sin(a) * r * 1.04, mix(top, bottom, v), -0.035 + Math.cos(a) * r * 0.9 - 0.03 * v * v); },
    weights: (u, v, p) => hanging(v, p, hold) });
  /* front panels: a long maroon one with a gold point, and the shorter orange one over it */
  const front = (name, width, top, bottom, depth, material, hold) => cloth(root, body, { name, cols: 12, rows: 32, material,
    at: (u, v) => V((u - 0.5) * mix(width * 0.75, width, v), mix(top, bottom, v), depth + 0.05 * Math.sin(v * Math.PI * 0.82) - 0.02 * v + 0.008 * Math.sin(u * 13 + v * 5) * v),
    weights: (u, v, p) => hanging(v, p, hold) });
  front('KarnaPanelMaroon', 0.19, 1.03, 0.25, 0.146, cut(matte({ map: panelPaint(256, 1024, 0.13, C.maroon, { shade: C.maroonShade, border: 18, seed: 7, ornament: 0.2 }), emissive: 0x18030c })), 0.85);
  front('KarnaPanelOrange', 0.12, 1.035, 0.47, 0.166, cut(matte({ map: panelPaint(192, 768, 0.14, C.orange, { shade: C.orangeShade, border: 11, seed: 9, ornament: 0.13 }), emissive: 0x6a2a00 })), 0.85);
  /* maroon outer flaps edged with gold */
  for (const s of [1, -1]) hang('KarnaFlap' + (s > 0 ? 'L' : 'R'), s * 24, s * 66, 1.03, 0.55, 0.19, cut(matte({ map: panelPaint(192, 640, 0.3, C.maroon, { shade: C.maroonShade, border: 16, seed: 40 + s }), emissive: 0x18030c })));
  /* gold hip plates */
  for (const s of [1, -1]) hang('KarnaHipPlate' + (s > 0 ? 'L' : 'R'), s * 52, s * 118, 1.035, 0.8, 0.212, cut(metal({ map: panelPaint(256, 256, 0.26, C.gold, { border: 18, seed: 50 + s }), emissive: 0x201400, metalness: 0.55 })), { rows: 14, hold: 0.7, flare: 0.028 });
  for (const s of [1, -1]) hang('KarnaBackFlap' + (s > 0 ? 'L' : 'R'), s * 122, s * 180, 1.03, 0.66, 0.19, cut(matte({ map: panelPaint(192, 512, 0.2, C.maroon, { shade: C.maroonShade, border: 14, seed: 60 + s }), emissive: 0x18030c })));
  /* the large clasp */
  const clasp = new THREE.Group(), rim = gold({ color: 0xf2c552 }), face = metal({ map: goldSheet(91), color: 0xffedc0, emissive: 0x2a1a00 });
  const diamond = (w, h, depth, material) => { const s = new THREE.Shape(); s.moveTo(0, h); s.quadraticCurveTo(w * 0.35, h * 0.55, w, 0.01); s.quadraticCurveTo(w * 0.45, -h * 0.5, 0, -h); s.quadraticCurveTo(-w * 0.45, -h * 0.5, -w, 0.01); s.quadraticCurveTo(-w * 0.35, h * 0.55, 0, h);
    return mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 }), material); };
  clasp.add(diamond(0.062, 0.085, 0.012, rim)); const mid = diamond(0.046, 0.064, 0.008, face); mid.position.z = 0.012; clasp.add(mid); const boss = diamond(0.022, 0.034, 0.006, rim); boss.position.z = 0.022; clasp.add(boss);
  clasp.position.set(0, 1.038, 0.176); attach(root, 'pelvis', clasp);
}

function shoes(root, body){
  layer(root, body, { name: 'KarnaShoes', bones: /^(foot_|ball_|calf_)/, where: p => p.y < 0.088, inflate: 0.013, wrap: { around: 'y', cz: -0.03, top: 0.088, bottom: -0.012 }, material: matte({ map: shoePaint(), roughness: 0.45, metalness: 0.2, emissive: 0x14020a }) });
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const x = s * 0.128, curl = rod([V(x, 0.018, 0.105), V(x, 0.014, 0.15), V(x, 0.032, 0.174), V(x, 0.056, 0.168), V(x, 0.06, 0.148)], t => mix(0.026, 0.004, t), matte({ color: 0x76102e, roughness: 0.45 }), 32, 10);
    attach(root, 'ball_' + side, curl);
    attach(root, 'ball_' + side, rod([V(x, 0.036, 0.1), V(x, 0.036, 0.15), V(x, 0.05, 0.182), V(x, 0.07, 0.158)], t => mix(0.007, 0.003, t), gold({ color: 0xf0c04e }), 24, 8));
  }
}

function head(root, body){
  addCurlyHair(root, body, { strands: 90, segments: 26, sides: 4, toShoulder: true, seed: 31, curl: 0.1, bun: false, color: 0x24140a, topCap: 0.62, tube: 0.17, faceGap: 1.5 });
  const hb = boundsOf(root, body, ['Head']), R = hb.size.x / 2, cz = hb.ctr.z - 0.006, bandY = hb.box.max.y - hb.size.y * 0.27, g = new THREE.Group();
  const rim = gold({ color: 0xf2c552 }), bright = gold({ color: 0xffd568 });
  /* the tall crown: [radius, height] turned round, with raised rings between its tiers */
  const profile = [[0.113, -0.012], [0.119, 0.004], [0.11, 0.018], [0.104, 0.064], [0.113, 0.074], [0.096, 0.086], [0.077, 0.118], [0.084, 0.128], [0.066, 0.14], [0.056, 0.162], [0.066, 0.169], [0.042, 0.182], [0.034, 0.2], [0.02, 0.206], [0.028, 0.218], [0.016, 0.228], [0.001, 0.262]];
  const crown = mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 48), metal({ map: texture(1024, 256, (x, w, h) => {
    x.fillStyle = '#d8a436'; x.fillRect(0, 0, w, h); engrave(x, 0, 0, w, h, { seed: 101, count: 90, size: 15, light: C.goldLight, dark: C.goldDark, width: 2 });
    x.fillStyle = 'rgba(110,70,8,0.5)'; for (let i = 0; i < 40; i++) x.fillRect(i * w / 40, h * 0.5, 5, h * 0.22); }), color: 0xfff0c8, metalness: 0.55, emissive: 0x1e1200 }));
  crown.position.set(0, bandY, cz); crown.scale.set(1, 1.1, 1.08); g.add(crown);
  for (const [r, y, t] of [[0.12, 0.004, 0.008], [0.114, 0.074, 0.006], [0.085, 0.128, 0.0055], [0.067, 0.169, 0.005], [0.029, 0.218, 0.0045]]) { const ring = mesh(new THREE.TorusGeometry(r, t, 8, 48), rim, 0, bandY + y * 1.1, cz); ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1.08, 1); g.add(ring); }
  for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, bead = mesh(new THREE.SphereGeometry(0.0065, 8, 6), bright, Math.sin(a) * 0.119, bandY + 0.022, cz + Math.cos(a) * 0.128); g.add(bead); }
  /* leaf-shaped plates standing on the front and sides, the red jewel in the front one */
  const leaf = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w, 0); s.quadraticCurveTo(-w * 1.05, h * 0.36, -w * 0.6, h * 0.42); s.quadraticCurveTo(-w * 0.62, h * 0.68, -w * 0.28, h * 0.7); s.quadraticCurveTo(-w * 0.2, h * 0.86, 0, h); s.quadraticCurveTo(w * 0.2, h * 0.86, w * 0.28, h * 0.7); s.quadraticCurveTo(w * 0.62, h * 0.68, w * 0.6, h * 0.42); s.quadraticCurveTo(w * 1.05, h * 0.36, w, 0); s.closePath();
    return mesh(new THREE.ExtrudeGeometry(s, { depth: 0.007, bevelEnabled: true, bevelSize: 0.0025, bevelThickness: 0.0025, bevelSegments: 1 }), bright); };
  const frontZ = cz + 0.119 * 1.08;
  const main = leaf(0.08, 0.15); main.position.set(0, bandY - 0.002, frontZ + 0.004); main.rotation.x = -0.24; g.add(main);
  const jewel = mesh(new THREE.SphereGeometry(0.02, 18, 14), ruby(), 0, bandY + 0.056, frontZ + 0.004); jewel.scale.set(0.85, 1.4, 0.55); g.add(jewel);
  for (const s of [-1, 1]) { const side = leaf(0.032, 0.07); side.position.set(Math.sin(s * 1.15) * 0.116, bandY + 0.004, cz + Math.cos(1.15) * 0.126); side.rotation.y = s * 1.15; g.add(side);
    const curl = mesh(new THREE.TorusGeometry(0.019, 0.0065, 8, 22, Math.PI * 1.6), rim, s * 0.118, bandY + 0.006, cz - 0.012); curl.rotation.y = Math.PI / 2; g.add(curl); }
  /* red mark on the forehead */
  const mark = mesh(new THREE.SphereGeometry(0.005, 10, 8), matte({ color: 0xd2231a, emissive: 0x5a0600 }), 0, bandY - 0.03, cz + hb.size.z / 2 * 0.95); mark.scale.set(0.7, 2.2, 0.5); g.add(mark);
  /* glowing crescent earrings (kundala) */
  const light = glowGold();
  for (const s of [-1, 1]) { const x = s * (R + 0.014), y = bandY - 0.105;
    const hoop = mesh(new THREE.TorusGeometry(0.029, 0.0095, 10, 32, Math.PI * 1.72), light, x, y, hb.ctr.z + 0.004); hoop.rotation.set(0, s * 0.9, Math.PI / 2 + Math.PI * 0.14); g.add(hoop);
    g.add(mesh(new THREE.SphereGeometry(0.0095, 10, 8), rim, x, y + 0.036, hb.ctr.z + 0.004)); }
  attach(root, 'Head', g);
}
