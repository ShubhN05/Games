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

## Adding a character
Copy a folder, rename it, edit `character.js`, `look.js`, `bow.js` and `design.md`, delete `lock.json`
if it was copied, then add it to `index.js`.
