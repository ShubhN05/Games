/* Where things stand in the 3D world. Side 0 = left (the player), side 1 = right (the computer). */
import * as THREE from 'three';

export const BASE = 4.8;     // distance of each archer from the centre (core/path.js START = 2 x BASE - 0.75)
export const STEP = 0.9;     // how far a step back or forward moves
export const home = i => (i ? 1 : -1) * BASE;
export const face = i => (i ? -1 : 1);
export const stanceX = (i, stance) => home(i) + ({ back: -STEP, forward: STEP }[stance] || 0) * face(i);

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/* turn an object built along +X so it points from one spot to another */
export const point = (o, from, to) => { const dir = to.clone().sub(from); if (dir.lengthSq() > 1e-8) o.quaternion.setFromUnitVectors(V(1, 0, 0), dir.normalize()); };
