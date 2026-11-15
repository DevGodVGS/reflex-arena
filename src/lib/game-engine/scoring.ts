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
