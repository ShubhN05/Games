# ⚔️ YUDH — Part 1: Arjun vs Ravan

A Tekken-style **3D fighting game** that runs in your browser. Play as **Arjun**, the archer-warrior, against the dark giant **Ravan**.

**▶ Play:** https://shubhn05.github.io/Games/yudh/ &nbsp;(desktop Chrome, keyboard. Phone controls are coming.)

> Work in progress — the game grows with every update. Right now it is a first playable: one hero, one boss, rounds, a training ground.

## ⚙ Difficulty
Press `4` on the menu: **Easy / Normal / Hard** (remembered by your browser). Easier settings give the computer slower reactions, longer warnings and softer hits.

- A **white glint** on the computer fighter means an attack is coming.
- A **circle** on the floor marks a power: leave it or block. A **red zone** marks a super: leave it (jumping and ducking do not help).
- Block a computer punch or kick and it is stuck for a moment: **hit back**.
- Repeat the same move four times in a row and the computer reads you: it blocks and counter-kicks.

## 🔊 Sound and hit feel
- Punches, kicks, blocks, jumps, knockdowns, every power, round gongs, a slow-motion **K.O.** and an announcer voice (your computer's own English voice).
- Every hit freezes the picture for a split second and flashes; a blocked hit flashes blue.
- Punches and kicks step in and land only when the fist or foot reaches the opponent.
- `M` (or the menu button) turns sound off and on. Sound starts after your first key press (a browser rule).
- All sounds are made in code (`lib/sfx.js`), no sound files.

## 🏆 Fight mode (arcade ladder)
Pick a fighter, then beat the other fighters one by one (best of 3, 90-second rounds, a VS screen between stages, each opponent a bit tougher). **Ravan is the final boss.** Lose and press `R` to retry that fight.

**Everyone:** `Z` or `S` while jumping = **air kick** (8 %) · double-tap forward = **running flying kick** (12 %, knocks down, block it).

## ✨ Q and W combos (every fighter, each in his own element)
| Keys | Power | Damage | How to stop it |
|---|---|---|---|
| `Q` then `A` | **Giant orb** (Asur: huge fireball from his mouth) | 22 %, knocks down | **cannot be blocked**: jump it |
| `W` then `Q` | **Laser** across the arena | 18 % | block or jump |
| `W` then `A` | Leap and throw a **sky sword** | 20 %, knocks down | block or jump |
| `W` then `S` | **Burning floor** for 1 second | up to 20 % (4 x 5) | jump, or block |
| `Q` then `S` | **Arrow throw** | 15 % | block, jump or crouch |

**Fighter roles:** Arjun, Indra and Asur are the top fighters, strong at long and short range; Ravan, the villain, is too: their versions of these combos cross the whole arena. **Choo and Kaze are short-range fighters:** theirs reach only close up (about 3 steps) — a burst, a palm beam, a leaping blade cut, a ring on the floor and a short dart.

**All of Choo's and Kaze's powers are short range** (about 3.2 units), old and new, for the player and the computer, including their D supers. Only the fatality still reaches any distance (flying kick / running kick unchanged).

They share the 3-second combo cooldown. `Q` and `W` do nothing on their own. Elements: Arjun sun/fire, Choo chi, Kaze wind, Indra thunder, Ravan demon, Asur fire.

## 👥 Fighters
- **Asur** — the fire warrior, as strong as Indra. Fair skin, red trousers, flame-red hair. `A+X` Hand Fireball (18 %, crouch, jump or block) · `Z+S` Flame Kick (14 %, knocks down) · `X A` Mouth Fireball (20 %, knocks down, jump or block) · `D` Inferno (4 s of fire pillars, up to 65 %: keep moving) · `X A Z A A A` Hellfire fatality.
- **Indra** — king of the gods, lord of thunder. Lightning crackles around him all the time. `A+X` Thunder Shot (18 %, very fast) · `Z+S` Thunder Kick (14 %, knocks down) · `X A` Sky Thunder (20 %, anywhere; block it) · `D` Storm of Heaven (4 s of coloured lightning, up to 65 %, cannot be blocked: keep moving) · `X A Z A A A` White Judgement fatality.
- **Ravan** — the demon king, now playable (and still the boss). A giant with a demon sword that appears whenever he uses a power. `A+X` Sword Slash (knocks down) · `Z+S` Leg Sweep (knocks down, jump it) · `A A` Heat Vision (crouch it) · `X A` Sword Throw, it flies back to his hand · `X S A` Inferno Sword · `D` Sky Cleaver (super). No fatality: he is powerful enough.
- **Kaze** — an original ninja: shuriken, clones, wind. `A+X` shuriken · `Z+S` flying kick (10 %, 3 s cooldown) · `D` Spiral Sphere (super) · `A A A` Clone Barrage · `X A` Wind Tornado · `S A` Shuriken Storm · `X S A` Ground Burst · `X A Z A A A` fatality.
- **Arjun** — archer hero (bow, fire arrows).
- **Choo** — Chinese kung-fu master (Tekken-3 / Bruce-Lee style). Pick him on the **character select** screen (after choosing a mode: ← → to choose, Enter to confirm, Esc to go back), then pick the **stage** (7 arenas + RANDOM). Same combo keys, different powers: `A+X` chi wave · `Z+S` flying kick (10 %, 3 s cooldown) · `D` Dragon Rush (super) · `A A A` Hundred Fists · `X A` Heavenly Thunder · `S A` Spinning Dragon Kick · `X S A` Earth Shatter · `X A Z A A A` fatality.

## Modes
- **⚔ Fight** — best-of-3 rounds (first to 2 wins, 3rd round if 1–1), **90 seconds** each. Ravan attacks.
- **🏹 Mirror duel** — you against a copy of your fighter. It fights with its punches, kicks, powers and super. `G` makes it stand still, `B` makes it block, `1` / `2` make it attack on command.
- **🎯 Training ground** — Ravan **stands still**. Practice every move, use your super any time, and trigger Ravan's moves one by one to learn how to dodge them.

## Controls
| Key | Action |
|---|---|
| `←` `→` | move (walk as far as you like — the camera follows and zooms out) |
| `↑` / `↓` | jump / crouch |
| hold **BACK** (away from the enemy) | block — your fighter **crosses both arms in an X** and a blue shield glows. No block while you are attacking. Walking back is slower |
| `A` `X` | left punch / right punch |
| `Z` `S` | left kick / right kick |
| `A` + `X` | **long-range arrow** (15 %, 3 s cooldown) |
| `Z` + `S` | **fire arrow** — burns the target 5 s (5 % total, 3 s cooldown) |
| `A` `A` `A` | **Arrow rain** (20 %) — only a block stops it |
| `X` then `A` | **Fire rain** (15 % + burn) — block it |
| `S` then `A` | **Fire blast** (12 %) |
| `X` `S` `A` | **Ground attack** (18 %) — jump over it |
| `X` `A` `Z` `A` `A` `A` | **FATALITY** — an arrow that can't be blocked or dodged; instant kill, the opponent is beheaded. Works **at any time once the opponent has lost more than half their health** (the screen shows FATALITY READY) |
| `→` `→` (double-tap forward) | **Running flying kick** (12 %, knocks down, 3 s cooldown) — hold BACK to block |
| `Z` / `S` while jumping | **Air kick** (8 %) |
| `D` | **SUPER** — burning arrow + fire storm (65 %). Only in the **last 30 s** of a round, **once per round**. Cannot be blocked — get away! |
| `R` / `Esc` | restart / back to the menu |
| `M` | sound off / on |
| training: `1`–`8` | Ravan does sword slash / leg sweep / sword throw / inferno sword / heat vision / fire throw / jump slam / super slam |
| training: `G` / `H` | Ravan fights back on/off / heal both |

A button pressed during another move is remembered for a moment. After a knockdown, press any button to get up sooner.

Combos: type the keys within ~0.5 s of each other (3 s cooldown). The key sequences are the same for every fighter; each fighter gets a different effect (these are Arjun's). Strong hits knock the opponent down; light hits push him back.

Damage is a **percentage of the victim's full health**. Blocking stops punches, kicks and ranged attacks, but **not** the super.

## Ravan (boss) moves
Fire throw (dodge: jump, crouch, or block) · Sword slash, leg sweep, sword throw, inferno sword and heat vision · Jump slam (watch the red zone — leave it or be in the air) · **Super slam** in the last 30 s (65 %, run out of the red zone).

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
