/* the rules of the duel. run all tests: npm test */
import assert from 'node:assert/strict';
import { createDuel, step, inputCode, cancelCode, shoot, setStance, jump, cancelDraw, airHeight, POWERS, T } from '../src/core/index.js';
const run = (d, s) => { const ev = []; for (let i = 0, n = Math.round(s * 100); i < n; i++) ev.push(...step(d, 0.01)); return ev; };
const code = (d, i, c) => { inputCode(d, i, c[0]); return inputCode(d, i, c[1]); };
const hp = (d, i) => Math.round(d.f[i].hp * 10) / 10;
let n = 0; const test = (name, fn) => { fn(); n++; };
const fresh = () => createDuel(['arjun', 'karna']);

test('every ordinary power has a counter', () => { for (const [c, p] of Object.entries(POWERS)) if (!p.rare) { assert.ok(p.counters.length, c); p.counters.forEach(x => assert.ok(POWERS[x], c + '->' + x)); } });
test('super: 2 s call, 2.5 s flight, 10% if unanswered', () => { const d = fresh(); code(d, 0, '11'); run(d, 1.95); assert.equal(d.incoming[1], null); run(d, 0.1); assert.equal(d.incoming[1].code, '11'); run(d, 2.4); assert.equal(hp(d, 1), 100); run(d, 0.1); assert.equal(hp(d, 1), 90); });
test('right counter pressed at 1.95 s blocks', () => { const d = fresh(); code(d, 0, '11'); run(d, 2.0); run(d, 1.95); code(d, 1, '12'); run(d, 1); assert.equal(hp(d, 1), 100); });
test('right counter pressed after 2 s is too late', () => { const d = fresh(); code(d, 0, '11'); run(d, 2.0); run(d, 2.08); const e = code(d, 1, '12'); run(d, 1); assert.equal(hp(d, 1), 90); });
test('wrong counter: 10%, only one attempt', () => { const d = fresh(); code(d, 0, '11'); run(d, 2.0); code(d, 1, '13'); run(d, 0.6); assert.ok(d.incoming[1]); assert.equal(code(d, 1, '12').type, 'refused', 'no silent second try or attack'); assert.equal(d.f[1].call, null); run(d, 2); assert.equal(hp(d, 1), 90); });
test('counter before release is an attack, not a counter', () => { const d = fresh(); code(d, 0, '11'); code(d, 1, '12'); assert.equal(d.f[1].call.code, '12'); });
test('countering only pauses own call', () => { const d = fresh(); code(d, 0, '11'); run(d, 1); code(d, 1, '14'); run(d, 1.05); const left = d.f[1].call.left; code(d, 1, '12'); run(d, 0.45); assert.ok(Math.abs(d.f[1].call.left - left) < 0.02); run(d, 1.5); assert.equal(d.incoming[0].code, '14'); });
test('1 s rest after releasing a super', () => { const d = fresh(); code(d, 0, '11'); run(d, 2.05); assert.equal(code(d, 0, '12').type, 'refused'); run(d, 1); assert.equal(code(d, 0, '12').type, 'call'); });
test('stray first number is forgotten', () => { let d = fresh(); inputCode(d, 0, '3'); run(d, 1.6); assert.equal(d.f[0].digits, ''); d = fresh(); code(d, 0, '11'); run(d, 1.9); inputCode(d, 1, '3'); run(d, 0.2); assert.equal(d.f[1].digits, ''); });
test('a finished match leaves nothing flying', () => { const d = fresh(); d.f[1].hp = 5; code(d, 0, '11'); run(d, 2.1); code(d, 1, '13'); shoot(d, 1, 'hard', 'high'); code(d, 0, '12'); run(d, 4); assert.equal(d.winner, 0); assert.deepEqual([d.arrows.length, d.incoming[0], d.incoming[1], d.f[0].call, d.f[0].draw], [0, null, null, null, null]); });
test('rare: 30%, once per match', () => { const d = fresh(); code(d, 0, '51'); run(d, 4.55); assert.equal(hp(d, 1), 70); assert.equal(code(d, 0, '51').type, 'refused'); });
test('rare defended with own Brahmastra keeps the attack shot', () => { const d = fresh(); code(d, 0, '51'); run(d, 2.1); code(d, 1, '51'); run(d, 3); assert.equal(hp(d, 1), 100); assert.equal(code(d, 1, '51').type, 'call'); });
test('Brahma Danda blocks rare once, not ordinary', () => { const d = fresh(); code(d, 0, '51'); run(d, 2.1); code(d, 1, '54'); run(d, 3); assert.equal(hp(d, 1), 100); assert.equal(d.f[1].used['54'], true);
  code(d, 0, '11'); run(d, 2.1); assert.equal(code(d, 1, '54').type, 'refused'); });
