import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const levels = JSON.parse(fs.readFileSync("prisma/levels.json", "utf-8"));

  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: {
        name: level.name,
        imageUrl: level.imageUrl,
        // To avoid duplicates, optionally delete old children before creating new ones:
        characters: {
          deleteMany: {},
          create: level.characters.map((c) => ({
            name: c.name,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
          })),
        },
        scores: {
          deleteMany: {},
          create: level.scores.map((s) => ({
            player: s.player,
            time: s.time,
            createdAt: new Date(s.createdAt),
          })),
        },
      },
      create: {
        id: level.id,
        name: level.name,
        imageUrl: level.imageUrl,
        characters: {
          create: level.characters.map((c) => ({
            name: c.name,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
          })),
        },
        scores: {
          create: level.scores.map((s) => ({
            player: s.player,
            time: s.time,
            createdAt: new Date(s.createdAt),
          })),
        },
      },
    });

    console.log(`Seeded level ${level.id}`);
  }

  const completionScores = JSON.parse(
    fs.readFileSync("prisma/completionScores.json", "utf-8")
  );

  for (const score of completionScores) {
    await prisma.completionScore.upsert({
      where: { id: score.id }, // Assuming your JSON includes `id`, else use a unique field or skip upsert
      update: {
        playerName: score.playerName,
        totalTime: score.totalTime,
        completedAt: new Date(score.completedAt),
      },
      create: {
        id: score.id,
        playerName: score.playerName,
        totalTime: score.totalTime,
        completedAt: new Date(score.completedAt),
      },
    });
  }

  console.log("✅ Seeded completion scores");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
