/* ASHVATTHAMA - how he looks. Design description and status: design.md
   Built from the picture in pictures/: the young avenger - wild black hair in a high knot, a burning gem on his forehead,
   red war paint, dark steel armour with bronze edges under crossed studded straps, spiked layered shoulder plates,
   spiked bracers and fingerless gloves, studded leather hip guard, torn black cloth over dark red trousers, tall
   strapped boots, black-feathered arrows. Uses the shared wardrobe but changes nothing in it. */
import * as THREE from 'three';
import { boundsOf, dominantBones } from '../shared/helpers.js';
import { V, mix, clamp01, table, random, texture, engrave, metal, gold, matte, layer, cloth, attach, mesh, rod } from '../shared/wardrobe.js';
import { addHair } from './hair.js';
import { STEEL, steel, bronze, steelPaint, worn } from './metals.js';

export const skinTint = 0xf0e2dc;        // sun-darkened skin comes from the skin texture itself

const C = { leather: '#3a251a', leatherDark: '#170d08', leatherLight: '#6e4a32', red: '#5f181d', redShade: 'rgba(10,0,2,0.65)', black: '#201c21', blackShade: 'rgba(0,0,0,0.65)', bronze: '#a8823a', bronzeLight: '#f0d488', bronzeDark: '#4e3610' };
const TAU = Math.PI * 2, UP = V(0, 1, 0);
const TORSO = /^(spine_0[123]|clavicle_[lr]|neck_01|upperarm_[lr])$/;

/* ---------------- paintings ---------------- */
const folds = (x, w, h, base, shade, count, seed) => {
  x.fillStyle = base; x.fillRect(0, 0, w, h); const r = random(seed);
  for (let i = 0; i < count; i++) { const cx = (i + r() * 0.7) / count * w, wide = w / count * (0.45 + r() * 0.55), g = x.createLinearGradient(cx - wide, 0, cx + wide, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, shade); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.save(); x.translate(cx, 0); x.transform(1, 0, (r() - 0.5) * 0.6, 1, 0, 0); x.translate(-cx, 0); x.fillRect(cx - wide, 0, wide * 2, h); x.restore(); }
};
const stud = (x, cx, cy, rad) => { for (const [color, size, off] of [['#0c0a0a', 1.35, 1], ['#8d8f96', 1, 0], ['#eef0f6', 0.4, -rad * 0.3]]) { x.fillStyle = color; x.beginPath(); x.arc(cx + off, cy + off, rad * size, 0, TAU); x.fill(); } };
const leatherPaint = (seed, { w = 256, h = 128, studs = 0, rows = [0.5], stitch = true } = {}) => texture(w, h, x => {
  x.fillStyle = C.leather; x.fillRect(0, 0, w, h); worn(x, w, h, seed, Math.round(w * h / 260));
  if (stitch) { x.strokeStyle = C.leatherLight; x.lineWidth = 2; x.setLineDash([7, 7]); for (const v of [0.09, 0.91]) { x.beginPath(); x.moveTo(0, h * v); x.lineTo(w, h * v); x.stroke(); } x.setLineDash([]); }
  for (const v of rows) for (let i = 0; i < studs; i++) stud(x, (i + 0.5) * w / studs, h * v, Math.min(9, h * 0.07));
});
/* a bronze edge line: dark under, bright on top */
const edge = (x, points, wide = 8) => { for (const [color, w, dy] of [[STEEL.dark, wide + 7, 4], [C.bronze, wide, 0], [C.bronzeLight, wide * 0.28, -1.5]]) { x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(points[0][0], points[0][1] + dy); x.quadraticCurveTo(points[1][0], points[1][1] + dy, points[2][0], points[2][1] + dy); x.stroke(); } };

