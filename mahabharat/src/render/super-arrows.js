/* Super arrows and counters on screen. Colours come from content/powers.js.
   To give one power its own special picture later, branch on POWERS[code] in build(). */
import * as THREE from 'three';
import { scene } from './stage.js';
import { V, clamp, face, point } from './layout.js';
import { glow, drop, burst } from './effects.js';
import { makeArrow } from '../shared/yudh.js';
import { POWERS, T } from '../core/index.js';

const flying = new Map();      // uid -> { o, by }
let counters = [];             // { o, code, uid of the attack it meets }

function build(code, size = 1){
  const p = POWERS[code], o = new THREE.Group(), a = makeArrow(false, 0.9); a.position.x = -0.9; o.add(a);
  o.add(glow(p.color, 1.25 * size, 0.95, p.dark ? THREE.NormalBlending : THREE.AdditiveBlending));
  o.add(glow(0xffffff, 0.55 * size, 1, THREE.NormalBlending));
  scene.add(o); return o;
}
function flightPos(actors, by, p){ const q = actors[by].chest(1.5).lerp(actors[1 - by].chest(1.2), p); q.y += Math.sin(Math.PI * p) * 0.9; return q; }
function take(uid){ const fx = flying.get(uid); if (fx) { flying.delete(uid); drop(fx.o); } return fx; }

export const superArrows = {
  release(shot, actors){ flying.set(shot.uid, { o: build(shot.code), by: shot.by }); burst(actors[shot.by].chest(1.5), 22, POWERS[shot.code].color, 3.5); },
  blocked(uid, code, byCode){ const fx = take(uid); if (fx) { burst(fx.o.position, 40, POWERS[code].color, 5, 0.8); burst(fx.o.position, 30, POWERS[byCode].color, 4, 0.7); } },
  remove(uid){ take(uid); },
  position(uid){ return flying.get(uid)?.o.position; },
  setVisible(on){ for (const fx of flying.values()) fx.o.visible = on; },
  update(duel, actors){
    for (const [uid, fx] of flying) {
      const s = duel.incoming[1 - fx.by]; if (!s || s.uid !== uid) continue;
      const p = 1 - clamp(s.left / T.flight, 0, 1), q = flightPos(actors, fx.by, p);
      fx.o.position.copy(q); point(fx.o, q, flightPos(actors, fx.by, p + 0.02)); burst(q, 1, POWERS[s.code].color, 0.8, 0.45, 0.35);
    }
    counters = counters.filter(c => {
      const r = duel.counters.find(x => x.target === c.uid), target = flying.get(c.uid);
      if (!r || !target) { drop(c.o); return false; }
      const q = 1 - clamp(r.left / T.counterExec, 0, 1), from = actors[r.by].chest(1.5), at = target.o.position, shield = POWERS[c.code].shield;
      const p = shield ? from.clone().add(V(face(r.by) * 0.6 * q, 0, 0)) : from.clone().lerp(at, q);
      c.o.position.copy(p); point(c.o, from, at); if (shield) c.o.scale.setScalar(1 + 1.4 * q); burst(p, 1, POWERS[c.code].color, 0.6, 0.35, 0.28);
      return true;
    });
    for (const r of duel.counters) if (!counters.some(c => c.uid === r.target)) counters.push({ o: build(r.code, 0.85), code: r.code, uid: r.target });
  },
  clear(){ for (const fx of [...flying.values(), ...counters]) drop(fx.o); flying.clear(); counters = []; }
};
