import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GAMES } from "@/lib/constants/games";
import { GameId } from "@/types/game";
import { ReactionRushGame } from "@/components/games/ReactionRushGame";
import { TargetStrikeGame } from "@/components/games/TargetStrikeGame";
import { PerfectTimingGame } from "@/components/games/PerfectTimingGame";
import { ColorPanicGame } from "@/components/games/ColorPanicGame";
import { MemoryFlashGame } from "@/components/games/MemoryFlashGame";
import { QuickDecisionGame } from "@/components/games/QuickDecisionGame";
import { DodgeMasterGame } from "@/components/games/DodgeMasterGame";
import { TapFrenzyGame } from "@/components/games/TapFrenzyGame";
import { FlashGridGame } from "@/components/games/FlashGridGame";
import { LastSecondGame } from "@/components/games/LastSecondGame";

interface PageProps {
  params: Promise<{
    gameId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = GAMES[gameId as GameId];
  if (!game) return { title: "Game Not Found — Reflex Arena" };

  return {
    title: `${game.title} — Reflex Arena`,
    description: game.description,
  };
}

export default async function GamePlayPage({ params }: PageProps) {
  const { gameId } = await params;
  const game = GAMES[gameId as GameId];

  if (!game) {
    notFound();
  }

  const renderGame = () => {
    switch (gameId) {
      case "reaction-rush":
        return <ReactionRushGame />;
      case "target-strike":
        return <TargetStrikeGame />;
      case "perfect-timing":
        return <PerfectTimingGame />;
      case "color-panic":
        return <ColorPanicGame />;
      case "memory-flash":
        return <MemoryFlashGame />;
      case "quick-decision":
        return <QuickDecisionGame />;
      case "dodge-master":
        return <DodgeMasterGame />;
      case "tap-frenzy":
        return <TapFrenzyGame />;
      case "flash-grid":
        return <FlashGridGame />;
      case "last-second":
        return <LastSecondGame />;
      default:
        return notFound();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col items-center">
      {renderGame()}
    </div>
  );
}