/* chest: painting left to right goes round the body, the middle is the front */
const TOP = 1.575, BOTTOM = 1.025, CH = { w: 1024, h: 512 }, TCZ = -0.02;
const px = deg => (deg / 360 + 0.5) * CH.w, py = y => (TOP - y) / (TOP - BOTTOM) * CH.h;
const outline = (x, drop = 0) => {
  for (let d = -180; d <= 180; d += 3) { const side = Math.abs(Math.abs(d) - 90), neck = Math.max(0, 1 - Math.min(Math.abs(d), 180 - Math.abs(d)) / 36), top = side < 34 ? mix(1.36, 1.535, side / 34) : 1.55 - 0.03 * neck * neck; d === -180 ? x.moveTo(px(d), py(top) + drop) : x.lineTo(px(d), py(top) + drop); }
};
const armourPaint = () => texture(CH.w, CH.h, x => {
  x.beginPath(); outline(x); x.lineTo(CH.w, py(1.032)); x.lineTo(0, py(1.032)); x.closePath();
  const g = x.createLinearGradient(0, 0, 0, CH.h); g.addColorStop(0, '#5d626c'); g.addColorStop(0.4, '#6b707b'); g.addColorStop(0.62, '#383b43'); g.addColorStop(1, '#4a4e57'); x.fillStyle = g; x.fill(); x.save(); x.clip();
  worn(x, CH.w, CH.h, 821, 800);
  /* engraved collar panel, front and back */
  for (const mid of [0, 180, -180]) { x.save(); x.beginPath(); x.moveTo(px(mid - 40), py(1.55)); x.lineTo(px(mid + 40), py(1.55)); x.quadraticCurveTo(px(mid + 22), py(1.47), px(mid), py(1.45)); x.quadraticCurveTo(px(mid - 22), py(1.47), px(mid - 40), py(1.55)); x.closePath(); x.fillStyle = '#45474f'; x.fill(); x.clip();
    engrave(x, px(mid - 40), py(1.55), px(80) - px(0), py(1.45) - py(1.55), { seed: 822, count: 34, size: 15, light: '#a9adb8', dark: '#14151a', width: 2 }); x.restore();
    edge(x, [[px(mid - 40), py(1.55)], [px(mid - 22), py(1.47)], [px(mid), py(1.45)]], 6); edge(x, [[px(mid + 40), py(1.55)], [px(mid + 22), py(1.47)], [px(mid), py(1.45)]], 6); }
  for (const s of [-1, 1]) {
    edge(x, [[px(0), py(1.315)], [px(s * 34), py(1.30)], [px(s * 68), py(1.39)]], 9);             // under the breast plates
    edge(x, [[px(0), py(1.255)], [px(s * 30), py(1.245)], [px(s * 74), py(1.30)]], 7);
    edge(x, [[px(0), py(1.185)], [px(s * 34), py(1.20)], [px(s * 74), py(1.245)]], 7);
    edge(x, [[px(0), py(1.115)], [px(s * 30), py(1.15)], [px(s * 72), py(1.17)]], 5);
    edge(x, [[px(s * 108), py(1.31)], [px(s * 142), py(1.24)], [px(s * 176), py(1.30)]], 7);
    edge(x, [[px(s * 108), py(1.20)], [px(s * 142), py(1.14)], [px(s * 176), py(1.19)]], 6);
  }
  x.save(); x.beginPath(); x.rect(px(-24), py(1.17), px(48) - px(0), py(1.07) - py(1.17)); x.clip(); x.fillStyle = '#3c3e46'; x.fill();
  engrave(x, px(-24), py(1.17), px(48) - px(0), py(1.07) - py(1.17), { seed: 823, count: 40, size: 17, light: '#979ba6', dark: '#101115', width: 2 }); x.restore();
  edge(x, [[px(-24), py(1.08)], [px(-22), py(1.15)], [px(-4), py(1.18)]], 4); edge(x, [[px(24), py(1.08)], [px(22), py(1.15)], [px(4), py(1.18)]], 4);
  x.restore(); x.strokeStyle = C.bronze; x.lineWidth = 11; x.beginPath(); outline(x, 6); x.stroke(); x.strokeStyle = C.bronzeLight; x.lineWidth = 3; x.beginPath(); outline(x, 4); x.stroke();
});

