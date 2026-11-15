"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GameId, GameResult, GameState, RoundResult } from "@/types/game";
import { sound } from "@/lib/audio/sound-synth";
import {
  calculateProgressionRewards,
  calculateRankTier,
  generateSessionId,
  generateVerificationHash,
} from "./scoring";

interface UseGameEngineProps {
  gameId: GameId;
  totalRounds?: number;
  timeLimitSeconds?: number;
  onFinish?: (result: GameResult) => void;
}

export function useGameEngine({
  gameId,
  totalRounds = 1,
  timeLimitSeconds,
  onFinish,
}: UseGameEngineProps) {
  const [state, setState] = useState<GameState>("IDLE");
  const [countdown, setCountdown] = useState<number>(3);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [results, setResults] = useState<GameResult | null>(null);

  const sessionIdRef = useRef<string>(generateSessionId());
  const startTimeRef = useRef<number>(0);
  const playStartTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const roundResultsRef = useRef<RoundResult[]>([]);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    setState("COUNTDOWN");
    setCountdown(3);
    sound.play("countdown_tick");

    let count = 3;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        sound.play("countdown_tick");
      } else {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        sound.play("countdown_go");
        setState("PLAYING");
        const now = performance.now();
        playStartTimeRef.current = now;
        totalPausedDurationRef.current = 0;
      }
    }, 850);
  }, []);

  const ready = useCallback(() => {
    setState("READY");
    startCountdown();
  }, [startCountdown]);

  const pause = useCallback(() => {
    if (state !== "PLAYING") return;
    setState("PAUSED");
    pauseTimeRef.current = performance.now();
  }, [state]);

  const resume = useCallback(() => {
    if (state !== "PAUSED") return;
    const pausedDuration = performance.now() - pauseTimeRef.current;
    totalPausedDurationRef.current += pausedDuration;
    setState("PLAYING");
  }, [state]);

  const restart = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    sessionIdRef.current = generateSessionId();
    roundResultsRef.current = [];
    setScore(0);
    setCombo(0);
    setCurrentRound(1);
    setResults(null);
    startCountdown();
  }, [startCountdown]);

  const recordRound = useCallback((round: RoundResult) => {
    roundResultsRef.current.push(round);
    setCurrentRound((prev) => prev + 1);
  }, []);

  const updateScore = useCallback((newScoreOrUpdater: number | ((prev: number) => number)) => {
    setScore((prev) => {
      const updated = typeof newScoreOrUpdater === "function" ? newScoreOrUpdater(prev) : newScoreOrUpdater;
      return updated;
    });
  }, []);

  const updateCombo = useCallback((newCombo: number) => {
    setCombo(newCombo);
    if (newCombo > 1) {
      sound.play("combo_up");
    }
  }, []);

  const endGame = useCallback(
    (customFinalScore?: number, additionalData?: Partial<GameResult>) => {
      if (state === "ENDED") return;
      setState("ENDED");

      const now = performance.now();
      const totalDuration = now - playStartTimeRef.current - totalPausedDurationRef.current;
      const finalScore = customFinalScore !== undefined ? customFinalScore : score;

      const rankTier = calculateRankTier(gameId, finalScore);
      const { xpEarned, coinsEarned } = calculateProgressionRewards(gameId, finalScore, rankTier);

      const rounds = roundResultsRef.current;
      let avgReaction: number | undefined;
      let fastestReaction: number | undefined;
      let slowestReaction: number | undefined;

      if (rounds.length > 0) {
        const validReactionTimes = rounds
          .map((r) => r.timeTakenMs)
          .filter((t) => t > 0);

        if (validReactionTimes.length > 0) {
          avgReaction = validReactionTimes.reduce((a, b) => a + b, 0) / validReactionTimes.length;
          fastestReaction = Math.min(...validReactionTimes);
          slowestReaction = Math.max(...validReactionTimes);
        }
      }

      const timestamp = Date.now();
      const verificationHash = generateVerificationHash(gameId, finalScore, Math.round(totalDuration), timestamp);

      const gameResult: GameResult = {
        gameId,
        score: finalScore,
        rawScore: finalScore,
        isNewPersonalBest: false, // will be evaluated by player store
        totalDurationMs: Math.round(totalDuration),
        roundsPlayed: rounds.length || totalRounds,
        roundDetails: rounds,
        averageReactionMs: avgReaction,
        fastestReactionMs: fastestReaction,
        slowestReactionMs: slowestReaction,
        rankTier,
        xpEarned,
        coinsEarned,
        timestamp,
        sessionId: sessionIdRef.current,
        isRanked: true,
        verificationHash,
        ...additionalData,
      };

      setResults(gameResult);

      if (rankTier === "Cyber God" || rankTier === "Master" || rankTier === "Elite") {
        sound.play("victory");
      } else {
        sound.play("game_over");
      }

      if (onFinish) {
        onFinish(gameResult);
      }
    },
    [state, score, gameId, totalRounds, onFinish]
  );

  return {
    state,
    countdown,
    currentRound,
    totalRounds,
    score,
    combo,
    results,
    ready,
    pause,
    resume,
    restart,
    endGame,
    recordRound,
    updateScore,
    updateCombo,
    sessionId: sessionIdRef.current,
  };
}
