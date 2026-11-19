"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Home,
  Share2,
  Sparkles,
  Swords,
  Zap,
  Clock,
  Crosshair,
  Award,
  CheckCircle2,
  CloudOff,
  Loader2,
} from "lucide-react";
import { GameMetadata, GameResult } from "@/types/game";
import { usePlayerStore } from "@/lib/store/playerStore";
import { cn } from "@/lib/utils";
import { ShareCardModal } from "./ShareCardModal";
import { buildScorePayload, submitScore, flushPendingScores } from "@/lib/services/scoreSubmission";

interface ResultsModalProps {
  meta: GameMetadata;
  result: GameResult;
  onRestart: () => void;
}

export function ResultsModal({ meta, result, onRestart }: ResultsModalProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "submitting" | "synced" | "queued" | "failed"
  >("idle");

  const { recordGameResult, profile } = usePlayerStore();
  const [sessionProgression, setSessionProgression] = useState<{
    isNewPb: boolean;
    unlockedAchievements: { id: string; title: string; description: string }[];
    leveledUp: boolean;
    newLevel: number;
  } | null>(null);

  useEffect(() => {
    // Record score in player store
    const prog = recordGameResult(result);
    setSessionProgression(prog);

    // Asynchronously dispatch score to backend persistence API
    const payload = buildScorePayload(result, profile);
    setSubmissionStatus("submitting");
    submitScore(payload)
      .then((res) => {
        if (res.success) {
          setSubmissionStatus("synced");
        } else if (res.queued) {
          setSubmissionStatus("queued");
        } else {
          setSubmissionStatus("failed");
        }
      })
      .catch(() => {
        setSubmissionStatus("failed");
      });

    // Fire victory confetti if personal best or high tier
    if (prog.isNewPb || result.rankTier === "Cyber God" || result.rankTier === "Master") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00E5FF", "#8B5CF6", "#22C55E", "#F59E0B"],
      });
    }

    const handleOnline = () => {
      flushPendingScores()
        .then((count) => {
          if (count > 0) {
            setSubmissionStatus("synced");
          }
        })
        .catch(() => {});
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [result, recordGameResult, profile]);

  const tierColors: Record<string, { bg: string; text: string; border: string }> = {
    "Cyber God": { bg: "bg-gradient-to-r from-amber-500/20 to-cyan-500/20", text: "text-amber-300", border: "border-amber-400" },
    "Master": { bg: "bg-purple-900/40", text: "text-purple-300", border: "border-purple-500" },
    "Elite": { bg: "bg-cyan-950/40", text: "text-[#00E5FF]", border: "border-[#00E5FF]/60" },
    "Challenger": { bg: "bg-blue-950/40", text: "text-blue-300", border: "border-blue-500/50" },
    "Rookie": { bg: "bg-slate-800/60", text: "text-slate-300", border: "border-slate-600" },
    "Recruit": { bg: "bg-slate-900/60", text: "text-slate-400", border: "border-slate-700" },
  };

  const activeTier = tierColors[result.rankTier] || tierColors["Rookie"];

  const handleCreateChallenge = () => {
    const challengeUrl = `${window.location.origin}/challenge?game=${result.gameId}&target=${result.score}&challenger=${encodeURIComponent(profile.username)}`;
    navigator.clipboard.writeText(challengeUrl);
    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080B14]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#111827] border border-[#1E293B] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center gap-1">
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
            {meta.title} — Session Complete
          </span>

          {sessionProgression?.isNewPb && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/50 text-amber-300 text-xs font-black tracking-widest uppercase animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              NEW PERSONAL BEST!
            </div>
          )}

          {/* Large Score Display */}
          <div className="mt-2 flex flex-col items-center">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#00E5FF] bg-clip-text text-transparent">
              {meta.formatScore(result.score)}
            </span>
          </div>

          {/* Performance Tier Pill */}
          <div
            className={cn(
              "mt-2 px-4 py-1 rounded-full border text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md",
              activeTier.bg,
              activeTier.text,
              activeTier.border
            )}
          >
            <Award className="w-4 h-4" />
            <span>Reflex Tier: {result.rankTier}</span>
          </div>

          {/* Cloud Sync / Leaderboard Status */}
          <div className="mt-1 flex items-center justify-center min-h-[1.25rem]">
            {submissionStatus === "submitting" && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Syncing to Leaderboard...
              </span>
            )}
            {submissionStatus === "synced" && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Score Verified & Saved to Leaderboard
              </span>
            )}
            {submissionStatus === "queued" && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
                <CloudOff className="w-3.5 h-3.5" />
                Offline: Saved Locally (Queued for Sync)
              </span>
            )}
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {result.averageReactionMs !== undefined && (
            <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B] flex flex-col items-center text-center">
              <Clock className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-[10px] uppercase font-mono text-slate-400">Avg Reaction</span>
              <span className="text-base font-bold font-mono text-white">
                {Math.round(result.averageReactionMs)} ms
              </span>
            </div>
          )}

          {result.fastestReactionMs !== undefined && (
            <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B] flex flex-col items-center text-center">
              <Zap className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[10px] uppercase font-mono text-slate-400">Fastest Round</span>
              <span className="text-base font-bold font-mono text-emerald-300">
                {Math.round(result.fastestReactionMs)} ms
              </span>
            </div>
          )}

          {result.accuracyPercentage !== undefined && (
            <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B] flex flex-col items-center text-center">
              <Crosshair className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-[10px] uppercase font-mono text-slate-400">Accuracy</span>
              <span className="text-base font-bold font-mono text-purple-300">
                {result.accuracyPercentage}%
              </span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B] flex flex-col items-center text-center">
            <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-mono text-slate-400">XP Earned</span>
            <span className="text-base font-bold font-mono text-amber-300">
              +{result.xpEarned} XP
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B] flex flex-col items-center text-center">
            <Sparkles className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] uppercase font-mono text-slate-400">Coins</span>
            <span className="text-base font-bold font-mono text-[#00E5FF]">
              +{result.coinsEarned}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#080B14]/80 border border-[#1E293B] flex flex-col items-center text-center">
            <Trophy className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-[10px] uppercase font-mono text-slate-400">Ranked Status</span>
            <span className="text-base font-bold font-mono text-indigo-300">
              Verified
            </span>
          </div>
        </div>

        {/* Level Up Banner */}
        {sessionProgression?.leveledUp && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/60 to-cyan-900/60 border border-cyan-400/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <div>
                <span className="text-xs font-bold text-white block">LEVEL UP!</span>
                <span className="text-[11px] text-cyan-200">
                  You are now Level {sessionProgression.newLevel}! (+150 Coins bonus)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Unlocked Achievements */}
        {sessionProgression && sessionProgression.unlockedAchievements.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400 block">
              Achievements Unlocked ({sessionProgression.unlockedAchievements.length})
            </span>
            <div className="space-y-1.5">
              {sessionProgression.unlockedAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-2.5 rounded-lg bg-[#080B14] border border-amber-500/30 flex items-center gap-3"
                >
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-white block">{ach.title}</span>
                    <span className="text-[11px] text-slate-400">{ach.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            Play Again
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setShowShareModal(true)}
              className="py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Share2 className="w-4 h-4 text-[#00E5FF]" />
              Share Scorecard
            </button>

            <button
              onClick={handleCreateChallenge}
              className="py-2.5 px-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Swords className="w-4 h-4 text-purple-400" />
              {challengeCopied ? "Link Copied!" : "Challenge Friend"}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] text-xs text-slate-400">
            <Link
              href={`/leaderboard?game=${result.gameId}`}
              className="hover:text-[#00E5FF] flex items-center gap-1 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              View Game Leaderboard
            </Link>

            <Link
              href="/games"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              All Games
            </Link>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareCardModal
          meta={meta}
          result={result}
          username={profile.username}
          tier={result.rankTier}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
