"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  Trophy,
  Play,
  Sparkles,
  Shield,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { LeaderboardEntry } from "@/types/player";
import { cn } from "@/lib/utils";

export default function DailyChallengePage() {
  const { profile, claimDailyReward } = usePlayerStore();
  const [dailyData, setDailyData] = useState<{
    dateString: string;
    gameId: GameId;
    gameTitle: string;
    tagline: string;
    specialRulesDescription: string;
    msRemaining: number;
    multiplier: number;
    seed?: number;
  } | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [claimedReward, setClaimedReward] = useState<boolean>(false);

  useEffect(() => {
    // Fetch daily config
    fetch("/api/daily")
      .then((res) => res.json())
      .then((data) => {
        setDailyData(data);
        setSecondsRemaining(Math.floor(data.msRemaining / 1000));

        // Fetch daily leaderboard
        fetch(`/api/leaderboards?game=${data.gameId}&scope=daily`)
          .then((res) => res.json())
          .then((lb) => setLeaderboard(lb.entries || []))
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  // Countdown timer interval
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const todayStr = new Date().toISOString().split("T")[0];
  const hasClaimedToday = profile.lastDailyChallengeDate === todayStr;

  const handleClaim = () => {
    if (hasClaimedToday) return;
    claimDailyReward();
    setClaimedReward(true);
  };

  const gameMeta = dailyData ? GAMES[dailyData.gameId] : GAMES["reaction-rush"];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-500">
            <Flame className="w-4 h-4 fill-rose-500" />
            SYNCHRONIZED GLOBAL EVENT
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Daily Arena
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            One common seed. Global leaderboard. Test yourself against players worldwide under identical conditions.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="flex flex-col items-center sm:items-end">
          <span className="text-[11px] uppercase font-mono text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
            Next Reset In (UTC)
          </span>
          <div className="flex items-center gap-1 font-mono text-2xl font-black text-white mt-1">
            <span className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1E293B]">
              {String(hours).padStart(2, "0")}h
            </span>
            <span>:</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1E293B]">
              {String(minutes).padStart(2, "0")}m
            </span>
            <span>:</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1E293B] text-rose-400">
              {String(seconds).padStart(2, "0")}s
            </span>
          </div>
        </div>
      </div>

      {/* Main Daily Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Featured Daily Challenge Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-rose-950/40 via-[#111827] to-[#0D1322] border-2 border-rose-500/40 p-6 sm:p-10 shadow-[0_0_35px_rgba(239,68,68,0.15)] flex flex-col justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  Today&apos;s Featured Discipline
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Seed: #{dailyData?.seed || 2026}
                </span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  {gameMeta.title}
                </h2>
                <p className="text-sm font-mono text-cyan-400 mt-1">
                  {gameMeta.tagline}
                </p>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  {dailyData?.specialRulesDescription || gameMeta.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Reward Boost</span>
                  <span className="text-base font-bold font-mono text-amber-400">1.5x XP & Coins</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Ranked Attempt</span>
                  <span className="text-base font-bold font-mono text-emerald-400">Primary Run</span>
                </div>
                <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B] col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Current Streak</span>
                  <span className="text-base font-bold font-mono text-rose-400">{profile.streakDays} Days 🔥</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={`/games/${gameMeta.id}?mode=daily`}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Play Daily Challenge Now
              </Link>

              <button
                onClick={handleClaim}
                disabled={hasClaimedToday || claimedReward}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#111827] border border-[#1E293B] hover:border-amber-400/50 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                {hasClaimedToday || claimedReward ? "Daily Reward Claimed" : "Claim Streak Bonus (+150 Coins)"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Today's Daily Leaderboard */}
        <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Today&apos;s Standings</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {dailyData?.dateString}
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={cn(
                  "p-3 rounded-xl border flex items-center justify-between text-xs transition-colors",
                  entry.rank === 1
                    ? "bg-amber-950/30 border-amber-500/40"
                    : entry.rank === 2
                    ? "bg-slate-800/60 border-slate-600"
                    : entry.rank === 3
                    ? "bg-amber-900/20 border-amber-800/40"
                    : "bg-[#080B14] border-[#1E293B]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px]",
                      entry.rank === 1
                        ? "bg-amber-400 text-[#080B14]"
                        : entry.rank === 2
                        ? "bg-slate-300 text-[#080B14]"
                        : entry.rank === 3
                        ? "bg-amber-600 text-white"
                        : "text-slate-400"
                    )}
                  >
                    {entry.rank}
                  </span>

                  <div className="flex flex-col">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {entry.username}
                      {entry.isPro && (
                        <span className="text-[9px] px-1 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono">
                          PRO
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {entry.title || "Reflex Rookie"}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-black text-sm text-[#00E5FF]">
                  {entry.formattedScore}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/leaderboard"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-center font-bold text-slate-200 transition-colors mt-auto"
          >
            View Complete Global Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}
