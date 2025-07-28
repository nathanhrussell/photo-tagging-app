import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /levels
router.get("/levels", async (req, res) => {
  try {
    const levels = await prisma.level.findMany({
      select: {
        id: true,
        name: true,
        thumbnail: true
      }
    });
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: "Failed to load levels" });
  }
});

// GET /levels/:id
router.get("/levels/:id", async (req, res) => {
  const levelId = parseInt(req.params.id);
  try {
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        characters: {
          select: {
            name: true,
            x: true,
            y: true,
            width: true,
            height: true
          }
        }
      }
    });
    if (!level) return res.status(404).json({ error: "Level not found" });
    res.json(level);
  } catch (err) {
    console.error("❌ Backend error in /api/levels/:id", err.message, err.stack);
    res.status(500).json({ error: "Failed to load level data" });
  }
});


// POST /validate-click
router.post("/validate-click", async (req, res) => {
  const { levelId, character, x, y } = req.body;
  try {
    const match = await prisma.character.findFirst({
      where: {
        levelId: parseInt(levelId),
        name: character
      }
    });

    if (!match) {
      console.log("❌ Character not found:", character);
      return res.status(404).json({ correct: false, message: "Character not found" });
    }

    const userX = Number(x);
    const userY = Number(y);
    const withinX = userX >= match.x && userX <= match.x + match.width;
    const withinY = userY >= match.y && userY <= match.y + match.height;

    console.log(
      `User click: (${userX}, ${userY}) | Target: (${match.x}, ${match.y}) | ` +
      `Width: ${match.width} | Height: ${match.height}`
    );

    res.json({ correct: withinX && withinY });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /scores - for final game completion
router.post("/scores", async (req, res) => {
  const { name, time, completedAt } = req.body;
  
  if (!name || time == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const score = await prisma.completionScore.create({
      data: {
        playerName: name,
        totalTime: parseInt(time),
        completedAt: completedAt ? new Date(completedAt) : new Date()
      }
    });
    
    console.log("New completion score submitted:", score);
    res.json({ success: true, message: "Score recorded successfully", score });
  } catch (error) {
    console.error("Error saving completion score:", error);
    res.status(500).json({ error: "Failed to save score" });
  }
});

// GET /scores/:levelId (stub)
router.get("/scores/:levelId", (req, res) => {
  // Replace with real leaderboard fetch from DB if needed
  res.json([]);
});

export default router;
