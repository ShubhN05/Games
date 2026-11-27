# Kurukshetra — Archery Duel

A one-on-one long-range archery duel in the browser: you against the computer, with Arjun, Karna, Bhishma, Drona and Ashvatthama.

**Play:** https://shubhn05.github.io/Games/kurukshetra/ (computer keyboard, or a phone held sideways)

## Controls

| Key | Action |
|---|---|
| **F** / **S** | fast arrow (0.3%, **20**) / slow arrow (1%, **15**). A slow arrow that hits breaks the opponent's super arrow call. Each can be shot four ways: |
| F/S alone (or **←** held) | straight shot — escape it with **↓** (crouch, hold) |
| **↓** held + F/S | low shot — escape it with **↑** (jump just before it arrives) |
| **↑** held + F/S | jump shot — escape it with **←** (step back, hold) |
| **→** held + F/S | high shot — escape it with **→** (step forward, hold; not while in the air) |
| arrow keys | move; the newest key wins, and pressing one gives up a shot being drawn (the arrow is kept) |
| **1–5** | super arrow, or a counter when one is coming |
| **6** / **7** | your big weapons, once each |
| **Space** | Brahma Danda shield (blocks one big weapon) |
| **H** / **P** / **Esc** | counter chart / pause / pause, then menu |
| **R** | restart (when paused or after the match) |
| **M** | sound on/off |

Choose your archer and your opponent (or a random one) on the menu; **R** fights the same pair again.

A super arrow takes 3 s to prepare and 2.5 s to fly. The opponent cannot see which one it is until release.
Brahmastra, Pashupata and Narayanastra do 30%, other super arrows 10%.

| Key | Super arrow | Stopped by |
|---|---|---|
| 1 | Fire | 2 Water |
| 2 | Water | 3 Wind |
| 3 | Wind | 4 Mountain |
| 4 | Mountain | 5 Thunder |
| 5 | Thunder | 1 Fire |
| 6 | Brahmastra (every archer) | 6, or Space |
| 7 | Pashupata (Arjun) | Space; 6 halves it |
| 7 | Narayanastra (Ashvatthama) | lower your bow (hold ↓), or Space |

**Narayanastra** (Ashvatthama, once per match): hold **↓** to lower your bow and do not attack, and it passes you by.
Shooting, releasing your own super arrow or trying another counter while it flies turns it on you (an attack begun
in its first 0.6 s is forgiven). Lowering your bow drops a super arrow you were preparing, without using it up.
The Brahma Danda also stops it.

## On a phone

Hold it sideways. The controls appear by themselves on touch screens.

| Control | Action |
|---|---|
| **F** / **S** (left) | fast / slow arrow |
| **SUPER** (left) | hold, slide to one of the five circles, let go (let go in the middle to cancel) |
| **★** (left) | hold and slide to a big weapon or the shield |
| joystick (right) | ↑ jump · ↓ duck · ← step back · → step forward; held while tapping F or S it chooses the shot |
| **Ⅱ** (top) | pause: continue, restart, chart, sound, menu |

The first visit downloads about 30 MB, so use Wi-Fi. To try the phone controls on a computer, add `?touch=1`
to the address.

## Intro film

The game opens with a 46-second film (**PLAY INTRO** / **SKIP**; **WATCH INTRO** on the menu replays it). Computers
get `media/intro.mp4`; touch screens get `media/intro-phone.mp4`, which shows thumbs on the phone controls.
It is recorded from the game itself, with the music *Before the Temple Bell* (kept locally as
`tools/intro/music.mp3`) as its only sound. To record it again after changing a character or the
battlefield, serve the games folder on port 8010 and run (`--phone` or `--pc` records one of the two; `--sound` changes only the sound):

```bash
python kurukshetra/tools/intro/record.py     # needs Google Chrome, and: pip install websockets imageio-ffmpeg numpy
```

`?intro=0` in the address goes straight to the menu.

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
  input/              keyboard (KEYMAP) and finger gestures
  audio/              sound
characters/           one folder per character: data, look, bow, design, pictures (see its README)
lib/three/            the Three.js 3D library
tests/                rules, touch gesture, content and design-lock checks
media/                the intro films (computer and phone)
tools/intro/          records the intro film (not loaded by the game)
```

This game is self-contained: it loads nothing from the other games.

Dependencies go one way: `core` knows only `content` and `characters`; `ai` uses `core`; `render` and `ui` show what `core` says; `game` connects them.

## Adding things

**A new character** — see [`characters/README.md`](characters/README.md): copy a folder, edit it, add it to
`characters/index.js`. Approved designs are locked so they cannot change by accident.

**A new weapon** — add one entry to `src/content/powers.js` with an id, its key, colour and counters. Keys 1–5 are
the ordinary circle; a big weapon uses 6 or 7. The chart, counter table, hints and computer pick it up. An archer may fire a `rare` one only if
it is listed in their `rares`.

**A new arena**
1. Copy `src/content/arenas/warbanner-marsh.js`; write `paint(ctx)` on a 960×540 canvas (ground line y = 450).
2. Import it in `arenas/index.js` and add it to `ARENAS`. The menu then shows an arena choice.

Run `npm test` after adding: it reports missing fields and counters that do not exist.

Fighters with a different style (mace, magic) will need new rules in `core/`, not only content.

## Credits

Uses Three.js (MIT, `lib/three/LICENSE`), and the CC0 body model and animations by Quaternius
(`characters/shared/LICENSE-Quaternius-CC0.txt`).
