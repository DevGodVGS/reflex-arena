"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Crosshair, Award, RotateCcw } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

export function PerfectTimingGame() {
  const meta = GAMES["perfect-timing"];
  const TOTAL_ROUNDS = 5;

  const engine = useGameEngine({
    gameId: "perfect-timing",
    totalRounds: TOTAL_ROUNDS,
  });

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [beamPos, setBeamPos] = useState<number>(0); // 0 to 100%
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Press SPACE or TAP to STOP");

  const rafRef = useRef<number | null>(null);
  const beamPosRef = useRef<number>(0);
  const directionRef = useRef<number>(1); // 1 = right, -1 = left

  // Progressive parameters based on currentRound
  const targetZoneWidth = Math.max(10, 26 - (currentRound - 1) * 3.5); // % of bar width
  const targetZoneStart = 50 - targetZoneWidth / 2;
  const targetZoneEnd = 50 + targetZoneWidth / 2;
  const beamSpeed = 0.8 + (currentRound - 1) * 0.35; // speed step per frame

  const animationLoop = useCallback(() => {
    beamPosRef.current += directionRef.current * beamSpeed;

    if (beamPosRef.current >= 100) {
      beamPosRef.current = 100;
      directionRef.current = -1;
    } else if (beamPosRef.current <= 0) {
      beamPosRef.current = 0;
      directionRef.current = 1;
    }

    setBeamPos(beamPosRef.current);
    rafRef.current = requestAnimationFrame(animationLoop);
  }, [beamSpeed]);

  useEffect(() => {
    if (engine.state === "PLAYING" && !isStopped) {
      directionRef.current = 1;
      beamPosRef.current = 0;
      rafRef.current = requestAnimationFrame(animationLoop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [engine.state, isStopped, animationLoop]);

  const handleStop = useCallback(() => {
    if (engine.state !== "PLAYING" || isStopped) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsStopped(true);

    const stoppedAt = beamPosRef.current;
    const center = 50;
    const distanceFromCenter = Math.abs(stoppedAt - center);

    let earned = 0;
    let isBullseye = false;

    if (stoppedAt >= targetZoneStart && stoppedAt <= targetZoneEnd) {
      // Inside zone!
      const normalizedOffset = distanceFromCenter / (targetZoneWidth / 2); // 0 to 1
      earned = Math.round(1000 - normalizedOffset * 400);

      if (normalizedOffset < 0.15) {
        isBullseye = true;
        earned = 1000;
        sound.play("bullseye");
        setStatusMessage("PERFECT BULLSEYE! 1,000 PTS!");
      } else {
        sound.play("hit");
        setStatusMessage(`GREAT HIT! +${earned} PTS`);
      }
    } else {
      // Missed critical zone
      sound.play("miss");
      setStatusMessage("MISSED TARGET ZONE! 0 PTS");
    }

    setRoundScore(earned);
    engine.updateScore((prev) => prev + earned);
    engine.recordRound({
      roundNumber: currentRound,
      timeTakenMs: Math.round(distanceFromCenter * 10),
      score: earned,
      isSuccess: earned > 0,
    });

    if (currentRound >= TOTAL_ROUNDS) {
      setTimeout(() => {
        engine.endGame();
      }, 1200);
    } else {
      setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        setIsStopped(false);
        setRoundScore(null);
        setStatusMessage("Press SPACE or TAP to STOP");
      }, 1500);
    }
  }, [engine, isStopped, currentRound, targetZoneStart, targetZoneEnd, targetZoneWidth]);

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
    setRoundScore(null);
    setStatusMessage("Press SPACE or TAP to STOP");
    engine.restart();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={engine.score}
        currentRound={currentRound}
        totalRounds={TOTAL_ROUNDS}
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
              <Crosshair className="w-8 h-8 text-[#00E5FF]" />
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
              Start 5-Round Session
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full max-w-xl flex flex-col items-center gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase font-mono text-slate-400">
                Round {currentRound} of {TOTAL_ROUNDS}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">{statusMessage}</h3>
            </div>

            {/* Oscillation Bar Container */}
            <div className="w-full h-16 bg-[#111827] rounded-2xl border-2 border-[#1E293B] relative overflow-hidden flex items-center shadow-inner">
              {/* Target Critical Zone */}
              <div
                style={{
                  left: `${targetZoneStart}%`,
                  width: `${targetZoneWidth}%`,
                }}
                className="absolute top-0 bottom-0 bg-[#00E5FF]/20 border-x-2 border-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center justify-center"
              >
                {/* Center Hairline */}
                <div className="w-0.5 h-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,1)]" />
              </div>

              {/* Oscillating Beam Indicator */}
              <div
                style={{
                  left: `${beamPos}%`,
                }}
                className={cn(
                  "absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full transition-shadow duration-75",
                  isStopped
                    ? roundScore && roundScore > 0
                      ? "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]"
                      : "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)]"
                    : "bg-white shadow-[0_0_20px_rgba(255,255,255,1)]"
                )}
              />
            </div>

            {/* Tap Button for mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStop();
              }}
              disabled={isStopped}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-base uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50 transition-all active:scale-95"
            >
              {isStopped ? "ROUND COMPLETE" : "STOP BEAM (SPACE / TAP)"}
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
