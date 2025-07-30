import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function exportData() {
  try {
    const levels = await prisma.level.findMany({
      include: {
        characters: true,
        scores: true,
      },
    });
    fs.writeFileSync("prisma/levels.json", JSON.stringify(levels, null, 2));

    const completionScores = await prisma.completionScore.findMany();
    fs.writeFileSync(
      "prisma/completionScores.json",
      JSON.stringify(completionScores, null, 2)
    );

    console.log("✅ Exported levels, characters, scores, and completionScores");
  } catch (error) {
    console.error("❌ Error exporting data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
