/* the rules of the duel. run all tests: npm test */
import assert from 'node:assert/strict';
import { createDuel, step, inputCode, cancelCode, shoot, setStance, jump, cancelDraw, airHeight, answersTo, shieldFor, breakTime, jumpCue, POWERS, T } from '../src/core/index.js';
const run = (d, s) => { const ev = []; for (let i = 0, n = Math.round(s * 100); i < n; i++) ev.push(...step(d, 0.01)); return ev; };
const code = (d, i, c) => { inputCode(d, i, c[0]); return inputCode(d, i, c[1]); };
const hp = (d, i) => Math.round(d.f[i].hp * 10) / 10;
let n = 0; const test = (name, fn) => { fn(); n++; };
const fresh = () => createDuel(['arjun', 'karna']);
const CALL = T.call;          // seconds to prepare a super arrow

test('every ordinary power has a counter', () => { for (const [c, p] of Object.entries(POWERS)) if (!p.rare) { assert.ok(p.counters.length, c); p.counters.forEach(x => assert.ok(POWERS[x], c + '->' + x)); } });
test('super: 3 s to prepare, 2.5 s flight, 10% if unanswered', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL - 0.05); assert.equal(d.incoming[1], null); run(d, 0.1); assert.equal(d.incoming[1].code, '11'); run(d, 2.4); assert.equal(hp(d, 1), 100); run(d, 0.1); assert.equal(hp(d, 1), 90); });
test('right counter pressed at 1.95 s blocks', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL); run(d, 1.95); code(d, 1, '12'); run(d, 1); assert.equal(hp(d, 1), 100); });
test('right counter pressed after 2 s is too late', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL); run(d, 2.08); const e = code(d, 1, '12'); run(d, 1); assert.equal(hp(d, 1), 90); });
test('wrong counter: 10%, only one attempt', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL); code(d, 1, '13'); run(d, 0.6); assert.ok(d.incoming[1]); assert.equal(code(d, 1, '12').type, 'refused', 'no silent second try or attack'); assert.equal(d.f[1].call, null); run(d, 2); assert.equal(hp(d, 1), 90); });
test('counter before release is an attack, not a counter', () => { const d = fresh(); code(d, 0, '11'); code(d, 1, '12'); assert.equal(d.f[1].call.code, '12'); });
test('countering only pauses own call', () => { const d = fresh(); code(d, 0, '11'); run(d, 1); code(d, 1, '14'); run(d, CALL - 0.95); const left = d.f[1].call.left; code(d, 1, '12'); run(d, 0.45); assert.ok(Math.abs(d.f[1].call.left - left) < 0.02); run(d, 1.5); assert.equal(d.incoming[0].code, '14'); });
test('1 s rest after releasing a super', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL + 0.05); assert.equal(code(d, 0, '12').type, 'refused'); run(d, 1); assert.equal(code(d, 0, '12').type, 'call'); });
test('stray first number is forgotten', () => { let d = fresh(); inputCode(d, 0, '3'); run(d, 1.6); assert.equal(d.f[0].digits, ''); d = fresh(); code(d, 0, '11'); run(d, CALL - 0.1); inputCode(d, 1, '3'); run(d, 0.2); assert.equal(d.f[1].digits, ''); });
test('a finished match leaves nothing flying', () => { const d = fresh(); d.f[1].hp = 5; code(d, 0, '11'); run(d, CALL + 0.1); code(d, 1, '13'); shoot(d, 1, 'hard', 'high'); code(d, 0, '12'); run(d, 4); assert.equal(d.winner, 0); assert.deepEqual([d.arrows.length, d.incoming[0], d.incoming[1], d.f[0].call, d.f[0].draw], [0, null, null, null, null]); });
test('rare: 30%, once per match', () => { const d = fresh(); code(d, 0, '51'); run(d, CALL + 2.55); assert.equal(hp(d, 1), 70); assert.equal(code(d, 0, '51').type, 'refused'); });
test('rare defended with own Brahmastra keeps the attack shot', () => { const d = fresh(); code(d, 0, '51'); run(d, CALL + 0.1); code(d, 1, '51'); run(d, 3); assert.equal(hp(d, 1), 100); assert.equal(code(d, 1, '51').type, 'call'); });
test('Brahma Danda blocks rare once, not ordinary', () => { const d = fresh(); code(d, 0, '51'); run(d, CALL + 0.1); code(d, 1, '54'); run(d, 3); assert.equal(hp(d, 1), 100); assert.equal(d.f[1].used['54'], true);
  code(d, 0, '11'); run(d, CALL + 0.1); assert.equal(code(d, 1, '54').type, 'refused'); });
