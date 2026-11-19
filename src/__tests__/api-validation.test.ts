import { describe, it, expect } from "vitest";
import { z } from "zod";
import { GAMES } from "@/lib/constants/games";
import { generateVerificationHash, validateScoreBounds } from "@/lib/game-engine/scoring";

const SubmitScoreSchema = z.object({
  gameId: z.string(),
  score: z.number(),
  sessionId: z.string(),
  durationMs: z.number().positive("Duration must be positive"),
  accuracyPercentage: z.number().min(0).max(100).optional(),
  averageReactionMs: z.number().optional(),
  fastestReactionMs: z.number().optional(),
  slowestReactionMs: z.number().optional(),
  rankTier: z.string(),
  timestamp: z.number(),
  verificationHash: z.string().min(1, "Verification hash is required"),
});

describe("API Validation & Security Edge Cases", () => {
  it("validates legitimate score submission schema with required hash", () => {
    const timestamp = Date.now();
    const hash = generateVerificationHash("reaction-rush", 185, 14500, timestamp);
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
      timestamp,
      verificationHash: hash,
    };

    const result = SubmitScoreSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects missing or empty verification hash", () => {
    const payloadWithoutHash = {
      gameId: "reaction-rush",
      score: 185,
      sessionId: "sess_test_123",
      durationMs: 14500,
      rankTier: "Master",
      timestamp: Date.now(),
    };
    expect(SubmitScoreSchema.safeParse(payloadWithoutHash).success).toBe(false);

    const payloadWithEmptyHash = {
      ...payloadWithoutHash,
      verificationHash: "",
    };
    expect(SubmitScoreSchema.safeParse(payloadWithEmptyHash).success).toBe(false);
  });

  it("rejects non-positive durations or invalid accuracy percentages", () => {
    const invalidDuration = {
      gameId: "target-strike",
      score: 12000,
      sessionId: "sess_invalid_dur",
      durationMs: -500,
      rankTier: "Elite",
      timestamp: Date.now(),
      verificationHash: "v1_test",
    };
    expect(SubmitScoreSchema.safeParse(invalidDuration).success).toBe(false);

    const zeroDuration = {
      ...invalidDuration,
      durationMs: 0,
    };
    expect(SubmitScoreSchema.safeParse(zeroDuration).success).toBe(false);

    const invalidAccuracy = {
      gameId: "target-strike",
      score: 12000,
      sessionId: "sess_invalid_acc",
      durationMs: 30000,
      accuracyPercentage: 150,
      rankTier: "Elite",
      timestamp: Date.now(),
      verificationHash: "v1_test",
    };
    expect(SubmitScoreSchema.safeParse(invalidAccuracy).success).toBe(false);
  });

  it("detects cryptographic verification hash tampering", () => {
    const timestamp = Date.now();
    const legitimateHash = generateVerificationHash("target-strike", 25000, 30000, timestamp);

    // Score tampered
    const tamperedScoreHash = generateVerificationHash("target-strike", 99999, 30000, timestamp);
    expect(legitimateHash).not.toBe(tamperedScoreHash);

    // Duration tampered
    const tamperedDurationHash = generateVerificationHash("target-strike", 25000, 5000, timestamp);
    expect(legitimateHash).not.toBe(tamperedDurationHash);

    // Timestamp tampered
    const tamperedTimeHash = generateVerificationHash("target-strike", 25000, 30000, timestamp - 10000);
    expect(legitimateHash).not.toBe(tamperedTimeHash);
  });

  it("enforces multi-game biological sanity bounds via validateScoreBounds", () => {
    // Reaction rush: < 90ms is bot/inhuman
    expect(validateScoreBounds("reaction-rush", 45, 10000).valid).toBe(false);
    expect(validateScoreBounds("reaction-rush", 89, 10000).valid).toBe(false);
    expect(validateScoreBounds("reaction-rush", 150, 10000).valid).toBe(true);

    // Tap frenzy: max 25 CPS ceiling
    expect(validateScoreBounds("tap-frenzy", 300, 10000).valid).toBe(false); // 30 CPS!
    expect(validateScoreBounds("tap-frenzy", 120, 10000).valid).toBe(true); // 12 CPS

    // Perfect timing: max 5000 pts
    expect(validateScoreBounds("perfect-timing", 5001, 15000).valid).toBe(false);
    expect(validateScoreBounds("perfect-timing", 4800, 15000).valid).toBe(true);

    // Quick decision: max 16000 pts
    expect(validateScoreBounds("quick-decision", 18000, 20000).valid).toBe(false);
    expect(validateScoreBounds("quick-decision", 14500, 20000).valid).toBe(true);

    // Last second: max 5000 pts
    expect(validateScoreBounds("last-second", 6000, 12000).valid).toBe(false);
    expect(validateScoreBounds("last-second", 4500, 12000).valid).toBe(true);

    // Target strike: ceiling 60000 pts
    expect(validateScoreBounds("target-strike", 99999, 30000).valid).toBe(false);
    expect(validateScoreBounds("target-strike", 35000, 30000).valid).toBe(true);

    // Color panic: ceiling 50000 pts
    expect(validateScoreBounds("color-panic", 55000, 30000).valid).toBe(false);
    expect(validateScoreBounds("color-panic", 35000, 30000).valid).toBe(true);

    // Memory flash: ceiling 40000 pts
    expect(validateScoreBounds("memory-flash", 45000, 45000).valid).toBe(false);
    expect(validateScoreBounds("memory-flash", 25000, 45000).valid).toBe(true);

    // Flash grid: ceiling 60000 pts
    expect(validateScoreBounds("flash-grid", 70000, 30000).valid).toBe(false);
    expect(validateScoreBounds("flash-grid", 40000, 30000).valid).toBe(true);

    // Dodge master: points accumulation ceiling (maxPtsPerSec * duration + 1000)
    expect(validateScoreBounds("dodge-master", 30000, 10000).valid).toBe(false); // 30k in 10s is impossible
    expect(validateScoreBounds("dodge-master", 5500, 10000).valid).toBe(true); // 5.5k in 10s is achievable

    // Negative score
    expect(validateScoreBounds("target-strike", -10, 30000).valid).toBe(false);
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
