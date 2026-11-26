/* The keyboard. All key choices are in KEYMAP. When two movement keys are held, the newest one wins. */
import { SHOT_BY_DIRECTION } from '../core/index.js';

export const KEYMAP = {
  fast: 'KeyF', hard: 'KeyS', jump: 'ArrowUp', crouch: 'ArrowDown', back: 'ArrowLeft', forward: 'ArrowRight',
  shield: 'Space', pause: 'KeyP', restart: 'KeyR', help: 'KeyH', mute: 'KeyM', menu: 'Escape', start: 'Enter'
};
/* the weapon key pressed ('1'-'7' or 'Space'), if it is one */
export const powerKeyOf = code => code === KEYMAP.shield ? 'Space' : /^(Digit|Numpad)([1-7])$/.exec(code)?.[2];
export const moveOf = code => ['jump', 'crouch', 'back', 'forward'].find(a => KEYMAP[a] === code);

const held = {};                 // key -> when it was pressed (0 = not held)
let presses = 0;
const since = action => held[KEYMAP[action]] || 0;
export const isDown = action => since(action) > 0;
export function stanceFromKeys(){
  const newest = ['crouch', 'back', 'forward'].filter(isDown).sort((a, b) => since(b) - since(a))[0];
  return !newest || (newest === 'crouch' && since('jump') > since('crouch')) ? 'mid' : newest;
}
/* the shot is chosen by the direction held while pressing F or S (the newest one if several) */
export function pathFromKeys(){
  const newest = Object.keys(SHOT_BY_DIRECTION).filter(isDown).sort((a, b) => since(b) - since(a))[0];
  return newest ? SHOT_BY_DIRECTION[newest] : 'straight';
}

/* keys can be pressed by the keyboard or by the phone controls */
let listener = () => {};
export function keyDown(code, event){ held[code] = ++presses; listener(code, event); }
export function keyUp(code){ held[code] = 0; }

export function initKeyboard({ onPress, onBlur }){
  listener = onPress;
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    keyDown(e.code, e);
  });
  addEventListener('keyup', e => keyUp(e.code));
  addEventListener('blur', () => { for (const k in held) held[k] = 0; onBlur(); });
}
