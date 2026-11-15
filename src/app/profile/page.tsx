"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Crown,
  Trophy,
  Flame,
  Award,
  Clock,
  Sparkles,
  Edit2,
  Check,
  Gamepad2,
  Shield,
  ArrowRight,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { cn, formatNumber, formatTime } from "@/lib/utils";

export default function ProfilePage() {
  const { profile, updateUsername } = usePlayerStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);

  const handleSaveName = () => {
    updateUsername(nameInput);
    setIsEditingName(false);
  };

  const xpPercent = Math.min(100, Math.round((profile.currentXp / profile.xpToNextLevel) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#111827] via-[#0D1322] to-[#080B14] border border-[#1E293B] p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
          {/* Avatar with dynamic frame */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#8B5CF6] via-[#00E5FF] to-[#22C55E] p-1 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
              <div className="w-full h-full bg-[#080B14] rounded-full flex items-center justify-center font-black text-3xl text-white">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            </div>
            {profile.isPro && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-[#080B14]">
                <Crown className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={16}
                    className="px-3 py-1 rounded-lg bg-[#080B14] border border-[#00E5FF] text-white text-lg font-bold focus:outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-[#00E5FF] text-[#080B14]"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {profile.username}
                  </h1>
                  <button
                    onClick={() => {
                      setNameInput(profile.username);
                      setIsEditingName(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {profile.isPro ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                  PRO PASS ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
                  GUEST FIGHTER
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-cyan-400">
              Rank: {profile.tier} • Level {profile.level}
            </p>

            {/* Level XP Progress Bar */}
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>XP {formatNumber(profile.currentXp)}</span>
                <span>{formatNumber(profile.xpToNextLevel)} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${xpPercent}%` }}
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Balance & Streak Cards */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-4 rounded-2xl bg-[#080B14]/80 border border-[#1E293B] text-center min-w-[100px]">
            <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-xs font-mono uppercase text-slate-400 block">Coins</span>
            <span className="text-lg font-mono font-bold text-amber-300">
              {formatNumber(profile.coins)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#080B14]/80 border border-[#1E293B] text-center min-w-[100px]">
            <Flame className="w-5 h-5 text-rose-500 mx-auto mb-1" />
            <span className="text-xs font-mono uppercase text-slate-400 block">Streak</span>
            <span className="text-lg font-mono font-bold text-rose-400">
              {profile.streakDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Personal Records & Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Records Card */}
        <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Personal Bests by Game
            </h2>
            <Link
              href="/stats"
              className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1 font-bold"
            >
              Detailed Stats <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {Object.values(GAMES).map((game) => {
              const pb = profile.personalBests[game.id];
              return (
                <div
                  key={game.id}
                  className="p-3 rounded-xl bg-[#080B14] border border-[#1E293B] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{game.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Played {pb ? pb.timesPlayed : 0} times
                    </span>
                  </div>

                  <span className="font-mono font-bold text-sm text-[#00E5FF]">
                    {pb ? game.formatScore(pb.bestScore) : "Not Played"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Recent Match History
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Last {profile.recentMatches.length} Matches
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {profile.recentMatches.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                No recent matches recorded yet. Launch a game to start your legacy!
              </div>
            ) : (
              profile.recentMatches.map((m, idx) => {
                const game = GAMES[m.gameId];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#080B14] border border-[#1E293B] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{game?.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Tier: {m.rankTier}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">
                        {game?.formatScore(m.score)}
                      </span>
                      <span className="text-[11px] font-mono text-amber-400">
                        +{m.xpEarned} XP
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
