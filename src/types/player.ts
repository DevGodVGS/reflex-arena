import { GameId, GameResult } from "./game";

export type PlayerTier =
  | "Iron"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Grandmaster"
  | "Cyber Overlord";

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  category: "avatar" | "theme" | "frame" | "soundpack" | "cursor" | "title";
  priceCoins: number;
  isPremiumOnly: boolean;
  previewUrl?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "reflex" | "progression" | "streak" | "games" | "mastery";
  icon: string;
  xpReward: number;
  coinsReward: number;
  condition: {
    type: "games_played" | "score_reach" | "streak_days" | "all_games_played" | "speed_threshold" | "perfect_rounds";
    target: number;
    gameId?: GameId;
  };
}

export interface PlayerAchievement {
  achievementId: string;
  unlockedAt: number;
}

export interface GamePersonalBest {
  gameId: GameId;
  bestScore: number;
  achievedAt: number;
  timesPlayed: number;
  averageScore: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  email?: string;
  isGuest: boolean;
  isPro: boolean;
  avatar: string;
  title: string;
  frame: string;
  soundpack: string;
  cursorEffect: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  coins: number;
  tier: PlayerTier;
  createdAt: number;
  streakDays: number;
  lastDailyChallengeDate?: string;
  totalPlayTimeSeconds: number;
  gamesPlayedTotal: number;
  personalBests: Record<GameId, GamePersonalBest>;
  unlockedAchievements: PlayerAchievement[];
  inventory: string[]; // cosmetic IDs
  recentMatches: GameResult[];
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatar: string;
  frame?: string;
  title?: string;
  isPro: boolean;
  score: number;
  formattedScore: string;
  country?: string;
  achievedAt: number;
}

export interface FriendChallenge {
  id: string;
  gameId: GameId;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorScore: number;
  seed: number;
  createdAt: number;
  expiresAt: number;
  challengerId?: string;
  challengerName?: string;
  challengerScore?: number;
  winnerId?: string;
  status: "pending" | "completed" | "expired";
}

export interface DailyChallengeConfig {
  dateString: string; // YYYY-MM-DD
  gameId: GameId;
  title: string;
  multiplier: number;
  specialRulesDescription: string;
  seed: number;
}