/* the two crossed straps, as [x, height] across the body */
const STRAP = t => ({ x: mix(0.135, -0.165, t), y: table([[0, 1.54], [0.18, 1.475], [0.46, 1.385], [0.75, 1.31], [1, 1.255]], t) });
const strapPaint = surface => texture(CH.w, CH.h, x => {
  for (const face of [1, -1]) for (const s of [1, -1]) {
    const pts = Array.from({ length: 33 }, (_, i) => { const p = STRAP(i / 32), sx = p.x * s, z = surface(sx, p.y, face), deg = Math.atan2(sx, z - TCZ) * 180 / Math.PI; return [px(deg), py(p.y)]; });
    for (const [color, wide] of [[C.leatherDark, 50], ['#46291b', 40], ['#5e3c28', 5]]) { x.strokeStyle = color; x.lineWidth = wide; x.lineCap = 'butt'; x.lineJoin = 'round'; x.beginPath(); pts.forEach(([a, b], i) => i && Math.abs(a - pts[i - 1][0]) < CH.w / 2 ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); }
  }
});
const bandPaint = () => leatherPaint(831, { w: 512, h: 64, studs: 14 });
const bracerPaint = () => texture(512, 256, (x, w, h) => {
  x.fillStyle = C.black; x.fillRect(0, 4, w, h - 8); worn(x, w, h, 841, 260);
  /* leather wraps with studs */
  for (const v of [0.24, 0.62, 0.86]) { x.fillStyle = C.leatherDark; x.fillRect(0, h * v - 18, w, 36); x.fillStyle = C.leather; x.fillRect(0, h * v - 13, w, 26); for (let i = 0; i < 16; i++) stud(x, (i + 0.5) * w / 16, h * v, 6); }
  /* the steel plate over the outer side */
  const plate = () => { x.beginPath(); x.moveTo(w * 0.27, 6); x.lineTo(w * 0.73, 6); x.quadraticCurveTo(w * 0.66, h * 0.5, w * 0.62, h - 22); x.quadraticCurveTo(w * 0.5, h + 8, w * 0.38, h - 22); x.quadraticCurveTo(w * 0.34, h * 0.5, w * 0.27, 6); x.closePath(); };
  plate(); const g = x.createLinearGradient(w * 0.27, 0, w * 0.73, 0); g.addColorStop(0, '#3f434b'); g.addColorStop(0.5, '#8a909c'); g.addColorStop(1, '#3f434b'); x.fillStyle = g; x.fill(); x.save(); x.clip(); worn(x, w, h, 842, 400); x.restore();
  plate(); x.strokeStyle = C.bronze; x.lineWidth = 13; x.stroke(); plate(); x.strokeStyle = C.bronzeLight; x.lineWidth = 3; x.stroke();
});
const bootPaint = () => texture(512, 512, (x, w, h) => {
  x.fillStyle = '#251c19'; x.fillRect(0, 0, w, h); worn(x, w, h, 851, 700); const r = random(852);
  for (const [v, tilt] of [[0.13, 22], [0.27, -18], [0.42, 14], [0.7, -10], [0.8, 8]]) for (const half of [0, 1]) { const y = h * v, a = half * w / 2, d = tilt * (half ? -1 : 1);
    for (const [color, wide] of [['#0b0807', 30], ['#3a2a22', 22], ['#57402f', 3]]) { x.strokeStyle = color; x.lineWidth = wide; x.beginPath(); x.moveTo(a - 6, y - d); x.lineTo(a + w / 2 + 6, y + d); x.stroke(); } stud(x, a + r() * 30 + 100, y, 5); }
});
/* cloth with ragged lower and side edges and a few holes (clear paint = no cloth) */
const tornPaint = (base, shade, seed) => texture(256, 512, (x, w, h) => {
  folds(x, w, h, base, shade, 6, seed); const r = random(seed + 1);
  x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
  x.beginPath(); x.moveTo(-4, h + 4); for (let a = -4; a <= w + 24; a += 20) { x.lineTo(a, h - 20 - r() * 120); x.lineTo(a + 10, h - r() * 30); } x.lineTo(w + 4, h + 4); x.closePath(); x.fill();
  for (const side of [0, w]) { x.beginPath(); x.moveTo(side, h * 0.3); for (let y = h * 0.3; y <= h; y += 34) { x.lineTo(side + (side ? -1 : 1) * r() * 34, y + 12); x.lineTo(side, y + 30); } x.closePath(); x.fill(); }
  for (let i = 0; i < 16; i++) { x.beginPath(); x.ellipse(24 + r() * (w - 48), h * 0.4 + r() * h * 0.5, 2 + r() * 8, 5 + r() * 18, r() - 0.5, 0, TAU); x.fill(); }
  x.globalCompositeOperation = 'source-over';
});
const ragged = (base, shade, seed) => { const m = matte({ map: tornPaint(base, shade, seed), roughness: 0.9, emissive: 0x0f0b10 }); m.alphaTest = 0.5; return m; };

/* ---------------- dressing ---------------- */
export function dress(root, body){
  root.updateMatrixWorld(true);
  const surface = skinDepth(root, body);
  trousers(root, body);
  armour(root, body, surface);
  armsAndShoulders(root, body);
  waist(root, body);
  tasset(root, body);
  boots(root, body);
  face(root, body);
  addHair(root, body);
  quiver(root);
  root.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.name === 'MI_Hair_1') m.color = new THREE.Color(0x120c0a); }); });
}

/* how far forward (face 1) or back (face -1) the torso reaches at [x, y] */
function skinDepth(root, body){
  const dom = dominantBones(body), pos = body.geometry.attributes.position, points = [], v = V();
  for (let i = 0; i < pos.count; i++) if (TORSO.test(dom[i])) { v.fromBufferAttribute(pos, i); body.localToWorld(v); root.worldToLocal(v); points.push(v.clone()); }
  return (x, y, face) => { for (let near = 0.025; ; near *= 1.6) { let best = null; for (const p of points) if (Math.abs(p.x - x) < near && Math.abs(p.y - y) < near && (best === null || p.z * face > best * face)) best = p.z; if (best !== null) return best; } };
}