test('Danda cannot attack', () => assert.equal(code(fresh(), 0, '54').type, 'refused'));
test('Pashupata: Arjuna only; Brahmastra halves it to 15', () => { const d = fresh(); assert.equal(code(d, 1, '53').type, 'refused'); code(d, 0, '53'); run(d, 2.1); code(d, 1, '51'); run(d, 3); assert.equal(hp(d, 1), 85); });
test('Narayanastra belongs to neither', () => { const d = fresh(); assert.equal(code(d, 0, '52').type, 'refused'); assert.equal(code(d, 1, '52').type, 'refused'); });
test('unknown code and cancel', () => { const d = fresh(); assert.equal(code(d, 0, '55').type, 'refused'); inputCode(d, 0, '1'); cancelCode(d, 0); assert.equal(d.f[0].digits, ''); });
test('fast 0.3 and slow 1 damage, each from its own stock', () => { const d = fresh(); shoot(d, 0, 'fast', 'straight'); run(d, 2); assert.equal(hp(d, 1), 99.7); shoot(d, 0, 'hard', 'straight'); run(d, 2.5); assert.equal(hp(d, 1), 98.7); assert.deepEqual(d.f[0].arrows, { fast: 19, hard: 14 }); });
test('only 20 fast and 15 slow arrows', () => { const d = fresh(), shots = kind => { let k = 0; for (let i = 0; i < 30; i++) { if (shoot(d, 0, kind, 'straight')) k++; run(d, 2); } return k; }; assert.equal(shots('fast'), 20); assert.equal(d.f[0].arrows.hard, 15, 'slow stock untouched'); assert.equal(shots('hard'), 15); assert.deepEqual(d.f[0].arrows, { fast: 0, hard: 0 }); });
for (const [path, stance] of [['straight', 'crouch'], ['jump', 'back'], ['high', 'forward']])
  test(path + ' shot escaped only by ' + stance, () => { for (const s of ['mid', 'crouch', 'back', 'forward']) { const d = fresh(); setStance(d, 1, s); shoot(d, 0, 'hard', path); run(d, 3); assert.equal(hp(d, 1), s === stance ? 100 : 99, path + ' vs ' + s); } });
