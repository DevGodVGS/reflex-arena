"use client";

import Link from "next/link";
import {
  Zap,
  Flame,
  Trophy,
  Swords,
  Crown,
  Play,
  ArrowRight,
  Sparkles,
  Shield,
  Activity,
  Award,
} from "lucide-react";
import { GAME_LIST } from "@/lib/constants/games";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

export default function HomeDashboardPage() {
  const { profile } = usePlayerStore();

  const dailyGame = GAME_LIST[0]; // Reaction Rush for today's seed

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#111827] via-[#0D1322] to-[#080B14] border border-[#1E293B] overflow-hidden p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl">
        {/* Ambient Neon Blobs */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-5 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Competitive Arcade Gaming Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
            Think Fast. <br />
            <span className="bg-gradient-to-r from-[#00E5FF] via-white to-[#8B5CF6] bg-clip-text text-transparent text-glow-cyan">
              React Faster.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
            Ten high-octane mini-games designed to benchmark your twitch reflexes, microsecond precision, working memory, and mental focus. Play instantly as guest — no sign-up needed.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/games/reaction-rush"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Reaction Rush
            </Link>

            <Link
              href="/daily"
              className="px-6 py-3.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-white font-bold text-sm border border-[#1E293B] hover:border-[#EF4444]/50 transition-colors flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              Daily Arena Challenge
            </Link>
          </div>
        </div>

        {/* Live Quick Reflex Calibration Pill Card */}
        <div className="w-full max-w-sm rounded-2xl bg-[#080B14]/80 backdrop-blur-md border border-[#1E293B] p-6 flex flex-col gap-5 shadow-xl z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Live Arena Metrics
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
              <span className="text-xs text-slate-300">Human Baseline</span>
              <span className="text-sm font-mono font-bold text-slate-400">~275 ms</span>
            </div>

            <div className="p-3 rounded-xl bg-[#111827] border border-[#00E5FF]/30 flex items-center justify-between shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                Cyber God Benchmark
              </span>
              <span className="text-sm font-mono font-bold text-[#00E5FF]">&lt; 160 ms</span>
            </div>

            <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
              <span className="text-xs text-slate-300">Your Current Level</span>
              <span className="text-sm font-mono font-bold text-amber-300">
                LVL {profile.level} ({profile.tier})
              </span>
            </div>
          </div>

          <Link
            href="/games"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            Explore All 10 Mini-Games
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. DAILY CHALLENGE HERO BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#111827] to-amber-950/40 border border-rose-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] shrink-0">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold text-rose-400 tracking-wider">
                Daily Arena Event
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                1 Ranked Attempt
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              {dailyGame.title}: Neural Overdrive
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identical randomized seed for all players worldwide. Resets at midnight UTC.
            </p>
          </div>
        </div>

        <Link
          href="/daily"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] whitespace-nowrap"
        >
          Enter Daily Arena
        </Link>
      </div>

      {/* 3. QUICK STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex flex-col">
          <span className="text-[11px] uppercase font-mono text-slate-400">Total Games Played</span>
          <span className="text-2xl font-black font-mono text-white mt-1">
            {profile.gamesPlayedTotal}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">across all mini-games</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex flex-col">
          <span className="text-[11px] uppercase font-mono text-slate-400">Competitive Tier</span>
          <span className="text-2xl font-black font-mono text-[#00E5FF] mt-1">
            {profile.tier}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">Level {profile.level}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex flex-col">
          <span className="text-[11px] uppercase font-mono text-slate-400">Daily Streak</span>
          <span className="text-2xl font-black font-mono text-amber-400 mt-1">
            {profile.streakDays} Days 🔥
          </span>
          <span className="text-[10px] text-slate-500 mt-1">keep it active daily</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex flex-col">
          <span className="text-[11px] uppercase font-mono text-slate-400">Achievements</span>
          <span className="text-2xl font-black font-mono text-purple-400 mt-1">
            {profile.unlockedAchievements.length} / 30
          </span>
          <span className="text-[10px] text-slate-500 mt-1">badges unlocked</span>
        </div>
      </div>

      {/* 4. FEATURED MINI-GAMES GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Arcade Disciplines</h2>
            <p className="text-xs text-slate-400">Select any discipline to launch instant gameplay</p>
          </div>

          <Link
            href="/games"
            className="text-xs font-bold text-[#00E5FF] hover:underline flex items-center gap-1"
          >
            View all 10 games
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAME_LIST.slice(0, 6).map((game) => {
            const pb = profile.personalBests[game.id];
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#00E5FF]/60 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#080B14] text-slate-400 border border-[#1E293B]">
                      {game.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      PB: {pb ? game.formatScore(pb.bestScore) : "—"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{game.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">100% Client-Side Engine</span>
                  <span className="text-[#00E5FF] font-bold group-hover:translate-x-1 transition-transform">
                    Play →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. FRIEND CHALLENGE & PRO TEASER ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Versus Teaser */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#111827] border border-purple-500/30 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
              <Swords className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Friend Challenge Versus Mode</h3>
            <p className="text-xs text-slate-300">
              Set a record in any game, generate an encrypted challenge link, and send it to your friend on WhatsApp or Discord to see who has superior biological latency.
            </p>
          </div>

          <Link
            href="/challenge"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider text-center transition-colors"
          >
            Create or View Challenges
          </Link>
        </div>

        {/* Pro Pass Teaser */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[#111827] border border-[#00E5FF]/30 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/50 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <h3 className="text-xl font-bold text-white">Reflex Pro Pass</h3>
            <p className="text-xs text-slate-300">
              Ad-free gameplay, in-depth latency progression charts, custom cursor effects, legendary golden borders, and +1,000 arena coins bonus.
            </p>
          </div>

          <Link
            href="/subscription"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-xs uppercase tracking-wider text-center hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
          >
            Upgrade to Pro — ₹99/mo
          </Link>
        </div>
      </div>
    </div>
  );
}
