import { GameId, GameResult, RoundResult } from "@/types/game";
import { GAMES } from "@/lib/constants/games";

export function calculateRankTier(
  gameId: GameId,
  score: number
): "Recruit" | "Rookie" | "Challenger" | "Elite" | "Master" | "Cyber God" {
  const meta = GAMES[gameId];
  if (!meta) return "Rookie";

  if (meta.higherIsBetter) {
    if (score >= meta.benchmarkGodlike) return "Cyber God";
    if (score >= meta.benchmarkPro) return "Master";
    if (score >= meta.benchmarkGood) return "Elite";
    if (score >= meta.benchmarkGood * 0.75) return "Challenger";
    if (score >= meta.benchmarkGood * 0.5) return "Rookie";
    return "Recruit";
  } else {
    // Lower is better (reaction rush ms)
    if (score <= meta.benchmarkGodlike) return "Cyber God";
    if (score <= meta.benchmarkPro) return "Master";
    if (score <= meta.benchmarkGood) return "Elite";
    if (score <= meta.benchmarkGood * 1.3) return "Challenger";
    if (score <= meta.benchmarkGood * 1.7) return "Rookie";
    return "Recruit";
  }
}

export function calculateProgressionRewards(
  gameId: GameId,
  score: number,
  tier: "Recruit" | "Rookie" | "Challenger" | "Elite" | "Master" | "Cyber God"
): { xpEarned: number; coinsEarned: number } {
  const tierMultiplier = {
    "Recruit": 1.0,
    "Rookie": 1.25,
    "Challenger": 1.6,
    "Elite": 2.2,
    "Master": 3.0,
    "Cyber God": 5.0,
  }[tier];

  const baseXp = 100;
  const baseCoins = 25;

  const xpEarned = Math.round(baseXp * tierMultiplier);
  const coinsEarned = Math.round(baseCoins * tierMultiplier);

  return { xpEarned, coinsEarned };
}

export function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateVerificationHash(
  gameId: GameId,
  score: number,
  durationMs: number,
  timestamp: number
): string {
  const raw = `${gameId}:${score}:${durationMs}:${timestamp}:reflex_arena_salt_2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `v1_${Math.abs(hash).toString(16)}`;
}

export function validateScoreBounds(
  gameId: GameId,
  score: number,
  durationMs: number
): { valid: boolean; reason?: string } {
  if (score < 0) {
    return { valid: false, reason: "Score cannot be negative" };
  }

  switch (gameId) {
    case "reaction-rush":
      if (score < 90) {
        return { valid: false, reason: "Inhuman latency detected (<90ms)" };
      }
      if (score > 10000) {
        return { valid: false, reason: "Reaction time exceeds maximum allowed timeout" };
      }
      break;

    case "tap-frenzy": {
      const maxCps = 25;
      const durationSec = Math.max(1, durationMs / 1000);
      if (score / durationSec > maxCps || score > 250) {
        return { valid: false, reason: "Click rate exceeds human biological capability (>25 CPS)" };
      }
      break;
    }

    case "perfect-timing":
      if (score > 5000) {
        return { valid: false, reason: "Score exceeds maximum achievable perfect timing score (5,000)" };
      }
      break;

    case "quick-decision":
      if (score > 16000) {
        return { valid: false, reason: "Score exceeds maximum achievable quick decision score (16,000)" };
      }
      break;

    case "last-second":
      if (score > 5000) {
        return { valid: false, reason: "Score exceeds maximum achievable countdown brake score (5,000)" };
      }
      break;

    case "target-strike":
      if (score > 60000) {
        return { valid: false, reason: "Score exceeds realistic target strike ceiling (60,000)" };
      }
      break;

    case "color-panic":
      if (score > 50000) {
        return { valid: false, reason: "Score exceeds maximum color panic score" };
      }
      break;

    case "memory-flash":
      if (score > 40000) {
        return { valid: false, reason: "Memory sequence length exceeds realistic bounds" };
      }
      break;

    case "flash-grid":
      if (score > 60000) {
        return { valid: false, reason: "Flash grid score exceeds realistic bounds" };
      }
      break;

    case "dodge-master": {
      const maxPtsPerSec = 500;
      const dodgeDurationSec = Math.max(1, durationMs / 1000);
      if (score > dodgeDurationSec * maxPtsPerSec + 1000) {
        return { valid: false, reason: "Score accumulation exceeds survival rate limits" };
      }
      break;
    }
  }

  return { valid: true };
}
