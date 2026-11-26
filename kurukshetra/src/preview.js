/* Character preview: the design picture beside the 3D character, from the front, side and back.
   preview.html?c=arjun&view=front|three|side|back&draw=1 */
import * as THREE from 'three';
import { CHARACTERS, getCharacter } from '../characters/index.js';
import { loadClips } from '../characters/shared/body.js';
import { renderer, scene, camera } from './render/stage.js';
import { createModel, createActor } from './render/archer.js';
import { home } from './render/layout.js';

const query = new URLSearchParams(location.search), $ = id => document.getElementById(id);
const VIEWS = { front: 0, three: 42, side: 90, back: 180 };           // degrees round the character
let view = VIEWS[query.get('view')] !== undefined ? query.get('view') : 'three', drawing = query.get('draw') === '1';
const who = getCharacter(query.get('c') || CHARACTERS[0].id);

renderer.setSize(900, 1200, false); camera.aspect = 0.75; camera.updateProjectionMatrix();
scene.background = new THREE.Color(0x2a303c);
const lamp = new THREE.DirectionalLight(0xfff0dd, 1.3); scene.add(lamp, lamp.target);       // preview only: light from the viewer

$('who').replaceChildren(...CHARACTERS.map(c => new Option(c.name, c.id, false, c.id === who.id)));
$('who').onchange = e => { query.set('c', e.target.value); location.search = query; };
function buttons(){
  $('views').replaceChildren(...Object.keys(VIEWS).map(v => { const b = document.createElement('button'); b.textContent = v === 'three' ? 'ANGLE' : v.toUpperCase(); b.className = v === view ? 'sel' : ''; b.onclick = () => { view = v; buttons(); frame(0); }; return b; }));
  $('draw').className = drawing ? 'sel' : '';
}
$('draw').onclick = () => { drawing = !drawing; buttons(); frame(0.5); };

/* the design picture is only on this computer; the local server lists the folder */
async function showPicture(){
  const folder = 'characters/' + who.id + '/pictures/';
  const list = await fetch(folder).then(r => r.ok ? r.text() : '').catch(() => '');
  const file = [...list.matchAll(/href="([^"]+\.(?:png|jpe?g|webp))"/gi)].map(m => m[1])[0];
  if (file) { $('ref').src = folder + file; $('refName').textContent = decodeURIComponent(file); } else $('refBox').hidden = true;
}

await loadClips();
const actor = createActor(await createModel(who), 0);
const pose = () => drawing ? { winner: null, f: [{ stance: 'mid', draw: { kind: 'hard', path: 'straight', left: 0 }, call: null, hop: null }] } : null;
function frame(dt){
  actor.pose(dt, pose());
  const a = VIEWS[view] * Math.PI / 180, x = home(0), far = 4.5;
  camera.position.set(x + Math.cos(a) * far, 1.15, Math.sin(a) * far); camera.lookAt(x, 0.96, 0);
  lamp.position.set(camera.position.x, 3, camera.position.z); lamp.target.position.set(x, 1, 0);
  renderer.render(scene, camera);
}
buttons(); showPicture();
for (let i = 0; i < 40; i++) frame(1 / 60);
window.__p = { show(v, d = false){ view = v; drawing = d; buttons(); for (let i = 0; i < 40; i++) frame(1 / 60); } };
const clock = new THREE.Clock();
(function loop(){ frame(Math.min(0.05, clock.getDelta())); requestAnimationFrame(loop); })();
