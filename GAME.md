# GAME.md — Future Defense: Robot Uprising
## Design Bible & Source of Truth

*All design decisions below are market-informed. Primary references: Kingdom Rush series
(4.8★, ~50M downloads), Bloons TD6 (4.8★, premium + fair IAP), Plants vs. Zombies (4.7★).
Decisions marked with 📊 are backed by review analysis.*

---

## Market Research Summary

**What top tower defense games do right:**
- Towers have distinct personalities, not just stat differences (📊 most-cited positive in KR reviews)
- Branching upgrade paths create player debate and replayability (📊 KR/BTD6)
- Hero unit adds active skill expression — makes player feel powerful (📊 KR's #1 cited feature)
- Enemy variety forces strategic thinking — air units, armored, fast, splitting (📊 BTD6)
- Perfect difficulty ramp: wave 1 is impossible to lose, wave 10 requires thought (📊 universal)
- 3-star map rating system: completable without stars, mastery requires them (📊 KR)
- No energy systems, no wait timers — players violently hate these (📊 most-cited negative in F2P TDs)

**What kills TD games in reviews:**
- Difficulty walls behind paywalls
- Towers feeling interchangeable
- Late-game repetition with nothing new
- UI that doesn't work at mobile scale
- No challenge for skilled players (stars/achievements needed)

**Best monetization model for reviews + revenue:**
- Free base game (all campaign content)
- Optional premium world packs ($1.99–$2.99) — proven by KR Frontiers
- Cosmetic skins for towers (no gameplay advantage)
- NEVER: energy systems, loot boxes, P2W upgrades

---

## Narrative

**Setting:** Year 2157. A rogue superintelligence called **TITAN** has built an army of robots
and launched a global invasion to reclaim Earth for machines.

**Player role:** You command **A.R.I.A.** — the Automated Response Intelligence Agency —
Earth's last automated defense network. Each mission is a strategic engagement to hold ground
and push TITAN's forces back.

**Tone:** Sci-fi but accessible. Think Iron Man's AI assistant personality meets a real threat.
Appropriate for ages 8 and up. Robots are menacing but not gory.

**Story beats (simple, told through level intros):**
- World 1: TITAN attacks Earth's outer cities. First contact. We hold the line.
- World 2: TITAN discovers our underground bunkers. We defend the last human sanctuaries.
- World 3: We go on offense — breach TITAN's mothership and destroy the core.

---

## Campaign Structure

**3 Worlds × 3 Maps = 9 Maps total**

All maps use Tiled JSON format (see `/maps/`). Path waypoints defined in map data.

### World 1 — Earth's Last Stand 🌆
*Bombed-out urban ruins. Tutorial difficulty. Single straight-ish path. Introduces mechanics.*
- Map 1-1: **The Outskirts** — Single path, wide lanes, gentle curve. Full tutorial here.
- Map 1-2: **Downtown** — Path splits briefly then rejoins. Introduces path variety.
- Map 1-3: **The Bridge** — Long straight path with two chokepoints. First real difficulty.

### World 2 — The Underground 🚇
*Subway tunnels and bunkers. Medium difficulty. Branching paths, narrower build zones.*
- Map 2-1: **Platform Seven** — Two enemy entry points merging into one exit. Requires split defense.
- Map 2-2: **The Tunnels** — Maze-like path, many corners. Cryo/Tesla synergy emphasized.
- Map 2-3: **Command Center** — Widest map. Two separate paths never converge. Hardest of World 2.

### World 3 — TITAN's Ship 🤖
*Interior of the robot mothership. Hard difficulty. Complex paths. Boss gauntlet.*
- Map 3-1: **The Hangar** — Large open area, enemies spawn from 3 points.
- Map 3-2: **The Core Approaches** — Tight spiral path, limited build space, must be efficient.
- Map 3-3: **TITAN's Core** — Final map. Waves of every enemy type. TITAN boss fight finale.

**Unlock structure:**
- World 1 available immediately
- World 2 unlocks after completing all World 1 maps (any star count)
- World 3 unlocks after completing all World 2 maps

**Star system (📊 proven by Kingdom Rush):**
- Each map: 0–3 stars based on lives remaining at end
  - ★★★: Finish with 15+ lives
  - ★★: Finish with 5–14 lives
  - ★: Finish with 1–4 lives
- Stars spent to unlock towers (see Progression)

---

## Tower System

### 9 Base Towers (by unlock order)

| Tower | Cost | Role | Personality | Unlocked |
|-------|------|------|-------------|---------|
| **Pea Shooter** | $20 | Starter rapid-fire | The Rookie. Lovable, underestimated | From start |
| **Laser Turret** | $50 | Single-target high DPS | The Sniper. Cold and precise | From start |
| **EMP Cannon** | $75 | Crowd stun | The Disabler. Thinks before shooting | From start |
| **Cryo Tower** | $90 | Slow field | The Freezer. Patient, methodical | From start |
| **Spark Tower** | $35 | Budget AOE electric | The Wildcard. Chaotic energy | 3★ total |
| **Plasma Cannon** | $100 | AOE burst | The Blaster. Loud and proud | 6★ total |
| **Tesla Coil** | $120 | Chain lightning | The Chainer. Loves company | 10★ total |
| **Rail Gun** | $150 | Pierce through line | The Specialist. One shot, many kills | 15★ total |
| **Missile Battery** | $175 | Heavy AOE + armor pierce | The Closer. Expensive, worth it | 20★ total |

### 5 Fusion Towers (📊 unique mechanic, differentiator)

Combine two towers into one upgraded fusion tower. Both towers consumed, fusion tower placed.
Fusion is irreversible. Strategic risk/reward.

| Fusion | Result | Special |
|--------|--------|---------|
| Laser + EMP | **Disruptor** | Laser that stuns on hit |
| Plasma + Missile | **Plasma Rocket** | AOE rocket with burn DoT |
| Tesla + Cryo | **Absolute Zero** | Chain lightning that freezes |
| Rail + Plasma | **Annihilator** | Pierce + AOE at pierce points |
| Photon + Vortex | **Prism Cannon** | Multi-beam in 5 directions |

### Tower Upgrade System (📊 Kingdom Rush style — biggest replayability driver)

Each tower has **2 upgrade levels**, bought with gold during a run.
Level 2 is a **binary choice** — two different upgrade paths. Player picks one.

This choice is the engagement hook. Players discuss "which path is better" online.

**Example — Laser Turret:**
- Level 1 ($75): +30% damage, +10% range. "Improved targeting optics."
- Level 2A ($120): **Overcharge** — 2× damage but fires 50% slower. For armored enemies.
- Level 2B ($120): **Rapid Pulse** — 2× fire rate, -20% damage. Shreds swarms.

*Full upgrade trees for all 9 towers defined in `/js/data/tower-upgrades.ts`*

### Mine (special)
- Proximity Mine ($40) — placed on path, one-use, high damage splash
- No upgrades

---

## Enemy System

### 9 Enemy Types (introduces in this order across campaign)

| Enemy | First Appears | Special Mechanic | Countered By |
|-------|--------------|-----------------|--------------|
| **Scout** | Map 1-1 | None | Anything |
| **Soldier** | Map 1-1 | 2× health of Scout | Laser, Rail |
| **Tank** | Map 1-2 | Heavy armor (-50% from non-pierce) | Rail, Missile |
| **Drone** | Map 1-3 | **FLIES** — ignores ground obstacles | Tesla, EMP |
| **Mech** | Map 2-1 | Occasional shield burst (1-sec immune) | Sustained DPS |
| **Swarm** | Map 2-2 | Dies → splits into 2 Scouts | AOE (Plasma, Tesla) |
| **Titan** | Map 2-3 | High HP, slows adjacent towers' fire rate | Cryo + Rail |
| **Juggernaut** | Map 3-x | Boss: 6000HP, guaranteed Wave 20+ | Everything |
| **Specter** | Map 3-x | Boss: speed 5.0, phases briefly invincible | EMP timing |

**Flying unit rule (📊 forces strategic diversity — BTD6's most praised mechanic):**
Only Tesla, EMP, Rail, Missile, and Photon hit flying units.
Players must maintain mixed tower loadouts. Pure ground-only builds get punished by Drones.

---

## Hero Unit (📊 Kingdom Rush's most-cited positive feature)

**ARIA-7** — a mobile combat drone the player can reposition between waves.

- Has 150 HP (can be targeted by enemies, retreats if HP < 20)
- Active ability (tap to use, 30s cooldown): **EMP Burst** — stuns all enemies on screen for 2s
- Passive: +15% damage bonus to nearest 3 towers
- Levels up every 3 waves: Wave 3 (Level 2: HP + damage), Wave 6 (Level 3: adds shield), Wave 9+ (Level 4+)
- Draggable on the map — repositioning is a key player skill

---

## Economy

**In-run gold:**
- Starting gold: $150 (enough for 3–4 cheap towers)
- Gold per enemy kill: scales with enemy HP (Scout=$2, Juggernaut=$50)
- Gold per wave cleared: flat bonus ($25 × wave number)

**Between-run stars:**
- Spent to unlock towers (see Tower System)
- Spent to unlock World 2, World 3
- No other currency — keeps it simple, no backend needed

---

## Difficulty

**Three settings (📊 players expect this — absence cited as negative in reviews):**
- **Recruit** — 30 starting lives, 80% enemy HP, enemies earn 20% less gold
- **Sergeant** — 20 starting lives, 100% enemy HP (default)
- **Commander** — 10 starting lives, 130% enemy HP, no selling towers

**Per-map challenge modes** (unlock after 3★):
- **Iron Defense**: Cannot sell towers
- **Speed Run**: 30-second wave timer
- **No Mercy**: Lives start at 1

---

## Progression Flow

```
New Player
  └─ Tutorial (Map 1-1, guided)
      └─ Unlock World 1 fully
          └─ Earn stars → unlock Spark, Plasma towers
              └─ Complete World 1 → unlock World 2
                  └─ Earn stars → unlock Tesla, Rail towers
                      └─ Complete World 2 → unlock World 3
                          └─ Earn stars → unlock Missile tower
                              └─ Complete World 3 → credits + Challenge maps unlock
```

---

## Audio

**Music (per world):**
- World 1: Tense electronic — think Hans Zimmer sci-fi, minimal, building
- World 2: Darker, heavier — industrial drums, distorted bass
- World 3: Full orchestral-electronic hybrid — epic, climactic

**Sound effects:**
- Every tower type has a distinct shot sound (already built)
- Enemy death sounds vary by enemy type
- UI sounds: tower placement (satisfying click), upgrade (power-up chime), wave clear (fanfare)
- ARIA hero ability: satisfying EMP "whumph"

---

## Visual Style

**Towers:** Stylized sci-fi cartoon with neon glow accents. Clean shapes, readable at 36×36px.
**Enemies:** Same style. Size communicates threat — Scout is tiny, Juggernaut is massive.
**Map:** Dark background, circuit-board grid texture, glowing path edges.
**UI:** Dark panel, neon accent colors, minimal text.

*All sprites generated via DALL-E 3 at 1024×1024, cropped to sprite bounds, stored in `/assets/sprites/`*

---

## Technical Notes

- Map format: Tiled JSON (`.tmj`) in `/maps/`
- Game engine: HTML5 Canvas (vanilla JS/TS)
- Build: Vite 7 + TypeScript 5
- Tests: Vitest (unit) + Puppeteer (visual smoke)
- Deploy: GitHub Pages (auto via push to main)
- Save: localStorage (no backend needed)
- Branch strategy: features on `feature/*` branches, main = always working

---

## Checkpoint Tags (Git)

| Tag | Contents |
|-----|---------|
| `checkpoint-0-baseline` | Current working game before overnight changes |
| `checkpoint-1-setup` | Vite + TypeScript + project structure |
| `checkpoint-2-sprites` | All AI sprites generated and integrated |
| `checkpoint-3-maps` | Campaign structure, 9 maps, map select screen |
| `checkpoint-4-upgrades` | Tower upgrade system (2 levels + branching) |
| `checkpoint-5-hero` | ARIA hero unit |
| `checkpoint-6-enemies` | Flying units + new enemy mechanics |
| `checkpoint-7-polish` | Tutorial, win/loss screens, difficulty settings |
| `v9.0-campaign` | Release-ready campaign build |
