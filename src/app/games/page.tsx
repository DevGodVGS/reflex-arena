"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Target,
  Crosshair,
  Palette,
  Brain,
  HelpCircle,
  ShieldAlert,
  Flame,
  LayoutGrid,
  Clock,
  Sparkles,
  Trophy,
  Search,
} from "lucide-react";
import { GAME_LIST } from "@/lib/constants/games";
import { GameCategory, GameId } from "@/types/game";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Zap,
  Target,
  Crosshair,
  Palette,
  Brain,
  HelpCircle,
  ShieldAlert,
  Flame,
  LayoutGrid,
  Clock,
};

export default function GamesDiscoveryPage() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | GameCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = usePlayerStore();

  const categories = [
    { id: "all", label: "All Mini-Games" },
    { id: "reflex", label: "Twitch Reflex" },
    { id: "precision", label: "Micro Precision" },
    { id: "cognitive", label: "Cognitive Neural" },
    { id: "speed", label: "Motor Speed" },
  ];

  const filteredGames = GAME_LIST.filter((game) => {
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00E5FF]">
            <Sparkles className="w-4 h-4" />
            ARCADE ROSTER • 10 DISCIPLINES
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Game Discovery
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Choose your proving ground. Calibrate twitch reflexes, cognitive speed, and sub-second precision.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search game disciplines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#111827] border border-[#1E293B] focus:border-[#00E5FF] focus:outline-none text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as "all" | GameCategory)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200",
              selectedCategory === cat.id
                ? "bg-[#00E5FF] text-[#080B14] shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                : "bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const IconComponent = ICONS[game.icon] || Zap;
          const personalBest = profile.personalBests[game.id];

          return (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#00E5FF]/60 hover:shadow-[0_0_25px_rgba(0,229,255,0.15)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative p-6"
            >
              {/* Top ambient hover accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full blur-2xl group-hover:bg-[#00E5FF]/15 transition-all pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    style={{ borderColor: `${game.accentColor}40` }}
                    className="w-12 h-12 rounded-xl bg-[#080B14] border flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
                  >
                    <IconComponent
                      style={{ color: game.accentColor }}
                      className="w-6 h-6"
                    />
                  </div>

                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded bg-[#080B14] text-slate-400 border border-[#1E293B]">
                    {game.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {game.tagline}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Bottom: Personal Best & Play Button */}
              <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Personal Best
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {personalBest ? game.formatScore(personalBest.bestScore) : "—"}
                  </span>
                </div>

                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-xs uppercase tracking-wider group-hover:brightness-110 shadow-sm transition-all">
                  Play
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
