/* ASHVATTHAMA's long black hair: painted to the shape of his head, tied in a high wild knot with a leather cord,
   loose locks falling over the temples to the chest and down the back. */
import * as THREE from 'three';
import { boundsOf } from '../shared/helpers.js';
import { V, mix, table, random, texture, matte, layer, attach, mesh, rod } from '../shared/wardrobe.js';

const TOP = 1.83, BOTTOM = 1.56, W = 1024, H = 512;
const px = deg => (deg / 360 + 0.5) * W, py = y => (TOP - y) / (TOP - BOTTOM) * H;
/* [degrees from the nose, height]: the lowest edge of the hair on the head */
const HAIRLINE = [[0, 1.778], [8, 1.77], [20, 1.774], [38, 1.762], [52, 1.742], [66, 1.718], [80, 1.7], [90, 1.718], [100, 1.714], [110, 1.675], [130, 1.632], [180, 1.615]];

const paint = () => texture(W, H, x => {
  const r = random(812);
  const area = () => { x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); for (let d = 180; d >= -180; d -= 3) x.lineTo(px(d), py(table(HAIRLINE, Math.abs(d)))); x.closePath(); };
  x.fillStyle = '#17110f'; area(); x.fill();
  const strand = (sx, sy, dx, dy, wide, color) => { x.strokeStyle = color; x.lineWidth = wide; x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + dx * 0.3, sy + dy * 0.55, sx + dx, sy + dy); x.stroke(); };
  const tone = () => { const t = r(); return t < 0.25 ? 'rgba(96,70,56,0.85)' : t < 0.5 ? 'rgba(52,38,34,0.9)' : 'rgba(6,4,4,0.9)'; };
  x.lineCap = 'round';
  x.save(); area(); x.clip();
  for (let i = 0; i < 1300; i++) { const sx = r() * W, sy = r() * H, side = (sx / W - 0.5) * 2; strand(sx, sy, side * 80 * r(), -(30 + r() * 90), 1 + r() * 2.4, tone()); }
  x.restore();
  for (let i = 0; i < 240; i++) { const d = (r() - 0.5) * 360, y = table(HAIRLINE, Math.abs(d)); strand(px(d), py(y) + (Math.abs(d) < 60 ? r() * 3 : 4 + r() * 6), (d / 180) * 26, -(12 + r() * 18), 0.9 + r(), tone()); }
});

