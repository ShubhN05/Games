/* What you see and hear when something happens in the rules. */
import { V } from '../render/layout.js';
import { burst } from '../render/effects.js';
import { normalArrows } from '../render/normal-arrows.js';
import { superArrows } from '../render/super-arrows.js';
import { note, floatText } from '../ui/messages.js';
import { powerColor } from '../ui/dom.js';
import { SHIELD, answerText, hitAdvice } from '../ui/advice.js';
import { play } from '../audio/sound.js';
import { POWERS, shieldFor, getCharacter } from '../core/index.js';

const upper = code => POWERS[code].name.toUpperCase();

/* one handler per event type; m = the running match */
const ON = {
  arrow(e){ normalArrows.spawn(e.arrow); play('bow', e.arrow.kind === 'hard' ? 1 : 0.55); },
  release(e, m){ superArrows.release(e.shot, m.actors); play(POWERS[e.shot.code].sound); },
  dodge(e, m){ normalArrows.dodge(e.arrow.uid); floatText(m.actors[e.to].chest(2.3), 'DODGE', '#9fe8ff'); },
  hit(e, m){
    const a = m.actors[e.to], slow = e.arrow.kind === 'hard'; normalArrows.hit(e.arrow.uid); burst(a.chest(), slow ? 24 : 12, 0xff5030, slow ? 3.5 : 2.5, 0.45, slow ? 0.24 : 0.18);
    floatText(a.chest(2.3), '-' + e.damage + '%' + (e.to === 0 && m.hints ? '  (' + hitAdvice(e.arrow.path, m.duel.f[0]) + ')' : ''), '#ffb347');
    a.hurt = slow ? 0.5 : 0.3; m.shake = Math.max(m.shake, slow ? 0.15 : 0.07); m.lesson = null; play('punch', slow ? 0.8 : 0.5);
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
  lowered(e){ if (e.to === 0) note('Bow lowered: your ' + upper(e.code) + ' is dropped', '#ffe9a0', 1.6); },
  resisted(e, m){
    const left = shieldFor(m.duel, 0) ? 'only the ' + SHIELD + ' stops it now' : 'nothing can stop it now';
    note(e.to === 0 ? 'You resisted the ' + upper(e.code) + ': ' + left : getCharacter(m.duel.f[e.to].id).name + ' resisted your ' + upper(e.code), e.to === 0 ? '#ff8a7a' : '#9fffb0', 2); play('warn', 0.8);
  },
  spared(e, m){
    superArrows.remove(e.uid); const a = m.actors[e.to], who = getCharacter(m.duel.f[e.to].id).name;
    burst(a.chest(2.1), 45, POWERS[e.code].color, 4, 0.9, 0.3); floatText(a.chest(2.3), 'PASSES BY', '#9fe8ff');
    note(e.to === 0 ? 'Bow lowered: ' + upper(e.code) + ' passes you by' : who + ' lowered the bow: your ' + upper(e.code) + ' passes by', e.to === 0 ? '#9fffb0' : '#ffb0a0', 2); play('block', 0.8);
  },
  superhit(e, m){
    superArrows.remove(e.uid);
    const a = m.actors[e.to], big = e.damage >= 15;
    burst(a.chest(1.2), big ? 90 : 45, POWERS[e.code].color, big ? 7 : 5, 1.0, big ? 0.45 : 0.3);
    floatText(a.chest(2.3), '-' + e.damage + '%', '#ff6a5a');
    if (e.to === 0) { m.lesson = upper(e.code) + ' hit you. Stop it with: ' + answerText(e.code, m.duel.f[0]); note(m.lesson, '#ffb0a0', 3.2); }
    else { m.lesson = null; note(upper(e.code) + ' hits ' + getCharacter(m.duel.f[e.to].id).name, powerColor(e.code)); }
    m.shake = big ? 0.35 : 0.18; a.hurt = 0.5; play('explosion', big ? 1 : 0.7);
  },
  over(){ play('ko'); normalArrows.clear(); superArrows.clear(); }
};
export function showEvent(e, match){ ON[e.type]?.(e, match); }

/* feedback for the player's own weapon keys */
export function showInput(result, m){
  if (!result) return;
  if (result.type === 'refused') note(result.why, '#ffb0a0', 1.1);
  if (result.type === 'late') { note('Too late!', '#ff8a7a', 1); play('warn', 0.6); }
  if (result.type === 'counter') { play('chi'); if (result.paused) note('Your call is paused while you counter', '#ffe9a0', 0.9); }
  if (result.type === 'call') {
    play('charge', 0.7);
    if (result.code === m.ai.last) note(getCharacter(m.duel.f[1].id).name + ' has seen your ' + upper(result.code) + ': change arrows to surprise', '#ffb347', 2.4);
  }
}
