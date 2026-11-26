/* THE ROSTER. To add an archer: copy karna.js, edit it, then import and list it here.
   The menu, health bars, chart and computer pick it up from this list. */
import arjun from './arjun.js';
import karna from './karna.js';

export const CHARACTERS = [arjun, karna];
export const getCharacter = id => {
  const c = CHARACTERS.find(x => x.id === id);
  if (!c) throw new Error('unknown character: ' + id);
  return c;
};
