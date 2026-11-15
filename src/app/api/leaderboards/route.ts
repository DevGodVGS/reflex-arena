import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { LeaderboardEntry } from "@/types/player";

// Seeded high-level arcade champions to ensure full, lively leaderboards out-of-the-box
const BOT_CHAMPIONS = [
  { name: "ApexSynapse", country: "IN", avatar: "avatar_godlike_emperor", title: "Zero Latency", isPro: true, tier: "Cyber God" },
  { name: "ValkyrieSpeed", country: "US", avatar: "avatar_quantum_ai", title: "Apex Predator", isPro: true, tier: "Master" },
  { name: "KuroShinobi", country: "JP", avatar: "avatar_phantom_ninja", title: "Speed Demon", isPro: false, tier: "Master" },
  { name: "CyberGamer99", country: "DE", avatar: "avatar_neon_cyber", title: "Reflex Rookie", isPro: false, tier: "Elite" },
  { name: "HyperNova", country: "KR", avatar: "avatar_quantum_ai", title: "Zero Latency", isPro: true, tier: "Elite" },
  { name: "QuantumLeap", country: "CA", avatar: "avatar_phantom_ninja", title: "Speed Demon", isPro: false, tier: "Challenger" },
  { name: "NeonStriker", country: "GB", avatar: "avatar_neon_cyber", title: "Reflex Rookie", isPro: false, tier: "Challenger" },
  { name: "VortexDrift", country: "BR", avatar: "avatar_neon_cyber", title: "Reflex Rookie", isPro: false, tier: "Rookie" },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = (searchParams.get("game") || "reaction-rush") as GameId;
    const scope = searchParams.get("scope") || "global"; // global, daily, weekly

    const gameMeta = GAMES[gameId] || GAMES["reaction-rush"];

    // Fetch scores from database
    const dbScores = await prisma.gameScore.findMany({
      where: {
        gameId: gameMeta.id,
        isRanked: true,
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: {
        score: gameMeta.higherIsBetter ? "desc" : "asc",
      },
      take: 20,
    });

    const entries: LeaderboardEntry[] = [];

    // Map real database scores if any
    dbScores.forEach((s, idx) => {
      const p = s.user.profile;
      entries.push({
        rank: idx + 1,
        playerId: s.userId,
        username: p?.username || s.user.name || "Anonymous",
        avatar: p?.avatar || "avatar_neon_cyber",
        frame: p?.frame || "frame_default",
        title: p?.title || "title_recruit",
        isPro: p?.isPro || false,
        score: s.score,
        formattedScore: gameMeta.formatScore(s.score),
        country: p?.country || "IN",
        achievedAt: s.achievedAt.getTime(),
      });
    });

    // If fewer than 8 entries, supplement with calibrated benchmark bots for rich competitive experience
    if (entries.length < 8) {
      const needed = 8 - entries.length;
      for (let i = 0; i < needed; i++) {
        const bot = BOT_CHAMPIONS[i % BOT_CHAMPIONS.length];
        let botScore = 0;

        if (gameMeta.higherIsBetter) {
          // Scale from benchmarkGodlike down to benchmarkGood
          botScore = Math.round(
            gameMeta.benchmarkGodlike * (1 - i * 0.08) - Math.random() * (gameMeta.benchmarkGood * 0.1)
          );
        } else {
          // Lower is better (reaction rush ms): 140ms, 155ms, 175ms...
          botScore = Math.round(
            gameMeta.benchmarkGodlike + i * 18 + Math.random() * 8
          );
        }

        entries.push({
          rank: entries.length + 1,
          playerId: `bot_${bot.name.toLowerCase()}`,
          username: bot.name,
          avatar: bot.avatar,
          title: bot.title,
          isPro: bot.isPro,
          score: botScore,
          formattedScore: gameMeta.formatScore(botScore),
          country: bot.country,
          achievedAt: Date.now() - (i + 1) * 3600000,
        });
      }
    }

    // Sort entries according to game rules
    entries.sort((a, b) => (gameMeta.higherIsBetter ? b.score - a.score : a.score - b.score));

    // Re-assign ranks
    entries.forEach((e, i) => {
      e.rank = i + 1;
    });

    return NextResponse.json({
      gameId: gameMeta.id,
      gameTitle: gameMeta.title,
      scope,
      entries,
      totalCount: entries.length,
    });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
