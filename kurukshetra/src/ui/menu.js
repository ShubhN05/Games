/* The start menu and the counter chart window. Buttons are built from the roster, levels and arenas. */
import { $ } from './dom.js';
import { showIntro, play } from './intro.js';
import { CHARACTERS } from '../core/index.js';
import { ARENAS } from '../content/arenas/index.js';
import { LEVELS } from '../ai/levels.js';

export const settings = { archer: CHARACTERS[0].id, opponent: 'random', level: 'normal', hints: 'on', arena: ARENAS[0].id };

function choices(box, options, key, onPick){
  const pick = value => { settings[key] = value; for (const b of box.children) b.classList.toggle('sel', b.dataset.v === value); };
  box.replaceChildren(...options.map(([value, label]) => {
    const b = document.createElement('button'); b.dataset.v = value; b.textContent = label;
    b.onclick = () => { b.blur(); pick(value); onPick?.(value); };
    return b;
  }));
  pick(settings[key]);
}

export function buildMenu({ onStart, onHelp, onSound, onArena }){
  choices($('pickO'), [['random', 'RANDOM'], ...CHARACTERS.map(c => [c.id, c.name])], 'opponent');
  /* nobody fights themselves: grey out your own archer among the opponents */
  const guard = () => { for (const b of $('pickO').children) b.disabled = b.dataset.v === settings.archer; if (settings.opponent === settings.archer) $('pickO').children[0].click(); };
  choices($('pickA'), CHARACTERS.map(c => [c.id, c.name]), 'archer', guard);
  guard();
  choices($('pickH'), [['on', 'ON'], ['off', 'OFF']], 'hints');
  choices($('pickL'), Object.entries(LEVELS).map(([id, l]) => [id, l.name]), 'level');
  choices($('pickR'), ARENAS.map(a => [a.id, a.name.toUpperCase()]), 'arena', onArena);
  $('arenaRow').hidden = ARENAS.length < 2;
  $('bStart').onclick = () => { $('bStart').blur(); onStart(); };
  $('bHelp').onclick = $('bClose').onclick = e => { e.target.blur(); onHelp(); };
  $('bSound').onclick = e => { e.target.blur(); onSound(); };
  $('bIntro').onclick = e => { e.target.blur(); showIntro(); play(); };
}
export function soundLabel(on){ $('bSound').textContent = 'SOUND: ' + (on ? 'ON' : 'OFF') + ' (M)'; }
export function showMenu(on){ $('menu').style.display = on ? 'flex' : 'none'; }
export const helpOpen = () => $('help').style.display === 'flex';
export function showHelp(on){ $('help').style.display = on ? 'flex' : 'none'; }
