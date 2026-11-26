/* Bhishma's silver and ivory, used by his look and his bow. */
import * as THREE from 'three';
import { texture, engrave, metal } from '../shared/wardrobe.js';

/* a cool studio for the silver to reflect */
let studio = null;
function cool(){
  if (studio) return studio;
  studio = texture(256, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dfe7f0'); g.addColorStop(0.35, '#7f93aa'); g.addColorStop(0.55, '#28323f'); g.addColorStop(1, '#0c1016'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f4f8ff'; for (const [px, py, pw, ph] of [[18, 16, 36, 28], [116, 8, 28, 18], [194, 28, 24, 32]]) x.fillRect(px, py, pw, ph);
  });
  studio.flipY = false; studio.mapping = THREE.EquirectangularReflectionMapping; return studio;
}
export const SILVER = { light: '#e8eef5', mid: '#99a6b4', dark: '#333e4b' };
export const silver = (o = {}) => metal({ color: 0xaab6c4, emissive: 0x05070a, metalness: 0.74, roughness: 0.38, envMap: cool(), envMapIntensity: 0.95, ...o });
export const silverSheet = (seed, w = 256, h = 256, count = 22) => texture(w, h, x => {
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#c3ced9'); g.addColorStop(0.5, '#82909f'); g.addColorStop(1, '#cdd7e1'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  engrave(x, 0, 0, w, h, { seed, count, size: 22, light: SILVER.light, dark: SILVER.dark });
});
