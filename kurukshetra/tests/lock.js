/* Design lock. A locked character's files (its folder and characters/shared) must not change.
   npm run lock                    show which characters are locked
   npm run lock -- arjun           lock the approved design
   npm run lock -- unlock arjun    allow changes again (only when Shubham asks) */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CHARACTERS_DIR = fileURLToPath(new URL('../characters/', import.meta.url));
const TEXT = new Set(['.js', '.json', '.md', '.txt', '.gltf', '.svg']);
const lockFile = id => join(CHARACTERS_DIR, id, 'lock.json');

function filesIn(folder, base = ''){
  return readdirSync(join(CHARACTERS_DIR, folder, base), { withFileTypes: true }).flatMap(e => {
    const rel = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) return filesIn(folder, rel);
    return rel === 'lock.json' ? [] : [folder + '/' + rel];
  });
}
/* Windows may change line endings when files go through git, so text files are compared without them */
function print(path){
  let data = readFileSync(join(CHARACTERS_DIR, path));
  if (TEXT.has(extname(path))) data = data.toString('utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(data).digest('hex');
}
export const fingerprint = id => Object.fromEntries([...filesIn(id), ...filesIn('shared')].sort().map(p => [p, print(p)]));
export const isLocked = id => existsSync(lockFile(id));
export function lock(id){ writeFileSync(lockFile(id), JSON.stringify({ lockedOn: new Date().toISOString().slice(0, 10), files: fingerprint(id) }, null, 2) + '\n'); }
export function unlock(id){ rmSync(lockFile(id), { force: true }); }
/* what differs from the approved files (empty = unchanged) */
export function differences(id){
  const was = JSON.parse(readFileSync(lockFile(id), 'utf8')).files, now = fingerprint(id);
  return [...new Set([...Object.keys(was), ...Object.keys(now)])].sort().filter(p => was[p] !== now[p])
    .map(p => (!was[p] ? 'added   ' : !now[p] ? 'removed ' : 'changed ') + p);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { CHARACTERS } = await import('../characters/index.js');
  const [first, second] = process.argv.slice(2), removing = first === 'unlock', id = removing ? second : first;
  if (!first) for (const c of CHARACTERS) console.log(c.id.padEnd(12), isLocked(c.id) ? 'LOCKED' : 'not locked');
  else if (!CHARACTERS.some(c => c.id === id)) { console.error('No character called "' + id + '".'); process.exit(1); }
  else if (removing) { unlock(id); console.log(id, 'is unlocked.'); }
  else if (isLocked(id)) { console.error(id + ' is already locked. Unlock first if the design really should change.'); process.exit(1); }
  else { lock(id); console.log(id, 'is locked.'); }
}
