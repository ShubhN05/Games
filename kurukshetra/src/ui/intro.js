/* The introduction film, shown before the menu while the game loads behind it. The films are in media/
   (made by tools/intro/record.py). It starts by itself every time the game is opened, with SKIP always there.
   Browsers usually refuse sound until the player has tapped: then it plays silently with a TAP FOR SOUND button,
   and a tap starts it again from the beginning with sound. If even the silent start is refused, PLAY is offered.
   Add ?intro=0 to the address to go straight to the menu. */
import { $ } from './dom.js';
import { TOUCH } from './device.js';
import { soundOn } from '../audio/sound.js';

const FILE = TOUCH ? 'media/intro-phone.mp4' : 'media/intro.mp4';      // phones are shown thumbs, computers keys
let open = false;
export const introOpen = () => open;

export function initIntro(){
  const box = document.createElement('div'); box.id = 'intro';
  box.innerHTML = '<video id="iFilm" playsinline preload="auto" src="' + FILE + '"></video>'
    + '<div id="iStart"><h1>KURUKSHETRA</h1><button id="iPlay">▶ PLAY INTRO</button></div>'
    + '<button id="iSound">🔊 TAP FOR SOUND</button><button id="iSkip">SKIP ▶▶</button>';
  document.body.appendChild(box);
  $('iPlay').onclick = $('iSound').onclick = () => play(true);
  $('iSkip').onclick = closeIntro;
  $('iFilm').onended = $('iFilm').onerror = closeIntro;
  $('iFilm').onclick = () => { if ($('iFilm').muted) play(true); };      // a tap on a silent film asks for sound, not for skipping
  /* while the film is up, keys belong to it and never reach the menu behind */
  addEventListener('keydown', e => {
    if (!open) return;
    e.stopImmediatePropagation();
    if (!['Enter', 'Space', 'Escape'].includes(e.code)) return;
    e.preventDefault();
    if (e.repeat) return;
    const on = document.activeElement?.id, waiting = $('iStart').style.display === 'flex';
    if (e.code !== 'Escape' && (on === 'iSound' || (waiting && on !== 'iSkip'))) play(true); else closeIntro();
  }, true);
  if (new URLSearchParams(location.search).get('intro') !== '0') autoStart();
}

/* what is on top of the film: the PLAY screen, the sound button, or neither */
function offer(playScreen, soundButton){
  $('iStart').style.display = playScreen ? 'flex' : 'none';
  $('iSound').style.display = soundButton ? 'block' : 'none';
}
export function showIntro(){
  open = true;
  $('intro').style.display = 'block'; offer(false, false);
  const film = $('iFilm'); film.pause(); if (film.readyState) film.currentTime = 0;
}
/* when the game is opened */
function autoStart(){
  showIntro();
  const upright = matchMedia('(orientation: portrait)');
  if (!(TOUCH && upright.matches)) return void begin();
  /* a phone held upright: wait until it is turned (both signals, as not every browser sends each one) */
  const turned = () => {
    if (upright.matches) return;
    removeEventListener('resize', turned); upright.removeEventListener('change', turned);
    if (open) begin();
  };
  addEventListener('resize', turned); upright.addEventListener('change', turned);
}
async function begin(){
  const film = $('iFilm'), tryPlay = muted => { film.muted = muted; return film.play().then(() => true, () => false); };
  let started = soundOn() && await tryPlay(false);                    // with sound, where the browser allows it
  if (!started && open) started = await tryPlay(true);                // otherwise silently
  if (open) offer(!started, started && film.muted);
}
/* from the start; askedForSound = the player tapped for it, otherwise the game's sound setting decides */
export function play(askedForSound = false){
  offer(false, false);
  const film = $('iFilm'); film.muted = !(askedForSound || soundOn());
  if (film.readyState) film.currentTime = 0;
  film.play().catch(closeIntro);                     // a film that cannot play must never block the game
}
export function closeIntro(){
  open = false;
  $('iFilm').pause(); $('intro').style.display = 'none';
  document.activeElement?.blur?.();
}
