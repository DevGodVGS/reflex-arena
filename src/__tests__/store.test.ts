import { describe, it, expect, beforeEach } from "vitest";
import { usePlayerStore } from "@/lib/store/playerStore";
import { GameResult } from "@/types/game";

describe("Player Progression & Store System", () => {
  beforeEach(() => {
    // Reset store to known state
    usePlayerStore.setState({
      profile: {
        id: "test_gladiator",
        username: "TestHero",
        isGuest: true,
        isPro: false,
        avatar: "avatar_neon_cyber",
        title: "title_recruit",
        frame: "frame_default",
        soundpack: "sound_cyber_classic",
        cursorEffect: "cursor_default",
        level: 1,
        currentXp: 0,
        xpToNextLevel: 500,
        coins: 1000,
        tier: "Bronze",
        createdAt: Date.now(),
        streakDays: 1,
        totalPlayTimeSeconds: 0,
        gamesPlayedTotal: 0,
        personalBests: {} as Record<string, never>,
        unlockedAchievements: [],
        inventory: ["avatar_neon_cyber", "frame_default", "title_recruit"],
        recentMatches: [],
      },
    });
  });

  it("updates personal best and level on recording a winning game", () => {
    const mockResult: GameResult = {
      gameId: "target-strike",
      score: 15000,
      rawScore: 15000,
      isNewPersonalBest: true,
      totalDurationMs: 30000,
      roundsPlayed: 25,
      rankTier: "Elite",
      xpEarned: 600, // Enough to level up past 500!
      coinsEarned: 50,
      timestamp: Date.now(),
      sessionId: "test_sess_1",
      isRanked: true,
    };

    const outcome = usePlayerStore.getState().recordGameResult(mockResult);

    expect(outcome.isNewPb).toBe(true);
    expect(outcome.leveledUp).toBe(true);
    expect(outcome.newLevel).toBe(2);

    const updatedProfile = usePlayerStore.getState().profile;
    expect(updatedProfile.gamesPlayedTotal).toBe(1);
    expect(updatedProfile.totalPlayTimeSeconds).toBe(30);
    expect(updatedProfile.personalBests["target-strike"]?.bestScore).toBe(15000);
  });

  it("unlocks achievements upon meeting conditions", () => {
    const mockResult: GameResult = {
      gameId: "reaction-rush",
      score: 215, // sub 220ms benchmark achievement!
      rawScore: 215,
      isNewPersonalBest: true,
      totalDurationMs: 12000,
      roundsPlayed: 5,
      rankTier: "Elite",
      xpEarned: 220,
      coinsEarned: 50,
      timestamp: Date.now(),
      sessionId: "test_sess_2",
      isRanked: true,
    };

    const outcome = usePlayerStore.getState().recordGameResult(mockResult);
    expect(outcome.unlockedAchievements.length).toBeGreaterThan(0);
    const unlockedIds = outcome.unlockedAchievements.map((a) => a.id);
    expect(unlockedIds).toContain("first_spark"); // 1st game played
    expect(unlockedIds).toContain("sub_300ms"); // sub 300ms reaction
    expect(unlockedIds).toContain("sub_220ms"); // sub 220ms reaction
  });

  it("handles cosmetic purchasing and inventory deduplication", () => {
    const store = usePlayerStore.getState();

    // Buy Phantom Ninja avatar (costs 500 coins)
    const buyResult = store.buyCosmetic("avatar_phantom_ninja");
    expect(buyResult.success).toBe(true);

    const updated = usePlayerStore.getState().profile;
    expect(updated.coins).toBe(500); // 1000 - 500
    expect(updated.inventory).toContain("avatar_phantom_ninja");

    // Attempting to buy again returns error
    const duplicateBuy = usePlayerStore.getState().buyCosmetic("avatar_phantom_ninja");
    expect(duplicateBuy.success).toBe(false);
    expect(duplicateBuy.error).toBe("Item already owned");
  });

  it("equips owned cosmetic items properly", () => {
    const store = usePlayerStore.getState();
    store.buyCosmetic("avatar_phantom_ninja");
    store.equipCosmetic("avatar", "avatar_phantom_ninja");

    expect(usePlayerStore.getState().profile.avatar).toBe("avatar_phantom_ninja");
  });
});
