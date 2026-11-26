/* the finger gestures of the phone controls (screen coordinates: y grows downwards) */
import assert from 'node:assert/strict';
import { stickDirection, pickByAngle, STICK_DEAD, PICK_DEAD } from '../src/input/gestures.js';
let n = 0; const test = (name, fn) => { fn(); n++; };

test('a resting thumb moves nothing', () => { assert.equal(stickDirection(0, 0), null); assert.equal(stickDirection(STICK_DEAD - 1, 0), null); assert.equal(stickDirection(0, -(STICK_DEAD - 1)), null); });
test('four directions: forward is towards the opponent, on the right', () => {
  assert.equal(stickDirection(40, 0), 'forward'); assert.equal(stickDirection(-40, 0), 'back'); assert.equal(stickDirection(0, -40), 'jump'); assert.equal(stickDirection(0, 40), 'crouch'); });
test('the stronger axis wins', () => { assert.equal(stickDirection(50, -20), 'forward'); assert.equal(stickDirection(20, -50), 'jump'); assert.equal(stickDirection(-25, 60), 'crouch'); });
test('near a diagonal the thumb keeps its direction instead of flickering', () => {
  assert.equal(stickDirection(40, -44, 'forward'), 'forward'); assert.equal(stickDirection(44, -40, 'jump'), 'jump'); assert.equal(stickDirection(30, -60, 'forward'), 'jump', 'clearly turned'); });

const FIVE = [95, 70, 45, 20, -5];
const at = (deg, far = 90) => [Math.cos(deg * Math.PI / 180) * far, -Math.sin(deg * Math.PI / 180) * far];
test('sliding towards a circle picks it', () => FIVE.forEach((deg, i) => assert.equal(pickByAngle(...at(deg), FIVE), i, 'angle ' + deg)));
test('between two circles the nearer one is picked', () => { assert.equal(pickByAngle(...at(60), FIVE), 1); assert.equal(pickByAngle(...at(55), FIVE), 2); });
test('letting go in the middle picks nothing', () => { assert.equal(pickByAngle(0, 0, FIVE), null); assert.equal(pickByAngle(...at(45, PICK_DEAD - 1), FIVE), null); });
test('sliding away from every circle picks nothing (a way to cancel)', () => { for (const deg of [180, 240, -90, 140]) assert.equal(pickByAngle(...at(deg), FIVE), null, 'angle ' + deg); });
test('angles wrap round', () => assert.equal(pickByAngle(...at(-175), [180, 90]), 0));
console.log('OK touch', n, 'tests');
