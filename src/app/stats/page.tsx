"use client";

import { useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Clock,
  Zap,
  Crosshair,
  Award,
  Activity,
  Flame,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { GAMES, GAME_LIST } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { cn, formatNumber } from "@/lib/utils";

export default function StatisticsDashboardPage() {
  const { profile } = usePlayerStore();
  const [selectedGame, setSelectedGame] = useState<GameId>("reaction-rush");

  const activeMeta = GAMES[selectedGame];
  const pb = profile.personalBests[selectedGame];

  // Calculate reaction times trend from recent matches of this game
  const recentGameMatches = profile.recentMatches.filter((m) => m.gameId === selectedGame);
  const scoresTrend = recentGameMatches.map((m) => m.score).reverse();

  // Total playtime formatted
  const totalHours = Math.floor(profile.totalPlayTimeSeconds / 3600);
  const totalMins = Math.floor((profile.totalPlayTimeSeconds % 3600) / 60);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00E5FF]">
            <Activity className="w-4 h-4" />
            TELEMETRY & NEURAL BENCHMARKS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Performance Statistics
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            In-depth analytics on reaction latency curves, session volume, accuracy calibrations, and tier progressions.
          </p>
        </div>
      </div>

      {/* Lifetime Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Arena Playtime</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">
            {totalHours}h {totalMins}m
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">active gameplay ticks</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Games Played</span>
          <span className="text-2xl font-black font-mono text-[#00E5FF] mt-1 block">
            {profile.gamesPlayedTotal}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">sessions completed</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">Unique Disciplines</span>
          <span className="text-2xl font-black font-mono text-purple-400 mt-1 block">
            {Object.keys(profile.personalBests).length} / 10
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">games calibrated</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">Arena Tier</span>
          <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
            {profile.tier}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Level {profile.level}</span>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GAME_LIST.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                selectedGame === game.id
                  ? "bg-[#00E5FF] text-[#080B14] shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  : "bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B]"
              )}
            >
              {game.title}
            </button>
          ))}
        </div>

        {/* Selected Game Deep Dive Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Progression Chart Panel */}
          <div className="lg:col-span-2 rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
                  {activeMeta.title} Performance Curve
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recent session scores progression
                </p>
              </div>

              <span className="text-xs font-mono text-[#00E5FF] px-2.5 py-1 rounded bg-[#080B14] border border-[#1E293B]">
                Personal Best: {pb ? activeMeta.formatScore(pb.bestScore) : "—"}
              </span>
            </div>

            {/* Custom Interactive SVG Line Chart */}
            <div className="w-full h-56 bg-[#080B14] rounded-2xl border border-[#1E293B] p-4 flex flex-col justify-between relative">
              {scoresTrend.length > 1 ? (
                <div className="w-full h-full flex items-end justify-between gap-2 pt-6 pb-2">
                  {scoresTrend.map((score, i) => {
                    const minScore = Math.min(...scoresTrend);
                    const maxScore = Math.max(...scoresTrend);
                    const range = Math.max(1, maxScore - minScore);
                    const heightPercent = Math.max(15, Math.min(95, ((score - minScore) / range) * 80 + 15));

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-7 bg-slate-900 border border-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                          {activeMeta.formatScore(score)}
                        </div>

                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] bg-gradient-to-t from-[#00E5FF]/40 to-[#00E5FF] rounded-t-md group-hover:brightness-125 transition-all shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                        />
                        <span className="text-[9px] font-mono text-slate-500 mt-1">#{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs font-mono gap-1">
                  <span>Insufficient telemetry data for this discipline.</span>
                  <span>Play at least 2 sessions to render the performance curve.</span>
                </div>
              )}
            </div>
          </div>

          {/* Benchmarks & Breakdown Card */}
          <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Benchmark Thresholds
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#080B14] border border-amber-500/30 flex items-center justify-between">
                  <span className="text-amber-300 font-bold">Cyber God (0.1%)</span>
                  <span className="text-white font-bold">{activeMeta.formatScore(activeMeta.benchmarkGodlike)}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#080B14] border border-purple-500/30 flex items-center justify-between">
                  <span className="text-purple-300 font-bold">Master Pro (5%)</span>
                  <span className="text-white font-bold">{activeMeta.formatScore(activeMeta.benchmarkPro)}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#080B14] border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-cyan-300 font-bold">Elite Reflex (20%)</span>
                  <span className="text-white font-bold">{activeMeta.formatScore(activeMeta.benchmarkGood)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080B14] border border-[#1E293B] space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Lifetime Played</span>
              <span className="text-lg font-mono font-bold text-white block">
                {pb ? `${pb.timesPlayed} sessions` : "0 sessions"}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 block">
                Average: {pb ? activeMeta.formatScore(pb.averageScore) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
