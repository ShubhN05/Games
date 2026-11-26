# Kurukshetra — Archery Duel

A one-on-one long-range archery duel in the browser: you against the computer, Arjun and Karna.

**Play:** https://shubhn05.github.io/Games/kurukshetra/ (desktop keyboard)

## Controls

| Key | Action |
|---|---|
| **F** / **S** | fast arrow (0.3%) / normal arrow (1%); 50 arrows in total. Each can be shot four ways: |
| F/S alone | straight shot — escape it with **↓** (crouch, hold) |
| **A** + F/S | low shot — escape it with **↑** (jump just before it arrives) |
| **↑** + F/S | jump shot — escape it with **←** (step back, hold) |
| **D** + F/S | high shot — escape it with **→** (step forward, hold; not while in the air) |
| arrow keys | move; the newest key wins, and pressing one gives up a shot being drawn (the arrow is kept) |
| **1–5, twice** | super arrow, or the counter when one is coming |
| **Space** | clear the first number |
| **H** / **P** / **Esc** | counter chart / pause / pause, then menu |
| **R** | restart (when paused or after the match) |
| **M** | sound on/off |

A super arrow takes 2 s to call and 2.5 s to fly. The opponent cannot see which one it is until release.
Brahmastra and Pashupata do 30%, other super arrows 10%.

## Run and test locally

```bash
cd Games
python -m http.server 8010     # open http://localhost:8010/kurukshetra/
cd kurukshetra && npm test      # needs Node.js; no packages to install
```

## How the code is organised

```
index.html            the page (markup only)
styles/game.css       look of menu and HUD
preview.html          compares a character with its design picture
src/
  main.js             loads everything, runs the frame loop
  content/            ← add arrows and arenas here
    powers.js           all super arrows and their counters
    arenas/             one file per arena + index.js
  core/               the rules (no drawing, no keyboard; runs in Node)
  ai/                 the computer opponent and its levels
  game/               match flow: session.js, events.js (what each event looks and sounds like)
  render/             3D: stage, archers, arrows, effects
  ui/                 menu, HUD, chart, messages
  input/              keyboard (KEYMAP)
  audio/              sound
characters/           one folder per character: data, look, bow, design, pictures (see its README)
lib/three/            the Three.js 3D library
tests/                rules, content and design-lock checks
```

This game is self-contained: it loads nothing from the other games.

Dependencies go one way: `core` knows only `content` and `characters`; `ai` uses `core`; `render` and `ui` show what `core` says; `game` connects them.

## Adding things

**A new character** — see [`characters/README.md`](characters/README.md): copy a folder, edit it, add it to
`characters/index.js`. Approved designs are locked so they cannot change by accident.

**A new super arrow** — add one entry to `src/content/powers.js` with a free code (digits 1–5), its colour and
its counters. The chart, counter table, hints and computer pick it up. An archer may fire a `rare` one only if
it is listed in their `rares`.

**A new arena**
1. Copy `src/content/arenas/warbanner-marsh.js`; write `paint(ctx)` on a 960×540 canvas (ground line y = 450).
2. Import it in `arenas/index.js` and add it to `ARENAS`. The menu then shows an arena choice.

Run `npm test` after adding: it reports missing fields and counters that do not exist.

Fighters with a different style (mace, magic) will need new rules in `core/`, not only content.

## Credits

Uses Three.js (MIT, `lib/three/LICENSE`), and the CC0 body model and animations by Quaternius
(`characters/shared/LICENSE-Quaternius-CC0.txt`).