test('Danda cannot attack', () => assert.equal(code(fresh(), 0, '54').type, 'refused'));
test('Pashupata: Arjuna only; Brahmastra halves it to 15', () => { const d = fresh(); assert.equal(code(d, 1, '53').type, 'refused'); code(d, 0, '53'); run(d, CALL + 0.1); code(d, 1, '51'); run(d, 3); assert.equal(hp(d, 1), 85); });
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
test('a slow arrow fired 1.2 s into the preparation still breaks it', () => { const d = fresh(); code(d, 1, '11'); run(d, 1.2); shoot(d, 0, 'hard', 'straight'); run(d, 2.5); assert.equal(d.f[1].broken, 1); assert.equal(d.incoming[0], null); });
test('a slow arrow that hits breaks a super call, which can be started again', () => { const d = fresh(); code(d, 1, '11'); shoot(d, 0, 'hard', 'straight'); const e = run(d, 3);
  assert.ok(e.some(x => x.type === 'interrupted' && x.to === 1 && x.code === '11')); assert.equal(e.some(x => x.type === 'release'), false); assert.equal(d.f[1].call, null); assert.equal(hp(d, 1), 99); assert.equal(code(d, 1, '11').type, 'call'); });
test('a slow arrow already in the air also breaks the call', () => { const d = fresh(); shoot(d, 0, 'hard', 'straight'); run(d, 0.9); code(d, 1, '11'); run(d, 1.2); assert.equal(d.f[1].call, null); });
test('a broken rare weapon is not used up', () => { const d = fresh(); code(d, 1, '51'); shoot(d, 0, 'hard', 'straight'); run(d, 3); assert.equal(d.f[1].used['51'], undefined); assert.equal(code(d, 1, '51').type, 'call'); });
test('a fast arrow does not break a super call', () => { const d = fresh(); code(d, 1, '11'); shoot(d, 0, 'fast', 'straight'); const e = run(d, CALL + 0.1); assert.equal(hp(d, 1), 99.7); assert.ok(e.some(x => x.type === 'release')); });
test('a dodged slow arrow does not break the call', () => { const d = fresh(); code(d, 1, '11'); setStance(d, 1, 'crouch'); shoot(d, 0, 'hard', 'straight'); const e = run(d, CALL + 0.1); assert.equal(hp(d, 1), 100); assert.ok(e.some(x => x.type === 'release')); });
test('a slow arrow arriving after the release does not stop the super arrow', () => { const d = fresh(); code(d, 1, '11'); run(d, CALL - 1.2); shoot(d, 0, 'hard', 'straight'); run(d, 2); assert.equal(d.incoming[0].code, '11'); assert.equal(hp(d, 1), 99); });
test('no normal shot while calling', () => { const d = fresh(); code(d, 0, '11'); assert.equal(shoot(d, 0, 'fast', 'straight'), false); });
test('match ends at 0 and freezes', () => { const d = fresh(); d.f[1].hp = 5; code(d, 0, '11'); const e = run(d, CALL + 2.6); assert.equal(d.winner, 0); assert.ok(e.some(x => x.type === 'over')); assert.equal(shoot(d, 0, 'fast', 'straight'), false); });
/* Narayanastra: lower your bow (crouch) and do not attack, and it passes by */
const narayana = () => { const d = createDuel(['ashvatthama', 'karna']); code(d, 0, '52'); run(d, CALL + 0.02); assert.equal(d.incoming[1]?.code, '52'); return d; };
const GRACE = T.lowerGrace;
test('only Ashvatthama has Narayanastra, besides Brahmastra', () => { const d = createDuel(['ashvatthama', 'ashvatthama']); assert.equal(code(d, 0, '52').type, 'call'); assert.equal(code(d, 1, '51').type, 'call'); assert.equal(code(createDuel(['drona', 'karna']), 0, '52').type, 'refused'); });
test('Narayanastra: 30% on a standing archer, once per match', () => { const d = narayana(); run(d, 3); assert.equal(hp(d, 1), 70); assert.equal(code(d, 0, '52').type, 'refused'); });
test('Narayanastra passes by a lowered bow', () => { const d = narayana(); run(d, 1.5); setStance(d, 1, 'crouch'); const e = run(d, 1.5); assert.equal(hp(d, 1), 100); assert.equal(d.incoming[1], null); assert.ok(e.some(x => x.type === 'spared' && x.to === 1)); });
test('the bow must still be lowered when it arrives', () => { const d = narayana(); setStance(d, 1, 'crouch'); run(d, 1.5); setStance(d, 1, 'mid'); run(d, 1.5); assert.equal(hp(d, 1), 70); });
test('stepping aside does not escape Narayanastra', () => { for (const s of ['back', 'forward']) { const d = narayana(); setStance(d, 1, s); run(d, 3); assert.equal(hp(d, 1), 70, s); } });
test('shooting at it makes Narayanastra strike even a lowered bow', () => { const d = narayana(); run(d, GRACE + 0.1); assert.ok(shoot(d, 1, 'fast', 'straight')); const e = run(d, 0.5); assert.ok(e.some(x => x.type === 'resisted' && x.to === 1)); assert.equal(e.filter(x => x.type === 'resisted').length, 1); setStance(d, 1, 'crouch'); run(d, 2); assert.equal(hp(d, 1), 70); });
test('a shot begun in the first moment is forgiven', () => { const d = narayana(); run(d, GRACE - 0.2); shoot(d, 1, 'fast', 'straight'); run(d, 0.5); setStance(d, 1, 'crouch'); run(d, 2); assert.equal(hp(d, 1), 100); });
test('trying another astra against it is resisting', () => { for (const c of ['11', '51']) { const d = narayana(); code(d, 1, c); setStance(d, 1, 'crouch'); const e = run(d, 3); assert.equal(hp(d, 1), 70, c); assert.ok(e.some(x => x.type === 'resisted')); } });
test('Brahma Danda stops Narayanastra, also after resisting', () => { const d = narayana(); run(d, GRACE + 0.1); shoot(d, 1, 'fast', 'straight'); run(d, 0.5); assert.deepEqual(answersTo(d, 1), ['54']); code(d, 1, '54'); run(d, 2); assert.equal(hp(d, 1), 100); });
test('lowering the bow drops your own preparation without using it up', () => { const d = createDuel(['ashvatthama', 'karna']); code(d, 0, '52'); run(d, 1); assert.equal(code(d, 1, '51').type, 'call'); run(d, CALL - 0.98); assert.ok(d.f[1].call); setStance(d, 1, 'crouch'); const e = run(d, 3);
  assert.ok(e.some(x => x.type === 'lowered' && x.to === 1 && x.code === '51')); assert.equal(d.f[1].used['51'], undefined); assert.equal(e.some(x => x.type === 'release' && x.by === 1), false); assert.equal(hp(d, 1), 100); });
