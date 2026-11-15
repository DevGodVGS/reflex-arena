"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Clock, AlertOctagon, Sparkles, Award } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

export function LastSecondGame() {
  const meta = GAMES["last-second"];
  const TOTAL_ROUNDS = 5;
  const ROUND_START_TIME = 3.0; // 3.000s countdown

  const engine = useGameEngine({
    gameId: "last-second",
    totalRounds: TOTAL_ROUNDS,
  });

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(ROUND_START_TIME);
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("STOP as close to 0.000s as you dare!");

  const roundStartTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isStoppedRef = useRef<boolean>(false);

  // Rounds 4 and 5 are blind mode under 0.8s
  const isBlindRound = currentRound >= 4;

  const tick = useCallback(() => {
    if (isStoppedRef.current) return;

    const now = performance.now();
    const elapsed = (now - roundStartTimeRef.current) / 1000;
    const remaining = ROUND_START_TIME - elapsed;

    if (remaining <= 0) {
      // BUST! Hit 0 without stopping
      isStoppedRef.current = true;
      setIsStopped(true);
      setTimeRemaining(0);
      sound.play("miss");
      setStatusMessage("BUSTED! Timer hit zero — 0 PTS");
      setRoundScore(0);

      engine.recordRound({
        roundNumber: currentRound,
        timeTakenMs: 3000,
        score: 0,
        isSuccess: false,
      });

      advanceRound();
      return;
    }

    setTimeRemaining(remaining);
    rafRef.current = requestAnimationFrame(tick);
  }, [currentRound, engine]);

  const advanceRound = useCallback(() => {
    if (currentRound >= TOTAL_ROUNDS) {
      setTimeout(() => {
        engine.endGame();
      }, 1200);
    } else {
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        setIsStopped(false);
        isStoppedRef.current = false;
        setTimeRemaining(ROUND_START_TIME);
        setRoundScore(null);
        setStatusMessage("STOP as close to 0.000s as you dare!");
        roundStartTimeRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      }, 1600);
    }
  }, [currentRound, engine, tick]);

  useEffect(() => {
    if (engine.state === "PLAYING" && !isStopped) {
      isStoppedRef.current = false;
      roundStartTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [engine.state, tick]);

  const handleStop = useCallback(() => {
    if (engine.state !== "PLAYING" || isStoppedRef.current) return;

    isStoppedRef.current = true;
    setIsStopped(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const now = performance.now();
    const elapsed = (now - roundStartTimeRef.current) / 1000;
    const stoppedAt = Math.max(0, ROUND_START_TIME - elapsed);
    setTimeRemaining(stoppedAt);

    let earned = 0;
    if (stoppedAt > 0) {
      // Reward stopping close to 0: e.g. 0.05s = 1000 - (50 * 1.5) = 925 pts
      const diffMs = stoppedAt * 1000;
      earned = Math.max(0, Math.round(1000 - diffMs * 1.4));

      if (stoppedAt < 0.1) {
        sound.play("bullseye");
        setStatusMessage(`INSANE NERVES! Stopped at ${(stoppedAt * 1000).toFixed(0)}ms! +${earned} PTS`);
      } else {
        sound.play("hit");
        setStatusMessage(`STOPPED AT ${(stoppedAt * 1000).toFixed(0)}ms! +${earned} PTS`);
      }
    }

    setRoundScore(earned);
    engine.updateScore((prev) => prev + earned);
    engine.recordRound({
      roundNumber: currentRound,
      timeTakenMs: Math.round(stoppedAt * 1000),
      score: earned,
      isSuccess: earned > 0,
    });

    advanceRound();
  }, [engine, currentRound, advanceRound]);

  // Spacebar support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleStop();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStop]);

  const handleRestart = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCurrentRound(1);
    setIsStopped(false);
    isStoppedRef.current = false;
    setTimeRemaining(ROUND_START_TIME);
    setRoundScore(null);
    setStatusMessage("STOP as close to 0.000s as you dare!");
    engine.restart();
  };

  const isObscured = isBlindRound && !isStopped && timeRemaining <= 0.8 && timeRemaining > 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={engine.score}
        currentRound={currentRound}
        totalRounds={TOTAL_ROUNDS}
        combo={engine.combo}
        onPause={engine.pause}
        onResume={engine.resume}
        onRestart={handleRestart}
      />

      <div
        onClick={handleStop}
        className="w-full h-[520px] bg-[#0A0E1A] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col items-center justify-center p-6 select-none cursor-pointer"
      >
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.2)]">
              <Clock className="w-8 h-8 text-[#00E5FF]" />
            </div>

            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
            </div>

            <div className="bg-[#080B14] p-4 rounded-xl border border-[#1E293B] text-left text-xs text-slate-300 max-w-md space-y-1.5">
              <span className="font-bold text-[#00E5FF] uppercase block font-mono">
                Instructions:
              </span>
              {meta.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#00E5FF] font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <button
              onClick={engine.ready}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Start Chrono Test
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full max-w-md flex flex-col items-center gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase font-mono text-slate-400">
                Round {currentRound} of {TOTAL_ROUNDS} {isBlindRound && "• BLIND MODE"}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                {statusMessage}
              </h3>
            </div>

            {/* Huge Digital Chronometer Display */}
            <div className="p-8 rounded-3xl bg-[#111827] border-2 border-[#1E293B] shadow-[0_0_40px_rgba(0,0,0,0.6)] flex items-center justify-center min-w-[280px]">
              <span
                className={cn(
                  "text-6xl sm:text-7xl font-mono font-black tracking-wider text-glow-cyan",
                  isStopped
                    ? roundScore && roundScore > 0
                      ? "text-emerald-400"
                      : "text-rose-500"
                    : isObscured
                    ? "text-amber-400 animate-pulse"
                    : "text-[#00E5FF]"
                )}
              >
                {isObscured ? "??.???s" : `${timeRemaining.toFixed(3)}s`}
              </span>
            </div>

            {/* Big Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStop();
              }}
              disabled={isStopped}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-base uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50 active:scale-95 transition-all"
            >
              {isStopped ? "ROUND RECORDED" : "STOP TIMER NOW (SPACE / TAP)"}
            </button>
          </div>
        )}

        {engine.state === "ENDED" && engine.results && (
          <ResultsModal meta={meta} result={engine.results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