test('low shot hits every standing or crouching stance', () => { for (const s of ['mid', 'crouch', 'back', 'forward']) { const d = fresh(); setStance(d, 1, s); shoot(d, 0, 'hard', 'low'); run(d, 3); assert.equal(hp(d, 1), 99, 'low vs ' + s); } });
/* seconds from the shot until a hard arrow reaches the middle position */
const ARRIVE = T.hard.draw + T.hard.flight * 0.983;
test('a well-timed jump clears a low shot', () => { for (const before of [0.5, 0.35, 0.15]) { const d = fresh(); shoot(d, 0, 'hard', 'low'); run(d, ARRIVE - before); assert.ok(jump(d, 1)); run(d, 2); assert.equal(hp(d, 1), 100, 'jump ' + before + ' s early'); } });
test('a jump far too early or too late does not clear it', () => { for (const before of [1.2, 0.02]) { const d = fresh(); shoot(d, 0, 'hard', 'low'); run(d, ARRIVE - before); jump(d, 1); run(d, 2); assert.equal(hp(d, 1), 99, 'jump ' + before + ' s early'); } });
test('jumping does not escape the other shots', () => { for (const path of ['straight', 'jump', 'high']) { const d = fresh(); shoot(d, 0, 'hard', path); run(d, ARRIVE - 0.35); jump(d, 1); run(d, 2); assert.equal(hp(d, 1), 99, 'jump vs ' + path); } });
test('stepping forward in mid-air does not escape a high shot', () => { const d = fresh(); setStance(d, 1, 'forward'); shoot(d, 0, 'hard', 'high'); run(d, ARRIVE - 0.45); jump(d, 1); run(d, 2); assert.equal(hp(d, 1), 99); });
test('cannot jump again in mid-air; lands after 0.7 s', () => { const d = fresh(); assert.ok(jump(d, 0)); run(d, 0.3); assert.ok(airHeight(d.f[0]) > 0.6); assert.equal(jump(d, 0), false); run(d, 0.6); assert.equal(airHeight(d.f[0]), 0); assert.ok(jump(d, 0)); });
test('crouching drops you out of a jump', () => { const d = fresh(); jump(d, 0); run(d, 0.3); setStance(d, 0, 'crouch'); assert.equal(airHeight(d.f[0]), 0); });
test('jump shot is airborne while drawing and lands after', () => { const d = fresh(); shoot(d, 0, 'hard', 'jump'); run(d, 0.65); assert.ok(airHeight(d.f[0]) > 0.6); run(d, 0.5); assert.equal(airHeight(d.f[0]), 0); });
test('cancelling a draw returns the arrow and allows dodging', () => { const d = fresh(); shoot(d, 1, 'hard', 'straight'); assert.equal(d.f[1].arrows.hard, 14); setStance(d, 1, 'crouch'); assert.equal(d.f[1].stance, 'mid'); assert.ok(cancelDraw(d, 1)); assert.equal(d.f[1].arrows.hard, 15); assert.equal(d.f[1].stance, 'crouch'); run(d, 2); assert.equal(d.arrows.length, 0); assert.equal(cancelDraw(d, 1), false); });
test('cannot dodge while drawing', () => { const d = fresh(); shoot(d, 0, 'fast', 'straight'); run(d, T.fast.draw + 0.05); shoot(d, 1, 'hard', 'jump'); setStance(d, 1, 'crouch'); assert.equal(d.f[1].stance, 'mid'); run(d, T.hard.draw + 0.05); assert.equal(d.f[1].stance, 'crouch'); });
test('same-path arrows knock each other down, different paths do not', () => { let d = fresh(); shoot(d, 0, 'hard', 'high'); shoot(d, 1, 'hard', 'high'); run(d, 3); assert.equal(hp(d, 0) + hp(d, 1), 200);
  d = fresh(); shoot(d, 0, 'hard', 'high'); shoot(d, 1, 'hard', 'straight'); run(d, 3); assert.equal(hp(d, 0) + hp(d, 1), 198); });
test('a slow arrow that hits breaks a super call, which can be started again', () => { const d = fresh(); code(d, 1, '11'); shoot(d, 0, 'hard', 'straight'); const e = run(d, 3);
  assert.ok(e.some(x => x.type === 'interrupted' && x.to === 1 && x.code === '11')); assert.equal(e.some(x => x.type === 'release'), false); assert.equal(d.f[1].call, null); assert.equal(hp(d, 1), 99); assert.equal(code(d, 1, '11').type, 'call'); });
