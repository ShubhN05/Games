/* Two-bone inverse kinematics: move a hand to a spot by bending the arm. */
import * as THREE from 'three';
import { V } from './layout.js';

function aimBone(bone, child, target){
  bone.updateWorldMatrix(true, false); child.updateWorldMatrix(true, false);
  const bp = bone.getWorldPosition(V()), d0 = child.getWorldPosition(V()).sub(bp).normalize(), d1 = target.clone().sub(bp).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(d0, d1), bq = bone.getWorldQuaternion(new THREE.Quaternion()), pq = bone.parent.getWorldQuaternion(new THREE.Quaternion());
  bone.quaternion.copy(pq.invert().multiply(q.multiply(bq))); bone.updateMatrixWorld(true);
}
/* bones: {name: bone}. pole = the way the elbow points, w = 0..1 how strongly to apply */
export function solveLimb(bones, upN, midN, endN, target, pole, w){
  const up = bones[upN], lo = bones[midN], ha = bones[endN];
  const S = up.getWorldPosition(V()), E = lo.getWorldPosition(V()), W = ha.getWorldPosition(V()), l1 = S.distanceTo(E), l2 = E.distanceTo(W);
  const to = target.clone().sub(S), d = Math.min(l1 + l2 - 0.001, Math.max(Math.abs(l1 - l2) + 0.001, to.length())), dir = to.normalize();
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), pl = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const En = S.clone().addScaledVector(dir, a).addScaledVector(pl, h), Wn = S.clone().addScaledVector(dir, d);
  En.lerp(E, 1 - w); Wn.lerp(W, 1 - w); aimBone(up, lo, En); aimBone(lo, ha, Wn);
}
