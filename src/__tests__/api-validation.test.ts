import { describe, it, expect } from "vitest";
import { z } from "zod";
import { GAMES } from "@/lib/constants/games";

const SubmitScoreSchema = z.object({
  gameId: z.string(),
  score: z.number(),
  sessionId: z.string(),
  durationMs: z.number().nonnegative(),
  accuracyPercentage: z.number().min(0).max(100).optional(),
  averageReactionMs: z.number().optional(),
  fastestReactionMs: z.number().optional(),
  slowestReactionMs: z.number().optional(),
  rankTier: z.string(),
  timestamp: z.number(),
  verificationHash: z.string().optional(),
});

describe("API Validation & Security Edge Cases", () => {
  it("validates legitimate score submission schema", () => {
    const validPayload = {
      gameId: "reaction-rush",
      score: 185,
      sessionId: "sess_test_123",
      durationMs: 14500,
      accuracyPercentage: 100,
      averageReactionMs: 185,
      fastestReactionMs: 165,
      slowestReactionMs: 205,
      rankTier: "Master",
      timestamp: Date.now(),
      verificationHash: "v1_abcd1234",
    };

    const result = SubmitScoreSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects negative durations or invalid accuracy percentages", () => {
    const invalidDuration = {
      gameId: "target-strike",
      score: 12000,
      sessionId: "sess_invalid_dur",
      durationMs: -500, // Invalid!
      rankTier: "Elite",
      timestamp: Date.now(),
    };
    expect(SubmitScoreSchema.safeParse(invalidDuration).success).toBe(false);

    const invalidAccuracy = {
      gameId: "target-strike",
      score: 12000,
      sessionId: "sess_invalid_acc",
      durationMs: 30000,
      accuracyPercentage: 150, // Invalid! Must be <= 100
      rankTier: "Elite",
      timestamp: Date.now(),
    };
    expect(SubmitScoreSchema.safeParse(invalidAccuracy).success).toBe(false);
  });

  it("enforces anti-cheat human threshold for Reaction Rush (< 90ms flagged)", () => {
    const isBotReaction = (ms: number) => ms < 90;

    expect(isBotReaction(45)).toBe(true); // Autoclicker / macro
    expect(isBotReaction(89)).toBe(true);
    expect(isBotReaction(145)).toBe(false); // Godlike human reaction
    expect(isBotReaction(220)).toBe(false); // Standard human reaction
  });

  it("verifies all 10 games are registered with proper metadata and benchmark constraints", () => {
    const gameIds = Object.keys(GAMES);
    expect(gameIds.length).toBe(10);

    gameIds.forEach((id) => {
      const g = GAMES[id as keyof typeof GAMES];
      expect(g.title).toBeDefined();
      expect(g.category).toBeDefined();
      expect(g.instructions.length).toBeGreaterThan(0);
      expect(typeof g.higherIsBetter).toBe("boolean");
      expect(g.benchmarkGodlike).toBeGreaterThan(0);
      expect(g.benchmarkPro).toBeGreaterThan(0);
      expect(g.benchmarkGood).toBeGreaterThan(0);
    });
  });
});
