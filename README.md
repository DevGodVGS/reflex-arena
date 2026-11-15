# ⚡ REFLEX ARENA
> **Think Fast. React Faster.**
> The competitive, browser-based arcade gaming platform designed to benchmark twitch reflexes, microsecond precision, working memory, and split-second neural decision-making across a unified gaming ecosystem.

---

## 🎮 Platform Overview

**Reflex Arena** is an independent, production-grade gaming platform engineered as a modular monolith. It brings together ten distinct, fully playable arcade mini-games calibrated against real human cognitive baselines:

1. **Reaction Rush**: Pure sub-millisecond reaction latency test with random delays (1.5s–5.0s) and false start penalty detection.
2. **Target Strike**: 30-second target shooter featuring dynamic target shrinking, streak combo multipliers, and hit accuracy calculations.
3. **Perfect Timing**: High-speed oscillating neon beam precision test across 5 rounds with shrinking critical bullseye strike zones.
4. **Color Panic**: Stroop-effect neural interference test with switching rules (font color vs written text) and 3-strike survival rules.
5. **Memory Flash**: Multi-sensory Simon Says matrix sequence retention with synthesized audio frequencies and increasing sequence lengths.
6. **Quick Decision**: 20-question rapid binary categorization sprint with misleading rotational and visual distractors.
7. **Dodge Master**: 2D arcade survival with keyboard (A/D/Arrows) and mobile touch-drag controls, dodging laser hazards and harvesting energy crystals.
8. **Tap Frenzy**: 10-second motor speed sprint with real-time CPS (Clicks Per Second) speedometer and Hyperdrive Overdrive tempo bonuses.
9. **Flash Grid**: 4x4 matrix of flashing targets with dynamic simultaneous target tracking and accuracy tracking.
10. **Last Second**: High-stakes countdown braking test. Stop the timer as close to 0.000s as you dare; hit zero and bust! Includes blind mode rounds.

---

## 🚀 Key Features

- **Universal Game Engine**: Built on `performance.now()` precision timing, deterministic lifecycle state machine (`IDLE` -> `READY` -> `COUNTDOWN` -> `PLAYING` -> `PAUSED` -> `ENDED`), combo calculators, and zero-asset procedural Web Audio synthesizer.
- **Zero-Friction Guest Mode**: Play instantly as a guest without signing up. Local storage persists levels, coins, personal bests, and achievements.
- **Daily Arena**: Daily synchronized global seed. 1 official ranked attempt per day with UTC midnight countdown and daily standings.
- **Friend Challenges (1v1 Versus)**: Set a score in any discipline, generate a cryptographic challenge URL, and share it on WhatsApp or Discord. Opponents can compete directly without registration.
- **Global & Game Leaderboards**: Verified rankings with anti-cheat filters (flagging sub-90ms reactions), player frames, titles, and country flags.
- **Player Progression & 30 Achievements**: Comprehensive XP curve, level-ups, tier titles (Recruit to Cyber God), and 30 distinct achievement badges.
- **Cosmetics Arsenal**: Customize avatars, glowing holographic frames, procedural sound packs, cursor trails, and gladiator titles.
- **Monetization & Pro Pass**: Tiered subscription architecture (₹99/month, ₹799/annual) for ad-free play, advanced latency regression charts, and exclusive cosmetics.
- **PWA & Mobile-First**: Responsive layout, touch controls, manifest.json, and standalone mobile app support.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion & Visuals**: [Framer Motion](https://www.framer.com/motion/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with safe cross-environment storage middleware
- **Database & ORM**: [Prisma 7](https://www.prisma.io/) with LibSQL / SQLite zero-config driver & PostgreSQL compatibility
- **Audio**: Web Audio API Procedural Synthesizer (Zero asset download latency, offline-ready)
- **Validation & Anti-Cheat**: [Zod](https://zod.dev/), Verification Hashing & minimum human biological latency checks
- **Testing**: [Vitest](https://vitest.dev/) unit & integration test suite

---

## 💻 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/DevGodVGS/reflex-arena.git
cd reflex-arena
npm install
```

### 2. Synchronize & Seed Database
```bash
# Push Prisma schema to local database
npx prisma db push

# Seed 10 games, 30 achievements, and cosmetics
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated Vitest test suite:
```bash
npm test
```

Create a production build:
```bash
npm run build
```

---

## 📄 License
MIT License. Crafted for high-performance browser esports and reflex calibration.
