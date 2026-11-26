/* DRONA's grey hair: painted to the shape of his head (hairline, sideburns, jaw), tied into a top-knot with cord,
   loose locks flowing down the back. */
import * as THREE from 'three';
import { boundsOf } from '../shared/helpers.js';
import { V, mix, table, random, texture, matte, layer, attach, mesh, rod } from '../shared/wardrobe.js';

const TOP = 1.83, BOTTOM = 1.56, W = 1024, H = 512;
const px = deg => (deg / 360 + 0.5) * W, py = y => (TOP - y) / (TOP - BOTTOM) * H;
/* [degrees from the nose, height]: the lowest edge of the hair on the head */
const HAIRLINE = [[0, 1.781], [16, 1.787], [32, 1.781], [48, 1.754], [60, 1.727], [74, 1.713], [88, 1.72], [100, 1.716], [108, 1.685], [122, 1.65], [145, 1.628], [180, 1.62]];
/* sideburns running down into the short beard along the jaw: upper edge, then lower edge */
const JAW_TOP = [[18, 1.604], [34, 1.616], [48, 1.63], [58, 1.65], [63, 1.675], [63, 1.73]];
const JAW_LOW = [[83, 1.73], [82, 1.66], [75, 1.61], [58, 1.58], [34, 1.564], [18, 1.563]];

const paint = () => texture(W, H, x => {
  const r = random(662);
  const area = () => { x.beginPath();
    x.moveTo(0, 0); x.lineTo(W, 0);
    for (let d = 180; d >= -180; d -= 3) x.lineTo(px(d), py(table(HAIRLINE, Math.abs(d))));
    x.closePath();
    for (const s of [1, -1]) { const ring = [...JAW_TOP, ...JAW_LOW]; if (s < 0) ring.reverse(); ring.forEach(([d, y], i) => i ? x.lineTo(px(s * d), py(y)) : x.moveTo(px(s * d), py(y))); x.closePath(); }
  };
  x.fillStyle = '#b6babf'; area(); x.fill();
  const strand = (sx, sy, dx, dy, wide, color) => { x.strokeStyle = color; x.lineWidth = wide; x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + dx * 0.3, sy + dy * 0.55, sx + dx, sy + dy); x.stroke(); };
  const tone = () => { const t = r(); return t < 0.4 ? 'rgba(244,246,249,0.9)' : t < 0.7 ? 'rgba(205,208,214,0.9)' : 'rgba(92,96,106,0.65)'; };
  x.save(); area(); x.clip(); x.lineCap = 'round';
  for (let i = 0; i < 1500; i++) { const sx = r() * W, sy = r() * H, side = (sx / W - 0.5) * 2; strand(sx, sy, side * 85 * r(), -(30 + r() * 90), 1 + r() * 2.2, tone()); }
  /* a soft shadow just above the hairline gives the swept-back hair some depth */
  x.strokeStyle = 'rgba(70,66,70,0.32)'; x.lineWidth = 14; x.beginPath(); for (let d = -60; d <= 60; d += 3) { const y = py(table(HAIRLINE, Math.abs(d))) - 4; d === -60 ? x.moveTo(px(d), y) : x.lineTo(px(d), y); } x.stroke();
  x.restore();
  /* single hairs breaking the edge, so it does not end in a hard line */
  x.lineCap = 'round';
  for (let i = 0; i < 260; i++) { const d = (r() - 0.5) * 360, y = table(HAIRLINE, Math.abs(d)); strand(px(d), py(y) + (Math.abs(d) < 65 ? r() * 2 : 4 + r() * 5), (d / 180) * 26, -(12 + r() * 18), 0.9 + r(), tone()); }
  for (let i = 0; i < 120; i++) { const s = r() < 0.5 ? 1 : -1, k = r() * (JAW_LOW.length - 2), n = Math.floor(k), [a, b] = [JAW_LOW[n + 1], JAW_LOW[n + 2] || JAW_LOW[n + 1]], d = mix(a[0], b[0], k - n), y = mix(a[1], b[1], k - n); strand(px(s * d), py(y) - 8, s * (r() - 0.5) * 8, 10 + r() * 12, 1.2 + r(), tone()); }
});

