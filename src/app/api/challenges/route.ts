import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, creatorName, creatorScore, creatorId } = body;

    if (!gameId || creatorScore === undefined) {
      return NextResponse.json({ error: "Missing challenge parameters" }, { status: 400 });
    }

    const token = `ch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const seed = Math.floor(Math.random() * 100000);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // If database user exists or create a transient guest user
    let user = null;
    if (creatorId) {
      user = await prisma.user.findUnique({ where: { id: creatorId } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: creatorName || "Player",
          isGuest: true,
        },
      });
    }

    const challenge = await prisma.challenge.create({
      data: {
        token,
        gameId,
        creatorId: user.id,
        creatorScore: Number(creatorScore),
        seed,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      token: challenge.token,
      challengeUrl: `/challenge/${challenge.token}`,
    });
  } catch (error) {
    console.error("Challenge creation error:", error);
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { token },
      include: {
        creator: {
          include: { profile: true },
        },
        attempts: {
          include: { user: { include: { profile: true } } },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    return NextResponse.json({
      challenge: {
        token: challenge.token,
        gameId: challenge.gameId,
        creatorName: challenge.creator.profile?.username || challenge.creator.name || "Challenger",
        creatorScore: challenge.creatorScore,
        createdAt: challenge.createdAt,
        expiresAt: challenge.expiresAt,
        status: challenge.status,
        attempts: challenge.attempts.map((a) => ({
          username: a.user.profile?.username || a.user.name || "Opponent",
          score: a.score,
          isWinner: a.isWinner,
          attemptedAt: a.attemptedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Fetch challenge error:", error);
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 });
  }
}
