/* The computer archer. It only learns which super arrow is coming after it has been released, like the player. */
import { setStance, shoot, jump, inputCode, owns, ESCAPE, POWERS, getCharacter } from '../core/index.js';
import { END, START, CONTACT } from '../core/path.js';
import { LEVELS } from './levels.js';

export function createAI(level, rnd = Math.random){
  const L = LEVELS[level];
  return { L, rnd, arrowT: 2.0, superT: 4.0, answer: null, lower: null, seen: new Set(), dodges: [], last: null, repeats: 0, broken: 0 };
}

export function stepAI(d, i, ai, dt){
  if (d.winner !== null) return;
  answerSuper(d, i, ai, dt);
  if (ai.lower !== null) {                                     // bow lowered: hold still until that weapon has gone
    if (d.incoming[i]?.uid === ai.lower) { ai.superT -= dt; ai.arrowT -= dt; return; }
    ai.lower = null; setStance(d, i, 'mid');
  }
  dodgeArrows(d, i, ai, dt);
  attack(d, i, ai, dt);
}

const pick = (ai, list) => list[Math.floor(ai.rnd() * list.length)];
const ordinary = () => Object.keys(POWERS).filter(c => !POWERS[c].rare);
function enter(d, i, code){ d.f[i].digits = ''; inputCode(d, i, code[0]); return inputCode(d, i, code[1]); }

function answerSuper(d, i, ai, dt){
  const { L, rnd } = ai, inc = d.incoming[i];
  if (!inc || inc.tried) return;
  if (!ai.answer || ai.answer.uid !== inc.uid) {
    ai.answer = { uid: inc.uid, t: L.think[0] + rnd() * (L.think[1] - L.think[0]) };
    ai.repeats = inc.code === ai.last ? ai.repeats + 1 : 0; ai.last = inc.code;      // the same arrow again and again gets read
    if (ai.repeats >= 2) ai.answer.t = Math.min(ai.answer.t, L.think[1] * 0.7);
    if (POWERS[inc.code].lower) planLower(d.f[i], inc, ai);
  }
  const waited = (ai.answer.t -= dt) <= 0;
  if (ai.lower === inc.uid) { if (waited) setStance(d, i, 'crouch'); return; }
  if (!waited) return;
  if (ai.answer.code) return void enter(d, i, ai.answer.code);
  const attack = POWERS[inc.code], good = rnd() < knows(ai);
  let code;
  if (!good) code = pick(ai, ordinary().filter(c => !attack.counters.includes(c)));
  else if (!attack.rare) code = pick(ai, attack.counters);
  else code = answerRare(d.f[i], attack, ai);
  enter(d, i, code);
}

const knows = ai => Math.min(0.97, ai.L.right + 0.2 * ai.repeats);
/* a weapon that passes a lowered bow: one who knows it stops attacking (or uses the shield), one who does not resists */
function planLower(f, inc, ai){
  const attack = POWERS[inc.code], shield = attack.counters.find(c => POWERS[c].shield && !f.used[c]);
  if (ai.rnd() >= knows(ai)) ai.answer.code = pick(ai, ordinary());
  else if (shield && ai.rnd() < 0.35) ai.answer.code = shield;
  else ai.lower = inc.uid;
}

/* a rare weapon: use a shield, or an own weapon that stops it, or at least one that weakens it */
function answerRare(f, attack, ai){
  const shield = attack.counters.find(c => POWERS[c].shield && !f.used[c]);
  const weapon = attack.counters.find(c => !POWERS[c].shield && owns(f, c));
  if (shield && (!weapon || ai.rnd() < 0.5)) return shield;
  return weapon || (attack.halvedBy || []).find(c => owns(f, c)) || pick(ai, ordinary());
}

/* step out of the way of normal arrows: always the one that arrives first */
function dodgeArrows(d, i, ai, dt){
  const { L, rnd } = ai;
  for (const a of d.arrows) if (a.by !== i && !ai.seen.has(a.uid)) {
    ai.seen.add(a.uid);
    if (rnd() < L.dodge) ai.dodges.push({ stance: ESCAPE[a.path], start: L.react, end: a.flight * END, arrives: a.flight * (1 + CONTACT.mid / START) });
  }
  if (!ai.dodges.length) return;
  for (const x of ai.dodges) { x.start -= dt; x.end -= dt; x.arrives -= dt; }
  ai.dodges = ai.dodges.filter(x => x.end > 0);
  const next = ai.dodges.filter(x => x.start <= 0).sort((a, b) => a.end - b.end)[0];
  if (!next) { if (!ai.dodges.length) setStance(d, i, 'mid'); return; }
  if (next.stance !== 'jump') return setStance(d, i, next.stance);
  setStance(d, i, 'mid');                                       // a low arrow: jump just before it arrives
  if (!next.jumped && next.arrives <= 0.3) next.jumped = jump(d, i);
}

function attack(d, i, ai, dt){
  const { L, rnd } = ai, f = d.f[i];
  const busy = d.incoming[i] && !d.incoming[i].tried;
  ai.superT -= dt; ai.arrowT -= dt;
  if (f.broken > ai.broken) { ai.broken = f.broken; ai.superT = 0.8; }        // the call was broken: start it again soon
  if (ai.superT <= 0 && !busy && !f.call && !f.draw) {
    const rare = getCharacter(f.id).rares.filter(c => !f.used[c]);
    const r = enter(d, i, rare.length && d.t > 20 && rnd() < 0.25 ? pick(ai, rare) : pick(ai, ordinary()));
    if (r && r.type === 'call') ai.superT = L.superEvery * (0.7 + rnd() * 0.6);
  }
  if (ai.arrowT <= 0 && !ai.dodges.length) {
    let kind = rnd() < 0.6 ? 'fast' : 'hard';
    if (f.arrows[kind] <= 0) kind = kind === 'fast' ? 'hard' : 'fast';        // that kind is used up
    if (shoot(d, i, kind, pick(ai, ['straight', 'jump', 'high', 'low']))) ai.arrowT = L.arrowEvery * (0.6 + rnd() * 0.8);
  }
}
