/* What you see and hear when something happens in the rules. */
import { V } from '../render/layout.js';
import { burst } from '../render/effects.js';
import { normalArrows } from '../render/normal-arrows.js';
import { superArrows } from '../render/super-arrows.js';
import { note, floatText } from '../ui/messages.js';
import { powerColor, ESCAPE_HINT } from '../ui/dom.js';
import { play } from '../audio/sound.js';
import { POWERS, getCharacter } from '../core/index.js';

const upper = code => POWERS[code].name.toUpperCase();

/* one handler per event type; m = the running match */
const ON = {
  arrow(e){ normalArrows.spawn(e.arrow); play('bow', e.arrow.kind === 'hard' ? 1 : 0.55); },
  release(e, m){ superArrows.release(e.shot, m.actors); play(POWERS[e.shot.code].sound); },
  dodge(e, m){ normalArrows.dodge(e.arrow.uid); floatText(m.actors[e.to].chest(2.3), 'DODGE', '#9fe8ff'); },
  hit(e, m){
    const a = m.actors[e.to]; normalArrows.hit(e.arrow.uid); burst(a.chest(), 7, 0xff5030, 2, 0.35, 0.16);
    floatText(a.chest(2.3), '-' + e.damage + '%' + (e.to === 0 && m.hints ? '  (needed ' + ESCAPE_HINT[e.arrow.path] + ')' : ''), '#ffb347'); a.hurt = 0.2; play('punch', 0.5);
  },
  interrupted(e, m){
    const a = m.actors[e.to]; burst(a.chest(1.6), 40, 0xffffff, 4.5, 0.7, 0.3); a.hurt = 0.4; m.shake = 0.14;
    note(e.to === 0 ? 'Your ' + upper(e.code) + ' was broken by a slow arrow: call it again' : 'You broke ' + getCharacter(m.duel.f[e.to].id).name + "'s super arrow!", e.to === 0 ? '#ff8a7a' : '#9fffb0', 1.8);
    play('block', 1);
  },
  clash(e){ normalArrows.clash(e.a, e.b); play('block', 0.7); },
  blocked(e, m){ superArrows.blocked(e.uid, e.code, e.by); note(upper(e.by) + ' stops ' + upper(e.code), '#9fffb0'); m.shake = 0.12; play('explosion', 0.8); },
  failed(e, m){ burst(m.actors[e.to].chest(1.9), 14, POWERS[e.by].color, 3, 0.5); note(upper(e.by) + ' cannot stop ' + upper(e.code), '#ff8a7a'); },
  weakened(e, m){ burst(m.actors[e.to].chest(1.9), 30, 0xffffff, 4, 0.6); note(POWERS[e.by].name + ' weakens ' + POWERS[e.code].name + ': half damage', '#ffe9a0'); play('explosion', 0.6); },
  superhit(e, m){
    superArrows.remove(e.uid);
    const a = m.actors[e.to], big = e.damage >= 15;
    burst(a.chest(1.2), big ? 90 : 45, POWERS[e.code].color, big ? 7 : 5, 1.0, big ? 0.45 : 0.3);
    floatText(a.chest(2.3), '-' + e.damage + '%', '#ff6a5a'); note(upper(e.code) + ' hits ' + getCharacter(m.duel.f[e.to].id).name, powerColor(e.code));
    m.shake = big ? 0.35 : 0.18; a.hurt = 0.5; play('explosion', big ? 1 : 0.7);
  },
  over(){ play('ko'); normalArrows.clear(); superArrows.clear(); }
};
export function showEvent(e, match){ ON[e.type]?.(e, match); }

/* feedback for the player's own number keys */
export function showInput(result){
  if (!result) return;
  if (result.type === 'refused') note(result.why, '#ffb0a0', 1.1);
  if (result.type === 'late') { note('Too late!', '#ff8a7a', 1); play('warn', 0.6); }
  if (result.type === 'counter') { play('chi'); if (result.paused) note('Your call is paused while you counter', '#ffe9a0', 0.9); }
  if (result.type === 'call') play('charge', 0.7);
}
