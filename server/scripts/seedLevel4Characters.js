import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
      {
        name: "Brick Carrier",
        x: 4.1,
        y: 75.8,
        width: 5.3,
        height: 18.5,
        levelId: 4
      },
      {
        name: "Excavator Operator",
        x: 32.1,
        y: 52.6,
        width: 7.4,
        height: 20.7,
        levelId: 4
      },
      {
        name: "Wheelbarrow Worker",
        x: 77.1,
        y: 77.3,
        width: 8.9,
        height: 20.1,
        levelId: 4
      }
    ]
  });

  console.log("✅ Level 4 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