const thigh = s => s > 0 ? 'thigh_l' : 'thigh_r', calf = s => s > 0 ? 'calf_l' : 'calf_r';
const hanging = (v, p, hold = 0.8) => { const t = clamp01(v * 1.25) * hold, left = clamp01(0.5 + p.x * 4.5); return [['pelvis', 1 - t], ['thigh_l', t * left], ['thigh_r', t * (1 - left)]]; };
/* a cone whose point shows outwards */
function spike(at, towards, long, wide, material){ const dir = towards.clone().normalize(), c = mesh(new THREE.ConeGeometry(wide, long, 12), material); c.position.copy(at).addScaledVector(dir, long / 2 - 0.006); c.quaternion.setFromUnitVectors(UP, dir); return c; }

function trousers(root, body){
  layer(root, body, { name: 'AshvaUnderCloth', bones: /^(pelvis|spine_01|spine_02|thigh_[lr]|calf_[lr])$/, where: p => p.y > 0.42 && p.y < 1.16, inflate: p => p.y > 0.96 ? 0.011 : 0.004,
    wrap: { around: 'y', cz: -0.04, top: 1.16, bottom: 0.42 }, material: matte({ color: 0x431015, roughness: 0.9, emissive: 0x150304 }) });
  const red = matte({ map: texture(512, 512, (x, w, h) => folds(x, w, h, C.red, C.redShade, 11, 861)), roughness: 0.85, emissive: 0x1c0607 });
  for (const s of [1, -1]) cloth(root, body, { name: 'AshvaTrouser' + (s > 0 ? 'L' : 'R'), cols: 56, rows: 40, closed: true, material: red,
    at: (u, v) => { const y = mix(1.0, 0.435, v), a = u * TAU;
      const rx = table([[1.0, 0.082], [0.9, 0.102], [0.76, 0.116], [0.62, 0.115], [0.54, 0.108], [0.48, 0.075], [0.435, 0.062]], y);
      const rz = table([[1.0, 0.113], [0.9, 0.125], [0.76, 0.135], [0.62, 0.13], [0.54, 0.12], [0.48, 0.088], [0.435, 0.072]], y);
      const fold = 1 + (0.09 * Math.sin(a * 6 + y * 22 + s) + 0.055 * Math.sin(a * 3 - y * 15)) * clamp01((y - 0.45) * 9) * clamp01((1.0 - y) * 4);
      const cx = s * table([[1.0, 0.07], [0.85, 0.108], [0.435, 0.12]], y), cz = table([[1.0, -0.03], [0.62, -0.035], [0.435, -0.055]], y);
      return V(cx + Math.sin(a) * rx * fold, y, cz + Math.cos(a) * rz * fold); },
    weights: (u, v, p) => { if (p.y > 0.88) { const t = clamp01((p.y - 0.88) / 0.11); return [['pelvis', t], [thigh(s), 1 - t]]; } const k = clamp01((0.62 - p.y) / 0.14); return [[thigh(s), 1 - k], [calf(s), k]]; } });
}

function armour(root, body, surface){
  const onTorso = p => Math.abs(p.x) < 0.235 && p.y > 1.01 && p.y < 1.6, wrap = { around: 'y', cz: TCZ, top: TOP, bottom: BOTTOM };
  const bump = (v, middle, width) => Math.exp(-Math.pow((v - middle) / width, 2));
  const plate = p => 0.024 + (p.z > 0 ? (0.021 * bump(p.y, 1.25, 0.062) * clamp01((0.19 - Math.abs(p.x)) * 16) + 0.011 * bump(p.x, 0, 0.034) * bump(p.y, 1.35, 0.075)) : 0);       // one smooth shell: bridge the hollows of the chest
  layer(root, body, { name: 'AshvaArmour', bones: TORSO, where: onTorso, inflate: plate, wrap, material: steel({ map: armourPaint(), color: 0xe4e4e8, roughness: 0.52, metalness: 0.55 }) });
  layer(root, body, { name: 'AshvaStraps', bones: TORSO, where: onTorso, inflate: p => plate(p) + 0.014, wrap, material: matte({ map: strapPaint(surface), roughness: 0.7, emissive: 0x160b07 }) });
  /* steel studs along the straps and bronze rings where they meet */
  const g = new THREE.Group(), knob = steel({ color: 0x8c919d }), brass = bronze();
  const at = (x, y, out) => V(x, y, surface(x, y, 1) + out);
  for (const s of [1, -1]) for (const t of [0.14, 0.26, 0.37, 0.58, 0.69, 0.8, 0.91]) { const p = STRAP(t), dome = mesh(new THREE.SphereGeometry(0.0062, 10, 8), knob); dome.position.copy(at(p.x * s, p.y, plate(at(p.x * s, p.y, 0)) + 0.016)); g.add(dome); }
  for (const [x, y] of [[0, STRAP(0.45).y], [0.115, 1.512], [-0.115, 1.512]]) { const ring = mesh(new THREE.TorusGeometry(0.018, 0.0052, 8, 24), brass); ring.position.copy(at(x, y, plate(at(x, y, 0)) + 0.02)); g.add(ring); }
  attach(root, 'spine_03', g);
  const collar = mesh(new THREE.TorusGeometry(0.083, 0.006, 8, 44), brass, 0, 1.548, -0.022); collar.rotation.x = Math.PI / 2 + 0.34; attach(root, 'spine_03', collar);
}