test('a slow arrow already in the air also breaks the call', () => { const d = fresh(); shoot(d, 0, 'hard', 'straight'); run(d, 0.9); code(d, 1, '11'); run(d, 1.2); assert.equal(d.f[1].call, null); });
test('a broken rare weapon is not used up', () => { const d = fresh(); code(d, 1, '51'); shoot(d, 0, 'hard', 'straight'); run(d, 3); assert.equal(d.f[1].used['51'], undefined); assert.equal(code(d, 1, '51').type, 'call'); });
test('a fast arrow does not break a super call', () => { const d = fresh(); code(d, 1, '11'); shoot(d, 0, 'fast', 'straight'); const e = run(d, 2.1); assert.equal(hp(d, 1), 99.7); assert.ok(e.some(x => x.type === 'release')); });
test('a dodged slow arrow does not break the call', () => { const d = fresh(); code(d, 1, '11'); setStance(d, 1, 'crouch'); shoot(d, 0, 'hard', 'straight'); const e = run(d, 2.1); assert.equal(hp(d, 1), 100); assert.ok(e.some(x => x.type === 'release')); });
test('a slow arrow arriving after the release does not stop the super arrow', () => { const d = fresh(); code(d, 1, '11'); run(d, 0.8); shoot(d, 0, 'hard', 'straight'); run(d, 2); assert.equal(d.incoming[0].code, '11'); assert.equal(hp(d, 1), 99); });
test('no normal shot while calling', () => { const d = fresh(); code(d, 0, '11'); assert.equal(shoot(d, 0, 'fast', 'straight'), false); });
test('match ends at 0 and freezes', () => { const d = fresh(); d.f[1].hp = 5; code(d, 0, '11'); const e = run(d, 4.6); assert.equal(d.winner, 0); assert.ok(e.some(x => x.type === 'over')); assert.equal(shoot(d, 0, 'fast', 'straight'), false); });
console.log('OK', n, 'tests');

/* what is drawn agrees with what hits */
import { heightAt, CONTACT, REACH, BODY } from '../src/core/path.js';
for (const [path, escape] of [['straight', 'crouch'], ['jump', 'back'], ['high', 'forward'], ['low', 'jump']])
  for (const st of ['mid', 'crouch', 'back', 'forward']) {
    const s = CONTACT[st], h = heightAt(path, s), inBody = s <= REACH[path] && h < (st === 'crouch' ? BODY.crouch : BODY.stand) && h > 0.2;
    assert.equal(inBody, st !== escape, path + ' ' + st + ' picture');
  }
/* in mid-air the feet clear only the low arrow */
import { JUMP } from '../src/core/path.js';
for (const path of ['straight', 'jump', 'high']) assert.ok(heightAt(path, CONTACT.mid) > JUMP.height && heightAt(path, CONTACT.mid) < BODY.stand + JUMP.clear, path + ' must hit a jumping body');
assert.ok(heightAt('low', CONTACT.mid) < JUMP.clear, 'low arrow passes under the feet');
/* stepping forward into an arrow that already passed the front spot still counts */
{ const d = fresh(); shoot(d, 0, 'hard', 'straight'); run(d, 0.7 + 0.93); setStance(d, 1, 'forward'); run(d, 1); assert.equal(hp(d, 1), 99, 'late step forward'); }

/* computer against computer: every level finishes a match and never breaks a rule */
import { createAI, stepAI } from '../src/ai/computer.js';
for (const lv of ['easy', 'normal', 'hard']) {
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const d = createDuel(['arjun', 'karna']), a = createAI(lv, rnd), b = createAI(lv, rnd), seen = {};
  for (let i = 0; i < 100 * 900 && d.winner === null; i++) { stepAI(d, 0, a, 0.01); stepAI(d, 1, b, 0.01); for (const e of step(d, 0.01)) seen[e.type] = (seen[e.type] || 0) + 1; }
  assert.notEqual(d.winner, null, lv + ' match must end'); assert.ok(d.f.every(f => f.arrows.fast >= 0 && f.arrows.hard >= 0));
  console.log(lv, 'ended at', d.t.toFixed(0), 's', JSON.stringify(seen));
}
