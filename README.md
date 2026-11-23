# 🎮 Games

A growing collection of small browser games. Every game is a self-contained folder: open it, play it, no installs.

**Play online:** https://negishubh05.github.io/Games/

## Games

| Game | Genre | Play | Source |
|---|---|---|---|
| 🌙 **Nightrunner — Missile Hero** | Dark-theme platformer, shoot missiles | [Play](https://negishubh05.github.io/Games/mario/) | [`/mario`](./mario) |

*More folders are coming — each new game gets its own directory with its own README.*

## How to play on any device

- **Desktop:** open the game link in Chrome (or any modern browser) and use the keyboard.
- **Phone / tablet:** open the same link and rotate to landscape. Games with touch support show on-screen buttons automatically.

## Run a game locally

```bash
git clone https://github.com/NegiShubh05/Games.git
cd Games
python -m http.server 8000
# open http://localhost:8000/mario/
```

Or simply double-click the `index.html` inside any game folder.

## Repo layout

```
Games/
├── index.html      # game menu (landing page)
├── README.md       # this file
└── mario/          # Nightrunner — Missile Hero
    ├── index.html
    └── README.md
```

Each game is plain HTML, CSS and JavaScript with no build step and no dependencies.

## Adding a game

1. Create a new folder, for example `snake/`.
2. Put an `index.html` (and any assets) inside, plus a `README.md` describing the game and its controls.
3. Add it to the table above and to the root `index.html` menu.

## License

Code is released under the MIT License (see `LICENSE`). Characters and art in each game are original unless stated otherwise in that game's README.