function armsAndShoulders(root, body){
  const wrap = (from, to) => ({ around: 'x', cy: 1.448, cz: -0.082, from, to });
  layer(root, body, { name: 'AshvaArmBands', bones: /^upperarm_[lr]$/, where: p => Math.abs(p.x) > 0.325 && Math.abs(p.x) < 0.405, inflate: 0.012, wrap: wrap(0.335, 0.395), material: matte({ map: bandPaint(), roughness: 0.7, emissive: 0x160b07 }) });
  layer(root, body, { name: 'AshvaBracers', bones: /^(lowerarm_|hand_)/, where: p => Math.abs(p.x) > 0.43 && Math.abs(p.x) < 0.7, inflate: p => table([[0.47, 0.027], [0.57, 0.019], [0.70, 0.013]], Math.abs(p.x)), wrap: wrap(0.485, 0.675), material: steel({ map: bracerPaint(), color: 0xd0d5e0, metalness: 0.55 }) });
  layer(root, body, { name: 'AshvaGloves', bones: /^(hand_|lowerarm_|(thumb|index|middle|ring|pinky)_0[12]_)/, where: p => Math.abs(p.x) > 0.655 && Math.abs(p.x) < 0.775, inflate: 0.0045, wrap: wrap(0.655, 0.775), material: matte({ color: 0x1d1514, roughness: 0.75, emissive: 0x050303 }) });
  const iron = steel({ color: 0x9aa0ac }), rim = bronze(), plateSteel = steel({ map: steelPaint(871), color: 0xdfe4ee });
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    for (const [x, tall] of [[0.525, 0.062], [0.6, 0.05]]) attach(root, 'lowerarm_' + side, spike(V(s * x, 1.448 + (x < 0.56 ? 0.058 : 0.05), -0.082), V(s * 0.25, 1, 0.1), tall, 0.012, iron));
    /* three overlapping shoulder plates, each with a bronze rim, the upper ones spiked */
    for (const [bone, x, y, z, w, h, d, lean, spikes] of [
      ['clavicle_', 0.212, 1.528, -0.055, 0.112, 0.082, 0.122, 0.3, [[0.15, 1, 0.35], [0.75, 0.8, -0.1], [-0.1, 0.9, -0.55]]],
      ['upperarm_', 0.268, 1.49, -0.07, 0.096, 0.07, 0.118, 0.58, [[0.55, 0.55, 0.65]]],
      ['upperarm_', 0.315, 1.462, -0.076, 0.075, 0.056, 0.098, 0.82, []]]) {
      const plate = new THREE.Group(), reach = 1.45, dome = mesh(new THREE.SphereGeometry(1, 28, 14, 0, TAU, 0, reach), plateSteel); dome.scale.set(w, h, d); plate.add(dome);
      const low = Math.cos(reach), ring = Math.sin(reach), lip = a => V(Math.cos(a) * ring * w, low * h, Math.sin(a) * ring * d);
      plate.add(rod(Array.from({ length: 33 }, (_, i) => lip(i / 32 * TAU)), () => 0.0095, rim, 64, 8));
      for (let i = 0; i < 10; i++) { const knob = mesh(new THREE.SphereGeometry(0.0062, 8, 6), iron); knob.position.copy(lip(i / 10 * TAU + 0.2)).multiplyScalar(1.0).add(V(0, 0.017, 0)).multiply(V(0.99, 1, 0.99)); plate.add(knob); }
      for (const [dx, dy, dz] of spikes) { const n = V(s * dx, dy, dz).normalize(), p = V(n.x * w, n.y * h, n.z * d); plate.add(spike(p, n, 0.068, 0.017, iron)); const foot = mesh(new THREE.TorusGeometry(0.018, 0.0045, 6, 16), rim); foot.position.copy(p); foot.quaternion.setFromUnitVectors(V(0, 0, 1), n); plate.add(foot); }
      plate.position.set(s * x, y, z); plate.rotation.z = -s * lean; attach(root, bone + side, plate);
    }
  }
}

