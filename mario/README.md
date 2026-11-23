# 🌙 Nightrunner — Missile Hero

A dark-theme, Mario-style platformer that runs in your browser. Run, jump, stomp enemies — and when stomping isn't enough, **fire missiles**.

**▶ Play now:** https://negishubh05.github.io/Games/mario/

No install, no download, no sign-up. It works on desktop Chrome and on phones (landscape).

---

## The idea

Old-school platformers gave the hero a gun. In this one, the hero already carries a **shoulder-mounted missile launcher**. Missiles streak across the screen with a flame trail, explode on impact, and take out every enemy caught in the blast.

Everything happens at night: a starry sky, a glowing moon, neon-edged ground and glowing coin blocks.

## Controls

### Keyboard
| Action | Keys |
|---|---|
| Move | `←` `→` or `A` `D` |
| Run faster | hold `Shift` |
| Jump | `↑`, `W` or `Space` (hold for a higher jump) |
| **Fire missile** | `X`, `J` or `Z` |
| Mute | `M` |
| Start / restart | `Enter` |

### Phone / tablet
Turn the phone **sideways**. On-screen buttons appear: ◀ ▶ to move, ▲ to jump, 🚀 to fire. Tap the screen to start or restart.

## How to play

- **Goal:** reach the glowing flag at the end of the level.
- **Enemies:** purple night-beetles walk the ground; yellow-eyed glow-bats fly in waves. Stomp them from above or blow them up with a missile.
- **Missiles:** up to 4 on screen at once, with a short reload (the orange bar in the top-right). Explosions have a small blast radius, so grouped enemies go down together.
- **Health:** 3 hearts and 3 lives. Touching an enemy costs a heart; falling into a pit costs a life.
- **Score:** +100 per enemy, +50 per coin or `?` block, +500 per heart left when you clear the level.

## Features

- Smooth physics: coyote time, jump buffering, variable jump height
- Parallax night background with twinkling stars
- Particle explosions, shockwave rings and screen shake
- Original art and sound effects, all generated in code (no image or audio files)
- Single file — one `index.html`, no libraries, no build step

## Run it locally

Just double-click `index.html`, or serve the folder:

```bash
python -m http.server 8000
# then open http://localhost:8000/mario/
```

## Credits and legal

This is a fan-style homage to the platformer genre. All characters, enemies, graphics and sounds are **original** and made for this project. It is not affiliated with or endorsed by Nintendo.

Made with HTML5 Canvas and plain JavaScript.
