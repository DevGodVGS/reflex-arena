"use client";

import { useState } from "react";
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  Shield,
  Award,
  ArrowRight,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const { profile, upgradeToPro } = usePlayerStore();

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeToPro();
      setIsProcessing(false);
      setSuccessMessage(true);
    }, 1200);
  };

  const proFeatures = [
    "100% Ad-Free uninterrupted gameplay",
    "Sub-millisecond latency distribution charts",
    "Exclusive Legendary Golden Frame & Crown badge",
    "Special soundpacks (80s Retro Synthwave)",
    "Instant +1,000 Arena Coins bonus drop",
    "Priority leaderboard verification badge",
    "Private friend tournament lobbies",
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5" />
          REFLEX ARENA PRO MEMBERSHIP
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Supercharge Your Performance
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Zero ads. Deep telemetry analytics. Exclusive tournament cosmetics. Competitive fairness is guaranteed — paid subscriptions never buy score advantages.
        </p>

        {/* Billing Toggle (Monthly vs Annual) */}
        <div className="pt-4 flex items-center justify-center">
          <div className="p-1 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                billingPeriod === "monthly"
                  ? "bg-[#080B14] text-[#00E5FF] shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                billingPeriod === "annual"
                  ? "bg-[#080B14] text-amber-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <span>Annual Pass</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Save 33%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards (Free vs Pro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-8 flex flex-col justify-between gap-8">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-mono text-slate-400 font-bold block">
                Standard Tier
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Gladiator (Free)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Full access to all 10 arcade disciplines and guest leaderboard rankings.
              </p>
            </div>

            <div className="text-3xl font-black font-mono text-white">
              ₹0 <span className="text-xs font-sans text-slate-500 font-normal">/ forever</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#1E293B] text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Play all 10 independent mini-games</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Daily Arena global challenge participation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Shareable 1v1 friend challenge links</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personal best saving in local storage</span>
              </div>
            </div>
          </div>

          <div className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold text-center">
            Active By Default
          </div>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className="rounded-3xl bg-gradient-to-br from-[#111827] via-[#0D1322] to-amber-950/30 border-2 border-amber-400/60 p-8 flex flex-col justify-between gap-8 relative shadow-[0_0_35px_rgba(245,158,11,0.2)]">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-sm">
              RECOMMENDED
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-mono text-amber-400 font-bold block">
                Competitive Tier
              </span>
              <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                Reflex Pro Pass
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                For serious esports competitors and reflex perfectionists.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-white">
                {billingPeriod === "monthly" ? "₹99" : "₹799"}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {billingPeriod === "monthly" ? "/ month" : "/ year (₹66/mo)"}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#1E293B] text-xs text-slate-200">
              {proFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {profile.isPro ? (
            <div className="w-full py-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider text-center">
              PRO PASS ACTIVE
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? "Processing Activation..." : "Upgrade to Pro Now"}
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
