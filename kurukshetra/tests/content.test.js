/* Checks everything in src/content, so a mistake in a new character, weapon or arena shows up at once. */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { POWERS } from '../src/content/powers.js';
import { CHARACTERS } from '../characters/index.js';
import { ARENAS } from '../src/content/arenas/index.js';
import { createDuel, inputCode } from '../src/core/index.js';

const unique = (list, what) => assert.equal(new Set(list).size, list.length, 'two ' + what + ' share an id');

for (const [code, p] of Object.entries(POWERS)) {
  assert.match(code, /^[1-5][1-5]$/, code + ': code must be two digits from 1 to 5');
  assert.ok(p.name && p.sanskrit && Number.isInteger(p.color) && p.sound, code + ': name, sanskrit, color and sound are needed');
  for (const c of [...p.counters, ...(p.halvedBy || [])]) assert.ok(POWERS[c], code + ': counter ' + c + ' does not exist');
  if (!p.shield) assert.ok(p.counters.length, code + ' (' + p.name + ') can never be stopped');
}
unique(CHARACTERS.map(c => c.id), 'characters');
assert.ok(CHARACTERS.length >= 2, 'a duel needs two characters');
for (const c of CHARACTERS) {
  assert.ok(c.name && typeof c.look === 'function' && typeof c.bow === 'function', c.id + ': name, look and bow are needed');
  for (const f of ['character.js', 'look.js', 'bow.js', 'design.md']) assert.ok(existsSync(new URL('../characters/' + c.id + '/' + f, import.meta.url)), c.id + ': folder characters/' + c.id + ' needs ' + f);
  for (const r of c.rares) assert.ok(POWERS[r]?.rare && !POWERS[r].shield, c.id + ': ' + r + ' is not a rare weapon');
  /* every archer can fire every ordinary power */
  for (const [code, p] of Object.entries(POWERS)) if (!p.rare) {
    const d = createDuel([c.id, c.id]); inputCode(d, 0, code[0]);
    assert.equal(inputCode(d, 0, code[1]).type, 'call', c.id + ' cannot call ' + code);
  }
}
unique(ARENAS.map(a => a.id), 'arenas');
for (const a of ARENAS) assert.ok(a.name && typeof a.paint === 'function', a.id + ': name and paint are needed');
/* Kurukshetra is its own game: no file may load anything from outside this folder */
const root = fileURLToPath(new URL('../', import.meta.url));
const ownFiles = ['index.html', ...['src', 'characters'].flatMap(d => readdirSync(root + d, { recursive: true }).map(x => d + '/' + x))];
for (const f of ownFiles.filter(f => /\.(js|html)$/.test(f)))
  assert.doesNotMatch(readFileSync(root + f, 'utf8'), /(from|import\(|src=|"three[^"]*":)\s*["'][^"']*yudh/i, f + ' loads something from YUDH');
console.log('OK content:', CHARACTERS.length, 'characters,', Object.keys(POWERS).length, 'powers,', ARENAS.length, 'arena(s)');
