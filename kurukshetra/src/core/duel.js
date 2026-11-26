/* One match: its state and the clock that drives it. No drawing, no keyboard - runs in Node for tests. */
import { ARROWS } from './constants.js';
import { tickDraw, tickHop, stepArrows } from './arrows.js';
import { tickDigits, tickLower, tickCall, stepSupers } from './supers.js';
import { getCharacter } from '../../characters/index.js';

const fighter = id => ({ id: getCharacter(id).id, hp: 100, arrows: { ...ARROWS }, digits: '', digitT: 0, stray: 0, call: null, draw: null, rest: 0, hold: 0, superRest: 0,
  stance: 'mid', wish: 'mid', hop: null, hopRest: 0, broken: 0, used: {} });

export function createDuel(ids){
  return { t: 0, f: ids.map(fighter), incoming: [null, null], counters: [], arrows: [], winner: null, uid: 1 };
}

/* advance the match by dt seconds; returns the events that happened.
   Long frames are cut into small pieces, so a slow computer plays by the same rules. */
const SLICE = 1 / 240;
export function step(d, dt){
  const ev = [], slices = Math.max(1, Math.ceil(dt / SLICE - 1e-6));
  for (let k = 0; k < slices; k++) tick(d, dt / slices, ev);
  return ev;
}
function tick(d, dt, ev){
  if (d.winner !== null) return;
  d.t += dt;

  d.f.forEach((f, i) => {
    f.rest = Math.max(0, f.rest - dt); f.superRest = Math.max(0, f.superRest - dt);
    tickDigits(f, dt);
    const held = f.hold > 1e-6; f.hold = Math.max(0, f.hold - dt);
    tickHop(f, dt);
    tickDraw(d, i, dt, ev);
    tickLower(d, i, ev);
    tickCall(d, i, dt, held, ev);
  });
  stepSupers(d, dt, ev);
  stepArrows(d, dt, ev);
  checkOver(d, ev);
}

function checkOver(d, ev){
  const dead = d.f.map(f => f.hp <= 0);
  if (!dead[0] && !dead[1]) return;
  d.winner = dead[0] && dead[1] ? 'draw' : dead[0] ? 1 : 0; ev.push({ type: 'over', winner: d.winner });
  d.f.forEach(f => { f.call = f.draw = f.hop = null; f.digits = ''; f.stance = 'mid'; });
  d.incoming = [null, null]; d.arrows = []; d.counters = [];
}
