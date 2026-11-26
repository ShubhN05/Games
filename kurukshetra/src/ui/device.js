/* Phone or computer? Touch controls and touch wording appear where fingers are the main pointer.
   For checking: add ?touch=1 or ?touch=0 to the address. */
const asked = new URLSearchParams(location.search).get('touch');
export const TOUCH = asked === '1' || (asked !== '0' && matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0);
