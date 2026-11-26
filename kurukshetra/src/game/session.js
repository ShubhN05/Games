/* Runs a match: starting, pausing, key presses and the frame by frame loop.
   Connects rules (core), computer (ai), pictures (render), screen (ui), sound and keyboard. */
import { createDuel, step, shoot, setStance, jump, cancelDraw, press, CHARACTERS, getCharacter, POWERS } from '../core/index.js';
import { $ } from '../ui/dom.js';
import { createAI, stepAI } from '../ai/computer.js';
import { render } from '../render/stage.js';
import { createActor } from '../render/archer.js';
import { normalArrows } from '../render/normal-arrows.js';
import { superArrows } from '../render/super-arrows.js';
import { stepParticles, clearParticles } from '../render/effects.js';
import { drawHud, showHud } from '../ui/hud.js';
import { buildCounterTable } from '../ui/chart.js';
import { settings, buildMenu, soundLabel, showMenu, helpOpen, showHelp } from '../ui/menu.js';
import { note, clearNote, banner, bannerText, tickMessages, clearFloats } from '../ui/messages.js';
import { play, toggleSound, soundOn } from '../audio/sound.js';
import { powerKeyOf, moveOf, KEYMAP, stanceFromKeys, pathFromKeys, initKeyboard } from '../input/keyboard.js';
import { showEvent, showInput } from './events.js';

/* the running match; duel === null means we are on the menu */
export const match = { duel: null, ai: null, actors: [], paused: false, overT: 0, shake: 0, buffered: null, hints: true, lesson: null };
let models = {}, loadModel = null, loading = false;

function clearScene(){ normalArrows.clear(); superArrows.clear(); clearParticles(); clearFloats(); }
function placeActors(ids){ Object.values(models).forEach(m => m.show(false)); match.actors = ids.map((id, side) => createActor(models[id], side)); }

/* build the fighters that are not ready yet, then carry on (at once when they all are) */
function withModels(ids, then){
  const missing = ids.filter(id => !models[id]);
  if (!missing.length) return void then();
  loading = true; $('loading').textContent = 'Loading ' + missing.map(id => getCharacter(id).name).join(' and ') + '…'; $('loading').style.display = 'flex';
  return Promise.all(missing.map(async id => { models[id] = await loadModel(id); })).then(() => { loading = false; $('loading').style.display = 'none'; then(); })
    .catch(error => { loading = false; $('loading').textContent = 'The fighter could not load: ' + error.message; throw error; });
}

export function start(archer = settings.archer, level = settings.level, opponent = settings.opponent){
  if (loading) return;
  settings.archer = archer; settings.level = level;
  const others = CHARACTERS.map(c => c.id).filter(id => id !== archer), foe = others.includes(opponent) ? opponent : others[Math.floor(Math.random() * others.length)];
  return withModels([archer, foe], () => begin(archer, foe, level));
}
/* the same two fighters once more */
const rematch = () => start(match.duel.f[0].id, settings.level, match.duel.f[1].id);

function begin(archer, foe, level){
  clearScene();
  Object.assign(match, { duel: createDuel([archer, foe]), ai: createAI(level), paused: false, overT: 0, shake: 0, buffered: null, lesson: null, hints: settings.hints === 'on' });
  placeActors([archer, foe]);
  showMenu(false); showHelp(false); banner('FIGHT'); clearNote();
  play('gong');
}

export function openMenu(){
  match.duel = null; clearScene();
  showMenu(true); showHelp(false); banner();
  placeActors(CHARACTERS.slice(0, 2).map(c => c.id));
}

/* with hints off, pausing must not give time to read the arrow */
const blind = () => !!match.duel && settings.hints === 'off' && !!match.duel.incoming[0];

function refresh(dt){
  const secret = match.paused && blind();
  tickMessages(dt);
  if (match.duel.t > 0.9 && bannerText() === 'FIGHT') banner();
  drawHud(match.duel, { hints: match.hints, secret, seen: match.ai.last, arrowSpot: uid => superArrows.position(uid), tipSpot: uid => normalArrows.position(uid) });
  superArrows.setVisible(!secret);
}

function setPause(on){
  if (on && blind()) clearParticles();                 // the glowing trail would tell which arrow it is
  match.paused = on; banner(on ? 'PAUSED' : '', on ? 'P = continue · R = restart · Esc = menu' : '');
  if (match.duel) refresh(0);
}
function toggleHelp(){
  const open = !helpOpen();
  if (open && blind()) return void note('No chart while an arrow is coming (hints off)', '#fff', 1.2);
  showHelp(open);
}
function toggleMute(){ const on = toggleSound(); soundLabel(on); return on; }

