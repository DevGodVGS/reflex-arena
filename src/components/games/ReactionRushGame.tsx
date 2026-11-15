"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Zap, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

type Step = "WAITING_FOR_START" | "WAITING_FOR_GREEN" | "READY_TO_CLICK" | "ROUND_DONE";

export function ReactionRushGame() {
  const meta = GAMES["reaction-rush"];
  const TOTAL_ROUNDS = 5;

  const engine = useGameEngine({
    gameId: "reaction-rush",
    totalRounds: TOTAL_ROUNDS,
  });

  const [step, setStep] = useState<Step>("WAITING_FOR_START");
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState<number>(0);
  const [lastReaction, setLastReaction] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Click anywhere to start");

  const greenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const greenTimestampRef = useRef<number>(0);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (greenTimeoutRef.current) clearTimeout(greenTimeoutRef.current);
    };
  }, []);

  const startNextRound = useCallback(() => {
    setStep("WAITING_FOR_GREEN");
    setStatusMessage("WAIT FOR GREEN...");
    setLastReaction(null);

    // Random interval between 1500ms and 5000ms
    const randomDelay = Math.floor(Math.random() * 3500) + 1500;

    if (greenTimeoutRef.current) clearTimeout(greenTimeoutRef.current);
    greenTimeoutRef.current = setTimeout(() => {
      greenTimestampRef.current = performance.now();
      setStep("READY_TO_CLICK");
      setStatusMessage("CLICK / TAP NOW!");
      sound.play("hit");
    }, randomDelay);
  }, []);

  // When engine enters PLAYING state from countdown
  useEffect(() => {
    if (engine.state === "PLAYING" && step === "WAITING_FOR_START") {
      startNextRound();
    }
  }, [engine.state, step, startNextRound]);

  const handleClickArea = () => {
    if (engine.state !== "PLAYING") return;

    if (step === "WAITING_FOR_GREEN") {
      // False start!
      if (greenTimeoutRef.current) clearTimeout(greenTimeoutRef.current);
      sound.play("miss");
      setFalseStarts((prev) => prev + 1);
      setStatusMessage("TOO EARLY! False start penalty. Resetting round...");
      setStep("WAITING_FOR_START");

      setTimeout(() => {
        startNextRound();
      }, 1200);
      return;
    }

    if (step === "READY_TO_CLICK") {
      const clickTime = performance.now();
      const reaction = Math.round(clickTime - greenTimestampRef.current);
      sound.play("tap");

      const updated = [...reactionTimes, reaction];
      setReactionTimes(updated);
      setLastReaction(reaction);
      setStep("ROUND_DONE");

      engine.recordRound({
        roundNumber: currentRound,
        timeTakenMs: reaction,
        score: reaction,
        isSuccess: true,
      });

      if (currentRound >= TOTAL_ROUNDS) {
        // Game complete! Calculate overall average
        const avg = Math.round(updated.reduce((a, b) => a + b, 0) / updated.length);
        const fastest = Math.min(...updated);
        const slowest = Math.max(...updated);

        setTimeout(() => {
          engine.endGame(avg, {
            averageReactionMs: avg,
            fastestReactionMs: fastest,
            slowestReactionMs: slowest,
            roundsPlayed: TOTAL_ROUNDS,
          });
        }, 800);
      } else {
        setStatusMessage(`${reaction} ms! Next round in 1.5s...`);
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
          startNextRound();
        }, 1500);
      }
    }
  };

  const handleRestart = () => {
    if (greenTimeoutRef.current) clearTimeout(greenTimeoutRef.current);
    setCurrentRound(1);
    setReactionTimes([]);
    setFalseStarts(0);
    setLastReaction(null);
    setStep("WAITING_FOR_START");
    engine.restart();
  };

  const currentAverage =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={currentAverage}
        currentRound={currentRound}
        totalRounds={TOTAL_ROUNDS}
        onPause={engine.pause}
        onResume={engine.resume}
        onRestart={handleRestart}
      />

      {/* Main Game Screen */}
      <div className="w-full h-[520px] bg-[#111827] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col">
        {/* Countdown Overlay */}
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {/* Ready / Instructions Screen */}
        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.2)]">
              <Zap className="w-8 h-8 text-[#00E5FF]" />
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
              Start Reaction Test
            </button>
          </div>
        )}

        {/* Active Game Interaction Surface */}
        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div
            onClick={handleClickArea}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-150 p-6 relative",
              step === "WAITING_FOR_GREEN" && "bg-rose-950/70 border-4 border-rose-600/60",
              step === "READY_TO_CLICK" && "bg-emerald-600 text-slate-900 border-4 border-emerald-400 shadow-[inset_0_0_50px_rgba(255,255,255,0.4)]",
              step === "ROUND_DONE" && "bg-[#0D1322] border-4 border-[#00E5FF]/40",
              step === "WAITING_FOR_START" && "bg-slate-900"
            )}
          >
            {/* Top Indicator */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="px-2.5 py-1 rounded bg-[#080B14]/80 border border-[#1E293B]">
                Round: {currentRound} / {TOTAL_ROUNDS}
              </span>
              {falseStarts > 0 && (
                <span className="px-2.5 py-1 rounded bg-rose-900/60 border border-rose-700 text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  False Starts: {falseStarts}
                </span>
              )}
            </div>

            {/* Central Cue */}
            <div className="flex flex-col items-center text-center gap-3">
              {step === "WAITING_FOR_GREEN" && (
                <div className="w-20 h-20 rounded-full bg-rose-600/30 border border-rose-500 flex items-center justify-center animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.8)]" />
                </div>
              )}

              {step === "READY_TO_CLICK" && (
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.9)] animate-ping">
                  <Zap className="w-12 h-12 text-emerald-600 fill-current" />
                </div>
              )}

              {step === "ROUND_DONE" && lastReaction && (
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black font-mono text-[#00E5FF] text-glow-cyan">
                    {lastReaction} ms
                  </span>
                  <span className="text-xs uppercase font-mono text-slate-400 mt-2">
                    Round {currentRound} Latency
                  </span>
                </div>
              )}

              <h3
                className={cn(
                  "text-2xl sm:text-3xl font-black tracking-tight",
                  step === "READY_TO_CLICK" ? "text-[#080B14]" : "text-white"
                )}
              >
                {statusMessage}
              </h3>
            </div>

            {/* Bottom Round Latencies Chips */}
            <div className="absolute bottom-4 flex items-center gap-2">
              {Array.from({ length: TOTAL_ROUNDS }).map((_, idx) => {
                const recorded = reactionTimes[idx];
                return (
                  <div
                    key={idx}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-mono border",
                      recorded
                        ? "bg-[#00E5FF]/20 border-[#00E5FF]/60 text-[#00E5FF]"
                        : idx + 1 === currentRound
                        ? "bg-slate-800 border-slate-600 text-white animate-pulse"
                        : "bg-slate-900/60 border-slate-800 text-slate-600"
                    )}
                  >
                    R{idx + 1}: {recorded ? `${recorded}ms` : "—"}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Modal */}
        {engine.state === "ENDED" && engine.results && (
          <ResultsModal meta={meta} result={engine.results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