export function addHair(root, body){
  layer(root, body, { name: 'DronaScalp', bones: /^(Head|neck_01)$/, where: p => p.y > BOTTOM, inflate: p => p.y > 1.73 ? 0.0075 : 0.0045,
    wrap: { around: 'y', cz: 0.0, top: TOP, bottom: BOTTOM }, material: matte({ map: paint(), emissive: 0x131416, roughness: 0.72 }) });
  const hb = boundsOf(root, body, ['Head']), R = hb.size.x / 2, crown = hb.box.max.y, g = new THREE.Group(), r = random(663);
  const white = matte({ color: 0xd2d5d9, emissive: 0x18191b, roughness: 0.65 }), grey = matte({ color: 0x9a9ea4, emissive: 0x0e0f10, roughness: 0.7 }), soft = matte({ color: 0xb8bbc0, emissive: 0x141517, roughness: 0.7 });
  const shade = i => [white, soft, grey, soft][i % 4];
  /* the top-knot: hair twisted round itself and bound with cord */
  const knot = V(0, crown + 0.024, hb.ctr.z - R * 0.2);
  const core = mesh(new THREE.SphereGeometry(0.032, 20, 14), soft, knot.x, knot.y, knot.z); g.add(core);
  for (let i = 0; i < 22; i++) { const turn = r() * Math.PI, tilt = (r() - 0.5) * 1.5, rad = 0.027 + r() * 0.012, from = r() * 6.28;
    const spin = new THREE.Euler(tilt, turn, 0);
    g.add(rod(Array.from({ length: 11 }, (_, k) => { const a = from + k / 10 * 4.2; return V(Math.cos(a) * rad, Math.sin(a) * rad * 0.9, (k / 10 - 0.5) * 0.016).applyEuler(spin).add(knot); }), t => 0.0065 * Math.sin(Math.PI * (0.1 + 0.8 * t)), shade(i), 20, 5)); }
  const cord = matte({ color: 0x9a6424, roughness: 0.8 });
  for (let i = 0; i < 3; i++) { const ring = mesh(new THREE.TorusGeometry(0.031 - i * 0.0015, 0.0048, 8, 30), cord, 0, crown - 0.008 + i * 0.008, knot.z); ring.rotation.x = Math.PI / 2; g.add(ring); }
  /* the loose end of the knot streaming back */
  for (let i = 0; i < 12; i++) { const s = (r() - 0.5) * 2, d = r();
    g.add(rod([V(knot.x + s * 0.012, knot.y + 0.008, knot.z - 0.02), V(s * 0.035, knot.y + 0.006 - d * 0.02, knot.z - 0.075), V(0.02 + s * 0.05, knot.y - 0.05 - d * 0.04, knot.z - 0.135 - d * 0.02), V(0.035 + s * 0.07, knot.y - 0.09 - d * 0.09, knot.z - 0.17 - d * 0.04)], t => 0.0052 * (1 - t) + 0.0004, shade(i), 30, 5)); }
  /* long locks down the back of the head to the shoulders */
  for (let i = 0; i < 46; i++) { const across = (i / 45 - 0.5) * 2, x = across * R * 0.9, curve = Math.sqrt(1 - across * across * 0.7), wave = Math.sin(i * 2.3) * 0.012, low = 1.545 + r() * 0.05;
    g.add(rod([V(x * 0.7, 1.755 + r() * 0.02, hb.box.min.z + 0.03 - 0.022 * curve), V(x * 1.02, 1.70, hb.box.min.z + 0.012 - 0.028 * curve), V(x * 1.05 + wave, 1.635, hb.box.min.z + 0.022 - 0.032 * curve), V(x * 1.15 - wave, low, hb.box.min.z + 0.02 - 0.04 * curve)], t => 0.0085 * Math.sin(Math.PI * (0.12 + 0.86 * t)) + 0.0005, shade(i), 26, 5)); }
  /* locks falling behind the ears */
  for (const s of [-1, 1]) for (let i = 0; i < 8; i++) { const z = -0.035 - i * 0.007, wave = Math.sin(i * 1.9) * 0.008;
    g.add(rod([V(s * R * 0.96, 1.728 - i * 0.002, z), V(s * (R + 0.012), 1.668, z - 0.014), V(s * (R + 0.002) + wave, 1.61, z - 0.018), V(s * (R + 0.018), 1.552 + r() * 0.035, z - 0.006 - r() * 0.02)], t => 0.0062 * Math.sin(Math.PI * (0.1 + 0.88 * t)) + 0.0004, shade(i), 26, 5)); }
  /* a few fine wisps lifted by the wind */
  for (const [s, y, i] of [[1, 1.72, 0], [-1, 1.715, 2]]) g.add(rod([V(s * R * 0.98, y, -0.05), V(s * (R + 0.012), y - 0.03, -0.1), V(s * (R + 0.002), y - 0.07, -0.135), V(s * (R + 0.016), y - 0.09, -0.175)], t => 0.0019 * (1 - t) + 0.0003, shade(i), 30, 4));
  attach(root, 'Head', g);
}
