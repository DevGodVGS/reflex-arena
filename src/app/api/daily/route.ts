import { NextResponse } from "next/server";
import { GAME_LIST } from "@/lib/constants/games";

export async function GET() {
  const now = new Date();
  const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Deterministic daily game selection based on date string hash
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const gameIndex = Math.abs(hash) % GAME_LIST.length;
  const game = GAME_LIST[gameIndex];

  // Calculate midnight UTC remaining milliseconds
  const tomorrowMidnight = new Date();
  tomorrowMidnight.setUTCHours(24, 0, 0, 0);
  const msRemaining = Math.max(0, tomorrowMidnight.getTime() - now.getTime());

  return NextResponse.json({
    dateString,
    gameId: game.id,
    gameTitle: game.title,
    tagline: game.tagline,
    specialRulesDescription: "Daily Arena Seed #2026. Ranked submissions are strictly validated. Only your primary attempt qualifies for global daily standings.",
    seed: Math.abs(hash),
    msRemaining,
    multiplier: 1.5,
  });
}
