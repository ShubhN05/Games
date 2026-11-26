/* ARJUN's bow. Edit freely: no other character uses this file. */
import * as THREE from 'three';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...o });
const goldMat = () => new THREE.MeshStandardMaterial({ color: 0xd9a93a, metalness: 0.45, roughness: 0.38, emissive: 0x3a2808 });
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/* the bow: vertical, belly pointing along local +Z (the game turns it to face the opponent) */
export function makeBow(){
  const group = new THREE.Group(), pts = [];
  for (let i = 0; i <= 28; i++) { const t = i / 28 * 2 - 1; pts.push(V(0, t * 0.64, 0.13 * (1 - t * t))); }
  group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.017, 8, false), std(0x8a5524, { roughness: 0.5, metalness: 0.2 })));
  const gold = goldMat(), grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.16, 12), gold); grip.position.set(0, 0, 0.13); group.add(grip);
  for (const s of [-1, 1]) { const tip = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), gold); tip.position.set(0, s * 0.64, 0); group.add(tip);
    const orn = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 14), gold); orn.position.set(0, s * 0.5, 0.06); orn.rotation.y = Math.PI / 2; group.add(orn); }
  const sg = new THREE.BufferGeometry().setFromPoints([V(0, 0.64, 0), V(0, 0, 0), V(0, -0.64, 0)]);
  const string = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: 0xf0e2c0 })); group.add(string);
  return { group, string, setString(worldPoint){ const mid = worldPoint ? group.worldToLocal(worldPoint.clone()) : V(0, 0, 0); sg.setFromPoints([V(0, 0.64, 0), mid, V(0, -0.64, 0)]); } };
}
