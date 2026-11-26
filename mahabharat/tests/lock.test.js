/* Fails if a locked character design has changed. */
import assert from 'node:assert/strict';
import { CHARACTERS } from '../characters/index.js';
import { isLocked, differences } from './lock.js';

const locked = CHARACTERS.filter(c => isLocked(c.id));
for (const c of locked) {
  const diff = differences(c.id);
  assert.equal(diff.length, 0, c.name + ' is LOCKED but its design files differ:\n  ' + diff.join('\n  ') +
    '\nUndo the change, or (only if Shubham asked for it) unlock, change and lock again.');
}
console.log('OK locks:', locked.length, 'locked design(s) unchanged');
