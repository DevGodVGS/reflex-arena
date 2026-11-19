import { GameResult } from "@/types/game";
import { generateVerificationHash } from "@/lib/game-engine/scoring";

export interface ScoreSubmissionPayload {
  gameId: string;
  score: number;
  sessionId: string;
  durationMs: number;
  accuracyPercentage?: number;
  averageReactionMs?: number;
  fastestReactionMs?: number;
  slowestReactionMs?: number;
  rankTier: string;
  timestamp: number;
  verificationHash: string;
  userId?: string;
  username?: string;
}

export interface ScoreSubmissionResult {
  success: boolean;
  verified?: boolean;
  sessionId?: string;
  queued?: boolean;
  error?: string;
}

const PENDING_SCORES_STORAGE_KEY = "reflex_pending_scores_v1";

let memoryFallback: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.getItem === "function") {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallback[key] || null;
    }
  }
  return memoryFallback[key] || null;
}

function setStorageItem(key: string, value: string): void {
  memoryFallback[key] = value;
  if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.setItem === "function") {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // silent fallback
    }
  }
}

export function clearScoreStorageForTesting(): void {
  memoryFallback = {};
  if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.removeItem === "function") {
    try {
      window.localStorage.removeItem(PENDING_SCORES_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Builds a validated score payload ready for /api/games/submit-score
 */
export function buildScorePayload(
  result: GameResult,
  profile?: { id?: string; username?: string }
): ScoreSubmissionPayload {
  const durationMs = Math.max(1, Math.round(result.totalDurationMs || 1000));
  const timestamp = result.timestamp || Date.now();
  const verificationHash =
    result.verificationHash ||
    generateVerificationHash(result.gameId, result.score, durationMs, timestamp);

  const payload: ScoreSubmissionPayload = {
    gameId: result.gameId,
    score: result.score,
    sessionId: result.sessionId || `sess_${Math.random().toString(36).substring(2, 10)}`,
    durationMs,
    rankTier: result.rankTier || "Rookie",
    timestamp,
    verificationHash,
  };

  if (result.accuracyPercentage !== undefined) {
    payload.accuracyPercentage = Math.round(result.accuracyPercentage);
  }
  if (result.averageReactionMs !== undefined) {
    payload.averageReactionMs = Math.round(result.averageReactionMs);
  }
  if (result.fastestReactionMs !== undefined) {
    payload.fastestReactionMs = Math.round(result.fastestReactionMs);
  }
  if (result.slowestReactionMs !== undefined) {
    payload.slowestReactionMs = Math.round(result.slowestReactionMs);
  }
  if (profile?.id) {
    payload.userId = profile.id;
  }
  if (profile?.username) {
    payload.username = profile.username;
  }

  return payload;
}

/**
 * Persists failed/offline submissions to local storage for subsequent retry
 */
export function queuePendingScore(payload: ScoreSubmissionPayload): void {
  try {
    const raw = getStorageItem(PENDING_SCORES_STORAGE_KEY);
    const list: ScoreSubmissionPayload[] = raw ? JSON.parse(raw) : [];
    // Avoid duplicate queueing
    if (!list.some((item) => item.sessionId === payload.sessionId)) {
      list.push(payload);
      setStorageItem(PENDING_SCORES_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.error("Failed to queue pending score to storage:", err);
  }
}

/**
 * Retrieves all currently queued pending submissions
 */
export function getPendingScores(): ScoreSubmissionPayload[] {
  try {
    const raw = getStorageItem(PENDING_SCORES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Removes a specific score payload from the pending queue after successful sync
 */
export function dequeuePendingScore(sessionId: string): void {
  try {
    const raw = getStorageItem(PENDING_SCORES_STORAGE_KEY);
    if (!raw) return;
    const list: ScoreSubmissionPayload[] = JSON.parse(raw);
    const updated = list.filter((item) => item.sessionId !== sessionId);
    setStorageItem(PENDING_SCORES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to dequeue score:", err);
  }
}

/**
 * Dispatches score submission to /api/games/submit-score with offline resilience
 */
export async function submitScore(
  payload: ScoreSubmissionPayload,
  fetchFn: typeof fetch = fetch
): Promise<ScoreSubmissionResult> {
  // If navigator reports offline, immediately queue without network attempt
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    queuePendingScore(payload);
    return {
      success: false,
      queued: true,
      error: "Device is currently offline. Score queued for synchronization.",
    };
  }

  try {
    const response = await fetchFn("/api/games/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // 5xx errors or server down -> queue for retry
      if (response.status >= 500) {
        queuePendingScore(payload);
        return {
          success: false,
          queued: true,
          error: data.error || `Server error (${response.status}). Queued for retry.`,
        };
      }
      return {
        success: false,
        error: data.error || `Submission failed with status ${response.status}`,
      };
    }

    // On success, dequeue if it was previously queued
    dequeuePendingScore(payload.sessionId);

    // Opportunistically flush any other pending scores
    flushPendingScores(fetchFn).catch(() => {});

    return {
      success: true,
      verified: data.verified,
      sessionId: data.sessionId,
    };
  } catch (networkError: unknown) {
    // Network failure (offline, DNS, timeout) -> queue
    queuePendingScore(payload);
    return {
      success: false,
      queued: true,
      error: (networkError as Error)?.message || "Network error. Score queued for retry.",
    };
  }
}

/**
 * Attempts to flush and submit all pending scores stored in localStorage
 */
export async function flushPendingScores(fetchFn: typeof fetch = fetch): Promise<number> {
  const pending = getPendingScores();
  if (pending.length === 0) return 0;

  let flushedCount = 0;
  for (const item of pending) {
    try {
      const res = await fetchFn("/api/games/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        dequeuePendingScore(item.sessionId);
        flushedCount++;
      }
    } catch {
      // Still offline or server unreachable, stop flushing for now
      break;
    }
  }
  return flushedCount;
}
