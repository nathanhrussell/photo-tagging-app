import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
        {
        name: "Wheelbarrow Worker",
        x: 89.4,
        y: 80.6,
        width: 5.5,
        height: 11.5,
        levelId: 4
        },
        {
        name: "Excavator Operator",
        x: 18.3,
        y: 60.5,
        width: 5.0,
        height: 8.5,
        levelId: 4
        },
        {
        name: "Brick Carrier",
        x: 49.7,
        y: 72.8,
        width: 4.8,
        height: 11.2,
        levelId: 4
        }
    ]
    });

  console.log("✅ Level 4 characters inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
