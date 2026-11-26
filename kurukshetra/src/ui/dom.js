import { POWERS } from '../core/index.js';

export const $ = id => document.getElementById(id);
const hex = c => '#' + c.toString(16).padStart(6, '0');
/* the key that escapes each shot */
export const ESCAPE_HINT = { straight: '↓ crouch', low: '↑ jump', jump: '← back', high: '→ forward' };
/* the readable colour of a power's name */
export const powerColor = code => hex(POWERS[code].textColor ?? POWERS[code].color);
