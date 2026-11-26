/* The weapon strip at the bottom of the screen and the counter table. Both are built from content/powers.js. */
import { $, powerColor } from './dom.js';
import { HOLD, keyLabel } from './advice.js';
import { POWERS, CHARACTERS, owns } from '../core/index.js';

const ordinary = () => Object.keys(POWERS).filter(c => !POWERS[c].rare);
let shown = '';

/* f = the player's fighter, answers = ids to highlight, seen = the last arrow the computer has watched.
   Left: the circle of ordinary arrows (each is stopped by the next). Right: your big weapons and the shield. */
export function drawChart(f, answers, seen){
  const key = f.id + JSON.stringify(f.used) + answers.join() + seen; if (key === shown) return; shown = key;
  const tile = c => {
    const p = POWERS[c], gone = p.rare && f.used[c];
    return '<div class="w ' + (answers.includes(c) ? 'ans' : gone ? 'gone' : '') + '"><u>' + p.key + '</u><span style="color:' + powerColor(c) + '">' + (p.short || p.name) + '</span>' + (c === seen && !gone ? '<small>seen</small>' : '') + '</div>';
  };
  const ring = ordinary(), again = '<div class="w again' + (answers.includes(ring[0]) ? ' ans' : '') + '"><u>' + POWERS[ring[0]].key + '</u></div>';
  const mine = Object.keys(POWERS).filter(c => POWERS[c].rare && owns(f, c));
  $('chart').innerHTML = '<div class="group"><p>Each arrow is stopped by the NEXT one ▸</p><div class="row">' + ring.map(tile).join('<i>▸</i>') + '<i>▸</i>' + again + '</div></div>'
    + '<div class="group big"><p>Once per match</p><div class="row">' + mine.map(tile).join('') + '</div></div>';
}

export function buildCounterTable(){
  const named = c => keyLabel(c) + ' ' + POWERS[c].name;
  $('table').innerHTML = '<table><tr><th>Key</th><th>Power</th><th>Stopped by</th></tr>' + Object.entries(POWERS).filter(([, p]) => !p.shield).map(([code, p]) => {
    const owners = CHARACTERS.filter(a => a.rares.includes(code)).map(a => a.name).join(', ');
    const who = p.rare ? ' <small>(' + (owners || 'not in this version') + ' · once)</small>' : '';
    const by = (p.lower ? HOLD[0].toUpperCase() + HOLD.slice(1) + ' ↓ (lower your bow) and do not attack, or ' : '') + p.counters.map(named).join(' or ') + (p.halvedBy || []).map(c => ' · ' + named(c) + ' halves it').join('') + (p.game ? ' *' : '');
    return '<tr><td><b>' + keyLabel(code) + '</b></td><td style="color:' + powerColor(code) + '">' + p.name + who + '</td><td>' + by + '</td></tr>';
  }).join('') + '</table>';
}