function waist(root, body){
  const ring = (name, top, bottom, rx, rz, material, twist = 0) => cloth(root, body, { name, cols: 72, rows: 8, closed: true, material,
    at: (u, v) => { const a = (u - 0.5) * TAU, k = 1 + twist * Math.sin(v * Math.PI * 5 + a * 3); return V(Math.sin(a) * rx * k, mix(top, bottom, v) + twist * 0.25 * Math.sin(a * 2 + 1), -0.03 + Math.cos(a) * rz * k); },
    weights: (u, v) => [['pelvis', 0.55 + 0.45 * v], ['spine_01', 0.45 * (1 - v)]] });
  ring('AshvaRedFold', 1.128, 1.075, 0.186, 0.159, matte({ map: texture(512, 64, (x, w, h) => folds(x, w, h, C.red, C.redShade, 30, 881)), roughness: 0.9, emissive: 0x0a0202 }), 0.035);
  ring('AshvaSash', 1.05, 0.955, 0.2, 0.173, matte({ map: texture(512, 128, (x, w, h) => folds(x, w, h, C.black, C.blackShade, 24, 882)), roughness: 0.9, emissive: 0x050405 }), 0.04);
  ring('AshvaBelt', 1.092, 1.038, 0.203, 0.177, matte({ map: texture(1024, 64, (x, w, h) => { x.fillStyle = C.leather; x.fillRect(0, 0, w, h); worn(x, w, h, 883, 300); x.strokeStyle = C.leatherLight; x.lineWidth = 2; x.setLineDash([8, 8]); for (const y of [9, h - 9]) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); } x.setLineDash([]); for (let i = 0; i < 6; i++) stud(x, w * 0.57 + i * 22, h / 2, 4); }), roughness: 0.7, emissive: 0x160b07 }));
  const g = new THREE.Group(), brass = bronze();
  g.add(rod([V(-0.047, 1.092, 0.15), V(0, 1.095, 0.157), V(0.047, 1.092, 0.15), V(0.052, 1.065, 0.15), V(0.047, 1.038, 0.15), V(0, 1.035, 0.157), V(-0.047, 1.038, 0.15), V(-0.052, 1.065, 0.15), V(-0.047, 1.092, 0.15)], () => 0.0085, brass, 64, 8),
    rod([V(-0.048, 1.065, 0.156), V(0, 1.066, 0.163), V(0.036, 1.063, 0.158)], () => 0.0055, brass, 16, 8));
  attach(root, 'pelvis', g);
  /* torn cloth hanging from the belt: [middle x, bottom, top width, bottom width, depth, sideways drift] */
  const strip = (name, x, bottom, narrow, wide, depth, drift, material, top = 1.03) => cloth(root, body, { name, cols: 12, rows: 30, material,
    at: (u, v) => V(x + drift * v * v + (u - 0.5) * mix(narrow, wide, v), mix(top, bottom, v), depth + 0.055 * Math.sin(v * Math.PI * 0.8) * Math.sign(depth) + 0.014 * Math.sin(u * 13 + v * 7) * v),
    weights: (u, v, p) => hanging(v, p, 0.85) });
  strip('AshvaTornRed', -0.005, 0.5, 0.11, 0.17, 0.155, 0.0, ragged('#33121a', C.blackShade, 891));
  strip('AshvaTornFront', -0.055, 0.36, 0.07, 0.13, 0.168, -0.012, ragged(C.black, C.blackShade, 893));
  strip('AshvaTornShort', 0.062, 0.56, 0.055, 0.085, 0.176, 0.015, ragged('#2a2429', C.blackShade, 895));
  strip('AshvaTornBack', 0.0, 0.46, 0.17, 0.25, -0.215, 0.0, ragged(C.black, C.blackShade, 897));
  /* the long tails streaming from his right hip */
  for (const [name, bottom, out, z, seed] of [['AshvaTailLong', 0.46, -0.2, -0.04, 901], ['AshvaTailShort', 0.62, -0.13, 0.04, 903]]) cloth(root, body, { name, cols: 10, rows: 28, material: ragged(C.black, C.blackShade, seed),
    at: (u, v) => V(-0.2 - 0.045 * Math.sin(v * Math.PI * 0.6) + out * v * v + (u - 0.5) * mix(0.03, 0.06, v), mix(1.02, bottom, v) + (u - 0.5) * 0.09 * v, z - 0.06 * v + (u - 0.5) * mix(0.05, 0.12, v) + 0.015 * Math.sin(v * 11)),
    weights: (u, v) => { const t = clamp01(v * 1.2) * 0.55; return [['pelvis', 1 - t], ['thigh_r', t]]; } });
}

