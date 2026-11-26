/* The ONLY file that borrows from the YUDH game (games/yudh). This game never edits YUDH.
   If something here breaks after a YUDH change, this is the one place to look.
   (index.html also points the 'three' import at YUDH's copy of Three.js.) */
import '../../../yudh/arenas.js';                          // sets window.FIGHTER_ARENAS
export { findBody } from '../../../yudh/lib/look.js';
export { dressArjun, makeBow, makeArrow } from '../../../yudh/lib/arjun.js';
export { dressAsur } from '../../../yudh/lib/asur.js';
export { createSfx } from '../../../yudh/lib/sfx.js';
export const ASSETS = new URL('../../../yudh/assets/', import.meta.url).href;
export function paintYudhArena(id, ctx){ window.FIGHTER_ARENAS.find(a => a.id === id).draw(ctx, 3); }
