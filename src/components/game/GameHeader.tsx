"use client";

import Link from "next/link";
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { GameMetadata, GameState } from "@/types/game";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  meta: GameMetadata;
  state: GameState;
  score: number;
  currentRound?: number;
  totalRounds?: number;
  combo?: number;
  onPause?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
}

export function GameHeader({
  meta,
  state,
  score,
  currentRound,
  totalRounds,
  combo = 0,
  onPause,
  onResume,
  onRestart,
}: GameHeaderProps) {
  const { soundSettings, setSoundMuted } = usePlayerStore();

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#111827]/80 backdrop-blur-md rounded-t-2xl">
      {/* Left: Exit button & Game Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/games"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Return to Games"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            {meta.title}
            {totalRounds && totalRounds > 1 && (
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-[#00E5FF] border border-slate-700">
                Round {Math.min(currentRound || 1, totalRounds)} / {totalRounds}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Center: Live Score & Combo Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Score
          </span>
          <span className="text-base sm:text-xl font-mono font-extrabold text-[#00E5FF] text-glow-cyan">
            {meta.formatScore(score)}
          </span>
        </div>

        {combo > 1 && (
          <div className="animate-bounce px-2 py-0.5 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F59E0B] text-white text-[11px] font-black tracking-wider uppercase shadow-[0_0_12px_rgba(239,68,68,0.5)]">
            {combo}x Combo!
          </div>
        )}
      </div>

      {/* Right: Controls (Pause/Resume, Restart, Sound) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSoundMuted(!soundSettings.isMuted)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle Sound"
        >
          {soundSettings.isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#00E5FF]" />
          )}
        </button>

        {onRestart && (
          <button
            onClick={onRestart}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Restart Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {state === "PLAYING" && onPause && (
          <button
            onClick={onPause}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Pause"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        {state === "PAUSED" && onResume && (
          <button
            onClick={onResume}
            className="p-2 rounded-lg bg-[#00E5FF] text-[#080B14] hover:bg-[#00E5FF]/90 font-bold transition-colors"
            title="Resume"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
}
