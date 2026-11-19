import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { generateVerificationHash, validateScoreBounds } from "@/lib/game-engine/scoring";

const SubmitScoreSchema = z.object({
  gameId: z.string(),
  score: z.number(),
  sessionId: z.string(),
  durationMs: z.number().positive("Duration must be positive"),
  accuracyPercentage: z.number().min(0).max(100).optional(),
  averageReactionMs: z.number().optional(),
  fastestReactionMs: z.number().optional(),
  slowestReactionMs: z.number().optional(),
  rankTier: z.string(),
  timestamp: z.number(),
  verificationHash: z.string().min(1, "Verification hash is required"),
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

    // 1. Anti-cheat signature verification
    const expectedHash = generateVerificationHash(
      data.gameId as GameId,
      data.score,
      data.durationMs,
      data.timestamp
    );

    if (data.verificationHash !== expectedHash) {
      return NextResponse.json(
        { error: "Anti-cheat verification failed: invalid signature hash" },
        { status: 403 }
      );
    }

    // 2. Timestamp clock skew verification (max 5 minutes window)
    const now = Date.now();
    const maxClockSkewMs = 5 * 60 * 1000;
    if (Math.abs(now - data.timestamp) > maxClockSkewMs) {
      return NextResponse.json(
        { error: "Anti-cheat verification failed: session timestamp expired or out of bounds" },
        { status: 422 }
      );
    }

    // 3. Game bounds & biological sanity checks across all mini-games
    const boundsCheck = validateScoreBounds(data.gameId as GameId, data.score, data.durationMs);
    if (!boundsCheck.valid) {
      return NextResponse.json(
        { error: `Anti-cheat guard triggered: ${boundsCheck.reason}` },
        { status: 422 }
      );
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
