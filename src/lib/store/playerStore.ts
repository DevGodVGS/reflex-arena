"use client";

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { GameId, GameResult } from "@/types/game";
import { PlayerProfile, PlayerTier, Achievement } from "@/types/player";
import { GAMES } from "@/lib/constants/games";
import { ACHIEVEMENTS } from "@/lib/constants/achievements";
import { COSMETIC_ITEMS } from "@/lib/constants/cosmetics";
import { sound, SoundPack } from "@/lib/audio/sound-synth";

// Safe cross-environment storage adapter
const memoryStorage: Record<string, string> = {};
const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.getItem === "function") {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return memoryStorage[name] || null;
      }
    }
    return memoryStorage[name] || null;
  },
  setItem: (name: string, value: string): void => {
    memoryStorage[name] = value;
    if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.setItem === "function") {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // silent fallback
      }
    }
  },
  removeItem: (name: string): void => {
    delete memoryStorage[name];
    if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.removeItem === "function") {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // silent fallback
      }
    }
  },
};

interface SoundSettings {
  isMuted: boolean;
  volume: number;
  soundPack: SoundPack;
}

interface PlayerStore {
  profile: PlayerProfile;
  soundSettings: SoundSettings;
  isInitialized: boolean;

  // Actions
  init: () => void;
  recordGameResult: (result: GameResult) => {
    isNewPb: boolean;
    unlockedAchievements: Achievement[];
    leveledUp: boolean;
    newLevel: number;
  };
  equipCosmetic: (category: "avatar" | "frame" | "title" | "soundpack" | "cursor", itemId: string) => void;
  buyCosmetic: (itemId: string) => { success: boolean; error?: string };
  upgradeToPro: () => void;
  updateUsername: (name: string) => void;
  setSoundMuted: (muted: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setSoundPack: (pack: SoundPack) => void;
  claimDailyReward: () => { coins: number; xp: number };
}

const DEFAULT_PROFILE: PlayerProfile = {
  id: "guest_" + Math.random().toString(36).substring(2, 9),
  username: "GuestGladiator",
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
  coins: 200,
  tier: "Bronze",
  createdAt: Date.now(),
  streakDays: 1,
  totalPlayTimeSeconds: 0,
  gamesPlayedTotal: 0,
  personalBests: {} as PlayerProfile["personalBests"],
  unlockedAchievements: [],
  inventory: [
    "avatar_neon_cyber",
    "frame_default",
    "title_recruit",
    "sound_cyber_classic",
    "cursor_default",
  ],
  recentMatches: [],
};

function calculateTier(level: number): PlayerTier {
  if (level >= 50) return "Cyber Overlord";
  if (level >= 40) return "Grandmaster";
  if (level >= 30) return "Master";
  if (level >= 22) return "Diamond";
  if (level >= 16) return "Platinum";
  if (level >= 10) return "Gold";
  if (level >= 5) return "Silver";
  if (level >= 2) return "Bronze";
  return "Iron";
}

function calculateXpToNext(level: number): number {
  return Math.round(500 * Math.pow(1.18, level - 1));
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      soundSettings: {
        isMuted: false,
        volume: 0.6,
        soundPack: "cyber",
      },
      isInitialized: false,

      init: () => {
        const { soundSettings } = get();
        sound.setMuted(soundSettings.isMuted);
        sound.setVolume(soundSettings.volume);
        sound.setSoundPack(soundSettings.soundPack);
        set({ isInitialized: true });
      },

      setSoundMuted: (muted) => {
        sound.setMuted(muted);
        set((state) => ({
          soundSettings: { ...state.soundSettings, isMuted: muted },
        }));
      },

      setSoundVolume: (volume) => {
        sound.setVolume(volume);
        set((state) => ({
          soundSettings: { ...state.soundSettings, volume },
        }));
      },

      setSoundPack: (pack) => {
        sound.setSoundPack(pack);
        set((state) => ({
          soundSettings: { ...state.soundSettings, soundPack: pack },
        }));
      },

      updateUsername: (name) => {
        const cleaned = name.trim().slice(0, 16);
        if (!cleaned) return;
        set((state) => ({
          profile: { ...state.profile, username: cleaned },
        }));
      },

      upgradeToPro: () => {
        set((state) => ({
          profile: {
            ...state.profile,
            isPro: true,
            coins: state.profile.coins + 1000,
          },
        }));
      },

      buyCosmetic: (itemId) => {
        const { profile } = get();
        const item = COSMETIC_ITEMS.find((c) => c.id === itemId);
        if (!item) return { success: false, error: "Item not found" };

        if (profile.inventory.includes(itemId)) {
          return { success: false, error: "Item already owned" };
        }

        if (item.isPremiumOnly && !profile.isPro) {
          return { success: false, error: "Reflex Pro subscription required" };
        }

        if (profile.coins < item.priceCoins) {
          return { success: false, error: "Insufficient arena coins" };
        }

        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins - item.priceCoins,
            inventory: [...state.profile.inventory, itemId],
          },
        }));

        return { success: true };
      },

      equipCosmetic: (category, itemId) => {
        const { profile } = get();
        if (!profile.inventory.includes(itemId)) return;

        set((state) => {
          const updated = { ...state.profile };
          if (category === "avatar") updated.avatar = itemId;
          if (category === "frame") updated.frame = itemId;
          if (category === "title") updated.title = itemId;
          if (category === "soundpack") updated.soundpack = itemId;
          if (category === "cursor") updated.cursorEffect = itemId;
          return { profile: updated };
        });
      },

      claimDailyReward: () => {
        const rewardCoins = 150;
        const rewardXp = 250;
        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins + rewardCoins,
            currentXp: state.profile.currentXp + rewardXp,
            streakDays: state.profile.streakDays + 1,
            lastDailyChallengeDate: new Date().toISOString().split("T")[0],
          },
        }));
        return { coins: rewardCoins, xp: rewardXp };
      },

      recordGameResult: (result) => {
        const { profile } = get();
        const meta = GAMES[result.gameId];
        let isNewPb = false;

        const currentPb = profile.personalBests[result.gameId];
        if (!currentPb) {
          isNewPb = true;
        } else if (meta.higherIsBetter) {
          if (result.score > currentPb.bestScore) isNewPb = true;
        } else {
          // Lower is better (reaction rush ms)
          if (result.score < currentPb.bestScore) isNewPb = true;
        }

        const bestScore = isNewPb ? result.score : currentPb?.bestScore || result.score;
        const timesPlayed = (currentPb?.timesPlayed || 0) + 1;
        const prevAvg = currentPb?.averageScore || result.score;
        const newAvg = (prevAvg * (timesPlayed - 1) + result.score) / timesPlayed;

        const updatedPb = {
          gameId: result.gameId,
          bestScore,
          achievedAt: isNewPb ? Date.now() : currentPb?.achievedAt || Date.now(),
          timesPlayed,
          averageScore: Math.round(newAvg),
        };

        // XP & Level calculations
        let newXp = profile.currentXp + result.xpEarned;
        let newLevel = profile.level;
        let leveledUp = false;
        let xpReq = calculateXpToNext(newLevel);

        while (newXp >= xpReq) {
          newXp -= xpReq;
          newLevel += 1;
          leveledUp = true;
          xpReq = calculateXpToNext(newLevel);
        }

        const newTier = calculateTier(newLevel);
        const newCoins = profile.coins + result.coinsEarned + (leveledUp ? 150 : 0);

        // Update games played & play time
        const durationSec = Math.round(result.totalDurationMs / 1000);
        const newTotalPlayTime = profile.totalPlayTimeSeconds + durationSec;
        const newGamesTotal = profile.gamesPlayedTotal + 1;

        // Check achievements
        const unlockedNow: Achievement[] = [];
        const existingUnlockedIds = new Set(profile.unlockedAchievements.map((a) => a.achievementId));

        ACHIEVEMENTS.forEach((ach) => {
          if (existingUnlockedIds.has(ach.id)) return;

          let earned = false;
          const { condition } = ach;

          if (condition.type === "games_played" && newGamesTotal >= condition.target) {
            earned = true;
          } else if (condition.type === "all_games_played") {
            const playedGames = new Set(Object.keys(profile.personalBests));
            playedGames.add(result.gameId);
            if (playedGames.size >= 10) earned = true;
          } else if (condition.type === "streak_days" && profile.streakDays >= condition.target) {
            earned = true;
          } else if (condition.gameId === result.gameId) {
            if (condition.type === "score_reach" && result.score >= condition.target) {
              earned = true;
            } else if (condition.type === "speed_threshold" && result.score <= condition.target) {
              earned = true;
            }
          }

          if (earned) {
            unlockedNow.push(ach);
            existingUnlockedIds.add(ach.id);
          }
        });

        // Add achievement rewards
        let achBonusXp = 0;
        let achBonusCoins = 0;
        unlockedNow.forEach((a) => {
          achBonusXp += a.xpReward;
          achBonusCoins += a.coinsReward;
        });

        newXp += achBonusXp;
        while (newXp >= xpReq) {
          newXp -= xpReq;
          newLevel += 1;
          leveledUp = true;
          xpReq = calculateXpToNext(newLevel);
        }

        const newAchievementsList = [
          ...profile.unlockedAchievements,
          ...unlockedNow.map((a) => ({ achievementId: a.id, unlockedAt: Date.now() })),
        ];

        // Prepend match to recent matches (limit to 30)
        const updatedRecent = [
          { ...result, isNewPersonalBest: isNewPb },
          ...profile.recentMatches.slice(0, 29),
        ];

        set((state) => ({
          profile: {
            ...state.profile,
            level: newLevel,
            currentXp: newXp,
            xpToNextLevel: xpReq,
            tier: newTier,
            coins: newCoins + achBonusCoins,
            totalPlayTimeSeconds: newTotalPlayTime,
            gamesPlayedTotal: newGamesTotal,
            personalBests: {
              ...state.profile.personalBests,
              [result.gameId]: updatedPb,
            },
            unlockedAchievements: newAchievementsList,
            recentMatches: updatedRecent,
          },
        }));

        return {
          isNewPb,
          unlockedAchievements: unlockedNow,
          leveledUp,
          newLevel,
        };
      },
    }),
    {
      name: "reflex_arena_player_data_v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        profile: state.profile,
        soundSettings: state.soundSettings,
      }),
    }
  )
);