/* overlapping studded leather plates guarding his left hip */
function tasset(root, body){
  const hide = matte({ map: leatherPaint(911, { w: 512, h: 128, studs: 7, rows: [0.36, 0.72] }), roughness: 0.72, emissive: 0x160b07 });
  for (let k = 0; k < 4; k++) cloth(root, body, { name: 'AshvaTasset' + k, cols: 24, rows: 6, material: hide,
    at: (u, v) => { const a = mix(22, 128, u) * Math.PI / 180, y = mix(1.025 - k * 0.083, 0.915 - k * 0.083, v) - 0.014 * Math.sin(u * Math.PI) * v, out = 1 + 0.02 * k + 0.03 * v;
      return V(Math.sin(a) * mix(0.228, 0.248, k / 3) * out, y, -0.032 + Math.cos(a) * mix(0.186, 0.205, k / 3) * out); },
    weights: (u, v, p) => { const t = clamp01((1.0 - p.y) / 0.2) * 0.85; return [['pelvis', 1 - t], ['thigh_l', t]]; } });
}

function boots(root, body){
  const hide = matte({ map: bootPaint(), roughness: 0.68, emissive: 0x130d0b });
  layer(root, body, { name: 'AshvaBootShaft', bones: /^(calf_|foot_|ball_)/, where: p => p.y < 0.5, inflate: 0.014, wrap: { around: 'y', cz: -0.05, top: 0.5, bottom: -0.012 }, material: hide });
  const last = [[-0.153, 0.121, 0.008, 0.055, 0.014], [-0.14, 0.121, 0.032, 0.09, -0.01], [-0.105, 0.122, 0.047, 0.115, -0.014], [-0.055, 0.123, 0.054, 0.128, -0.014], [-0.012, 0.129, 0.059, 0.108, -0.014],
    [0.03, 0.134, 0.065, 0.084, -0.015], [0.07, 0.132, 0.065, 0.067, -0.016], [0.108, 0.123, 0.057, 0.056, -0.014], [0.14, 0.118, 0.045, 0.05, -0.012], [0.162, 0.117, 0.028, 0.044, -0.008], [0.172, 0.117, 0.003, 0.02, 0.004]];
  const round = c => Math.sign(c) * Math.pow(Math.abs(c), 0.62), leather = matte({ color: 0x251c19, roughness: 0.6, emissive: 0x130d0b }), sole = matte({ color: 0x0e0a09, roughness: 0.9 }), cuffHide = matte({ color: 0x1b1311, roughness: 0.75, emissive: 0x050303 });
  for (const [side, s] of [['l', 1], ['r', -1]]) {
    const blend = p => { const toe = clamp01(p.z / 0.07); return [['foot_' + side, 1 - toe], ['ball_' + side, toe]]; };
    cloth(root, body, { name: 'AshvaBoot_' + side, cols: 32, rows: 40, closed: true, material: leather,
      at: (u, v) => { const t = v * (last.length - 1), i = Math.min(last.length - 2, Math.floor(t)), k = t - i, m = n => mix(last[i][n], last[i + 1][n], k), a = u * TAU, top = m(3), low = m(4);
        return V(s * (m(1) + m(2) * round(Math.cos(a))), (top + low) / 2 + (top - low) / 2 * round(Math.sin(a)), m(0)); }, weights: (u, v, p) => blend(p) });
    cloth(root, body, { name: 'AshvaSole_' + side, cols: 32, rows: 30, closed: true, material: sole,
      at: (u, v) => { const t = 0.4 + v * (last.length - 1.8), i = Math.min(last.length - 2, Math.floor(t)), k = t - i, m = n => mix(last[i][n], last[i + 1][n], k), a = u * TAU;
        return V(s * (m(1) + (m(2) + 0.005) * round(Math.cos(a))), -0.009 + 0.011 * round(Math.sin(a)), m(0)); }, weights: (u, v, p) => blend(p) });
    /* turned-over cuff at the top of the boot */
    cloth(root, body, { name: 'AshvaCuff_' + side, cols: 40, rows: 6, closed: true, material: cuffHide,
      at: (u, v) => { const a = u * TAU, puff = 1 + 0.07 * Math.sin(v * Math.PI); return V(s * 0.12 + Math.sin(a) * 0.077 * puff, mix(0.515, 0.45, v), -0.053 + Math.cos(a) * 0.089 * puff); },
      weights: () => [['calf_' + side, 1]] });
  }
}

