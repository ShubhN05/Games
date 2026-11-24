# ⚔️ YUDH — Part 1: Arjun vs Ravan

A Tekken-style **3D fighting game** that runs in your browser. Play as **Arjun**, the archer-warrior, against the dark giant **Ravan**.

**▶ Play:** https://shubhn05.github.io/Games/fighter/ &nbsp;(desktop Chrome, keyboard. Phone controls are coming.)

> Work in progress — the game grows with every update. Right now it is a first playable: one hero, one boss, rounds, a training ground.

## Modes
- **⚔ Fight** — best-of-3 rounds (first to 2 wins, 3rd round if 1–1), **90 seconds** each. Ravan attacks.
- **🎯 Training ground** — Ravan **stands still**. Practice every move, use your super any time, and trigger Ravan's moves one by one to learn how to dodge them.

## Controls
| Key | Action |
|---|---|
| `←` `→` | move (walk as far as you like — the camera follows and zooms out) |
| `↑` / `↓` | jump / crouch |
| hold **BACK** (away from the enemy) | block |
| `A` `X` | left punch / right punch |
| `Z` `S` | left kick / right kick |
| `A` + `X` | **long-range arrow** (15 %, 5 s cooldown) |
| `Z` + `S` | **fire arrow** — burns the target 5 s (5 % total, 5 s cooldown) |
| `D` | **SUPER** — burning arrow + fire storm (65 %). Only in the **last 30 s** of a round, **once per round**. Cannot be blocked — get away! |
| `R` / `Esc` | restart / back to the menu |
| `T` | (fight) jump to the last 30 s to try the super |
| training: `1` `2` `3` `4` | Ravan does fire throw / clap / jump slam / super slam |
| training: `G` / `H` | Ravan fights back on/off / heal both |

Damage is a **percentage of the victim's full health**. Blocking stops punches, kicks and ranged attacks, but **not** the super.

## Ravan (boss) moves
Fire throw (dodge: jump, crouch, or block) · Clap sound wave (block it or stay away) · Jump slam (watch the red zone — leave it or be in the air) · **Super slam** in the last 30 s (65 %, run out of the red zone).

## Built with
- **JavaScript + [Three.js](https://threejs.org/)** (3D), no build step — plain files served as they are.
- Everything not downloaded is drawn in code: the 7 arenas (painted backdrops), Arjun's clothes and bow, Ravan's hair and trousers, all effects.

## Credits
- 3D character model and animations: **[Quaternius](https://quaternius.com/)** — Universal Base Characters + Universal Animation Library 1 & 2 (**CC0**, public domain). License text in `assets/LICENSE-Quaternius-CC0.txt`.
- **Three.js** — MIT license (`lib/three/LICENSE`).
- Characters and art direction by the project owner. Arjun and Ravan are figures from Indian epics; this game is an original fan work, not affiliated with any studio.

## Run it yourself
Browsers block 3D files opened straight from disk, so use a tiny local server:
```bash
git clone https://github.com/ShubhN05/Games.git
cd Games
python -m http.server 8010
# open http://localhost:8010/fighter/
```
Developer pages: `arenas-preview.html` (the 7 arenas), `arjun-look.html?view=front|side` (Arjun's look), `test-3d.html` (first 3D test).
