/* The arrow every archer shoots. */
import * as THREE from 'three';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...o });

/* an arrow along local +X (nock at the origin, tip at +length) */
export function makeArrow(fire = false, len = 0.8){
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, len, 6), std(fire ? 0x5a3a1a : 0x9a6a30, { emissive: fire ? 0x401800 : 0x000000 })); shaft.rotation.z = Math.PI / 2; shaft.position.x = len / 2; g.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.1, 8), std(fire ? 0xff8a1a : 0xc8d0dc, { metalness: 0.5, roughness: 0.3, emissive: fire ? 0xff5a10 : 0x000000 })); tip.rotation.z = -Math.PI / 2; tip.position.x = len + 0.04; g.add(tip);
  for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.032, 0.003), std(i === 0 ? 0xc02020 : 0xf0f0f0)); f.position.x = 0.07; f.rotation.x = i * 2.094; g.add(f); }
  return g;
}
