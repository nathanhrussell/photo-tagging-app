import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
        {
        name: "Balloon Vendor",
        x: 39.4,
        y: 87.2,
        width: 4.0,
        height: 12.5,
        levelId: 5
        },
        {
        name: "Window Cat",
        x: 91.8,
        y: 17.5,
        width: 2.8,
        height: 4.8,
        levelId: 5
        },
        {
        name: "Double Bass Player",
        x: 76.9,
        y: 74.3,
        width: 4.2,
        height: 11.0,
        levelId: 5
        }
    ]
    });

  console.log("✅ Level 4 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
