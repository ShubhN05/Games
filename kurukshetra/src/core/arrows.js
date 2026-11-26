/* Normal arrows and moving: shooting, jumping, dodging, knocking down, hitting. */
import { T, ESCAPE, JUMP_CUE, done } from './constants.js';
import { tipS, START, CONTACT, REACH, END, CROSS, JUMP, heightAt, hopHeight } from './path.js';
import { resist } from './supers.js';

export function setStance(d, i, stance){
  const f = d.f[i]; f.wish = stance;
  if (f.draw) return;                                   // an archer drawing the bow cannot dodge (but may cancel the draw)
  f.stance = stance; if (stance === 'crouch') f.hop = null;      // crouching drops you out of a jump
}

/* how high archer f's feet are: from a jump, or from rising for a jump shot */
export function airHeight(f){
  const draw = f.draw?.path === 'jump' ? JUMP.height * Math.sin(Math.PI / 2 * (1 - Math.max(0, f.draw.left) / T[f.draw.kind].draw)) : 0;
  return Math.max(draw, f.hop == null ? 0 : hopHeight(f.hop));
}

export function jump(d, i){
  const f = d.f[i];
  if (d.winner !== null || f.draw || f.hop !== null || f.hopRest > 0) return false;
  f.hop = 0; if (f.stance === 'crouch') f.stance = f.wish = 'mid';
  return true;
}
export function tickHop(f, dt){
  f.hopRest = Math.max(0, f.hopRest - dt);
  if (f.hop !== null && (f.hop += dt) >= JUMP.time - 1e-6) { f.hop = null; f.hopRest = JUMP.rest; }
}

/* seconds until a flying arrow reaches a standing archer */
export const arrivesIn = a => a.flight * (1 + CONTACT.mid / START - a.p);
/* for a low arrow: 'wait', then 'now' while pressing jump will clear it, then nothing */
export function jumpCue(a){
  const left = arrivesIn(a);
  return left > JUMP_CUE.from ? 'wait' : left >= JUMP_CUE.to ? 'now' : null;
}
/* seconds in which the opponent can still shoot a slow arrow that reaches archer i before the super arrow leaves */
export function breakTime(d, i){
  const call = d.f[i].call;
  return call ? Math.max(0, call.left - T.hard.draw - T.hard.flight * (1 + CONTACT.mid / START)) : 0;
}

/* give up the bow draw to move: the arrow goes back into the quiver */
export function cancelDraw(d, i){
  const f = d.f[i];
  if (d.winner !== null || !f.draw) return false;
  f.arrows[f.draw.kind]++; f.draw = null; f.rest = 0; f.stance = f.wish;
  return true;
}

export function shoot(d, i, kind, path){
  const f = d.f[i];
  if (d.winner !== null || f.call || f.draw || f.rest > 0 || f.arrows[kind] <= 0) return false;
  f.arrows[kind]--; f.draw = { kind, path, left: T[kind].draw }; f.stance = 'mid'; resist(d, i);
  return true;
}

/* the bow draw of archer i: when it completes, the arrow leaves */
export function tickDraw(d, i, dt, ev){
  const f = d.f[i];
  if (!f.draw || !done(f.draw.left -= dt)) return;
  const { kind, path } = f.draw; f.draw = null; f.rest = T[kind].rest; if (path === 'jump') f.hop = JUMP.time / 2;      // lands after the shot
  setStance(d, i, f.wish);
  const a = { uid: d.uid++, by: i, kind, path, p: 0, flight: T[kind].flight, gap: -1 };
  d.arrows.push(a); ev.push({ type: 'arrow', arrow: a });
}

export function stepArrows(d, dt, ev){
  for (const a of d.arrows) { a.prev = a.p; a.p += dt / a.flight; }
  /* opposite arrows on the same path knock each other down if they really meet where they cross */
  for (const a of d.arrows) for (const b of d.arrows) {
    if (a.gone || b.gone || a.by !== 0 || b.by !== 1 || a.path !== b.path) continue;
    const before = a.prev + b.prev, after = a.p + b.p;
    if (before >= CROSS || after < CROSS) continue;
    const k = (CROSS - before) / (after - before), at = x => tipS(x.prev + (x.p - x.prev) * k);      // their heights at the moment they cross
    if (Math.abs(heightAt(a.path, at(a)) - heightAt(b.path, at(b))) < 0.55) { a.gone = b.gone = true; ev.push({ type: 'clash', a, b }); }
  }
  /* an arrow hits when its tip and the body cross, whichever of the two moved */
  for (const a of d.arrows) {
    if (a.gone) continue;
    const to = 1 - a.by, f = d.f[to], s = tipS(a.p), spot = CONTACT[f.stance], gap = s - spot;
    const where = tipS(a.prev) < spot ? spot : s;              // the arrow flew into the body, or the body stepped into the arrow
    const touched = a.gap < 0 && gap >= 0 && where <= REACH[a.path] + 1e-6;
    a.gap = gap;
    const airborne = airHeight(f) >= JUMP.clear, escaped = ESCAPE[a.path] === 'jump' ? airborne : !airborne && f.stance === ESCAPE[a.path];
    if (touched && !escaped) {
      a.gone = true; f.hp = Math.max(0, Math.round((f.hp - T[a.kind].dmg) * 10) / 10); ev.push({ type: 'hit', to, damage: T[a.kind].dmg, arrow: a });
      if (T[a.kind].breaksCall && f.call) { ev.push({ type: 'interrupted', to, code: f.call.code }); f.call = null; f.hold = 0; f.broken++; }    // a rare weapon is not used up
    }
    else if (a.p >= END) { a.gone = true; ev.push({ type: 'dodge', to, arrow: a }); }
  }
  d.arrows = d.arrows.filter(a => !a.gone);
}
