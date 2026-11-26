/* THE ROSTER. To add a character: copy a character folder, edit it, then import and list it here.
   The menu, health bars, chart and computer pick it up from this list. */
import arjun from './arjun/character.js';
import karna from './karna/character.js';
import bhishma from './bhishma/character.js';

export const CHARACTERS = [arjun, karna, bhishma];
export const getCharacter = id => {
  const c = CHARACTERS.find(x => x.id === id);
  if (!c) throw new Error('unknown character: ' + id);
  return c;
};
