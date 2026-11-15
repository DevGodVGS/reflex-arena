import { MetadataRoute } from "next";
import { GAME_LIST } from "@/lib/constants/games";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://reflexarena.gg";

  const staticPages = [
    "",
    "/games",
    "/daily",
    "/leaderboard",
    "/challenge",
    "/stats",
    "/achievements",
    "/shop",
    "/subscription",
    "/settings",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const gamePages = GAME_LIST.map((game) => ({
    url: `${baseUrl}/games/${game.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...gamePages];
}
