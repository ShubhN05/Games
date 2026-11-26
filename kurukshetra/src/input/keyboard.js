/* The keyboard. All key choices are in KEYMAP. When two movement keys are held, the newest one wins. */
export const KEYMAP = {
  fast: 'KeyF', hard: 'KeyS', low: 'KeyA', high: 'KeyD', jump: 'ArrowUp', crouch: 'ArrowDown', back: 'ArrowLeft', forward: 'ArrowRight',
  clear: 'Space', pause: 'KeyP', restart: 'KeyR', help: 'KeyH', mute: 'KeyM', menu: 'Escape', start: 'Enter'
};
export const digitOf = code => /^(Digit|Numpad)([1-5])$/.exec(code)?.[2];
export const moveOf = code => ['jump', 'crouch', 'back', 'forward'].find(a => KEYMAP[a] === code);

const held = {};                 // key -> when it was pressed (0 = not held)
let presses = 0;
const since = action => held[KEYMAP[action]] || 0;
export const isDown = action => since(action) > 0;
export function stanceFromKeys(){
  const newest = ['crouch', 'back', 'forward'].filter(isDown).sort((a, b) => since(b) - since(a))[0];
  return !newest || (newest === 'crouch' && since('jump') > since('crouch')) ? 'mid' : newest;
}
export const pathFromKeys = () => isDown('low') ? 'low' : isDown('jump') ? 'jump' : isDown('high') ? 'high' : 'straight';

export function initKeyboard({ onPress, onBlur }){
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    held[e.code] = ++presses;
    onPress(e.code, e);
  });
  addEventListener('keyup', e => { held[e.code] = 0; });
  addEventListener('blur', () => { for (const k in held) held[k] = 0; onBlur(); });
}
