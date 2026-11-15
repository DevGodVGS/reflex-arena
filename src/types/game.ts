export type GameId =
  | "reaction-rush"
  | "target-strike"
  | "perfect-timing"
  | "color-panic"
  | "memory-flash"
  | "quick-decision"
  | "dodge-master"
  | "tap-frenzy"
  | "flash-grid"
  | "last-second";

export type GameCategory = "reflex" | "precision" | "cognitive" | "speed";

export type GameState =
  | "IDLE"
  | "READY"
  | "COUNTDOWN"
  | "PLAYING"
  | "PAUSED"
  | "ENDED";

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  category: GameCategory;
  description: string;
  instructions: string[];
  tips: string[];
  icon: string; // Lucide icon name
  accentColor: string;
  scoreUnit: string;
  higherIsBetter: boolean;
  benchmarkGood: number;
  benchmarkPro: number;
  benchmarkGodlike: number;
  formatScore: (score: number) => string;
}

export interface RoundResult {
  roundNumber: number;
  timeTakenMs: number;
  score: number;
  isSuccess: boolean;
  notes?: string;
}

export interface GameResult {
  gameId: GameId;
  score: number;
  rawScore: number;
  isNewPersonalBest: boolean;
  accuracyPercentage?: number;
  averageReactionMs?: number;
  fastestReactionMs?: number;
  slowestReactionMs?: number;
  totalDurationMs: number;
  roundsPlayed: number;
  roundDetails?: RoundResult[];
  rankTier: "Recruit" | "Rookie" | "Challenger" | "Elite" | "Master" | "Cyber God";
  xpEarned: number;
  coinsEarned: number;
  timestamp: number;
  sessionId: string;
  isRanked: boolean;
  verificationHash?: string;
}

export interface GameEngineConfig {
  gameId: GameId;
  totalRounds?: number;
  timeLimitSeconds?: number;
  onStateChange?: (state: GameState) => void;
  onScoreUpdate?: (currentScore: number) => void;
  onFinish?: (result: GameResult) => void;
}
