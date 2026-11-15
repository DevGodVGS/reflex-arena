import { describe, it, expect } from "vitest";
import {
  calculateRankTier,
  calculateProgressionRewards,
  generateVerificationHash,
  generateSessionId,
} from "@/lib/game-engine/scoring";

describe("Universal Game Engine - Scoring & Anti-Tamper", () => {
  it("correctly calculates rank tier for lower-is-better games (Reaction Rush)", () => {
    // Reaction Rush benchmarkGodlike = 160ms, benchmarkPro = 200ms, benchmarkGood = 260ms
    expect(calculateRankTier("reaction-rush", 150)).toBe("Cyber God");
    expect(calculateRankTier("reaction-rush", 190)).toBe("Master");
    expect(calculateRankTier("reaction-rush", 250)).toBe("Elite");
    expect(calculateRankTier("reaction-rush", 310)).toBe("Challenger");
    expect(calculateRankTier("reaction-rush", 400)).toBe("Rookie");
    expect(calculateRankTier("reaction-rush", 550)).toBe("Recruit");
  });

  it("correctly calculates rank tier for higher-is-better games (Target Strike)", () => {
    // Target Strike benchmarkGodlike = 40000, benchmarkPro = 25000, benchmarkGood = 12000
    expect(calculateRankTier("target-strike", 45000)).toBe("Cyber God");
    expect(calculateRankTier("target-strike", 30000)).toBe("Master");
    expect(calculateRankTier("target-strike", 15000)).toBe("Elite");
    expect(calculateRankTier("target-strike", 10000)).toBe("Challenger");
    expect(calculateRankTier("target-strike", 7000)).toBe("Rookie");
    expect(calculateRankTier("target-strike", 2000)).toBe("Recruit");
  });

  it("multiplies XP and Coins according to tier rewards", () => {
    const godRewards = calculateProgressionRewards("reaction-rush", 150, "Cyber God");
    expect(godRewards.xpEarned).toBe(500); // 100 * 5.0
    expect(godRewards.coinsEarned).toBe(125); // 25 * 5.0

    const recruitRewards = calculateProgressionRewards("reaction-rush", 500, "Recruit");
    expect(recruitRewards.xpEarned).toBe(100);
    expect(recruitRewards.coinsEarned).toBe(25);
  });

  it("generates deterministic verification hashes", () => {
    const hash1 = generateVerificationHash("target-strike", 25000, 30000, 1700000000000);
    const hash2 = generateVerificationHash("target-strike", 25000, 30000, 1700000000000);
    const hashDifferent = generateVerificationHash("target-strike", 25001, 30000, 1700000000000);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDifferent);
    expect(hash1.startsWith("v1_")).toBe(true);
  });

  it("generates valid unique session IDs", () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });
});
