# 🌙 Nightrunner — Missile Hero

A dark-theme, Mario-style platformer that runs in your browser. Run, jump, stomp enemies — and when stomping isn't enough, **fire missiles**. Five levels, from a moonlit run to a final fight against **four dragons**.

**▶ Play now:** https://shubhn05.github.io/Games/mario/

No install, no download, no sign-up. It works on desktop Chrome and on phones (landscape).

---

## The idea

Old-school platformers gave the hero a gun. In this one, the hero already carries a **shoulder-mounted missile launcher**. Missiles streak across the screen with a flame trail, explode on impact, and take out every enemy caught in the blast.

## The 5 levels

| # | Level | What to expect |
|---|---|---|
| 1 | 🌙 **Night Run** | A starry night. Pits, pipes, brick and `?` blocks, beetles and bats. Reach the flag. |
| 2 | 🌊 **The Deep** | Everything is underwater. You **swim**: tap jump to paddle up, sink slowly when you stop. Coral walls, crabs, fish, jellyfish and spiky urchins (don't touch those). |
| 3 | 🔥 **Inferno** | Everything is burning. Lava pits, **fire jets** that warn before they blast, burning trees, imps and ember bats. Falling in lava is instant death. |
| 4 | ⛈️ **Storm Sky** | Cloud islands floating in a thunderstorm. No ground — miss a jump and you fall. Birds, cloud-puffs and thunder clouds that drop lightning bolts. |
| 5 | 🐉 **Dragon Lair** | The final boss fight. **Four dragons**, one after another. Each has its own health bar and attack. |

### The four dragons
1. **Ember Drake** — spits aimed fireballs.
2. **Frost Wyrm** — fires a spread of three ice shards.
3. **Venom Serpent** — lobs arcing poison globs.
4. **Shadow King** — the biggest and fastest; rapid triple shots.

All of them also **telegraph and dive-bomb** you. You can't stomp a dragon — only missiles hurt it. Defeating a dragon restores one heart.

## Controls

### Keyboard
| Action | Keys |
|---|---|
| Move | `←` `→` or `A` `D` |
| Run faster | hold `Shift` |
| Jump / swim up | `↑`, `W` or `Space` (hold for a higher jump; hold to keep swimming) |
| **Fire missile** | `X`, `J` or `Z` |
| Mute | `M` |
| Start / next level | `Enter` |
| Jump to a level (title screen) | `1` – `5` |

### Phone / tablet
Turn the phone **sideways**. On-screen buttons appear: ◀ ▶ to move, ▲ to jump or swim, 🚀 to fire. Tap the screen to start, and to continue after each level. The game goes fullscreen on your first tap.

## How to play

- **Goal:** reach the glowing flag at the end of each level. In level 5, defeat all four dragons.
- **Missiles:** up to 4 on screen at once, with a short reload (the orange bar top-right). Explosions have a blast radius, so grouped enemies go down together.
- **Health:** 3 hearts and 3 lives. Touching an enemy or a hazard costs a heart; pits, lava and deep falls cost a life. You gain a life after each level.
- **Score:** +100 per enemy, +50 per coin or `?` block, +1000 per dragon, +500 per heart left when you clear a level.
- **Boss progress is kept:** if you lose a life against the dragons, you restart at the dragon you were fighting, not the first one.

## Features

- Five distinct themes, each with its own backgrounds, tiles, enemies and hazards
- Swimming physics underwater, lava and fire jets, and a four-phase boss fight
- Smooth platforming: coyote time, jump buffering, variable jump height
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

This is a fan-style homage to the platformer genre. All characters, enemies, dragons, graphics and sounds are **original** and made for this project. It is not affiliated with or endorsed by Nintendo.

Made with HTML5 Canvas and plain JavaScript.
