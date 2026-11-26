/* An archer on screen. createModel() builds the body once per character;
   createActor() puts that body on one side of the field and animates it from the match state. */
import * as THREE from 'three';
import { scene } from './stage.js';
import { V, clamp, lerp, point, home, face, stanceX } from './layout.js';
import { sprite, shadowDisc, burst } from './effects.js';
import { clips, loadBody } from '../../characters/shared/body.js';
import { solveLimb } from './ik.js';
import { findBody } from '../../characters/shared/helpers.js';
import { makeArrow } from '../../characters/shared/arrow.js';
import { T } from '../core/index.js';

export async function createModel(character){
  const [{ skinTint, dress }, { makeBow }] = await Promise.all([character.look(), character.bow()]);
  const root = await loadBody(skinTint); scene.add(root);
  dress(root, findBody(root));
  const mixer = new THREE.AnimationMixer(root), bones = {}; root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const bow = makeBow(); scene.add(bow.group);
  const nock = makeArrow(false); scene.add(nock);
  const m = { root, mixer, bones, bow, nock, aura: sprite(0xffffff, 2.6, 0), shadow: shadowDisc(0.65, 0.4), cur: null, name: '' };
  m.play = (name, loop = true) => { if (m.name === name) return; const a = mixer.clipAction(clips[name]); a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = true; if (m.cur) m.cur.fadeOut(0.08); a.fadeIn(0.08).play(); m.cur = a; m.name = name; };
  m.show = on => { for (const o of [m.root, m.bow.group, m.nock, m.aura, m.shadow]) o.visible = on; };
  m.show(false);
  return m;
}

export function createActor(model, side){
  model.show(true); model.name = ''; model.mixer.stopAllAction(); model.cur = null; model.play('Idle_Loop'); model.root.rotation.y = face(side) * Math.PI / 2;
  const a = { model, side, x: home(side), hop: 0, aim: 0, hurt: 0 };
  /* the spot in front of the chest: where arrows start and hits show */
  a.chest = (y = 1.35) => V(a.x + face(side) * 0.55, y + a.hop, 0.05);
  a.pose = (dt, duel) => pose(a, dt, duel);
  return a;
}

function pose(a, dt, duel){
  const i = a.side, m = a.model, f = duel ? duel.f[i] : null, dead = !!duel && duel.winner !== null && duel.winner !== i;
  const tx = duel ? (dead ? home(i) + face(i) * 0.9 : stanceX(i, f.stance)) : home(i); a.x += (tx - a.x) * Math.min(1, dt * 30);
  a.hop = dead ? 0 : f && f.draw && f.draw.path === 'jump' ? 0.9 * Math.sin(Math.PI / 2 * (1 - clamp(f.draw.left / T[f.draw.kind].draw, 0, 1))) : Math.max(0, a.hop - dt * 2.8);
  a.hurt = Math.max(0, a.hurt - dt);
  m.root.position.set(a.x, a.hop, 0); m.shadow.position.set(a.x, 0.01, 0);
  if (dead) m.play('Death01', false); else if (a.hurt > 0.12 && !(f && f.stance === 'crouch')) m.play('Hit_Chest', false); else if (f && f.stance === 'crouch') m.play('Crouch_Idle_Loop'); else m.play('Idle_Loop');
  m.mixer.update(dt); m.root.updateMatrixWorld(true);
  poseBow(a, dt, f, dead);
}

/* arms, bow, nocked arrow and the calling glow */
function poseBow(a, dt, f, dead){
  const i = a.side, m = a.model, draw = f && f.draw, call = f && f.call, aiming = !dead && !!(draw || call);
  a.aim += ((aiming ? 1 : 0) - a.aim) * Math.min(1, dt * 18);
  const pull = draw ? 1 - clamp(draw.left / T[draw.kind].draw, 0, 1) : call ? Math.min(1, (T.call - call.left) / 0.6) : 0;
  const rise = draw ? { straight: 0, jump: -0.28, high: 0.85 }[draw.path] : call ? 0.22 : 0;
  const ch = m.bones.spine_03.getWorldPosition(V()), up = V(0, 1, 0), fwd = V(face(i) * Math.cos(rise), Math.sin(rise), 0), w = dead ? 0 : 0.45 + 0.55 * a.aim;
  solveLimb(m.bones, 'upperarm_l', 'lowerarm_l', 'hand_l', ch.clone().addScaledVector(fwd, lerp(0.5, 0.72, a.aim)).add(V(0, lerp(-0.3, 0.04, a.aim), 0.10)), V(0, -0.5, 0.7).addScaledVector(fwd, -0.2), w);
  if (a.aim > 0.02) solveLimb(m.bones, 'upperarm_r', 'lowerarm_r', 'hand_r', ch.clone().addScaledVector(fwd, 0.72 - 0.56 * pull).addScaledVector(up, 0.07).add(V(0, 0, -0.03)), fwd.clone().multiplyScalar(-1).addScaledVector(up, 0.5), a.aim);
  const hl = m.bones.hand_l.getWorldPosition(V()), hr = m.bones.hand_r.getWorldPosition(V());
  m.bow.group.visible = !dead; m.bow.group.position.copy(hl).add(V(face(i) * 0.03, 0.02, 0)); m.bow.group.rotation.set(0, face(i) * Math.PI / 2, 0); m.bow.setString(aiming ? hr : null);
  m.nock.visible = aiming; if (aiming) { m.nock.position.copy(hr); point(m.nock, hr, hl); }
  /* the calling glow is always white, so it never tells which arrow is coming */
  m.aura.position.set(a.x, 1.1 + a.hop, -0.3); m.aura.material.opacity = call && !dead ? 0.28 + 0.12 * Math.sin(performance.now() / 60) : 0;
  if (call && !dead && Math.random() < 0.5) burst(hr.clone().add(V((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0)), 1, 0xffffff, 0.7, 0.35, 0.14);
}
