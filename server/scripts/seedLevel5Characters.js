import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
      {
        name: "Balloon Vendor",
        x: 31.1,
        y: 78.7,
        width: 7.9,
        height: 11.5,
        levelId: 5
      },
      {
        name: "Double Bass Player",
        x: 75.9,
        y: 79.5,
        width: 11.8,
        height: 11.1,
        levelId: 5
      },
      {
        name: "Window Cat",
        x: 97.4,
        y: 27.6,
        width: 5.9,
        height: 5.5,
        levelId: 5
      }
    ]
  });

  console.log("✅ Level 5 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
