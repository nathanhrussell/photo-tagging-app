import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
        {
        name: "The Jousting Knight",
        x: 42.5,
        y: 66.5,
        width: 10.5,
        height: 15.0,
        levelId: 3
        },
        {
        name: "The Goose",
        x: 69.8,
        y: 79.0,
        width: 3.5,
        height: 6.0,
        levelId: 3
        },
        {
        name: "The King on the Tower",
        x: 26.5,
        y: 12.0,
        width: 4.5,
        height: 9.0,
        levelId: 3
        }
    ]
    });

  console.log("✅ Level 3 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
