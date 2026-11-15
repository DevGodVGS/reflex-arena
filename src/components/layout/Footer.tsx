import Link from "next/link";
import { Zap, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#1E293B] bg-[#080B14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00E5FF]" />
            <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white to-[#00E5FF] bg-clip-text text-transparent">
              REFLEX ARENA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Think Fast. React Faster. The premier browser arcade competitive ecosystem.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <Link href="/games" className="hover:text-[#00E5FF] transition-colors">
            All 10 Games
          </Link>
          <Link href="/daily" className="hover:text-[#00E5FF] transition-colors">
            Daily Arena
          </Link>
          <Link href="/leaderboard" className="hover:text-[#00E5FF] transition-colors">
            Global Leaderboards
          </Link>
          <Link href="/achievements" className="hover:text-[#00E5FF] transition-colors">
            Achievements
          </Link>
          <Link href="/privacy" className="hover:text-[#00E5FF] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#00E5FF] transition-colors">
            Terms of Service
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <Shield className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Anti-Cheat Verified Engine v2.4</span>
        </div>
      </div>
    </footer>
  );
}
