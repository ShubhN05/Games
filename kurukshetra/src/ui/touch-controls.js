/* The phone controls. They press the same keys as the keyboard (keyDown / keyUp), so the rules and the match
   do not know the difference.
   Left: F, S, SUPER (hold, slide to one of the five arrows) and the star (big weapons and shield).
   Right: the joystick. Top: pause. A bar of buttons while paused or after the match. */
import { $, powerColor } from './dom.js';
import { TOUCH } from './device.js';
import { POWERS, owns, answersTo } from '../core/index.js';
import { stickDirection, pickByAngle } from '../input/gestures.js';
import { keyDown, keyUp, KEYMAP } from '../input/keyboard.js';

const MOVES = { jump: KEYMAP.jump, crouch: KEYMAP.crouch, back: KEYMAP.back, forward: KEYMAP.forward };
const ANGLES = { 2: [75, 30], 3: [85, 45, 5], 5: [95, 70, 45, 20, -5] };      // where the wheel circles sit
const keyCode = key => /^\d$/.test(key) ? 'Digit' + key : KEYMAP.shield;

let state = null;                 // the latest { duel, paused, help, hints, over } from the match
let stick = null;                 // { id, dir } while the joystick is touched
let wheel = null;                 // { id, button, ids, angles, x, y, pick } while a wheel is open
const held = new Map();           // pointer id -> key held by the F or S button

const tap = code => { keyDown(code); keyUp(code); };
function make(parent, id, html, cls = ''){ const e = document.createElement('div'); e.id = id; e.className = cls; e.innerHTML = html; parent.appendChild(e); return e; }
/* follow one finger on a control until it lifts */
function onFinger(el, { down, move, up }){
  el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (err) {} down(e); });
  if (move) el.addEventListener('pointermove', move);
  if (up) for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(type, up);
}

/* ---------------- joystick ---------------- */
function steer(e){
  if (!stick || e.pointerId !== stick.id) return;
  const base = $('tStick').getBoundingClientRect(), dx = e.clientX - (base.left + base.width / 2), dy = e.clientY - (base.top + base.height / 2);
  const far = Math.hypot(dx, dy), limit = base.width * 0.32, k = far > limit ? limit / far : 1;
  $('tKnob').style.transform = 'translate(' + dx * k + 'px,' + dy * k + 'px)';
  turn(stickDirection(dx, dy, stick.dir));
}
function turn(dir){
  if (dir === stick.dir) return;
  if (stick.dir) keyUp(MOVES[stick.dir]);
  stick.dir = dir; $('tStick').dataset.dir = dir || '';
  if (dir) keyDown(MOVES[dir]);
}
function letGoStick(e){
  if (!stick || (e && e.pointerId !== stick.id)) return;
  turn(null); stick = null; $('tKnob').style.transform = '';
}

/* ---------------- wheels ---------------- */
/* what a wheel offers: SUPER = the ordinary arrows; the star = your big weapons and the shield */
const offers = (button, me) => Object.keys(POWERS).filter(c => button === 'tSuper' ? !POWERS[c].rare : POWERS[c].rare && owns(me, c));
function openWheel(button, e){
  if (wheel || !state?.duel) return;
  const ids = offers(button, state.duel.f[0]), angles = ANGLES[ids.length] || ids.map((x, i) => 95 - i * 100 / Math.max(1, ids.length - 1));
  const r = $(button).getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, far = Math.max(112, r.width * 2.1);
  const box = $('tWheel');
  box.innerHTML = ids.map((c, i) => {
    const p = POWERS[c], a = angles[i] * Math.PI / 180;
    return '<div class="item" data-c="' + c + '" style="left:' + (x + Math.cos(a) * far) + 'px;top:' + (y - Math.sin(a) * far) + 'px;border-color:' + powerColor(c) + '"><b>' + (p.rare ? '★' : p.key) + '</b><span>' + (p.short || p.name) + '</span></div>';
  }).join('') + '<div id="tPick"></div>';
  box.style.display = 'block'; $(button).classList.add('down');
  wheel = { id: e.pointerId, button, ids, angles, x: e.clientX, y: e.clientY, pick: null };
  paintWheel();
}
function slide(e){
  if (!wheel || e.pointerId !== wheel.id) return;
  wheel.pick = pickByAngle(e.clientX - wheel.x, e.clientY - wheel.y, wheel.angles); paintWheel();
}
function closeWheel(choose){
  if (!wheel) return;
  const code = choose && wheel.pick !== null ? wheel.ids[wheel.pick] : null;
  $(wheel.button).classList.remove('down'); $('tWheel').style.display = 'none'; wheel = null;
  if (code) tap(keyCode(POWERS[code].key));
}
function lift(e){ if (wheel && e.pointerId === wheel.id) closeWheel(e.type === 'pointerup'); }

