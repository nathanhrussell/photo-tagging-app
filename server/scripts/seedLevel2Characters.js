import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
        {
        name: "Lifeguard",
        x: 78.5,
        y: 48.0,
        width: 5.8,
        height: 17.0,
        levelId: 2
        },
        {
        name: "Grandma Reading",
        x: 31.2,
        y: 68.5,
        width: 6.5,
        height: 12.5,
        levelId: 2
        },
        {
        name: "Baby in White",
        x: 86.2,
        y: 76.3,
        width: 4.0,
        height: 7.0,
        levelId: 2
        }
    ]
    });

  console.log("✅ Level 2 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
