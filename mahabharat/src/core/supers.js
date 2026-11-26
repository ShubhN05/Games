/* Super arrows: number codes, calling, countering, hitting.
   Everything about a particular power comes from content/powers.js - no power codes are written here. */
import { T, DMG, done } from './constants.js';
import { POWERS } from '../content/powers.js';
import { getCharacter } from '../content/characters/index.js';

export const owns = (f, code) => !POWERS[code].rare || !!POWERS[code].shield || getCharacter(f.id).rares.includes(code);

/* codes that would help archer i against the arrow coming at them right now */
export function answersTo(d, i){
  const inc = d.incoming[i], f = d.f[i];
  if (!inc || inc.tried || inc.left < T.counterExec) return [];
  const attack = POWERS[inc.code];
  return [...attack.counters, ...(attack.halvedBy || [])].filter(c => owns(f, c) && !(POWERS[c].shield && f.used[c]));
}

export function cancelCode(d, i){ d.f[i].digits = ''; }

/* one number key. Returns null after the first number, else what the two-number code did */
export function inputCode(d, i, digit){
  const f = d.f[i];
  if (d.winner !== null || !/^[1-5]$/.test(digit)) return null;
  f.digits += digit; f.digitT = T.digit;
  if (f.digits.length < 2) return null;
  const code = f.digits; f.digits = '';
  const p = POWERS[code], refuse = why => ({ type: 'refused', code, why });
  if (!p) return refuse('no such power');
  if (!owns(f, code)) return refuse(getCharacter(f.id).name + ' does not have ' + p.name);

  const inc = d.incoming[i];
  if (inc) return inc.tried ? refuse('Your try is used: wait for this arrow') : counter(d, i, code, inc, refuse);

  if (p.shield) return refuse(p.name + ' only blocks a rare weapon');
  if (p.rare && f.used[code]) return refuse(p.name + ' already used');
  if (f.call) return refuse('already calling');
  if (f.draw) return refuse('finish your arrow first');
  if (f.superRest > 0) return refuse('Rest a moment');
  f.call = { code, left: T.call };
  return { type: 'call', code };
}

function counter(d, i, code, inc, refuse){
  const f = d.f[i], p = POWERS[code], attack = POWERS[inc.code];
  if (p.shield) {
    if (!attack.rare) return refuse(p.name + ' only blocks a rare weapon');
    if (f.used[code]) return refuse(p.name + ' already used');
  }
  if (inc.left < T.counterExec - 1e-6) { inc.tried = true; return { type: 'late', code }; }
  inc.tried = true; const paused = !!f.call; if (paused) f.hold = T.counterExec;     // your own call waits while you counter
  if (p.shield) f.used[code] = true;
  const halves = !!attack.halvedBy?.includes(code);
  const good = halves || attack.counters.includes(code);
  d.counters.push({ by: i, code, target: inc.uid, left: T.counterExec, good, halves });
  return { type: 'counter', code, paused };
}

/* a half-typed code is forgotten after a while */
export function tickDigits(f, dt){ if (f.digits && done(f.digitT -= dt)) f.digits = ''; }

/* the call of archer i: when it completes, the super arrow is released (held = waiting for own counter) */
export function tickCall(d, i, dt, held, ev){
  const f = d.f[i];
  if (!f.call || held || !done(f.call.left -= dt)) return;
  const code = f.call.code; f.call = null; f.superRest = T.superRest; d.f[1 - i].digits = '';
  if (POWERS[code].rare) f.used[code] = true;
  const s = { uid: d.uid++, by: i, code, left: T.flight, tried: false, damage: POWERS[code].rare ? DMG.rare : DMG.super };
  d.incoming[1 - i] = s; ev.push({ type: 'release', by: i, shot: s });
}

/* counters meet the attack, then super arrows arrive */
export function stepSupers(d, dt, ev){
  d.counters = d.counters.filter(c => {
    if (!done(c.left -= dt)) return true;
    const to = c.by, inc = d.incoming[to];
    if (!inc || inc.uid !== c.target) return false;
    if (c.halves) { inc.damage /= 2; ev.push({ type: 'weakened', to, code: inc.code, by: c.code }); }
    else if (c.good) { d.incoming[to] = null; ev.push({ type: 'blocked', to, code: inc.code, by: c.code, uid: inc.uid }); }
    else ev.push({ type: 'failed', to, code: inc.code, by: c.code });
    return false;
  });
  d.incoming.forEach((s, to) => {
    if (!s || !done(s.left -= dt)) return;
    d.incoming[to] = null; d.f[to].hp = Math.max(0, d.f[to].hp - s.damage);
    ev.push({ type: 'superhit', to, code: s.code, damage: s.damage, uid: s.uid });
  });
}
