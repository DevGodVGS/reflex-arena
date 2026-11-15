"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Brain, Sparkles, Volume2 } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

interface Pad {
  id: number;
  label: string;
  color: string;
  glow: string;
  toneFreq: number;
}

const PADS: Pad[] = [
  { id: 0, label: "PAD ALPHA", color: "#00E5FF", glow: "rgba(0,229,255,0.7)", toneFreq: 440 },
  { id: 1, label: "PAD BETA", color: "#8B5CF6", glow: "rgba(139,92,246,0.7)", toneFreq: 554 },
  { id: 2, label: "PAD GAMMA", color: "#22C55E", glow: "rgba(34,197,94,0.7)", toneFreq: 659 },
  { id: 3, label: "PAD DELTA", color: "#EF4444", glow: "rgba(239,68,68,0.7)", toneFreq: 880 },
];

export function MemoryFlashGame() {
  const meta = GAMES["memory-flash"];

  const engine = useGameEngine({
    gameId: "memory-flash",
  });

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInputIndex, setPlayerInputIndex] = useState<number>(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [mode, setMode] = useState<"WATCHING" | "PLAYING">("WATCHING");
  const [level, setLevel] = useState<number>(1);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playSequence = useCallback((seq: number[]) => {
    setMode("WATCHING");
    let step = 0;

    const playNext = () => {
      if (step >= seq.length) {
        setActivePad(null);
        setMode("PLAYING");
        setPlayerInputIndex(0);
        return;
      }

      const padId = seq[step];
      setActivePad(padId);
      sound.play("tap");

      timeoutRef.current = setTimeout(() => {
        setActivePad(null);
        step += 1;
        timeoutRef.current = setTimeout(playNext, 250);
      }, 450);
    };

    timeoutRef.current = setTimeout(playNext, 600);
  }, []);

  const startNextLevel = useCallback((currentLevel: number, currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setLevel(currentLevel);
    playSequence(newSeq);
  }, [playSequence]);

  useEffect(() => {
    if (engine.state === "PLAYING" && sequence.length === 0) {
      startNextLevel(1, []);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [engine.state, sequence.length, startNextLevel]);

  const handlePadClick = (padId: number) => {
    if (engine.state !== "PLAYING" || mode !== "PLAYING") return;

    setActivePad(padId);
    setTimeout(() => setActivePad(null), 200);

    const expectedPad = sequence[playerInputIndex];

    if (padId === expectedPad) {
      // Correct pad!
      sound.play("hit");
      const nextIndex = playerInputIndex + 1;

      if (nextIndex >= sequence.length) {
        // Sequence completed successfully!
        sound.play("success");
        const addedScore = level * 1000;
        engine.updateScore((prev) => prev + addedScore);
        engine.updateCombo(level);

        setTimeout(() => {
          startNextLevel(level + 1, sequence);
        }, 800);
      } else {
        setPlayerInputIndex(nextIndex);
      }
    } else {
      // Mistake!
      sound.play("miss");
      engine.endGame(level, {
        roundsPlayed: level,
      });
    }
  };

  const handleRestart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSequence([]);
    setLevel(1);
    setPlayerInputIndex(0);
    setActivePad(null);
    engine.restart();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={level}
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
              <Brain className="w-8 h-8 text-emerald-400" />
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
              Start Sequence Test
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            {/* Status Header */}
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase font-mono text-slate-400">
                Level {level} • Sequence Length: {sequence.length}
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {mode === "WATCHING" ? "WATCH & LISTEN..." : "YOUR TURN — REPEAT SEQUENCE"}
              </h3>
            </div>

            {/* 2x2 Cyber Sonic Pads */}
            <div className="grid grid-cols-2 gap-4 w-72 h-72 sm:w-80 sm:h-80">
              {PADS.map((pad) => {
                const isLit = activePad === pad.id;
                return (
                  <button
                    key={pad.id}
                    onClick={() => handlePadClick(pad.id)}
                    disabled={mode === "WATCHING"}
                    style={{
                      borderColor: pad.color,
                      backgroundColor: isLit ? pad.color : "#111827",
                      boxShadow: isLit ? `0 0 35px ${pad.glow}` : "none",
                    }}
                    className={cn(
                      "rounded-2xl border-2 transition-all duration-150 flex flex-col items-center justify-center p-4 active:scale-95",
                      mode === "WATCHING" ? "cursor-not-allowed opacity-90" : "cursor-pointer hover:border-white"
                    )}
                  >
                    <span
                      style={{ color: isLit ? "#080B14" : pad.color }}
                      className="font-mono text-xs font-black tracking-widest uppercase"
                    >
                      {pad.label}
                    </span>
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
