/* Plain words for what the player should do, or should have done. */
import { TOUCH } from './device.js';
import { POWERS, JUMP, owns } from '../core/index.js';

/* words that differ between fingers and keys */
export const HOLD = TOUCH ? 'pull' : 'hold';
export const HOLDING = TOUCH ? 'pulling' : 'holding';
export const SHIELD = TOUCH ? '★ shield' : 'shield (Space)';
/* what to press for weapon `code` (on a phone the big weapons and shield live under the star) */
export const keyLabel = code => TOUCH && POWERS[code].rare ? '★' : POWERS[code].key;

/* the key that escapes each ordinary shot */
export const ESCAPE_HINT = { straight: HOLD + ' ↓', low: 'jump ↑', jump: HOLD + ' ←', high: HOLD + ' →' };

const named = code => keyLabel(code) + ' ' + (POWERS[code].short || POWERS[code].name);

/* everything archer f could have used against a super arrow, e.g. "12 Water or 33 Sun discs" */
export function answerText(code, f){
  const p = POWERS[code];
  const list = [...p.counters, ...(p.halvedBy || [])].filter(c => owns(f, c) && !(POWERS[c].shield && f.used[c]))
    .map(c => named(c) + (p.halvedBy?.includes(c) ? ' (half)' : ''));
  if (p.lower) list.unshift(HOLD + ' ↓ and do not attack');
  return list.join(' or ');
}

/* why an ordinary arrow hit archer f */
export function hitAdvice(path, f){
  if (path !== 'low') return 'needed: ' + ESCAPE_HINT[path] + ' until it passes';
  if (f.hop !== null) return f.hop < JUMP.time / 2 ? 'jumped too late' : 'jumped too early';
  return f.hopRest > 0 ? 'jumped too early' : (TOUCH ? 'push' : 'press') + ' ↑ when it says NOW';
}
