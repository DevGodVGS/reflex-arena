import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildScorePayload,
  submitScore,
  queuePendingScore,
  getPendingScores,
  dequeuePendingScore,
  flushPendingScores,
  clearScoreStorageForTesting,
} from "@/lib/services/scoreSubmission";
import { GameResult } from "@/types/game";

describe("Frontend Score Submission & Persistence Service", () => {
  beforeEach(() => {
    clearScoreStorageForTesting();
    vi.restoreAllMocks();
  });

  const mockGameResult: GameResult = {
    gameId: "target-strike",
    score: 24500,
    rawScore: 24500,
    isNewPersonalBest: true,
    totalDurationMs: 30000,
    roundsPlayed: 1,
    accuracyPercentage: 94,
    rankTier: "Master",
    xpEarned: 120,
    coinsEarned: 50,
    timestamp: 1700000000000,
    sessionId: "sess_unit_test_123",
    isRanked: true,
    verificationHash: "v1_mockhash123",
  };

  const mockProfile = {
    id: "usr_gladiator_99",
    username: "NeonBlade",
  };

  it("builds a complete score submission payload adhering to API schema", () => {
    const payload = buildScorePayload(mockGameResult, mockProfile);

    expect(payload.gameId).toBe("target-strike");
    expect(payload.score).toBe(24500);
    expect(payload.sessionId).toBe("sess_unit_test_123");
    expect(payload.durationMs).toBe(30000);
    expect(payload.accuracyPercentage).toBe(94);
    expect(payload.rankTier).toBe("Master");
    expect(payload.timestamp).toBe(1700000000000);
    expect(payload.verificationHash).toBe("v1_mockhash123");
    expect(payload.userId).toBe("usr_gladiator_99");
    expect(payload.username).toBe("NeonBlade");
  });

  it("enforces positive minimum duration and auto-generates verification hash when missing", () => {
    const rawResult: GameResult = {
      ...mockGameResult,
      totalDurationMs: 0,
      verificationHash: undefined,
      sessionId: undefined as unknown as string,
    };

    const payload = buildScorePayload(rawResult);
    expect(payload.durationMs).toBeGreaterThanOrEqual(1);
    expect(payload.verificationHash).toMatch(/^v1_[0-9a-f]+$/);
    expect(payload.sessionId).toMatch(/^sess_/);
  });

  it("successfully dispatches score submission to /api/games/submit-score", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        verified: true,
        sessionId: "sess_server_persisted_456",
        score: 24500,
      }),
    });

    const payload = buildScorePayload(mockGameResult, mockProfile);
    const result = await submitScore(payload, mockFetch as unknown as typeof fetch);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/games/submit-score",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.sessionId).toBe("sess_server_persisted_456");
  });

  it("handles offline network failure gracefully by queueing score into localStorage", async () => {
    const networkErrorFetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    const payload = buildScorePayload(mockGameResult, mockProfile);
    const result = await submitScore(payload, networkErrorFetch as unknown as typeof fetch);

    expect(result.success).toBe(false);
    expect(result.queued).toBe(true);

    const queued = getPendingScores();
    expect(queued).toHaveLength(1);
    expect(queued[0].sessionId).toBe("sess_unit_test_123");
    expect(queued[0].score).toBe(24500);
  });

  it("manages offline queue: queue, retrieve, dequeue, and flush successfully", async () => {
    const payload1 = buildScorePayload({
      ...mockGameResult,
      sessionId: "sess_q1",
      score: 15000,
    });
    const payload2 = buildScorePayload({
      ...mockGameResult,
      sessionId: "sess_q2",
      score: 18000,
    });

    queuePendingScore(payload1);
    queuePendingScore(payload2);

    expect(getPendingScores()).toHaveLength(2);

    dequeuePendingScore("sess_q1");
    const remaining = getPendingScores();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].sessionId).toBe("sess_q2");

    // Flush remaining
    const flushFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const flushedCount = await flushPendingScores(flushFetch as unknown as typeof fetch);
    expect(flushedCount).toBe(1);
    expect(getPendingScores()).toHaveLength(0);
  });

  it("returns validation error message on 4xx rejection without throwing", async () => {
    const mockRejectedFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: "Anti-cheat verification failed: invalid signature hash" }),
    });

    const payload = buildScorePayload(mockGameResult, mockProfile);
    const result = await submitScore(payload, mockRejectedFetch as unknown as typeof fetch);

    expect(result.success).toBe(false);
    expect(result.queued).toBeFalsy();
    expect(result.error).toContain("Anti-cheat verification failed");
  });
});
