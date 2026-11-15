"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Crown,
  Check,
  Lock,
  Volume2,
  MousePointer,
  Square,
  User,
  Zap,
} from "lucide-react";
import { COSMETIC_ITEMS } from "@/lib/constants/cosmetics";
import { usePlayerStore } from "@/lib/store/playerStore";
import { CosmeticItem } from "@/types/player";
import { cn, formatNumber } from "@/lib/utils";

export default function CosmeticShopPage() {
  const { profile, buyCosmetic, equipCosmetic } = usePlayerStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const categories = [
    { id: "all", label: "All Items" },
    { id: "avatar", label: "Avatars" },
    { id: "frame", label: "Profile Frames" },
    { id: "title", label: "Titles" },
    { id: "soundpack", label: "Sound Packs" },
    { id: "cursor", label: "Cursor Trails" },
  ];

  const filtered = COSMETIC_ITEMS.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const handleBuy = (item: CosmeticItem) => {
    const res = buyCosmetic(item.id);
    if (res.success) {
      setStatusMessage({ text: `Purchased ${item.name}! You can now equip it.` });
    } else {
      setStatusMessage({ text: res.error || "Purchase failed", isError: true });
    }
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleEquip = (item: CosmeticItem) => {
    equipCosmetic(item.category as "avatar" | "frame" | "title" | "soundpack" | "cursor", item.id);
    setStatusMessage({ text: `Equipped ${item.name}!` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const isEquipped = (item: CosmeticItem) => {
    if (item.category === "avatar") return profile.avatar === item.id;
    if (item.category === "frame") return profile.frame === item.id;
    if (item.category === "title") return profile.title === item.id;
    if (item.category === "soundpack") return profile.soundpack === item.id;
    if (item.category === "cursor") return profile.cursorEffect === item.id;
    return false;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00E5FF]">
            <ShoppingBag className="w-4 h-4" />
            CYBERNETIC ARSENAL
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Cosmetic Marketplace
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Customize your gladiator persona with holographic frames, reactive sound packs, and cursor trails. Cosmetics provide zero competitive advantages.
          </p>
        </div>

        {/* Player Coin Balance */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Your Arena Balance</span>
            <span className="text-2xl font-mono font-black text-amber-300">
              {formatNumber(profile.coins)} Coins
            </span>
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={cn(
            "p-3.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in duration-150",
            statusMessage.isError
              ? "bg-rose-950/80 border-rose-500 text-rose-300"
              : "bg-emerald-950/80 border-emerald-500 text-emerald-300"
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedCategory === cat.id
                ? "bg-[#00E5FF] text-[#080B14] shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                : "bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const isOwned = profile.inventory.includes(item.id);
          const equipped = isEquipped(item);

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-2xl bg-[#111827] border p-6 flex flex-col justify-between gap-5 relative overflow-hidden transition-all",
                equipped
                  ? "border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                  : "border-[#1E293B] hover:border-slate-700"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border",
                      item.rarity === "legendary"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : item.rarity === "epic"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : item.rarity === "rare"
                        ? "bg-cyan-500/20 text-[#00E5FF] border-cyan-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    )}
                  >
                    {item.rarity}
                  </span>

                  {item.isPremiumOnly && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      <Crown className="w-3 h-3" />
                      PRO EXCLUSIVE
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Price / Equip CTA */}
              <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Cost</span>
                  <span className="text-sm font-mono font-bold text-amber-300">
                    {item.priceCoins === 0 ? "FREE" : `${formatNumber(item.priceCoins)} Coins`}
                  </span>
                </div>

                {isOwned ? (
                  equipped ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Equipped
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(item)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                    >
                      Equip
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={item.isPremiumOnly && !profile.isPro}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {item.isPremiumOnly && !profile.isPro ? "Requires Pro" : "Buy Item"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