export function addHair(root, body){
  layer(root, body, { name: 'AshvaScalp', bones: /^(Head|neck_01)$/, where: p => p.y > BOTTOM, inflate: p => p.y > 1.73 ? 0.0075 : 0.0045,
    wrap: { around: 'y', cz: 0.0, top: TOP, bottom: BOTTOM }, material: matte({ map: paint(), roughness: 0.6 }) });
  const hb = boundsOf(root, body, ['Head']), R = hb.size.x / 2, crown = hb.box.max.y, back = hb.box.min.z, g = new THREE.Group(), r = random(813);
  const black = matte({ color: 0x120d0c, roughness: 0.55 }), dark = matte({ color: 0x261a16, roughness: 0.55 }), brown = matte({ color: 0x41291e, roughness: 0.6, emissive: 0x080403 });
  const shade = i => [black, dark, black, brown, dark][i % 5];
  const lock = (points, thick, i, segments = 30) => {
    const curve = new THREE.CatmullRomCurve3(points), wavy = Array.from({ length: 15 }, (_, k) => { const t = k / 14, p = curve.getPoint(t), a = i * 2.4 + t * 15; return p.add(V(Math.sin(a) * 0.0055 * t, 0, Math.cos(a * 0.8) * 0.0055 * t)); });
    g.add(rod(wavy, t => thick * Math.sin(Math.PI * (0.12 + 0.86 * t)) + 0.0003, shade(i), segments, 4)); };
  /* the high knot, wound and bound with cord, with ends bursting out of it */
  const knot = V(0, crown + 0.048, hb.ctr.z - R * 0.22);
  const core = mesh(new THREE.SphereGeometry(0.036, 20, 14), black, knot.x, knot.y, knot.z); core.scale.y = 1.1; g.add(core);
  lock([V(0, crown - 0.012, knot.z), V(0, crown + 0.012, knot.z), V(0, knot.y, knot.z)], 0.03, 0, 12);
  for (let i = 0; i < 30; i++) { const spin = new THREE.Euler((r() - 0.5) * 1.8, r() * Math.PI, (r() - 0.5) * 0.6), rad = 0.03 + r() * 0.016, from = r() * 6.28;
    lock(Array.from({ length: 11 }, (_, k) => { const a = from + k / 10 * 4.4; return V(Math.cos(a) * rad, Math.sin(a) * rad, (k / 10 - 0.5) * 0.02).applyEuler(spin).add(knot); }), 0.0065, i, 20); }
  const cord = matte({ color: 0x5a3420, roughness: 0.8 });
  for (let i = 0; i < 3; i++) { const ring = mesh(new THREE.TorusGeometry(0.03 - i * 0.001, 0.0048, 8, 30), cord, 0, crown + 0.002 + i * 0.008, knot.z); ring.rotation.x = Math.PI / 2; g.add(ring); }
  for (let i = 0; i < 30; i++) { const a = r() * Math.PI * 2, out = 0.026 + r() * 0.036, up = r() * 0.036 - 0.012;
    lock([knot.clone().add(V(0, 0.01, -0.01)), knot.clone().add(V(Math.cos(a) * out * 0.7, 0.025 + up, Math.sin(a) * out * 0.5 - 0.025)), knot.clone().add(V(Math.cos(a) * out * 1.35, -0.04 + up, Math.sin(a) * out - 0.055))], 0.0027, i + 1, 20); }
  /* a thick tail from the knot down the back */
  for (let i = 0; i < 28; i++) { const s = (r() - 0.5) * 2, d = r();
    lock([V(knot.x + s * 0.015, knot.y, knot.z - 0.025), V(s * 0.04, crown + 0.012 - d * 0.02, back + 0.0), V(s * 0.07, 1.72 - d * 0.04, back - 0.05 - d * 0.02), V(s * 0.1 + Math.sin(i) * 0.015, 1.6 - d * 0.08, back - 0.045 - d * 0.03)], 0.0058, i); }
  /* long hair down the back */
  for (let i = 0; i < 74; i++) { const across = (i / 73 - 0.5) * 2, x = across * R * 0.95, curve = Math.sqrt(1 - across * across * 0.7), wave = Math.sin(i * 2.3) * 0.018, low = 1.48 + r() * 0.08;
    lock([V(x * 0.7, 1.755 + r() * 0.025, back + 0.03 - 0.022 * curve), V(x * 1.08, 1.69, back + 0.01 - 0.03 * curve), V(x * 1.15 + wave, 1.6, back + 0.025 - 0.04 * curve), V(x * 1.4 - wave, low, back + 0.0 - 0.05 * curve)], 0.0068, i); }
  /* locks framing the face and falling over the collar to the chest */
  for (const s of [-1, 1]) for (let i = 0; i < 24; i++) { const d = i / 23, wave = Math.sin(i * 1.7) * 0.012, z = 0.045 - d * 0.085;
    lock([V(s * R * (0.72 + d * 0.2), 1.775 - d * 0.02, z), V(s * (R + 0.013), 1.70 - r() * 0.02, z - 0.012), V(s * (R + 0.006) + wave, 1.62 - r() * 0.015, z - 0.01),
      V(s * (R + 0.032 + r() * 0.02) - wave, 1.55, z + 0.01 + (1 - d) * 0.035), V(s * (R + 0.015 + r() * 0.04), 1.465 + r() * 0.07, z + 0.02 + (1 - d) * 0.085)], 0.0041, i + 2); }
  /* stray strands lifted by the wind */
  for (const [s, y, i] of [[1, 1.75, 0], [1, 1.66, 1], [-1, 1.73, 2], [-1, 1.62, 3]]) g.add(rod([V(s * R * 0.98, y, -0.02), V(s * (R + 0.035), y - 0.01, -0.05), V(s * (R + 0.03), y - 0.055, -0.07), V(s * (R + 0.07), y - 0.07, -0.1)], t => 0.0022 * (1 - t) + 0.0003, shade(i), 30, 4));
  attach(root, 'Head', g);
}
