/* Timing, damage and other tuning numbers of the duel. */
export const T = {
  call: 3.0,            // preparing a super arrow (a slow arrow that hits breaks it)
  flight: 2.5,          // super arrow in the air
  counterExec: 0.5,     // counter needs this long, so it must be pressed within 2 s of release
  superRest: 1.0,       // pause after releasing a super arrow before the next call
  lowerGrace: 0.6,      // an attack begun this soon after a 'lower your bow' weapon is released is forgiven
  stray: 0.45,          // a number arriving this soon after a release broke off your half-typed code is thrown away
  digit: 1.5,           // a first number is forgotten after this long
  fast: { draw: 0.15, flight: 0.7, rest: 0.30, dmg: 0.3 },
  hard: { draw: 0.70, flight: 1.0, rest: 0.30, dmg: 1.0, breaksCall: true }     // a slow arrow that hits breaks a super arrow call
};
export const DMG = { super: 10, rare: 30 };
export const ARROWS = { fast: 20, hard: 15 };      // each archer's quiver: fast arrows and slow ('hard') arrows
export const ESCAPE = { straight: 'crouch', jump: 'back', high: 'forward', low: 'jump' };   // what escapes which shot
export const JUMP_CUE = { from: 0.52, to: 0.1 };      // a low arrow: jump when it is this many seconds away
export const done = left => left <= 1e-6;                                     // a countdown has run out
