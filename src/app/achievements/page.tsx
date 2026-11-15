"use client";

import { useState } from "react";
import {
  Award,
  Zap,
  Flame,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  Lock,
  Filter,
} from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/constants/achievements";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { profile } = usePlayerStore();

  const unlockedMap = new Map(
    profile.unlockedAchievements.map((a) => [a.achievementId, a.unlockedAt])
  );

  const categories = [
    { id: "all", label: "All Badges" },
    { id: "reflex", label: "Reflex Benchmarks" },
    { id: "progression", label: "Progression & Games" },
    { id: "streak", label: "Streaks" },
    { id: "mastery", label: "Apex Mastery" },
  ];

  const filtered = ACHIEVEMENTS.filter((ach) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "progression") return ach.category === "progression" || ach.category === "games";
    return ach.category === selectedCategory;
  });

  const completionPercent = Math.round(
    (profile.unlockedAchievements.length / ACHIEVEMENTS.length) * 100
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Award className="w-4 h-4" />
            COMMENDATIONS & TROPHIES
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Achievement Collection
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Complete high-tier reflex milestones to unlock massive XP bonuses, arena coins, and legendary titles.
          </p>
        </div>

        {/* Completion Progress Gauge */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex items-center gap-4 min-w-[240px]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-300">
            {completionPercent}%
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Unlocked</span>
              <span className="font-bold text-white">
                {profile.unlockedAchievements.length} / {ACHIEVEMENTS.length}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5">
              <div
                style={{ width: `${completionPercent}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedCategory === cat.id
                ? "bg-amber-400 text-[#080B14] shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ach) => {
          const isUnlocked = unlockedMap.has(ach.id);
          const unlockedAt = unlockedMap.get(ach.id);

          return (
            <div
              key={ach.id}
              className={cn(
                "p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden",
                isUnlocked
                  ? "bg-[#111827] border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.06)]"
                  : "bg-[#080B14]/60 border-[#1E293B] opacity-60 hover:opacity-80"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0",
                    isUnlocked
                      ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
                      : "bg-slate-900 border-slate-800 text-slate-600"
                  )}
                >
                  {isUnlocked ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{ach.title}</h3>
                    {isUnlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Rewards Strip */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">+{ach.xpReward} XP</span>
                  <span className="text-[#00E5FF] font-bold">+{ach.coinsReward} Coins</span>
                </div>

                {isUnlocked && unlockedAt && (
                  <span className="text-slate-500 text-[10px]">
                    {new Date(unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
