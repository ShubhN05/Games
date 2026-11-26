/* Timing, damage and other tuning numbers of the duel. */
export const T = {
  call: 2.0,            // calling a super arrow
  flight: 2.5,          // super arrow in the air
  counterExec: 0.5,     // counter needs this long, so it must be pressed within 2 s of release
  superRest: 1.0,       // pause after releasing a super arrow before the next call
  digit: 1.5,           // a first number is forgotten after this long
  fast: { draw: 0.15, flight: 0.7, rest: 0.30, dmg: 0.3 },
  hard: { draw: 0.70, flight: 1.0, rest: 0.30, dmg: 1.0 }
};
export const DMG = { super: 10, rare: 30 };
export const ARROWS = { fast: 20, hard: 20 };      // each archer's quiver: fast arrows and slow ('hard') arrows
export const ESCAPE = { straight: 'crouch', jump: 'back', high: 'forward', low: 'jump' };   // what escapes which shot
export const done = left => left <= 1e-6;                                     // a countdown has run out
