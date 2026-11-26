/* Everything drawn over the match: health bars, the incoming arrow panel, its name tag and your own call. */
import { $, powerColor, ESCAPE_HINT } from './dom.js';
import { drawChart } from './chart.js';
import { camera } from '../render/stage.js';
import { clamp } from '../render/layout.js';
import { POWERS, T, answersTo, getCharacter } from '../core/index.js';

function setHtml(el, html){ if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html; } }

function drawSide(f, i){
  const s = $('s' + i), who = getCharacter(f.id);
  s.querySelector('i').style.width = f.hp + '%';
  s.querySelector('b').textContent = who.name + (i ? ' (computer)' : ' (you)') + '   ' + (Math.round(f.hp * 10) / 10) + '%';
  const rares = who.rares.map(c => f.used[c] ? '<s style="opacity:.4">' + POWERS[c].name + '</s>' : POWERS[c].name).join(' · ');
  const shields = Object.keys(POWERS).filter(c => POWERS[c].shield).map(c => (POWERS[c].short || POWERS[c].name) + ' ' + (f.used[c] ? '○' : '●')).join('  ·  ');
  setHtml(s.querySelector('.info'), rares + '  ·  ' + shields);
  setHtml($('q' + i), quiver(f.arrows));
}
/* how many arrows of each kind are left (colours match the flying arrows) */
function quiver(arrows){
  return [['fast', 'F · FAST'], ['hard', 'S · SLOW']].map(([kind, label]) => { const n = arrows[kind];
    return '<div class="' + kind + (n === 0 ? ' empty' : n <= 5 ? ' few' : '') + '"><span>' + label + '</span><b>' + n + '</b></div>'; }).join('');
}

/* the big warning in the middle: first that the opponent is preparing a super arrow, then which one it is */
function drawIncoming(inc, answers, caller){
  const box = $('incoming'), title = box.querySelector('.t'), small = box.querySelector('.s'), keys = box.querySelector('.k');
  box.style.display = inc || caller ? 'block' : 'none';
  box.classList.toggle('waiting', !inc);
  if (!inc) {
    if (caller) { title.textContent = caller + ' is preparing a super arrow…'; title.style.color = '#fff'; small.textContent = 'Break it with a slow arrow (S), or get your number keys ready'; setHtml(keys, ''); box.style.borderColor = ''; }
    return;
  }
  const p = POWERS[inc.code], left = clamp((inc.left - T.counterExec) / (T.flight - T.counterExec), 0, 1);
  title.textContent = p.name.toUpperCase() + ' (' + p.sanskrit + ')'; title.style.color = box.style.borderColor = powerColor(inc.code);
  box.querySelector('.meter i').style.width = left * 100 + '%';
  small.textContent = inc.tried ? 'Your try is used' : left <= 0 ? 'Too late' : answers.length ? 'PRESS THESE NUMBERS NOW (arrow keys cannot dodge it)' : 'PRESS ITS COUNTER NUMBERS NOW (arrow keys cannot dodge it)';
  setHtml(keys, answers.map(c => '<span><kbd>' + c[0] + '</kbd><kbd>' + c[1] + '</kbd>' + POWERS[c].name + (p.halvedBy?.includes(c) ? ' (half)' : '') + '</span>').join('<em>or</em>'));
}

/* a name tag that rides on the arrow coming at you (spot = its 3D position) */
function drawTag(inc, spot){
  const tag = $('tag'); tag.style.display = spot ? 'block' : 'none';
  if (!spot) return;
  const q = spot.clone().project(camera);
  tag.textContent = POWERS[inc.code].name.toUpperCase(); tag.style.color = tag.style.borderColor = powerColor(inc.code);
  tag.style.left = clamp((q.x + 1) * 640, 80, 1200) + 'px'; tag.style.top = ((1 - q.y) * 360 - 36) + 'px';
}

/* a tag on each ordinary arrow coming at you, saying which key escapes it */
function drawArrowTags(arrows, spot){
  const box = $('tags');
  while (box.children.length < arrows.length) box.appendChild(document.createElement('b'));
  [...box.children].forEach((el, i) => {
    const a = arrows[i], p = a && spot(a.uid); el.style.display = p ? 'block' : 'none'; if (!p) return;
    const q = p.clone().project(camera); el.textContent = ESCAPE_HINT[a.path]; el.className = a.kind;
    el.style.left = clamp((q.x + 1) * 640, 70, 1210) + 'px'; el.style.top = clamp((1 - q.y) * 360 - 22, 60, 520) + 'px';
  });
}

/* secret = hide the incoming arrow (paused with hints off); arrowSpot(uid) = position of a flying super arrow */
export function drawHud(duel, { hints, secret, arrowSpot, tipSpot }){
  duel.f.forEach(drawSide);
  const me = duel.f[0], inc = secret ? null : duel.incoming[0], answers = hints ? answersTo(duel, 0) : [];
  drawIncoming(inc, answers, !secret && duel.f[1].call ? getCharacter(duel.f[1].id).name : null);
  drawTag(inc, inc && arrowSpot(inc.uid));
  drawArrowTags(hints ? duel.arrows.filter(a => a.by === 1) : [], tipSpot);
  $('mine').textContent = me.digits ? 'Code ' + me.digits + ' _' : me.call ? 'Calling ' + POWERS[me.call.code].name.toUpperCase() + '  ' + me.call.left.toFixed(1) + ' s' : '';
  drawChart(me, answers);
}
export function showHud(on){ $('hud').style.visibility = on ? 'visible' : 'hidden'; }
