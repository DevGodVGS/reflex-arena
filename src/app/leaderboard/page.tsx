"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Crown } from "lucide-react";
import { GAME_LIST, GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { LeaderboardEntry } from "@/types/player";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const initialGame = (searchParams.get("game") as GameId) || "reaction-rush";

  const [selectedGame, setSelectedGame] = useState<GameId>(initialGame);
  const [selectedScope, setSelectedScope] = useState<"global" | "daily" | "weekly">("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { profile } = usePlayerStore();
  const activeGameMeta = GAMES[selectedGame] || GAMES["reaction-rush"];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboards?game=${selectedGame}&scope=${selectedScope}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [selectedGame, selectedScope]);

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);
  const currentPb = profile.personalBests[selectedGame];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00E5FF]">
            <Trophy className="w-4 h-4" />
            HALL OF REFLEX CHAMPIONS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Global Rankings
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Official verified leaderboards. Only anti-cheat certified scores are logged.
          </p>
        </div>

        {/* Current User Quick Rank Card */}
        <div className="px-5 py-3 rounded-2xl bg-[#111827] border border-[#1E293B] flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] flex items-center justify-center font-bold text-[#080B14]">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Your Best Record</span>
            <span className="text-base font-black font-mono text-white">
              {currentPb ? activeGameMeta.formatScore(currentPb.bestScore) : "No Score Yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Selectors Bar: Game Selector & Scope Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Game Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
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

        {/* Scope Toggle (Global / Daily / Weekly) */}
        <div className="p-1 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center shrink-0">
          {(["global", "daily", "weekly"] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setSelectedScope(scope)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                selectedScope === scope
                  ? "bg-[#080B14] text-[#00E5FF] shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* #2 Rank */}
          {top3[1] && (
            <div className="rounded-2xl bg-[#111827] border border-slate-700 p-6 flex flex-col items-center text-center gap-3 order-2 md:order-1 relative">
              <div className="w-12 h-12 rounded-full bg-slate-300 text-[#080B14] font-black text-lg flex items-center justify-center shadow-lg">
                2
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center justify-center gap-1.5">
                  {top3[1].username}
                  {top3[1].isPro && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                </h3>
                <span className="text-xs font-mono text-slate-400">{top3[1].title}</span>
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-slate-200">
                {top3[1].formattedScore}
              </div>
            </div>
          )}

          {/* #1 Rank (Center Spotlight) */}
          {top3[0] && (
            <div className="rounded-2xl bg-gradient-to-b from-amber-950/40 via-[#111827] to-[#0D1322] border-2 border-amber-400/60 p-8 flex flex-col items-center text-center gap-3 order-1 md:order-2 shadow-[0_0_35px_rgba(245,158,11,0.2)] relative -mt-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-[#080B14] font-black text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                👑
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                  ARENA CHAMPION
                </span>
                <h3 className="font-black text-white text-xl flex items-center justify-center gap-1.5 mt-0.5">
                  {top3[0].username}
                  {top3[0].isPro && <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </h3>
                <span className="text-xs font-mono text-amber-300">{top3[0].title}</span>
              </div>
              <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-[#00E5FF] text-glow-cyan">
                {top3[0].formattedScore}
              </div>
            </div>
          )}

          {/* #3 Rank */}
          {top3[2] && (
            <div className="rounded-2xl bg-[#111827] border border-amber-800/40 p-6 flex flex-col items-center text-center gap-3 order-3 relative">
              <div className="w-12 h-12 rounded-full bg-amber-600 text-white font-black text-lg flex items-center justify-center shadow-lg">
                3
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center justify-center gap-1.5">
                  {top3[2].username}
                  {top3[2].isPro && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                </h3>
                <span className="text-xs font-mono text-slate-400">{top3[2].title}</span>
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-slate-200">
                {top3[2].formattedScore}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Rankings Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080B14] text-slate-400 uppercase font-mono border-b border-[#1E293B]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Title / Tier</th>
                <th className="py-3.5 px-4 text-right">Score</th>
                <th className="py-3.5 px-4 text-center">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {entries.map((entry) => (
                <tr
                  key={entry.rank}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-300">
                    #{entry.rank}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] text-cyan-400">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{entry.username}</span>
                    {entry.isPro && (
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        PRO
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {entry.title || "Reflex Rookie"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#00E5FF]">
                    {entry.formattedScore}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                    {entry.country || "IN"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-mono">Loading Leaderboards...</div>}>
      <LeaderboardContent />
    </Suspense>
  );
}
