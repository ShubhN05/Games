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
  shared/           base body, animations, arrow, hair helpers and the wardrobe (dressing tools)
```

## All archers

| Folder | Name | Side | Tier (proposed) | In the game |
|---|---|---|---|---|
| `arjun/` | Arjun | Pandava | Legend | yes, **locked** |
| `karna/` | Karna | Kaurava | Legend | yes, **locked** |
| `bhishma/` | Bhishma | Kaurava | Legend | yes, **locked** |
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

## Comparing a character with its picture
With the local server running, open `http://localhost:8010/kurukshetra/preview.html?c=arjun`:
the design picture is shown beside the 3D character, from the front, angle, side and back, with or without the bow drawn.

## Locking a design
When a character's look is approved:

```bash
npm run lock -- arjun          # record the approved files
npm run lock -- unlock arjun   # only when Shubham asks for a change
npm run lock                   # show which characters are locked
```

While a character is locked, `npm test` fails if a file in its folder, the base body, or any shared file its
look imports is changed or removed. Pictures are not part of the lock. A new design idea for one character
belongs in that character's own folder, because changing a shared file affects everyone who uses it.

Not covered by the lock: arm poses (`src/render/archer.js`) and scene lighting (`src/render/stage.js`).

## Adding a character to the game
Copy `character.js`, `look.js` and `bow.js` from a finished character into the new character's folder, edit
them and `design.md`, then add it to `index.js`.
