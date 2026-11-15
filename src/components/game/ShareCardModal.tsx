"use client";

import { useState } from "react";
import { X, Copy, Check, Share2, Sparkles, Zap, Award } from "lucide-react";
import { GameMetadata, GameResult } from "@/types/game";

interface ShareCardModalProps {
  meta: GameMetadata;
  result: GameResult;
  username: string;
  tier: string;
  onClose: () => void;
}

export function ShareCardModal({
  meta,
  result,
  username,
  tier,
  onClose,
}: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `⚡ REFLEX ARENA: ${meta.title}
🏆 Score: ${meta.formatScore(result.score)}
🎖️ Tier: ${tier}
👤 Player: ${username}
Think Fast. React Faster. Can you beat my score?
👉 ${typeof window !== "undefined" ? window.location.origin : ""}/games/${meta.id}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080B14]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Share2 className="w-4 h-4 text-[#00E5FF]" />
          <span>Share Arena Scorecard</span>
        </div>

        {/* Digital Scorecard Preview */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#080B14] via-[#111827] to-[#1E293B] border border-[#00E5FF]/40 shadow-[0_0_25px_rgba(0,229,255,0.15)] flex flex-col items-center text-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00E5FF]" />
            <span className="font-extrabold text-xs tracking-widest uppercase bg-gradient-to-r from-white to-[#00E5FF] bg-clip-text text-transparent">
              REFLEX ARENA
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase font-mono text-slate-400">{meta.title}</span>
            <span className="text-4xl font-black font-mono text-white text-glow-cyan mt-1">
              {meta.formatScore(result.score)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[11px] font-bold">
              {tier}
            </span>
            <span className="text-xs font-mono text-slate-400">@{username}</span>
          </div>

          <div className="w-full pt-3 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Verified Anti-Cheat</span>
            <span>think fast • react faster</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopyText}
          className="w-full py-3 rounded-xl bg-[#00E5FF] text-[#080B14] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#00E5FF]/90 transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied to Clipboard!" : "Copy Scorecard Link"}
        </button>
      </div>
    </div>
  );
}
