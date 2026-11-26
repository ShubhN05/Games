# Characters

Every character has its own folder. **Kurukshetra is a separate game: nothing here comes from another game while it runs.**

```
characters/
  index.js          the list of characters
  arjun/
    character.js    name and weapons
    look.js         body, clothes, hair, colours
    bow.js          bow
    design.md       the design in words, and whether it is locked
    pictures/       design pictures
    lock.json       appears when the design is locked
  karna/ ...
  shared/           base body, animations, arrow, building blocks (used by everyone)
```

## All archers

| Folder | Name | Side | Tier (proposed) | In the game |
|---|---|---|---|---|
| `arjun/` | Arjun | Pandava | Legend | yes, temporary look |
| `karna/` | Karna | Kaurava | Legend | yes, temporary look |
| `bhishma/` | Bhishma | Kaurava | Legend | not yet |
| `drona/` | Drona | Kaurava | Legend | not yet |
| `ashvatthama/` | Ashvatthama | Kaurava | Legend | not yet |
| `abhimanyu/` | Abhimanyu | Pandava | Elite | not yet |
| `satyaki/` | Satyaki | Pandava | Elite | not yet |
| `kripa/` | Kripa | Kaurava | Elite | not yet |
| `bhagadatta/` | Bhagadatta | Kaurava | Elite | not yet |
| `dhrishtadyumna/` | Dhrishtadyumna | Pandava | Great | not yet |
| `drupada/` | Drupada | Pandava | Great | not yet |
| `shikhandi/` | Shikhandi | Pandava | Great | not yet |
| `kritavarma/` | Kritavarma | Kaurava | Great | not yet |
| `bhurishrava/` | Bhurishrava | Kaurava | Great | not yet |
| `jayadratha/` | Jayadratha | Kaurava | Great | not yet |
| `vrishasena/` | Vrishasena | Kaurava | Great | not yet |
| `purujit/` | Purujit | Pandava | Great | not yet |
| `pandya/` | King of Pandya | Pandava | Great | not yet |
| `brihadbala/` | Brihadbala | Kaurava | Great | not yet |

A folder without `character.js` is waiting for its design; the game ignores it until it is built.

## Locking a design
When a character's look is approved:

```bash
npm run lock -- arjun          # record the approved files
npm run lock -- unlock arjun   # only when Shubham asks for a change
npm run lock                   # show which characters are locked
```

While a character is locked, `npm test` fails if any file in its folder, or anything in `shared/`, is
changed, added or removed. A new design idea for one character belongs in that character's own folder,
because changing `shared/` affects all of them.

Not covered by the lock: arm poses (`src/render/archer.js`) and scene lighting (`src/render/stage.js`).

## Adding a character to the game
Copy `character.js`, `look.js` and `bow.js` from a finished character into the new character's folder, edit
them and `design.md`, then add it to `index.js`.
