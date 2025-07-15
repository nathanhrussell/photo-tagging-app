import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
      {
        name: "Waldo",
        x: 14.1,
        y: 42.5,
        width: 5.5,
        height: 12.0,
        levelId: 1
      },
      {
        name: "Sunhat Girl",
        x: 24.5,
        y: 63.5,
        width: 6.0,
        height: 13.0,
        levelId: 1
      },
      {
        name: "Stroller Baby",
        x: 55.5,
        y: 60.5,
        width: 5.5,
        height: 10.0,
        levelId: 1
      }
    ]
  });

  console.log("✅ Level 1 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
