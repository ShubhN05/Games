/* The number chart at the bottom of the screen and the counter table. Both are built from content/powers.js. */
import { $, powerColor } from './dom.js';
import { POWERS, CHARACTERS, owns } from '../core/index.js';

const columns = () => ['1', '2', '3', '4', '5'].map(n => Object.keys(POWERS).filter(c => c[0] === n));
let shown = '';

/* f = the player's fighter, answers = codes to highlight, seen = the last arrow the computer has watched */
export function drawChart(f, answers, seen){
  const key = f.id + f.digits + JSON.stringify(f.used) + answers.join() + seen; if (key === shown) return; shown = key;
  $('chart').innerHTML = columns().map((col, n) => '<div class="col' + (f.digits === String(n + 1) ? ' on' : '') + '">' + col.map(c => {
    const p = POWERS[c], gone = p.rare && (f.used[c] || !owns(f, c));
    return '<div class="' + (answers.includes(c) ? 'ans' : gone ? 'gone' : '') + '"><u>' + c + '</u><span class="dot" style="background:' + powerColor(c) + '"></span>' + p.name + (c === seen && !gone ? '<small>seen</small>' : '') + '</div>';
  }).join('') + '</div>').join('');
}

export function buildCounterTable(){
  const named = c => c + ' ' + POWERS[c].name;
  $('table').innerHTML = '<table><tr><th>Code</th><th>Power</th><th>Stopped by</th></tr>' + Object.entries(POWERS).filter(([, p]) => !p.shield).map(([code, p]) => {
    const owners = CHARACTERS.filter(a => a.rares.includes(code)).map(a => a.name).join(', ');
    const who = p.rare ? ' <small>(' + (owners || 'not in this version') + ' · once)</small>' : '';
    const by = (p.lower ? 'Hold ↓ (lower your bow) and do not attack, or ' : '') + p.counters.map(named).join(' or ') + (p.halvedBy || []).map(c => ' · ' + named(c) + ' halves it').join('') + (p.game ? ' *' : '');
    return '<tr><td><b>' + code + '</b></td><td style="color:' + powerColor(code) + '">' + p.name + who + '</td><td>' + by + '</td></tr>';
  }).join('') + '</table>';
}