test('releasing your own super arrow while it flies is resisting', () => { const d = createDuel(['ashvatthama', 'karna']); code(d, 0, '52'); run(d, 1); code(d, 1, '11'); run(d, CALL - 0.98); run(d, 1.2); assert.ok(d.incoming[0], 'karna released'); setStance(d, 1, 'crouch'); run(d, 2); assert.equal(hp(d, 1), 70); });
test('crouching keeps the preparation against an ordinary arrow', () => { const d = fresh(); code(d, 0, '11'); run(d, 1); code(d, 1, '12'); run(d, CALL - 0.95); setStance(d, 1, 'crouch'); run(d, 0.5); assert.ok(d.f[1].call); });
/* a slow computer must play by the same rules: uneven, long frames change nothing */
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const frames = (d, fps, s, r) => { const ev = []; for (let t = 0; t < s;) { const dt = (0.85 + 0.3 * r()) / fps; ev.push(...step(d, dt)); t += dt; } return ev; };
for (const [kind, path, stance] of [['fast', 'high', 'back'], ['hard', 'high', 'back'], ['fast', 'jump', 'mid'], ['hard', 'jump', 'crouch'], ['fast', 'low', 'mid']])
  test(kind + ' ' + path + ' vs ' + stance + ' hits at any frame rate', () => { const r = seeded(11); for (const fps of [144, 60, 30, 20]) for (let k = 0; k < 80; k++) {
    const d = createDuel(['arjun', 'karna']); setStance(d, 1, stance); shoot(d, 0, kind, path); frames(d, fps, 3, r); assert.ok(d.f[1].hp < 100, 'missed at ' + fps + ' fps'); } });
