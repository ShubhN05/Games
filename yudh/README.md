# ⚔️ YUDH — Part 1: Arjun vs Ravan

A Tekken-style **3D fighting game** that runs in your browser. Play as **Arjun**, the archer-warrior, against the dark giant **Ravan**.

**▶ Play:** https://shubhn05.github.io/Games/yudh/ &nbsp;(desktop Chrome, keyboard. Phone controls are coming.)

> Work in progress — the game grows with every update. Right now it is a first playable: one hero, one boss, rounds, a training ground.

## 👥 Fighters
- **Arjun** — archer hero (bow, fire arrows).
- **Choo** — Chinese kung-fu master (Tekken-3 / Bruce-Lee style). Pick him on the menu (`C`). Same combo keys, different powers: `A+X` chi wave · `Z+S` flying kick · `D` Dragon Rush (super) · `A A A` Hundred Fists · `X A` Heavenly Thunder · `S A` Spinning Dragon Kick · `X S A` Earth Shatter · `X A Z A A A` fatality.

## Modes
- **⚔ Fight** — best-of-3 rounds (first to 2 wins, 3rd round if 1–1), **90 seconds** each. Ravan attacks.
- **🏹 Arjun vs Arjun** — a second Arjun stands in front of you (a test ground for Arjun's moves): `B` he blocks, `1` he jabs, `2` he shoots an arrow, `G` he fights back.
- **🎯 Training ground** — Ravan **stands still**. Practice every move, use your super any time, and trigger Ravan's moves one by one to learn how to dodge them.

## Controls
| Key | Action |
|---|---|
| `←` `→` | move (walk as far as you like — the camera follows and zooms out) |
| `↑` / `↓` | jump / crouch |
| hold **BACK** (away from the enemy) | block — Arjun **crosses his arms in an X** and a blue shield glows |
| `A` `X` | left punch / right punch |
| `Z` `S` | left kick / right kick |
| `A` + `X` | **long-range arrow** (15 %, 5 s cooldown) |
| `Z` + `S` | **fire arrow** — burns the target 5 s (5 % total, 5 s cooldown) |
| `A` `A` `A` | **Arrow rain** (20 %) — only a block stops it |
| `X` then `A` | **Fire rain** (15 % + burn) — block it |
| `S` then `A` | **Fire blast** (12 %) |
| `X` `S` `A` | **Ground attack** (18 %) — jump over it |
| `X` `A` `Z` `A` `A` `A` | **FATALITY** — an arrow that can't be blocked or dodged; instant kill, the opponent is beheaded. Super window only (last 30 s), once per round, uses your super |
| `→` `→` (double-tap forward) | **Run + slam punch** (10 %, knocks down, 3 s cooldown) — only a **BACK block** stops it |
| `D` | **SUPER** — burning arrow + fire storm (65 %). Only in the **last 30 s** of a round, **once per round**. Cannot be blocked — get away! |
| `R` / `Esc` | restart / back to the menu |
| `T` | (fight) jump to the last 30 s to try the super |
| training: `1` `2` `3` `4` | Ravan does fire throw / clap / jump slam / super slam |
| training: `G` / `H` | Ravan fights back on/off / heal both |

Combos: type the keys within ~0.5 s of each other (6 s cooldown). The key sequences are the same for every fighter; each fighter gets a different effect (these are Arjun's). Strong hits knock the opponent down; light hits push him back.

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
# open http://localhost:8010/yudh/
```
Developer pages: `arenas-preview.html` (the 7 arenas), `arjun-look.html?view=front|side` (Arjun's look), `test-3d.html` (first 3D test).
