/* Sound: YUDH's code-made sounds. Add new sounds here when the game gets its own. */
import { createSfx } from '../shared/yudh.js';

const sfx = createSfx();
export const play = (name, volume) => sfx.play(name, volume);
export const toggleSound = () => sfx.toggle();
export const soundOn = () => sfx.on;
