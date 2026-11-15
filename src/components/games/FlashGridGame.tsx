"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LayoutGrid, CheckCircle, Crosshair } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

interface ActiveTarget {
  cellIndex: number;
  expiresAt: number;
}

export function FlashGridGame() {
  const meta = GAMES["flash-grid"];
  const GAME_DURATION = 30;

  const engine = useGameEngine({
    gameId: "flash-grid",
    timeLimitSeconds: GAME_DURATION,
  });

  const [activeTargets, setActiveTargets] = useState<Map<number, number>>(new Map()); // cellIndex -> expiresAt
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  const spawnTargets = useCallback(() => {
    setActiveTargets((prev) => {
      const nextMap = new Map(prev);
      const now = performance.now();

      // Clean expired
      for (const [cell, exp] of nextMap.entries()) {
        if (now > exp) {
          nextMap.delete(cell);
        }
      }

      // Determine how many active targets we should have (1 to 3 depending on hits)
      const desiredCount = Math.min(3, Math.floor(hits / 8) + 1);

      while (nextMap.size < desiredCount) {
        const randomCell = Math.floor(Math.random() * 16);
        if (!nextMap.has(randomCell)) {
          // Expiration time gets shorter as hits increase (from 1500ms down to 750ms)
          const lifespan = Math.max(750, 1500 - hits * 25);
          nextMap.set(randomCell, now + lifespan);
        }
      }

      return nextMap;
    });
  }, [hits]);

  useEffect(() => {
    if (engine.state === "PLAYING" && !gameTimerRef.current) {
      spawnTargets();

      gameTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      spawnTimerRef.current = setInterval(() => {
        spawnTargets();
      }, 350);
    }
  }, [engine.state, spawnTargets]);

  // When time expires
  useEffect(() => {
    if (timeLeft === 0 && engine.state === "PLAYING") {
      const totalClicks = hits + misses;
      const acc = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;
      engine.endGame(undefined, {
        accuracyPercentage: acc,
        roundsPlayed: hits,
      });
    }
  }, [timeLeft, engine, hits, misses]);

  const handleCellClick = (cellIndex: number) => {
    if (engine.state !== "PLAYING") return;

    if (activeTargets.has(cellIndex)) {
      // Hit!
      sound.play("hit");
      const newHits = hits + 1;
      setHits(newHits);

      setActiveTargets((prev) => {
        const next = new Map(prev);
        next.delete(cellIndex);
        return next;
      });

      const added = 300 * (Math.min(5, Math.floor(newHits / 5) + 1));
      engine.updateScore((prev) => prev + added);
      engine.updateCombo(engine.combo + 1);
    } else {
      // Missed / clicked empty cell
      sound.play("miss");
      setMisses((prev) => prev + 1);
      engine.updateCombo(0);
    }
  };

  const handleRestart = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    setTimeLeft(GAME_DURATION);
    setHits(0);
    setMisses(0);
    setActiveTargets(new Map());
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

      <div className="w-full h-[520px] bg-[#0A0E1A] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col items-center justify-center p-6 select-none">
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.2)]">
              <LayoutGrid className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
            </div>

            <div className="bg-[#080B14] p-4 rounded-xl border border-[#1E293B] text-left text-xs text-slate-300 max-w-md space-y-1.5">
              <span className="font-bold text-emerald-400 uppercase block font-mono">
                Instructions:
              </span>
              {meta.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <button
              onClick={engine.ready}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Start 30s Grid Challenge
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full max-w-md flex flex-col items-center gap-5">
            {/* Top Stat Bar */}
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B] text-slate-300">
                  Hits: {hits}
                </span>
                <span className="px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B] text-slate-300">
                  Acc: {accuracyPercentage}%
                </span>
              </div>

              <span
                className={cn(
                  "px-3 py-1 rounded border font-mono font-bold",
                  timeLeft <= 5
                    ? "bg-rose-950 border-rose-500 text-rose-300 animate-pulse"
                    : "bg-[#111827] border-[#1E293B] text-slate-300"
                )}
              >
                TIME: {timeLeft}s
              </span>
            </div>

            {/* 4x4 Grid Matrix */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-72 h-72 sm:w-80 sm:h-80">
              {Array.from({ length: 16 }).map((_, idx) => {
                const isTarget = activeTargets.has(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    className={cn(
                      "rounded-xl border transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-90",
                      isTarget
                        ? "bg-[#00E5FF] border-white shadow-[0_0_25px_rgba(0,229,255,0.9)] animate-pulse"
                        : "bg-[#111827] border-[#1E293B] hover:border-slate-700"
                    )}
                  >
                    {isTarget && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#080B14] shadow-inner" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {engine.state === "ENDED" && engine.results && (
          <ResultsModal meta={meta} result={engine.results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
