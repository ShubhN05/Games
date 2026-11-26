/* THE ARENAS. To add one: copy warbanner-marsh.js, write its paint(ctx), then import and list it here.
   The menu shows an arena choice as soon as there is more than one. */
import warbannerMarsh from './warbanner-marsh.js';

export const ARENAS = [warbannerMarsh];
export const getArena = id => ARENAS.find(a => a.id === id) || ARENAS[0];
