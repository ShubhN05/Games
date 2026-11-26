/* The ordinary arrows on screen. Their flight comes from core/path.js, the same numbers the rules use. */
import * as THREE from 'three';
import { scene } from './stage.js';
import { V, home, face } from './layout.js';
import { glow, drop, burst } from './effects.js';
import { makeArrow } from '../../characters/shared/arrow.js';
import { tipS, heightAt, STOP } from '../core/path.js';

const flying = new Map();      // uid -> picture
let ghosts = [];               // dodged arrows finishing their flight

function arrowPos(a, p){       // where the arrow TIP is
  const to = 1 - a.by, c = Math.min(tipS(p), STOP[a.path]);
  return V(home(to) + c * face(a.by), heightAt(a.path, c), 0.12);
}
function place(fx, p){
  const tip = arrowPos(fx.a, p), dir = arrowPos(fx.a, p + 0.004).sub(arrowPos(fx.a, p - 0.02)).normalize(); if (dir.lengthSq() < 0.5) return;
  fx.o.quaternion.setFromUnitVectors(V(1, 0, 0), dir); fx.o.position.copy(tip).addScaledVector(dir, -fx.len);
}
function build(kind){          // thick, bright and glowing so it can be seen and dodged
  const hard = kind === 'hard', len = hard ? 0.95 : 0.7, color = hard ? 0xffd24a : 0xc8f4ff, o = new THREE.Group(), a = makeArrow(false, len);
  a.scale.set(1, 2.6, 2.6); a.traverse(m => { if (m.isMesh) m.material = new THREE.MeshBasicMaterial({ color }); }); o.add(a);
  const head = glow(color, hard ? 0.6 : 0.45, 0.95); head.position.x = len; o.add(head);
  const trail = glow(color, 0.35, 0.35); trail.position.x = -0.1; o.add(trail);
  scene.add(o); return { o, len };
}

export const normalArrows = {
  spawn(a){ const fx = { ...build(a.kind), a }; flying.set(a.uid, fx); place(fx, 0); },
  position(uid){ const fx = flying.get(uid); return fx && arrowPos(fx.a, fx.a.p); },
  hit(uid){ const fx = flying.get(uid); if (fx) { flying.delete(uid); drop(fx.o); } },
  dodge(uid){ const fx = flying.get(uid); if (fx) { flying.delete(uid); ghosts.push({ ...fx, p: fx.a.p, life: 0.45 }); } },
  clash(...arrows){ for (const a of arrows) { const fx = flying.get(a.uid); if (fx) { burst(fx.o.position, 8, 0xfff0c0, 2.5, 0.35, 0.15); drop(fx.o); flying.delete(a.uid); } } },
  update(dt){
    for (const fx of flying.values()) place(fx, fx.a.p);
    ghosts = ghosts.filter(g => { g.p += dt / g.a.flight; g.life -= dt; place(g, g.p); if (g.life > 0) return true; drop(g.o); return false; });
  },
  clear(){ for (const fx of [...flying.values(), ...ghosts]) drop(fx.o); flying.clear(); ghosts = []; }
};
