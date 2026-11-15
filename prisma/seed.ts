import { prisma } from "../src/lib/db/prisma";
import { GAME_LIST } from "../src/lib/constants/games";
import { ACHIEVEMENTS } from "../src/lib/constants/achievements";
import { COSMETIC_ITEMS } from "../src/lib/constants/cosmetics";

async function main() {
  console.log("Seeding Reflex Arena database...");

  // 1. Seed Games
  for (const g of GAME_LIST) {
    await prisma.game.upsert({
      where: { id: g.id },
      update: {
        title: g.title,
        category: g.category,
        description: g.description,
        higherIsBetter: g.higherIsBetter,
        scoreUnit: g.scoreUnit,
        benchmarkGood: g.benchmarkGood,
        benchmarkPro: g.benchmarkPro,
        benchmarkGodlike: g.benchmarkGodlike,
      },
      create: {
        id: g.id,
        title: g.title,
        category: g.category,
        description: g.description,
        higherIsBetter: g.higherIsBetter,
        scoreUnit: g.scoreUnit,
        benchmarkGood: g.benchmarkGood,
        benchmarkPro: g.benchmarkPro,
        benchmarkGodlike: g.benchmarkGodlike,
      },
    });
  }
  console.log(`✓ Seeded ${GAME_LIST.length} Games.`);

  // 2. Seed Achievements
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        description: a.description,
        category: a.category,
        icon: a.icon,
        xpReward: a.xpReward,
        coinsReward: a.coinsReward,
      },
      create: {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        icon: a.icon,
        xpReward: a.xpReward,
        coinsReward: a.coinsReward,
      },
    });
  }
  console.log(`✓ Seeded ${ACHIEVEMENTS.length} Achievements.`);

  // 3. Seed Cosmetics
  for (const c of COSMETIC_ITEMS) {
    await prisma.cosmeticItem.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        description: c.description,
        category: c.category,
        priceCoins: c.priceCoins,
        isPremiumOnly: c.isPremiumOnly,
        rarity: c.rarity,
      },
      create: {
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        priceCoins: c.priceCoins,
        isPremiumOnly: c.isPremiumOnly,
        rarity: c.rarity,
      },
    });
  }
  console.log(`✓ Seeded ${COSMETIC_ITEMS.length} Cosmetic Items.`);

  console.log("Reflex Arena seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
