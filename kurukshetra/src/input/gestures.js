/* What a finger movement means. Pure sums, no page: tested in tests/touch.test.js.
   dx, dy = how far the finger is from where it counts from, in screen pixels (y grows downwards). */
export const STICK_DEAD = 18;      // the joystick ignores movement smaller than this
export const PICK_DEAD = 34;       // a wheel picks nothing until the finger has slid this far
const STICKY = 1.3;                // the other axis must be this much stronger to take over
const REACH = 30;                  // degrees either side of a wheel circle that still pick it

/* the joystick's direction: 'jump', 'crouch', 'back', 'forward' or null. before = its direction until now */
export function stickDirection(dx, dy, before = null){
  if (Math.hypot(dx, dy) < STICK_DEAD) return null;
  const was = before === 'forward' || before === 'back' ? 'across' : before ? 'upright' : null;
  const across = was === 'across' ? Math.abs(dy) <= Math.abs(dx) * STICKY : was === 'upright' ? Math.abs(dx) > Math.abs(dy) * STICKY : Math.abs(dx) >= Math.abs(dy);
  return across ? (dx > 0 ? 'forward' : 'back') : (dy < 0 ? 'jump' : 'crouch');
}

/* which wheel circle the finger slid towards. angles = where the circles are, in degrees (0 = right, 90 = up) */
export function pickByAngle(dx, dy, angles){
  if (Math.hypot(dx, dy) < PICK_DEAD) return null;
  const slid = Math.atan2(-dy, dx) * 180 / Math.PI, off = a => Math.abs(((slid - a) % 360 + 540) % 360 - 180);
  let best = 0; for (let i = 1; i < angles.length; i++) if (off(angles[i]) < off(angles[best])) best = i;
  return off(angles[best]) <= REACH ? best : null;
}
