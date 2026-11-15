"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Flame, Zap, Gauge, Sparkles } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

export function TapFrenzyGame() {
  const meta = GAMES["tap-frenzy"];
  const GAME_DURATION = 10.0;

  const engine = useGameEngine({
    gameId: "tap-frenzy",
    timeLimitSeconds: GAME_DURATION,
  });

  const [taps, setTaps] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [currentCps, setCurrentCps] = useState<number>(0);
  const [isHyperdrive, setIsHyperdrive] = useState<boolean>(false);

  const tapTimestampsRef = useRef<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const calculateCps = useCallback(() => {
    const now = performance.now();
    // Keep taps from the last 1.5 seconds
    tapTimestampsRef.current = tapTimestampsRef.current.filter((t) => now - t <= 1500);
    const recentCount = tapTimestampsRef.current.length;
    const cps = Number((recentCount / 1.5).toFixed(1));
    setCurrentCps(cps);

    if (cps >= 9.0) {
      setIsHyperdrive(true);
    } else {
      setIsHyperdrive(false);
    }
  }, []);

  useEffect(() => {
    if (engine.state === "PLAYING" && !timerRef.current) {
      startTimeRef.current = performance.now();

      timerRef.current = setInterval(() => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, Number((GAME_DURATION - elapsed).toFixed(1)));
        setTimeLeft(remaining);
        calculateCps();

        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 100);
    }
  }, [engine.state, calculateCps]);

  // When time runs out
  useEffect(() => {
    if (timeLeft <= 0 && engine.state === "PLAYING") {
      sound.play("bullseye");
      engine.endGame(taps, {
        roundsPlayed: taps,
      });
    }
  }, [timeLeft, engine, taps]);

  const handleTap = () => {
    if (engine.state !== "PLAYING" || timeLeft <= 0) return;

    sound.play("tap");
    const now = performance.now();
    tapTimestampsRef.current.push(now);

    setTaps((prev) => {
      const next = prev + 1;
      engine.updateScore(next);
      return next;
    });

    calculateCps();
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTaps(0);
    setTimeLeft(GAME_DURATION);
    setCurrentCps(0);
    setIsHyperdrive(false);
    tapTimestampsRef.current = [];
    engine.restart();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={taps}
        combo={engine.combo}
        onPause={engine.pause}
        onResume={engine.resume}
        onRestart={handleRestart}
      />

      <div className="w-full h-[520px] bg-[#0A0E1A] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col items-center justify-center p-6 select-none">
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.2)]">
              <Flame className="w-8 h-8 text-rose-500" />
            </div>

            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
            </div>

            <div className="bg-[#080B14] p-4 rounded-xl border border-[#1E293B] text-left text-xs text-slate-300 max-w-md space-y-1.5">
              <span className="font-bold text-rose-400 uppercase block font-mono">
                Instructions:
              </span>
              {meta.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <button
              onClick={engine.ready}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Start 10s Sprint
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            {/* Top Gauges: Time Left & Real-Time CPS */}
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <span className="px-3 py-1 rounded bg-[#111827] border border-[#1E293B] text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#00E5FF]" />
                Speed: {currentCps} CPS
              </span>

              <span
                className={cn(
                  "px-3 py-1 rounded border font-black",
                  timeLeft <= 3
                    ? "bg-rose-950 border-rose-500 text-rose-300 animate-pulse"
                    : "bg-[#111827] border-[#1E293B] text-slate-300"
                )}
              >
                TIME: {timeLeft.toFixed(1)}s
              </span>
            </div>

            {/* Hyperdrive Overdrive Banner */}
            {isHyperdrive && (
              <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black tracking-widest uppercase flex items-center gap-1.5 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce">
                <Sparkles className="w-4 h-4" />
                HYPERDRIVE ACTIVE! 1.5X BOOST
              </div>
            )}

            {/* Tap Count Big Display */}
            <div className="flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                {taps}
              </span>
              <span className="text-xs uppercase font-mono text-slate-400 mt-1">
                TOTAL TAPS REGISTERED
              </span>
            </div>

            {/* Giant Central Tapping Zone Button */}
            <button
              onClick={handleTap}
              className="w-56 h-56 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-500 p-1.5 shadow-[0_0_40px_rgba(239,68,68,0.5)] active:scale-90 transition-transform cursor-pointer flex items-center justify-center select-none"
            >
              <div className="w-full h-full rounded-full bg-[#111827] flex flex-col items-center justify-center hover:bg-slate-900 transition-colors">
                <Flame className="w-14 h-14 text-rose-500 animate-pulse" />
                <span className="text-xs font-mono font-black text-rose-400 mt-2 uppercase tracking-widest">
                  TAP FAST!
                </span>
              </div>
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