/* ---------------- what can be used, and (with hints) what to use ---------------- */
function usable(c){
  const d = state.duel, f = d.f[0], p = POWERS[c], inc = d.incoming[0];
  if (p.shield) return !!inc && !!POWERS[inc.code].rare && !f.used[c];
  return !p.rare || !f.used[c] || answersTo(d, 0).includes(c);
}
const answers = () => state?.hints && state.duel ? answersTo(state.duel, 0) : [];
function paintWheel(){
  const good = answers();
  for (const el of $('tWheel').querySelectorAll('.item')) {
    const c = el.dataset.c, i = wheel.ids.indexOf(c);
    el.className = 'item' + (i === wheel.pick ? ' pick' : '') + (good.includes(c) ? ' ans' : usable(c) ? '' : ' gone');
  }
  const p = wheel.pick === null ? null : POWERS[wheel.ids[wheel.pick]];
  $('tPick').textContent = p ? 'Let go: ' + p.name : 'Slide to a circle';
}

/* ---------------- building and updating ---------------- */
export function releaseTouch(){
  if (!TOUCH) return;
  letGoStick(); closeWheel(false);
  for (const code of held.values()) keyUp(code); held.clear();
  document.querySelectorAll('#tPlay .btn').forEach(b => b.classList.remove('down'));
}

export function initTouch({ onPortrait }){
  if (!TOUCH) return;
  document.body.classList.add('touch');
  const root = make(document.body, 'touch', ''), play = make(root, 'tPlay', '');
  make(play, 'tSuper', 'SUPER', 'btn'); make(play, 'tStar', '★', 'btn'); make(play, 'tFast', 'F<small>FAST</small>', 'btn'); make(play, 'tSlow', 'S<small>SLOW</small>', 'btn');
  const base = make(play, 'tStick', '<i class="u">↑</i><i class="d">↓</i><i class="l">←</i><i class="r">→</i>'); make(base, 'tKnob', '');
  make(play, 'tPause', 'Ⅱ', 'btn'); make(play, 'tWheel', '');
  const bar = make(root, 'tBar', '');
  for (const [id, label, key, when] of [['tGo', 'CONTINUE', KEYMAP.pause, 'paused'], ['tAgain', 'FIGHT AGAIN', KEYMAP.restart, 'both'], ['tChart', 'CHART', KEYMAP.help, 'paused'], ['tSound', 'SOUND', KEYMAP.mute, 'paused'], ['tMenu', 'MENU', KEYMAP.menu, 'both']]) {
    const b = document.createElement('button'); b.id = id; b.textContent = label; b.dataset.when = when; b.onclick = () => { b.blur(); tap(key); }; bar.appendChild(b);
  }
  make(document.body, 'rotate', '<b>⟳</b>Turn your phone sideways');

  onFinger($('tStick'), { down: e => { if (stick) return; stick = { id: e.pointerId, dir: null }; steer(e); }, move: steer, up: letGoStick });
  for (const [id, code] of [['tFast', KEYMAP.fast], ['tSlow', KEYMAP.hard]]) {
    onFinger($(id), { down: e => { held.set(e.pointerId, code); $(id).classList.add('down'); keyDown(code); },
      up: e => { if (!held.delete(e.pointerId)) return; $(id).classList.remove('down'); keyUp(code); } });
  }
  for (const id of ['tSuper', 'tStar']) onFinger($(id), { down: e => openWheel(id, e), move: slide, up: lift });
  onFinger($('tPause'), { down: () => tap(KEYMAP.pause) });
  root.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('blur', releaseTouch);
  const upright = matchMedia('(orientation: portrait)');
  state = { portrait: upright, onPortrait };
}

/* called every frame by the match */
export function updateTouch(now){
  if (!TOUCH || !state) return;
  Object.assign(state, now);
  const { duel, paused, help, over, portrait } = state;
  const fighting = !!duel && duel.winner === null && !paused && !help;
  if (fighting && portrait.matches) return void state.onPortrait();
  if (!fighting && (stick || wheel || held.size)) releaseTouch();
  $('tPlay').style.display = fighting ? 'block' : 'none';
  const show = !!duel && !help && (paused || over);
  $('tBar').style.display = show ? 'flex' : 'none';
  if (show) for (const b of $('tBar').children) b.style.display = b.dataset.when === 'both' || (paused && !over) ? '' : 'none';
  if (!fighting) return;
  const good = answers();
  $('tSuper').classList.toggle('call', good.some(c => !POWERS[c].rare));
  $('tStar').classList.toggle('call', good.some(c => POWERS[c].rare));
  if (wheel) paintWheel();
}