/* ---------------- player input ---------------- */
function fire(kind, path){                    // a shot pressed a moment too early is remembered, not lost
  const d = match.duel;
  if (shoot(d, 0, kind, path)) { match.buffered = null; return; }
  const f = d.f[0];
  if (f.arrows[kind] <= 0) note('No ' + (kind === 'fast' ? 'fast' : 'slow') + ' arrows left', '#ffb0a0', 1); else if (f.call) note('You are calling a super arrow', '#ffb0a0', 0.9); else match.buffered = { kind, path, t: 0.45 };
}

function onPress(code, event){
  const d = match.duel;
  if (code === KEYMAP.mute) return void note(toggleMute() ? 'Sound on' : 'Sound off', '#fff', 0.8);
  if (code === KEYMAP.help) return void toggleHelp();
  if (code === KEYMAP.menu) {
    if (helpOpen()) return void toggleHelp();
    if (!d) return;
    return void (d.winner !== null || match.paused ? openMenu() : setPause(true));
  }
  if (!d) {
    const b = document.activeElement, chosen = b?.tagName === 'BUTTON' && b.matches(':focus-visible');     // a button reached with Tab: Enter presses it
    if (code === KEYMAP.start && !helpOpen() && !chosen) { event?.preventDefault(); start(); }
    return;
  }
  if (helpOpen()) return;
  if (code === KEYMAP.restart) return void (d.winner !== null || match.paused ? rematch() : note('To restart: pause (P), then R', '#fff', 1.2));
  if (code === KEYMAP.pause) return void (d.winner === null && setPause(!match.paused));
  if (match.paused || d.winner !== null) return;
  const move = moveOf(code);
  if (move) {                                  // moving comes first: it gives up a shot being drawn
    match.buffered = null;
    if (cancelDraw(d, 0)) note('Shot cancelled', '#fff', 0.7);
    setStance(d, 0, stanceFromKeys());
    if (move === 'jump') jump(d, 0);
    if (d.incoming[0] && !d.incoming[0].tried && !POWERS[d.incoming[0].code].lower) note('A super arrow cannot be dodged: press its counter', '#ffe9a0', 1.6);
  }
  const weapon = powerKeyOf(code);
  if (weapon) showInput(press(d, 0, weapon), match);
  if (code === KEYMAP.fast || code === KEYMAP.hard) { setStance(d, 0, stanceFromKeys()); fire(code === KEYMAP.fast ? 'fast' : 'hard', pathFromKeys()); }
}

/* ---------------- one frame ---------------- */
function advance(dt){
  const d = match.duel;
  if (d.winner === null) {
    setStance(d, 0, stanceFromKeys());
    const b = match.buffered;
    if (b) { if ((b.t -= dt) <= 0 || shoot(d, 0, b.kind, b.path)) match.buffered = null; }
    stepAI(d, 1, match.ai, dt);
    for (const e of step(d, dt)) {
      showEvent(e, match);
      if (e.type === 'over') { match.overT = 0.001; match.buffered = null; clearNote(); }
    }
  } else if (match.overT > 0 && (match.overT += dt) > 1.2) {
    banner(d.winner === 'draw' ? 'DRAW' : d.winner === 0 ? 'VICTORY' : 'DEFEAT', (d.winner === 1 && match.lesson ? match.lesson + '<br>' : '') + 'R = fight again · Esc = menu'); match.overT = 0;
  }
}

export function frame(dt, draw = true){
  const d = match.duel;
  if (d && !match.paused && !helpOpen()) {
    advance(dt);
    normalArrows.update(dt); superArrows.update(d, match.actors);
    match.actors.forEach(a => a.pose(dt, d)); stepParticles(dt); refresh(dt);
  } else if (d) tickMessages(dt);                 // messages still fade while paused
  else match.actors.forEach(a => a.pose(dt, null));
  showHud(!!match.duel);
  if (!draw) return;
  match.shake = Math.max(0, match.shake - dt * 0.8);
  render(match.shake);
}

export function init(loadedModels, { onArena, load }){
  models = loadedModels; loadModel = load;
  initKeyboard({ onPress, onBlur: () => { if (match.duel && match.duel.winner === null) setPause(true); } });
  buildMenu({ onStart: () => start(), onHelp: toggleHelp, onSound: toggleMute, onArena });
  buildCounterTable(); soundLabel(soundOn());
  openMenu();
}
