/* The keyboard. All key choices are in KEYMAP. */
export const KEYMAP = {
  fast: 'KeyF', hard: 'KeyS', high: 'KeyD', jump: 'ArrowUp', crouch: 'ArrowDown', back: 'ArrowLeft', forward: 'ArrowRight',
  clear: 'Space', pause: 'KeyP', restart: 'KeyR', help: 'KeyH', mute: 'KeyM', menu: 'Escape', start: 'Enter'
};
export const digitOf = code => /^(Digit|Numpad)([1-5])$/.exec(code)?.[2];

const held = {};
export const isDown = action => !!held[KEYMAP[action]];
export const stanceFromKeys = () => isDown('crouch') ? 'crouch' : isDown('back') && !isDown('forward') ? 'back' : isDown('forward') && !isDown('back') ? 'forward' : 'mid';
export const pathFromKeys = () => isDown('jump') ? 'jump' : isDown('high') ? 'high' : 'straight';

export function initKeyboard({ onPress, onBlur }){
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    held[e.code] = true;
    if (!e.repeat) onPress(e.code);
  });
  addEventListener('keyup', e => { held[e.code] = false; });
  addEventListener('blur', () => { for (const k in held) held[k] = false; onBlur(); });
}
