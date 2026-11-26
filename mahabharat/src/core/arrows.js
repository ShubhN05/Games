/* Normal arrows: shooting, dodging, knocking down, hitting. */
import { T, ESCAPE, done } from './constants.js';
import { tipS, CONTACT, REACH, END, CROSS, heightAt } from './path.js';

export function setStance(d, i, stance){
  const f = d.f[i]; f.wish = stance; if (!f.draw) f.stance = stance;       // an archer drawing the bow cannot dodge
}

export function shoot(d, i, kind, path){
  const f = d.f[i];
  if (d.winner !== null || f.call || f.draw || f.rest > 0 || f.arrows <= 0) return false;
  f.arrows--; f.draw = { kind, path, left: T[kind].draw }; f.stance = 'mid';
  return true;
}

/* the bow draw of archer i: when it completes, the arrow leaves */
export function tickDraw(d, i, dt, ev){
  const f = d.f[i];
  if (!f.draw || !done(f.draw.left -= dt)) return;
  const { kind, path } = f.draw; f.draw = null; f.rest = T[kind].rest; f.stance = f.wish;
  const a = { uid: d.uid++, by: i, kind, path, p: 0, flight: T[kind].flight, gap: -1 };
  d.arrows.push(a); ev.push({ type: 'arrow', arrow: a });
}

export function stepArrows(d, dt, ev){
  for (const a of d.arrows) { a.prev = a.p; a.p += dt / a.flight; }
  /* opposite arrows on the same path knock each other down if they really meet where they cross */
  for (const a of d.arrows) for (const b of d.arrows)
    if (!a.gone && !b.gone && a.by === 0 && b.by === 1 && a.path === b.path && a.prev + b.prev < CROSS && a.p + b.p >= CROSS
        && Math.abs(heightAt(a.path, tipS(a.p)) - heightAt(b.path, tipS(b.p))) < 0.55) { a.gone = b.gone = true; ev.push({ type: 'clash', a, b }); }
  /* an arrow hits when its tip and the body cross, whichever of the two moved */
  for (const a of d.arrows) {
    if (a.gone) continue;
    const to = 1 - a.by, f = d.f[to], s = tipS(a.p), gap = s - CONTACT[f.stance], touched = a.gap < 0 && gap >= 0 && s <= REACH[a.path] + 1e-6;
    a.gap = gap;
    if (touched && f.stance !== ESCAPE[a.path]) { a.gone = true; f.hp = Math.max(0, Math.round((f.hp - T[a.kind].dmg) * 10) / 10); ev.push({ type: 'hit', to, damage: T[a.kind].dmg, arrow: a }); }
    else if (a.p >= END) { a.gone = true; ev.push({ type: 'dodge', to, arrow: a }); }
  }
  d.arrows = d.arrows.filter(a => !a.gone);
}
