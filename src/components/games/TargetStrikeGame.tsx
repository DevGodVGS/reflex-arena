"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Target, Crosshair, AlertCircle, Sparkles } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

interface TargetItem {
  id: number;
  x: number; // percentage (5% to 90%)
  y: number; // percentage (10% to 85%)
  size: number; // in pixels
  spawnTime: number;
}

export function TargetStrikeGame() {
  const meta = GAMES["target-strike"];
  const GAME_DURATION_SECONDS = 30;

  const engine = useGameEngine({
    gameId: "target-strike",
    timeLimitSeconds: GAME_DURATION_SECONDS,
  });

  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [currentTarget, setCurrentTarget] = useState<TargetItem | null>(null);
  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetIdCounter = useRef<number>(1);
  const playAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const spawnTarget = useCallback((currentHits: number) => {
    // Dynamic size scaling: decreases from 64px to 32px based on hits
    const size = Math.max(32, 64 - Math.floor(currentHits / 5) * 4);
    const x = Math.floor(Math.random() * 80) + 10;
    const y = Math.floor(Math.random() * 70) + 15;

    setCurrentTarget({
      id: targetIdCounter.current++,
      x,
      y,
      size,
      spawnTime: performance.now(),
    });
  }, []);

  // When game starts playing
  useEffect(() => {
    if (engine.state === "PLAYING" && !timerRef.current) {
      spawnTarget(0);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [engine.state, spawnTarget]);

  // When timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && engine.state === "PLAYING") {
      const totalClicks = hits + misses;
      const accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;

      engine.endGame(undefined, {
        accuracyPercentage: accuracy,
        roundsPlayed: hits,
      });
    }
  }, [timeLeft, engine, hits, misses]);

  const handleTargetHit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (engine.state !== "PLAYING" || !currentTarget) return;

    const hitLatency = performance.now() - currentTarget.spawnTime;
    const speedBonus = Math.max(0, Math.round(500 - hitLatency));

    const newHits = hits + 1;
    const newStreak = streak + 1;
    setHits(newHits);
    setStreak(newStreak);

    // Multiplier maxes at 5x
    const multiplier = Math.min(5, Math.floor(newStreak / 5) + 1);
    engine.updateCombo(multiplier);

    const basePoints = 250;
    const addedScore = (basePoints + speedBonus) * multiplier;
    engine.updateScore((prev) => prev + addedScore);

    sound.play("hit");
    spawnTarget(newHits);
  };

  const handlePlayAreaMiss = () => {
    if (engine.state !== "PLAYING") return;
    setMisses((prev) => prev + 1);
    setStreak(0);
    engine.updateCombo(1);
    sound.play("miss");
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(GAME_DURATION_SECONDS);
    setHits(0);
    setMisses(0);
    setStreak(0);
    setCurrentTarget(null);
    engine.restart();
  };

  const totalClicks = hits + misses;
  const accuracyPercentage = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 100;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={engine.score}
        combo={engine.combo}
        onPause={engine.pause}
        onResume={engine.resume}
        onRestart={handleRestart}
      />

      <div
        ref={playAreaRef}
        onClick={handlePlayAreaMiss}
        className="w-full h-[520px] bg-[#0A0E1A] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col select-none cursor-crosshair"
      >
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.2)]">
              <Target className="w-8 h-8 text-purple-400" />
            </div>

            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
            </div>

            <div className="bg-[#080B14] p-4 rounded-xl border border-[#1E293B] text-left text-xs text-slate-300 max-w-md space-y-1.5">
              <span className="font-bold text-[#8B5CF6] uppercase block font-mono">
                How to Play:
              </span>
              {meta.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <button
              onClick={engine.ready}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Start 30s Challenge
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full h-full relative">
            {/* Top Stat Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-[#080B14]/80 border border-[#1E293B] flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-purple-400" />
                  Hits: {hits}
                </span>
                <span className="px-3 py-1 rounded bg-[#080B14]/80 border border-[#1E293B]">
                  Acc: {accuracyPercentage}%
                </span>
              </div>

              {/* Time Remaining Gauge */}
              <div
                className={cn(
                  "px-3 py-1 rounded border font-bold flex items-center gap-1.5",
                  timeLeft <= 5
                    ? "bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse"
                    : "bg-[#080B14]/80 border-[#1E293B] text-slate-200"
                )}
              >
                <span>TIME: {timeLeft}s</span>
              </div>
            </div>

            {/* Spawned Neon Target */}
            {currentTarget && (
              <div
                onClick={handleTargetHit}
                style={{
                  top: `${currentTarget.y}%`,
                  left: `${currentTarget.x}%`,
                  width: `${currentTarget.size}px`,
                  height: `${currentTarget.size}px`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute rounded-full cursor-pointer transition-transform active:scale-90 flex items-center justify-center group"
              >
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[#8B5CF6] animate-ping opacity-40" />
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#00E5FF] p-[2px] shadow-[0_0_20px_rgba(139,92,246,0.8)]">
                  <div className="w-full h-full rounded-full bg-[#080B14] flex items-center justify-center">
                    {/* Inner Bullseye */}
                    <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] shadow-[0_0_10px_rgba(0,229,255,1)]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {engine.state === "ENDED" && engine.results && (
          <ResultsModal meta={meta} result={engine.results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
