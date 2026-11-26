/* Short messages: the note line, the big banner and floating damage numbers. */
import { $ } from './dom.js';
import { camera } from '../render/stage.js';

let noteLeft = 0, floats = [];

export function note(text, color = '#fff', seconds = 1.4){ const n = $('note'); n.textContent = text; n.style.color = color; noteLeft = seconds; }
export function clearNote(){ $('note').textContent = ''; noteLeft = 0; }
export function banner(title = '', sub = ''){ $('msg').innerHTML = title + (sub ? '<div style="font-size:20px">' + sub + '</div>' : ''); }
export const bannerText = () => $('msg').textContent;

/* text that rises from a spot in the 3D world */
export function floatText(spot, text, color){
  const el = document.createElement('div'); el.className = 'float'; el.textContent = text; el.style.color = color;
  const p = spot.clone().project(camera); el.style.left = ((p.x + 1) * 640 - 40) + 'px'; el.style.top = ((1 - p.y) * 360) + 'px';
  $('hud').appendChild(el); el.getBoundingClientRect(); el.style.transform = 'translateY(-60px)'; el.style.opacity = '0'; floats.push({ el, left: 1 });
}
export function tickMessages(dt){
  if (noteLeft > 0 && (noteLeft -= dt) <= 0) $('note').textContent = '';
  floats = floats.filter(f => { if ((f.left -= dt) > 0) return true; f.el.remove(); return false; });
}
export function clearFloats(){ floats.splice(0).forEach(f => f.el.remove()); }
