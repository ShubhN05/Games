/* Start of the game: load the arena and every archer, then run the frame loop. */
import * as THREE from 'three';
import { CHARACTERS } from './core/index.js';
import { getArena } from './content/arenas/index.js';
import { fitToWindow, setArena } from './render/stage.js';
import { loadClips } from './render/assets.js';
import { createModel } from './render/archer.js';
import { init, frame, start, openMenu, match } from './game/session.js';
import { settings } from './ui/menu.js';
import { $ } from './ui/dom.js';

try {
  fitToWindow($('hud'));
  await setArena(getArena(settings.arena));
  await loadClips();
  const models = {};
  for (const c of CHARACTERS) models[c.id] = await createModel(c);
  init(models, { onArena: id => setArena(getArena(id)) });
  $('loading').remove();

  /* for automatic checks: __m.step(frames) advances the game even when the tab is hidden */
  window.__m = {
    start, menu: openMenu,
    step(n, dt = 1 / 60){ for (let i = 0; i < n; i++) frame(dt, i === n - 1); },
    get duel(){ return match.duel; }, get ai(){ return match.ai; },
    key(code, up){ dispatchEvent(new KeyboardEvent(up ? 'keyup' : 'keydown', { code })); }
  };
  const clock = new THREE.Clock();
  (function loop(){ frame(Math.min(0.05, clock.getDelta())); requestAnimationFrame(loop); })();
} catch (error) {
  $('loading').textContent = 'The game could not load: ' + error.message;
  throw error;
}
