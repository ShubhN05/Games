/* The introduction film, shown before the menu while the game loads behind it. The film is media/intro.mp4
   (made by tools/intro/record.py). Browsers allow sound only after a tap, so it waits for PLAY.
   Add ?intro=0 to the address to go straight to the menu. */
import { $ } from './dom.js';
import { soundOn } from '../audio/sound.js';

const FILE = 'media/intro.mp4';
let open = false, playing = false;
export const introOpen = () => open;

export function initIntro(){
  const box = document.createElement('div'); box.id = 'intro';
  box.innerHTML = '<video id="iFilm" playsinline preload="auto" src="' + FILE + '"></video>'
    + '<div id="iStart"><h1>KURUKSHETRA</h1><button id="iPlay">▶ PLAY INTRO</button></div>'
    + '<button id="iSkip">SKIP ▶▶</button>';
  document.body.appendChild(box);
  $('iPlay').onclick = play;
  $('iSkip').onclick = closeIntro;
  $('iFilm').onended = $('iFilm').onerror = closeIntro;
  $('iFilm').onclick = closeIntro;
  /* while the film is up, keys belong to it and never reach the menu behind */
  addEventListener('keydown', e => {
    if (!open) return;
    e.stopImmediatePropagation();
    if (!['Enter', 'Space', 'Escape'].includes(e.code)) return;
    e.preventDefault();
    if (e.repeat) return;
    if (!playing && e.code !== 'Escape' && document.activeElement?.id !== 'iSkip') play(); else closeIntro();
  }, true);
  if (new URLSearchParams(location.search).get('intro') !== '0') showIntro();
}

export function showIntro(){
  open = true; playing = false;
  $('intro').style.display = 'block'; $('iStart').style.display = 'flex';
  const film = $('iFilm'); film.pause(); if (film.readyState) film.currentTime = 0;
}
export function play(){
  playing = true; $('iStart').style.display = 'none';
  const film = $('iFilm'); film.muted = !soundOn();
  film.play().catch(closeIntro);                     // a film that cannot play must never block the game
}
export function closeIntro(){
  open = playing = false;
  $('iFilm').pause(); $('intro').style.display = 'none';
  document.activeElement?.blur?.();
}
