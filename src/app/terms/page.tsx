import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#00E5FF] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service</h1>
        <p className="text-xs font-mono text-slate-400">Effective Date: November 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">1. Fair Play & Anti-Cheat</h2>
          <p>
            Reflex Arena is a skill-based competitive benchmark platform. Using automated click scripts, memory modifiers, software macros, or artificial input simulation is strictly prohibited. Submissions violating biological limits (e.g. sub-90ms reactions or unnatural click distributions) will be disqualified from official global rankings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">2. Microtransactions & Subscriptions</h2>
          <p>
            Reflex Pro passes and cosmetic items (avatars, titles, soundpacks, frames) are non-refundable digital goods. Paid purchases are purely aesthetic and provide zero in-game score bonuses, latency adjustments, or competitive matchmaking advantages.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">3. Intellectual Property</h2>
          <p>
            All game audio synthesis routines, graphics, and codebase are the proprietary property of Reflex Arena.
          </p>
        </section>
      </div>
    </div>
  );
}
