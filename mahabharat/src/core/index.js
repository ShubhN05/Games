/* The public face of the rules. The rest of the game imports from here. */
export { T, DMG, ARROWS, ESCAPE } from './constants.js';
export { createDuel, step } from './duel.js';
export { shoot, setStance } from './arrows.js';
export { inputCode, cancelCode, answersTo, owns } from './supers.js';
export { POWERS } from '../content/powers.js';
export { CHARACTERS, getCharacter } from '../content/characters/index.js';
