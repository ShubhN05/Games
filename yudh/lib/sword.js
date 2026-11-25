/* RAVAN'S SWORD: a big curved demon blade built in code. The grip is at the origin, the blade points along +Y.
   Vault note: Games/Fighter Game/Fighter Game — Ravan (Final Boss).md */
import * as THREE from 'three';

export function makeSword(){
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0xaab2c2, metalness: 0.7, roughness: 0.3, emissive: 0x300404 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c1012, roughness: 0.7, metalness: 0.2 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9962c, roughness: 0.35, metalness: 0.5, emissive: 0x301c04 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xff2a14 });
  /* curved blade, wider near the point */
  const sh = new THREE.Shape();
  sh.moveTo(-0.055, 0.14); sh.quadraticCurveTo(-0.10, 0.90, -0.04, 1.35); sh.quadraticCurveTo(0.03, 1.62, 0.22, 1.82);
  sh.quadraticCurveTo(0.27, 1.45, 0.17, 1.15); sh.quadraticCurveTo(0.07, 0.75, 0.075, 0.14); sh.closePath();
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.026, bevelEnabled: false }), steel); blade.position.z = -0.013; group.add(blade);
  /* glowing red line down the middle */
  const line = new THREE.CatmullRomCurve3([new THREE.Vector3(0.0, 0.22, 0), new THREE.Vector3(-0.012, 0.8, 0), new THREE.Vector3(0.025, 1.25, 0), new THREE.Vector3(0.14, 1.6, 0)]);
  const groove = new THREE.Mesh(new THREE.TubeGeometry(line, 30, 0.017, 6, false), edgeMat); group.add(groove);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.065, 0.085), gold); guard.position.y = 0.12; group.add(guard);
  for (const s of [-1, 1]) { const spike = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.16, 8), gold); spike.position.set(s * 0.23, 0.15, 0); spike.rotation.z = -s * 1.1; group.add(spike); }
  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), edgeMat); gem.position.set(0, 0.12, 0.05); group.add(gem);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.04, 0.34, 10), dark); grip.position.y = -0.07; group.add(grip);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 10), gold); pommel.position.y = -0.27; group.add(pommel);
  return { group, steel };
}
