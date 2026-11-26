/* Where a normal arrow is, shared by the rules and the drawing, so what you see is what hits.
   s = distance of the arrow TIP from the target's middle position (negative = not there yet). */
export const START = 8.85;                       // s at launch is -START
export const END = 1 + 1.3 / START;              // flight progress where the arrow is certainly past everyone
export const CONTACT = { forward: -1.05, mid: -0.15, crouch: -0.15, back: 0.75 };   // where the tip touches the body
export const REACH = { straight: 9, jump: 0.3, high: 1.0, low: 9 };     // past this the arrow is in the ground
export const STOP = { straight: 9, jump: 0.45, high: 1.15, low: 9 };    // where the drawn arrow stops
export const BODY = { stand: 1.85, crouch: 1.35 };              // body heights
export const tipS = p => -START * (1 - p);
/* a jump: how long, how high the feet go, and how high they must be to clear a low arrow */
export const JUMP = { time: 0.7, height: 0.75, clear: 0.4, rest: 0.15 };
export const hopHeight = t => (t <= 0 || t >= JUMP.time ? 0 : JUMP.height * Math.pow(Math.sin(Math.PI * t / JUMP.time), 0.6));
const line = (s, knots) => { for (let i = 1; i < knots.length; i++) { const [a, ya] = knots[i - 1], [b, yb] = knots[i]; if (s <= b) return ya + (yb - ya) * (s - a) / (b - a); } return knots[knots.length - 1][1]; };
export function heightAt(path, s){
  if (path === 'straight') return 1.5;
  if (path === 'jump') return line(s, [[-START, 2.15], [-1.05, 1.5], [-0.15, 0.95], [0.45, 0.05]]);
  if (path === 'low') return line(s, [[-START, 1.25], [-6.6, 0.55], [-4.5, 0.3], [9, 0.3]]);      // dives, then skims at shin height
  if (s < -1.05) { const q = Math.max(0, (s + START) / (START - 1.05)); return 1.4 + 1.25 * q + 8.8 * q * (1 - q); }
  return line(s, [[-1.05, 2.65], [-0.45, 2.25], [-0.1, 1.05], [0.75, 0.55], [1.15, 0.05]]);
}
/* two opposite arrows pass each other when their progress adds up to this */
export const CROSS = (START - 0.75) / START;
