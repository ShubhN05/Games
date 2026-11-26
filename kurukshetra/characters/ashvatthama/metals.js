/* Ashvatthama's dark steel and old bronze, used by his look and his bow. */
import * as THREE from 'three';
import { texture, engrave, metal, random } from '../shared/wardrobe.js';

/* a night sky with a few torches for the metal to reflect */
let studio = null;
function night(){
  if (studio) return studio;
  studio = texture(256, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e4e8f4'); g.addColorStop(0.35, '#7c8498'); g.addColorStop(0.58, '#262a34'); g.addColorStop(1, '#100a0a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; for (const [px, py, pw, ph] of [[18, 16, 34, 26], [118, 8, 28, 18]]) x.fillRect(px, py, pw, ph);
    x.fillStyle = '#ffb070'; x.fillRect(194, 46, 24, 30);
  });
  studio.flipY = false; studio.mapping = THREE.EquirectangularReflectionMapping; return studio;
}
export const STEEL = { light: '#c2c8d4', mid: '#5a5e68', dark: '#121318' };
export const steel = (o = {}) => metal({ color: 0xb8bec9, emissive: 0x15161a, metalness: 0.66, roughness: 0.42, envMap: night(), envMapIntensity: 0.95, ...o });
let brass = null;
export const bronze = () => brass || (brass = metal({ color: 0x9a7636, emissive: 0x0e0901, metalness: 0.66, roughness: 0.46 }));

/* scratches and wear */
export const worn = (x, w, h, seed, count) => { const r = random(seed); for (let i = 0; i < count; i++) { x.fillStyle = r() < 0.55 ? 'rgba(0,0,0,0.28)' : 'rgba(225,230,245,0.13)'; x.fillRect(r() * w, r() * h, 2 + r() * 10, 1 + r() * 2); } };
export const steelPaint = (seed, w = 256, h = 256) => texture(w, h, x => {
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#7a808c'); g.addColorStop(0.5, '#464a54'); g.addColorStop(1, '#737985'); x.fillStyle = g; x.fillRect(0, 0, w, h); worn(x, w, h, seed, 300);
  engrave(x, 0, 0, w, h, { seed: seed + 1, count: 5, size: 20, light: STEEL.light, dark: STEEL.dark, width: 1.6 });
});
