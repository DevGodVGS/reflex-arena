"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Zap,
  Trophy,
  Flame,
  ShoppingBag,
  User,
  Volume2,
  VolumeX,
  Menu,
  X,
  Crown,
  Sparkles,
  BarChart2,
  Swords,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, soundSettings, setSoundMuted } = usePlayerStore();

  const navLinks = [
    { href: "/games", label: "Games", icon: Zap },
    { href: "/daily", label: "Daily Arena", icon: Flame, badge: "LIVE" },
    { href: "/leaderboard", label: "Rankings", icon: Trophy },
    { href: "/challenge", label: "Versus", icon: Swords },
    { href: "/stats", label: "Stats", icon: BarChart2 },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E293B] bg-[#080B14]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] p-[1.5px] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#080B14] rounded-[7px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#00E5FF] fill-[#00E5FF]/20 transition-transform group-hover:rotate-12" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-base sm:text-lg bg-gradient-to-r from-white via-slate-100 to-[#00E5FF] bg-clip-text text-transparent">
                REFLEX<span className="text-[#00E5FF]">ARENA</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono -mt-1 hidden sm:block">
                Think Fast. React Faster.
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "text-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F59E0B] text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Sound, Coins, Pro & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundMuted(!soundSettings.isMuted)}
            title={soundSettings.isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {soundSettings.isMuted ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#00E5FF]" />
            )}
          </button>

          {/* Coins Pill */}
          <Link
            href="/shop"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111827] border border-[#1E293B] hover:border-[#00E5FF]/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {profile.coins.toLocaleString()}
            </span>
          </Link>

          {/* Pro Pill / Upgrade */}
          <Link
            href="/subscription"
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
              profile.isPro
                ? "bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300"
                : "bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-[#080B14] hover:opacity-90 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            )}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{profile.isPro ? "PRO PASS" : "GET PRO"}</span>
          </Link>

          {/* Profile Pill */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 pl-2 rounded-full bg-[#111827] border border-[#1E293B] hover:border-[#8B5CF6]/50 transition-colors"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 leading-none">
                {profile.username}
              </span>
              <span className="text-[10px] font-mono text-[#00E5FF] leading-tight">
                LVL {profile.level}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#00E5FF] flex items-center justify-center text-xs font-bold text-[#080B14]">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E293B] bg-[#080B14]/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30"
                    : "text-slate-300 hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F59E0B] text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#1E293B] flex flex-col gap-2">
            <Link
              href="/subscription"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-[#080B14] font-bold text-xs"
            >
              <Crown className="w-4 h-4" />
              <span>{profile.isPro ? "PRO PASS ACTIVE" : "UPGRADE TO PRO — ₹99/mo"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