test('knock-downs are the same at any frame rate', () => { for (const [path, gap] of [['high', 0.4], ['high', 0.1], ['jump', 0.25], ['low', 0.3], ['straight', 0.5]]) { const seen = new Set();
  for (const fps of [1000, 60, 30, 20]) for (let k = 0; k < 20; k++) { const r = seeded(k + 1), d = createDuel(['arjun', 'karna']); shoot(d, 0, 'fast', path); let e = [];
    for (let t = 0; t < gap - 1e-9; t += 0.01) e.push(...step(d, 0.01)); shoot(d, 1, 'fast', path); e.push(...frames(d, fps, 3, r)); seen.add(e.some(x => x.type === 'clash')); }
  assert.equal(seen.size, 1, path + ' ' + gap + ' s apart'); } });

/* the release comes between your two numbers: the leftover one must not spoil the counter */
test('a number left over from before the release is thrown away', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL - 0.1); inputCode(d, 1, '3'); run(d, 0.2);
  assert.equal(inputCode(d, 1, '1').type, 'stray'); assert.equal(d.incoming[1].tried, false); assert.equal(code(d, 1, '12').type, 'counter'); run(d, 1); assert.equal(hp(d, 1), 100); });
test('only a quick leftover is thrown away', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL - 0.1); inputCode(d, 1, '3'); run(d, 0.8); assert.equal(code(d, 1, '12').type, 'counter'); });
test('with nothing half typed, the first number after a release counts', () => { const d = fresh(); code(d, 0, '11'); run(d, CALL + 0.05); assert.equal(code(d, 1, '12').type, 'counter'); });

/* what the screen needs to explain a counter */
test('a counter remembers whether it was right', () => { for (const [c, result] of [['12', 'good'], ['13', 'wrong']]) { const d = fresh(); code(d, 0, '11'); run(d, CALL + 0.1); code(d, 1, c); assert.deepEqual(d.incoming[1].reply, { code: c, result }); }
  let d = fresh(); code(d, 0, '53'); run(d, CALL + 0.1); code(d, 1, '51'); assert.equal(d.incoming[1].reply.result, 'half');
  d = fresh(); code(d, 0, '11'); run(d, CALL + 2.2); code(d, 1, '12'); assert.equal(d.incoming[1].reply.result, 'late'); });
test('shieldFor names the shield only while it can still help', () => { let d = narayana(); assert.equal(shieldFor(d, 1), '54'); run(d, 2.1); assert.equal(shieldFor(d, 1), null, 'too late');
  d = narayana(); d.f[1].used['54'] = true; assert.equal(shieldFor(d, 1), null, 'used up'); d = fresh(); code(d, 0, '11'); run(d, CALL + 0.1); assert.equal(shieldFor(d, 1), null, 'ordinary arrow'); });
test('breakTime says how long a slow arrow can still break a call', () => { const d = fresh(); code(d, 1, '11'); assert.ok(breakTime(d, 1) > 1.2 && breakTime(d, 1) < 1.4); assert.equal(breakTime(d, 0), 0);
  for (const wait of [0, 0.6, 1.2, 1.4, 2]) { const m = fresh(); code(m, 1, '11'); run(m, wait); const open = breakTime(m, 1) > 0; shoot(m, 0, 'hard', 'straight'); run(m, 3); assert.equal(m.f[1].broken > 0, open, 'shot after ' + wait + ' s'); } });
