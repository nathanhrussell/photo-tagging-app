import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
      {
        name: "Grandma Reading",
        x: 34.7,
        y: 72.8,
        width: 11.6,
        height: 35.0,
        levelId: 2
      },
      {
        name: "Baby in White",
        x: 51.0,
        y: 95.5,
        width: 7.1,
        height: 17.2,
        levelId: 2
      },
      {
        name: "Lifeguard",
        x: 73.9,
        y: 48.8,
        width: 9.2,
        height: 42.2,
        levelId: 2
      }
    ]
  });

  console.log("✅ Level 2 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
