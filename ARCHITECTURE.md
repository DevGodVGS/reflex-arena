# Reflex Arena — Architecture & System Design Document
*Think Fast. React Faster.*

## 1. System Overview

**Reflex Arena** is a production-grade browser arcade gaming platform engineered as a high-performance modular monolith. It provides a unified gaming ecosystem featuring ten responsive, precision-timed arcade mini-games, competitive rank systems, daily arenas, asynchronous friend challenges, comprehensive telemetry, cosmetics, and subscription monetization infrastructure.

```
+--------------------------------------------------------------------------+
|                               Next.js 15 App                             |
|  (App Router, Server Components & Dynamic Client Game Containers)       |
+--------------------+---------------------+-------------------------------+
|     UI & Pages     |   Universal Game    |       Progression & Social    |
| - Home Dashboard   |       Engine        | - Player Profiles & Ranks     |
| - Game Discovery   | - Lifecycle Module  | - Global & Game Leaderboards  |
| - 10 Game Pages    | - High-Res Timers   | - Daily Challenge Seed Engine |
| - Profile & Stats  | - Scoring & Combos  | - Friend Challenge URLs       |
| - Shop & Cosmetic  | - Synthesizer Audio | - 30+ Achievements Engine     |
| - Subscriptions    | - Anti-Cheat Guard  | - XP & Level Escalation       |
+--------------------+---------------------+-------------------------------+
|                    Data & Persistence Layer                              |
| - Prisma ORM 7 (Normalized Models: Users, Profiles, Scores, Sessions)     |
| - SQLite (Zero-Config Dev) / PostgreSQL (Production Compatible)          |
| - Guest LocalStorage Sync <--> Authenticated Cloud Profile Bridge        |
| - PostHog Analytics & Telemetry Layer                                    |
+--------------------------------------------------------------------------+
```

---

## 2. Universal Game Engine Design

The engine lives in `@/lib/game-engine/` and standardizes all mini-game interactions through a deterministic, strictly-typed lifecycle.

### 2.1 Lifecycle States
- `IDLE`: Game mounted, waiting for user configuration or initial "Ready" tap.
- `READY`: Instructions shown, countdown preparation.
- `COUNTDOWN`: 3-2-1 visual & synthesized audio countdown.
- `PLAYING`: Game loop active. High-precision `performance.now()` delta tracking.
- `PAUSED`: Pause overlay active, timers frozen, input ignored.
- `ENDED`: Session concluded, score verified, results calculation, XP/achievement triggers dispatched.

### 2.2 Core Modules
1. **Engine Core (`EngineContext`, `useGameSession`)**:
   Manages round counts, time limits, reactive state updates, and FPS-aligned tick loops (`requestAnimationFrame`).
2. **Audio Synthesizer (`WebAudioSynth`)**:
   Zero-dependency procedural sound generator using Web Audio API (`AudioContext`). Generates:
   - Countdown beeps (low tone, high tone)
   - Click/tap haptic audio feedback
   - Success chimes (major arpeggio)
   - Strike/mistake buzzers
   - High score fanfare
   - Background pulse ambient audio
3. **Scoring & Combo Calculator**:
   Calculates base points, speed multipliers, accuracy percentages, combo streaks, and anti-tamper checksums.
4. **Security & Anti-Cheat**:
   - Minimum reaction threshold guard (flags reactions < 100ms as inhuman / bot scripts).
   - Timestamp delta consistency check between client `start_time` and server ingestion.
   - Hash validation on session tokens to prevent replay attacks or direct score injection.

---

## 3. Mini-Games Architecture (10 Playable Games)

1. **Reaction Rush (`reaction-rush`)**:
   Pure reflex test with random 1.5s - 5.0s wait intervals, false start detection, millisecond reaction latency measurement, and human-tier classification (Godlike to Sluggish).
2. **Target Strike (`target-strike`)**:
   30-second reflex target shooter. Dynamic targets spawning across responsive canvas area, size reduction, accuracy calculations, combo multipliers.
3. **Perfect Timing (`perfect-timing`)**:
   Oscillating neon pulse bar. Stop the cursor dead in the center critical zone. 5 rounds of shrinking critical zones and accelerating velocities.
4. **Color Panic (`color-panic`)**:
   Stroop-effect neural challenge. Rapidly select matching font colors vs written words under escalating countdowns. 3 strikes allowed.
5. **Memory Flash (`memory-flash`)**:
   Auditory and visual 4-to-9 tile Simon sequence test. Progressive memory length, sound synthesis, level progression.
6. **Quick Decision (`quick-decision`)**:
   Rapid split-second categorization (direction arrows, parity, symmetry) with misleading distractor visual cues.
7. **Dodge Master (`dodge-master`)**:
   2D arcade survival. Control ship via keyboard (A/D/Arrows) or mobile touch drag to evade descending laser obstacles while collecting neon energy orbs.
8. **Tap Frenzy (`tap-frenzy`)**:
   10-second high-speed CPS (Clicks Per Second) challenge with dynamic rhythm multipliers, real-time speedometer gauge, and fatigue curve analysis.
9. **Flash Grid (`flash-grid`)**:
   Dynamic 4x4 matrix where targets illuminate in rapid sequence. Multi-target simultaneous tracking and speed clicking.
10. **Last Second (`last-second`)**:
   Countdown timer stopping test. Press stop as close to 0.000s without going below 0. Blind mode rounds where timer displays "???" during final 800ms.

---

## 4. Database & Entity Architecture (Prisma)

The database schema encapsulates 16 normalized models:
- `User`: Base identity (guest accounts & registered accounts).
- `PlayerProfile`: Username, avatar, selected cosmetic title, frame, soundpack, level, totalXP.
- `Game`: Metadata for all 10 games, scoring rules, high-score order (DESC vs ASC).
- `GameSession`: Ephemeral session token, verification hash, duration, game mode (practice, ranked, daily, challenge).
- `GameScore`: Immutable record of every score submission with reaction details, accuracy, combo.
- `PlayerStatistics`: Aggregated lifetime analytics: games played, total playtime, best score, average reaction time.
- `Achievement`: 30+ pre-seeded badges across reflex tiers, playtime milestones, streaks, mastery.
- `PlayerAchievement`: Unlocked achievements with timestamp and unlock score.
- `Challenge`: Asynchronous 1v1 friend challenges with share tokens, creator score, and status.
- `ChallengeAttempt`: Competitor challenge attempts with outcome comparison.
- `Tournament`: Scheduled weekly/monthly tournaments with entry fees and prize pools.
- `TournamentEntry`: Player participant records.
- `LeaderboardSnapshot`: Cached leaderboard snapshots (Global, Daily, Weekly, Game-specific).
- `Subscription`: Free vs Pro status, validity, billing period, provider checkout status.
- `CosmeticItem`: Shop catalog (Avatars, Themes, Cursor Effects, Sound Packs, Victory Animations, Frames).
- `PlayerInventory`: Items purchased or unlocked by player.

---

## 5. Security & Verification Strategy

- **Dual-Mode Gameplay**: Instant Guest Mode saves local progress in encrypted browser local storage; one-click registration merges local records into cloud Postgres/Prisma.
- **Server Verification API**: Score submission endpoints (`/api/games/submit-score`) validate:
  - Valid session token generated before game started.
  - Duration matches score range (e.g., Target Strike requires >= 29s duration).
  - Score value within mathematical limits for the game parameters.
  - Rate limiting via sliding window.
- **Secure Challenge URLs**: Crypto-random nano IDs for friend challenge links (`/challenge/ch_9x8a7f1...`).
