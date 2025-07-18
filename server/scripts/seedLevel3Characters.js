import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
      {
        name: "The King on the Tower",
        x: 22.1,
        y: 3.6,
        width: 6.2,
        height: 14.2,
        levelId: 3
      },
      {
        name: "The Jousting Knight",
        x: 50.5,
        y: 57.7,
        width: 8.2,
        height: 21.2,
        levelId: 3
      },
      {
        name: "The Goose",
        x: 42.3,
        y: 84.8,
        width: 4.9,
        height: 12.4,
        levelId: 3
      }
    ]
  });

  console.log("✅ Level 3 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
