/* Sound for the game. The sounds themselves are in sfx.js. */
import { createSfx } from './sfx.js';

const sfx = createSfx();
export const play = (name, volume) => sfx.play(name, volume);
export const toggleSound = () => sfx.toggle();
export const soundOn = () => sfx.on;