test('jumpCue says now exactly when a jump clears the low arrow', () => { for (const kind of ['fast', 'hard']) { let shown = 0;
  for (let wait = 0.2; wait < 1.8; wait += 0.02) { const d = createDuel(['arjun', 'karna']); shoot(d, 0, kind, 'low'); run(d, wait); const a = d.arrows[0]; if (!a || jumpCue(a) !== 'now') continue; shown++; jump(d, 1); run(d, 2); assert.equal(hp(d, 1), 100, kind + ' jump at ' + wait.toFixed(2)); }
  assert.ok(shown >= 10, kind + ' cue stays long enough: ' + shown); }
  const d = createDuel(['arjun', 'karna']); shoot(d, 0, 'hard', 'low'); run(d, 0.75); assert.equal(jumpCue(d.arrows[0]), 'wait'); });

/* the computer preparing its own super arrow when Narayanastra is released */
test('a computer that is preparing drops it and lowers its bow', () => { let hit = 0; const N = 200;
  for (let k = 1; k <= N; k++) { const d = createDuel(['ashvatthama', 'karna']), ai = createAI('hard', seeded(k * 7919)); ai.superT = 99; ai.arrowT = 99;
    code(d, 0, '52'); run(d, 1); code(d, 1, '11'); for (let i = 0; i < 600; i++) { stepAI(d, 1, ai, 0.01); step(d, 0.01); } if (d.f[1].hp <= 70) hit++; }
  assert.ok(hit / N < 0.25, 'hard computer still takes it: ' + hit / N); });
test('a computer that was made to resist reaches for its shield', () => { const d = narayana(), ai = createAI('hard', () => 0.5); ai.superT = ai.arrowT = 99; stepAI(d, 1, ai, 0.01); assert.equal(ai.lower, d.incoming[1].uid);
  d.incoming[1].resisted = true; stepAI(d, 1, ai, 0.01); assert.equal(d.counters[0]?.code, '54'); });
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

/* the computer against Narayanastra: a strong one usually knows to lower its bow, a weak one often does not */
{ const rate = lv => { let safe = 0; for (let k = 1; k <= 200; k++) { let s = k * 7919; const rnd = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      const d = narayana(), ai = createAI(lv, rnd); ai.superT = 99; ai.arrowT = 0.9;      // it would shoot soon, if it did not know better
      for (let i = 0; i < 300; i++) { stepAI(d, 1, ai, 0.01); step(d, 0.01); }
      assert.notEqual(d.f[1].stance, 'crouch', 'stands up again');
      if (d.f[1].hp > 90) safe++; } return safe / 200; };
  const hard = rate('hard'), easy = rate('easy'); assert.ok(hard > 0.75, 'hard defends it: ' + hard); assert.ok(easy > 0.15 && easy < 0.6, 'easy often fails: ' + easy);
  console.log('computer survives Narayanastra: easy', easy, 'hard', hard); }

/* computer against computer: every level finishes a match and never breaks a rule */
import { createAI, stepAI } from '../src/ai/computer.js';
for (const lv of ['easy', 'normal', 'hard']) for (const pair of [['arjun', 'karna'], ['ashvatthama', 'drona']]) {
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const d = createDuel(pair), a = createAI(lv, rnd), b = createAI(lv, rnd), seen = {};
  for (let i = 0; i < 100 * 900 && d.winner === null; i++) { stepAI(d, 0, a, 0.01); stepAI(d, 1, b, 0.01); for (const e of step(d, 0.01)) seen[e.type] = (seen[e.type] || 0) + 1; }
  assert.notEqual(d.winner, null, lv + ' match must end'); assert.ok(d.f.every(f => f.arrows.fast >= 0 && f.arrows.hard >= 0));
  console.log(lv, pair.join(' v '), 'ended at', d.t.toFixed(0), 's', JSON.stringify(seen));
}
