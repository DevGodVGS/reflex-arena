"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Swords,
  Share2,
  Copy,
  Check,
  Play,
  Trophy,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { GAMES, GAME_LIST } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";

function ChallengeContent() {
  const searchParams = useSearchParams();
  const challengeGame = (searchParams.get("game") as GameId) || null;
  const challengeTarget = searchParams.get("target") ? Number(searchParams.get("target")) : null;
  const challengerName = searchParams.get("challenger") || null;

  const { profile } = usePlayerStore();

  const [selectedGame, setSelectedGame] = useState<GameId>(challengeGame || "reaction-rush");
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const activeGameMeta = GAMES[selectedGame];
  const playerPb = profile.personalBests[selectedGame];

  const handleGenerateChallenge = async () => {
    const scoreToChallenge = playerPb ? playerPb.bestScore : (activeGameMeta.higherIsBetter ? 15000 : 220);
    const generated = `${window.location.origin}/challenge?game=${selectedGame}&target=${scoreToChallenge}&challenger=${encodeURIComponent(profile.username)}`;
    setCreatedUrl(generated);

    // Also attempt server sync
    fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: selectedGame,
        creatorName: profile.username,
        creatorScore: scoreToChallenge,
        creatorId: profile.id,
      }),
    }).catch(() => {});
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-purple-400">
            <Swords className="w-4 h-4" />
            1v1 ASYNCHRONOUS VERSUS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            Friend Challenges
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Settle scores head-to-head. Generate a verified challenge link, send it via WhatsApp, Discord, or X, and see who dominates.
          </p>
        </div>
      </div>

      {/* Incoming Challenge Alert (If arrived from a friend's link) */}
      {challengerName && challengeTarget !== null && challengeGame && (
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#111827] to-cyan-950/60 border-2 border-purple-500/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_35px_rgba(139,92,246,0.25)]">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-[#00E5FF] p-[2px] shrink-0">
              <div className="w-full h-full bg-[#080B14] rounded-[14px] flex items-center justify-center">
                <Swords className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div>
              <span className="text-xs uppercase font-mono text-purple-400 font-bold tracking-wider">
                INCOMING CHALLENGE FROM @{challengerName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Can you beat {GAMES[challengeGame]?.formatScore(challengeTarget)} in {GAMES[challengeGame]?.title}?
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Your opponent set this score and threw down the gauntlet.
              </p>
            </div>
          </div>

          <Link
            href={`/games/${challengeGame}?mode=challenge&target=${challengeTarget}`}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            Accept Challenge & Play
          </Link>
        </div>
      )}

      {/* Create a New Challenge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Creator Config Card */}
        <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" />
            <span>Create New Challenge Link</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-400 block">
              1. Select Mini-Game
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value as GameId)}
              className="w-full p-3 rounded-xl bg-[#080B14] border border-[#1E293B] text-white text-sm font-bold focus:border-[#00E5FF] focus:outline-none"
            >
              {GAME_LIST.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.category})
                </option>
              ))}
            </select>
          </div>

          {/* Current Player Record Preview */}
          <div className="p-4 rounded-2xl bg-[#080B14] border border-[#1E293B] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono text-slate-400">
                Your Personal Best
              </span>
              <span className="text-xl font-mono font-black text-white mt-0.5">
                {playerPb ? activeGameMeta.formatScore(playerPb.bestScore) : "Unplayed (Will use default benchmark)"}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <button
            onClick={handleGenerateChallenge}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-[#00E5FF] text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            Generate Shareable Challenge URL
          </button>

          {/* Output URL Box */}
          {createdUrl && (
            <div className="p-4 rounded-2xl bg-[#080B14] border border-[#00E5FF]/40 space-y-2 animate-in fade-in duration-200">
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold block">
                Challenge Link Ready to Send:
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={createdUrl}
                  className="w-full px-3 py-2 rounded-lg bg-[#111827] text-xs font-mono text-slate-300 border border-[#1E293B] select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg bg-[#00E5FF] text-[#080B14] font-bold text-xs flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How It Works Explainer */}
        <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Verified Asynchronous Rules
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#080B14] border border-[#1E293B] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <p>
                  <strong>Set your score:</strong> Play any game to establish your target benchmark score.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080B14] border border-[#1E293B] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-[#00E5FF] font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <p>
                  <strong>Send link to anyone:</strong> Your opponent does not need an account. They can play directly as a guest on desktop or mobile.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080B14] border border-[#1E293B] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <p>
                  <strong>Head-to-head comparison:</strong> The platform analyzes both reaction times and scores to declare an official victor.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#080B14] border border-[#1E293B] text-[11px] font-mono text-slate-500 text-center">
            Zero-Trust Token Integrity Engine v1.0
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FriendChallengePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-mono">Loading Arena Versus...</div>}>
      <ChallengeContent />
    </Suspense>
  );
}
