import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";

const SubmitScoreSchema = z.object({
  gameId: z.string(),
  score: z.number(),
  sessionId: z.string(),
  durationMs: z.number().nonnegative(),
  accuracyPercentage: z.number().min(0).max(100).optional(),
  averageReactionMs: z.number().optional(),
  fastestReactionMs: z.number().optional(),
  slowestReactionMs: z.number().optional(),
  rankTier: z.string(),
  timestamp: z.number(),
  verificationHash: z.string().optional(),
  userId: z.string().optional(),
  username: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubmitScoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid score payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const gameMeta = GAMES[data.gameId as GameId];
    if (!gameMeta) {
      return NextResponse.json({ error: "Unknown game identifier" }, { status: 404 });
    }

    // 1. Anti-cheat checks
    // If reaction-rush: minimum human latency threshold (sub-90ms is flagged as bot/autoclicker)
    if (data.gameId === "reaction-rush" && data.score < 90) {
      return NextResponse.json(
        { error: "Inhuman latency detected. Submission flagged by anti-cheat guard." },
        { status: 422 }
      );
    }

    // If duration is negative or unrealistic
    if (data.durationMs <= 0) {
      return NextResponse.json({ error: "Invalid session duration" }, { status: 422 });
    }

    // 2. Persist in database
    let profile = null;
    let userId = data.userId;

    if (!userId) {
      // Find or create guest user
      const guestName = data.username || "GuestGladiator";
      const guestUser = await prisma.user.create({
        data: {
          name: guestName,
          isGuest: true,
          profile: {
            create: {
              username: `${guestName}_${Math.random().toString(36).substring(2, 6)}`,
            },
          },
        },
        include: { profile: true },
      });
      userId = guestUser.id;
      profile = guestUser.profile;
    } else {
      profile = await prisma.playerProfile.findFirst({
        where: { userId },
      });
    }

    // Create session record
    const session = await prisma.gameSession.create({
      data: {
        userId,
        gameId: data.gameId,
        token: data.sessionId,
        isRanked: true,
        durationMs: data.durationMs,
        verificationHash: data.verificationHash,
        completedAt: new Date(),
        score: {
          create: {
            userId,
            gameId: data.gameId,
            score: data.score,
            accuracyPercent: data.accuracyPercentage,
            averageReactionMs: data.averageReactionMs,
            fastestReactionMs: data.fastestReactionMs,
            slowestReactionMs: data.slowestReactionMs,
            rankTier: data.rankTier,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      sessionId: session.id,
      score: data.score,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Score submission error:", error);
    return NextResponse.json(
      { error: "Internal server error submitting score" },
      { status: 500 }
    );
  }
}