/* the burning gem on his brow and the red war paint */
function face(root, body){
  const FT = 1.79, FB = 1.6, fx = d => (d / 360 + 0.5) * 1024, fy = y => (FT - y) / (FT - FB) * 512;
  const marks = texture(1024, 512, x => {
    x.clearRect(0, 0, 1024, 512);
    const slash = (a, b, c, wide) => { x.fillStyle = '#6e1510'; x.beginPath(); x.moveTo(fx(a[0]), fy(a[1])); x.quadraticCurveTo(fx(b[0]) - wide, fy(b[1]), fx(c[0]), fy(c[1])); x.quadraticCurveTo(fx(b[0]) + wide, fy(b[1]), fx(a[0]), fy(a[1])); x.fill(); };
    for (const s of [-1, 1]) { slash([s * 17, 1.682], [s * 22, 1.657], [s * 23, 1.628], 8); slash([s * 31, 1.684], [s * 38, 1.662], [s * 41, 1.64], 6); slash([s * 4, 1.757], [s * 9, 1.772], [s * 17, 1.779], 6); slash([s * 6, 1.74], [s * 14, 1.741], [s * 24, 1.752], 5); }
  });
  const paint = matte({ map: marks, roughness: 0.7, emissive: 0x1a0402 });
  layer(root, body, { name: 'AshvaWarPaint', bones: /^Head$/, where: p => p.z > 0.02 && p.y > FB && p.y < FT, inflate: 0.0016, wrap: { around: 'y', cz: 0.0, top: FT, bottom: FB }, material: paint });
  const g = new THREE.Group(), fire = new THREE.MeshStandardMaterial({ color: 0xff7a18, emissive: 0xff4a00, emissiveIntensity: 1.5, roughness: 0.2 });
  const y = 1.745, z = 0.1005;
  const gem = mesh(new THREE.OctahedronGeometry(1, 0), fire, 0, y, z); gem.scale.set(0.0095, 0.019, 0.006); g.add(gem);
  g.add(rod([V(0, y + 0.023, z - 0.002), V(0.012, y, z), V(0, y - 0.023, z), V(-0.012, y, z), V(0, y + 0.023, z - 0.002)], () => 0.0022, matte({ color: 0xb01808, emissive: 0x700a00 }), 32, 6));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture(128, 128, (x, w) => { const r = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,230,150,1)'); r.addColorStop(0.25, 'rgba(255,110,20,0.65)'); r.addColorStop(1, 'rgba(255,30,0,0)'); x.fillStyle = r; x.fillRect(0, 0, w, w); }), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.position.set(0, y, z + 0.012); halo.scale.set(0.075, 0.085, 1); g.add(halo);
  attach(root, 'Head', g);
}

function quiver(root){
  const q = new THREE.Group(), leather = matte({ color: 0x2c1d16, roughness: 0.72, emissive: 0x080403 }), brass = bronze(), iron = steel({ color: 0xaab0bc }), r = random(921);
  q.add(mesh(new THREE.CylinderGeometry(0.082, 0.052, 0.56, 24, 1, true), leather), mesh(new THREE.CircleGeometry(0.052, 24).rotateX(Math.PI / 2), leather, 0, -0.28, 0), mesh(new THREE.CylinderGeometry(0.09, 0.086, 0.055, 24, 1, true), leather, 0, 0.262, 0));
  for (const [y, rad, m] of [[0.29, 0.091, brass], [0.232, 0.084, brass], [-0.1, 0.065, leather], [-0.272, 0.054, brass]]) { const ring = mesh(new THREE.TorusGeometry(rad, 0.007, 8, 32), m, 0, y, 0); ring.rotation.x = Math.PI / 2; q.add(ring); }
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, knob = mesh(new THREE.SphereGeometry(0.0065, 8, 6), iron, Math.cos(a) * 0.089, 0.262, Math.sin(a) * 0.089); q.add(knob); }
  const wood = matte({ color: 0x3c2a20 }), feather = matte({ color: 0x2b2a31, emissive: 0x0b0a0e, roughness: 0.65 }), vane = new THREE.Shape();
  vane.moveTo(0, -0.066); vane.lineTo(0.019, -0.045); vane.lineTo(0.016, 0.038); vane.lineTo(0, 0.07); vane.lineTo(-0.016, 0.038); vane.lineTo(-0.019, -0.045); vane.closePath();
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, arrow = new THREE.Group(), lean = 0.05 + r() * 0.13, off = i % 2 ? 0.052 : 0.025, high = r() * 0.04;
    arrow.add(mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.38 + high, 6), wood, 0, 0.18 + high / 2, 0), mesh(new THREE.CylinderGeometry(0.0068, 0.0068, 0.022, 8), brass, 0, 0.23 + high, 0));
    for (let k = 0; k < 3; k++) { const f = mesh(new THREE.ShapeGeometry(vane), feather, 0, 0.32 + high, 0); f.rotation.y = k * Math.PI / 3 + a; arrow.add(f); }
    arrow.position.set(Math.cos(a) * off, 0.2, Math.sin(a) * off); arrow.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean); q.add(arrow); }
  q.position.set(0.09, 1.34, -0.245); q.rotation.set(-0.06, 0, -0.52); attach(root, 'spine_03', q);
}
