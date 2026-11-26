/* Everything drawn over the match: health bars, the incoming arrow panel, its name tag and your own call. */
import { $, powerColor } from './dom.js';
import { ESCAPE_HINT, HOLD, HOLDING, SHIELD, keyLabel, answerText } from './advice.js';
import { drawChart } from './chart.js';
import { camera } from '../render/stage.js';
import { clamp } from '../render/layout.js';
import { POWERS, T, answersTo, bowLowered, shieldFor, breakTime, jumpCue, getCharacter } from '../core/index.js';

function setHtml(el, html){ if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html; } }

function drawSide(f, i){
  const s = $('s' + i), who = getCharacter(f.id);
  s.querySelector('i').style.width = f.hp + '%';
  if (f.hp < Number(s.dataset.hp)) { s.classList.remove('hurt'); void s.offsetWidth; s.classList.add('hurt'); }     // the bar flashes
  s.dataset.hp = f.hp;
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

/* The warning panel below the archers, where no arrow flies behind it:
   first that the opponent is preparing a super arrow (and how long it can still be broken), then which one is coming.
   With counter keys to show it is tall and covers the chart; otherwise it stays small. */
function drawIncoming(duel, inc, answers, caller, hints){
  const box = $('incoming'), title = box.querySelector('.t'), small = box.querySelector('.s'), keys = box.querySelector('.k'), meter = box.querySelector('.meter i');
  const me = duel.f[0], say = (text, mood = '') => { small.textContent = text; small.className = 's ' + mood; };
  box.style.display = inc || caller ? 'flex' : 'none';
  $('keys').style.visibility = inc || caller ? 'hidden' : '';           // the panel takes the place of the key help
  box.classList.toggle('waiting', !inc);
  if (!inc) {
    box.classList.remove('full'); if (!caller) return;
    const open = breakTime(duel, 1), can = open > 0 && me.arrows.hard > 0 && !me.call;
    title.textContent = caller + ' is preparing a super arrow…'; title.style.color = '#fff'; box.style.borderColor = ''; setHtml(keys, '');
    box.classList.toggle('open', can);
    meter.style.width = clamp(open / (T.call - T.hard.draw - T.hard.flight), 0, 1) * 100 + '%';
    if (can) say('BREAK IT: shoot a slow arrow (S) NOW', 'good');
    else if (me.call) say('Finish your own arrow, then be ready to counter');
    else say(open > 0 ? 'No slow arrows left: get your counter ready' : 'Too late to break it: get your counter ready');
    return;
  }
  const p = POWERS[inc.code], canLower = p.lower && !inc.resisted && !inc.tried;
  const lowering = p.lower && !inc.resisted;
  const left = lowering ? clamp(inc.left / T.flight, 0, 1) : clamp((inc.left - T.counterExec) / (T.flight - T.counterExec), 0, 1);     // a bow can be lowered until it arrives
  title.textContent = p.name.toUpperCase() + ' (' + p.sanskrit + ')'; title.style.color = box.style.borderColor = powerColor(inc.code);
  box.classList.add('open'); meter.style.width = left * 100 + '%';
  const reply = inc.reply, sent = reply && POWERS[reply.code].name;
  if (reply?.result === 'good') say('✓ RIGHT: ' + sent + ' will stop it', 'good');
  else if (reply?.result === 'half') say('✓ ' + sent + ' will halve it', 'good');
  else if (lowering && bowLowered(me)) say('BOW LOWERED: keep ' + HOLDING + ' ↓ and do not attack', 'good');
  else if (reply) say((reply.result === 'late' ? '✗ TOO LATE. ' : '✗ WRONG: ' + sent + ' cannot stop it. ') + 'Needed: ' + answerText(inc.code, me), 'bad');
  else if (p.lower && inc.resisted) say(shieldFor(duel, 0) ? 'It turned on you: only the ' + SHIELD + ' stops it now' : 'It turned on you: nothing can stop it now', 'bad');
  else if (canLower) say(hints ? 'LOWER YOUR BOW: ' + HOLD + ' ↓ and do not attack' : 'ANSWER IT NOW');
  else say(left <= 0 ? 'Too late' : 'PRESS ITS COUNTER NOW (moving cannot dodge it)');
  const choices = answers.map(c => '<span><kbd>' + keyLabel(c) + '</kbd>' + POWERS[c].name + (p.halvedBy?.includes(c) ? ' (half)' : '') + '</span>');
  if (lowering && !inc.tried && hints) choices.unshift('<span><kbd>↓</kbd>lower your bow</span>');
  setHtml(keys, choices.join('<em>or</em>'));
  box.classList.toggle('full', choices.length > 0);
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
    const q = p.clone().project(camera), cue = a.path === 'low' ? jumpCue(a) : undefined;
    if (cue === null) { el.style.display = 'none'; return; }                     // too late to jump: stop telling
    el.textContent = cue === 'now' ? 'JUMP ↑ NOW' : cue === 'wait' ? '↑ wait…' : ESCAPE_HINT[a.path]; el.className = a.kind + (cue ? ' ' + cue : '');
    el.style.left = clamp((q.x + 1) * 640, 70, 1210) + 'px'; el.style.top = clamp((1 - q.y) * 360 - 22, 60, 520) + 'px';
  });
}

/* secret = hide the incoming arrow (paused with hints off); arrowSpot(uid) = position of a flying super arrow */
export function drawHud(duel, { hints, secret, seen, arrowSpot, tipSpot }){
  duel.f.forEach(drawSide);
  const me = duel.f[0], inc = secret ? null : duel.incoming[0], answers = hints ? answersTo(duel, 0) : [];
  drawIncoming(duel, inc, answers, !secret && duel.f[1].call ? getCharacter(duel.f[1].id).name : null, hints);
  drawTag(inc, inc && arrowSpot(inc.uid));
  drawArrowTags(hints ? duel.arrows.filter(a => a.by === 1) : [], tipSpot);
  $('mine').textContent = me.call ? 'Calling ' + POWERS[me.call.code].name.toUpperCase() + '  ' + me.call.left.toFixed(1) + ' s' : '';
  drawChart(me, answers, seen);
}
export function showHud(on){ $('hud').style.visibility = on ? 'visible' : 'hidden'; }
