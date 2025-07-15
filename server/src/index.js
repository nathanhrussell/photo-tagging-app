import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.get("/api/levels/:id/characters", async (req, res) => {
  const levelId = parseInt(req.params.id);
  try {
    const characters = await prisma.character.findMany({
      where: { levelId },
      select: {
        id: true,
        name: true,
        x: true,
        y: true,
        width: true,
        height: true
      }
    });
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: "Failed to load characters" });
  }
});

app.use(cors());
app.use(express.json());
app.use("/images", express.static("public"));

app.get("/api/test", (req, res) => {
  console.log("✅ /api/test hit");
  res.json({ message: "Backend is working!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
