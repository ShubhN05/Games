/* KAZE - the ninja of YUDH (original character: wind + clones + spiral energy). Built on the Quaternius Superhero Male model:
   teal ninja vest, dark navy trousers, white arm wraps, white scarf, forehead guard with a spiral mark, spiky red hair.
   Vault note: Games/Fighter Game/Kaze/Fighter Game — Kaze.md */
import * as THREE from 'three';
import { boundsOf, addShell, addPants } from './look.js';
import { addSpikyHair } from './choo.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05, ...o });
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function dressKaze(root, body){
  root.updateMatrixWorld(true);
  const teal = std(0x1f7f8c, { side: THREE.DoubleSide }), wrap = std(0xe6e6ea, { side: THREE.DoubleSide }), dark = std(0x14202c, { side: THREE.DoubleSide });
  addPants(body, { color: 0x182a38, hip: 0.030, thigh: 0.034, calf: 0.050 });
  addShell(root, body, { name: 'KazeVest', include: n => n === 'spine_01' || n === 'spine_02' || n === 'spine_03', inflate: () => 0.024, material: teal });
  addShell(root, body, { name: 'KazeWraps', include: n => /^lowerarm_/.test(n), inflate: () => 0.024, material: wrap });
  addShell(root, body, { name: 'KazeShins', include: n => /^calf_/.test(n), inflate: () => 0.062, material: wrap });
  addShell(root, body, { name: 'KazeSandals', include: n => /^(foot|ball)_/.test(n), inflate: () => 0.02, material: dark });
  addSpikyHair(root, body, 0xb23a1c, 33);
  /* forehead guard: dark cloth band + steel plate with a spiral mark */
  const hb = boundsOf(root, body, ['Head']), R = Math.max(hb.size.x, hb.size.z) / 2, bandY = hb.box.max.y - hb.size.y * 0.30, hg = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(R * 1.04, 0.014, 8, 44), std(0x1a2a6a)); band.rotation.x = Math.PI / 2 - 0.1; band.scale.set(hb.size.x / (2 * R), hb.size.z / (2 * R), 1); band.position.set(hb.ctr.x, bandY, hb.ctr.z); hg.add(band);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.05, 0.012), std(0xc8d0dc, { metalness: 0.7, roughness: 0.3 })); plate.position.set(hb.ctr.x, bandY + 0.005, hb.ctr.z + hb.size.z / 2 * 1.04); hg.add(plate);
  const spiral = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 6, 16), std(0x1a2a6a)); spiral.position.copy(plate.position).add(V(0, 0, 0.008)); hg.add(spiral);
  root.add(hg); root.updateMatrixWorld(true); root.getObjectByName('Head').attach(hg);
  /* white scarf around the neck with a tail down the back */
  const nb = boundsOf(root, body, ['neck_01']), sg = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(Math.max(nb.size.x, nb.size.z) * 0.62, 0.032, 8, 24), wrap); ring.rotation.x = Math.PI / 2; ring.position.set(nb.ctr.x, nb.ctr.y - 0.01, nb.ctr.z); sg.add(ring);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.36, 0.012), wrap); tail.position.set(nb.ctr.x, nb.ctr.y - 0.2, nb.box.min.z - 0.05); tail.rotation.x = 0.12; sg.add(tail);
  root.add(sg); root.updateMatrixWorld(true); root.getObjectByName('spine_03').attach(sg);
}
