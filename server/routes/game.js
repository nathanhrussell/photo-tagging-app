import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/levels/:id/characters", async (req, res) => {
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

// GET /scores - fetch all completion scores for leaderboard
router.get("/scores", async (req, res) => {
  try {
    const scores = await prisma.completionScore.findMany({
      select: {
        id: true,
        playerName: true,
        totalTime: true,
        completedAt: true
      },
      orderBy: {
        totalTime: 'asc' // Fastest times first
      }
    });
    
    // Transform the data to match what the frontend expects
    const transformedScores = scores.map(score => ({
      name: score.playerName,
      time: score.totalTime,
      completedAt: score.completedAt
    }));
    
    console.log(`Returning ${transformedScores.length} completion scores`);
    res.json(transformedScores);
  } catch (error) {
    console.error("Error fetching completion scores:", error);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// GET /scores/:levelId (stub)
router.get("/scores/:levelId", (req, res) => {
  // Replace with real leaderboard fetch from DB if needed
  res.json([]);
});

// GET /leaderboard - basic HTML test page
router.get("/leaderboard", async (req, res) => {
  try {
    const scores = await prisma.completionScore.findMany({
      orderBy: { totalTime: "asc" }
    });

    const rows = scores.map(score => `
      <tr>
        <td>${score.playerName}</td>
        <td>${score.totalTime}s</td>
        <td>${new Date(score.completedAt).toLocaleString()}</td>
      </tr>
    `).join("");

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Leaderboard</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 2rem;
              background: #f9fafb;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 0.5rem;
              text-align: left;
            }
            th {
              background: #e2e8f0;
            }
            h1 {
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <h1>Leaderboard</h1>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Time</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              ${rows || "<tr><td colspan='3'>No scores yet</td></tr>"}
            </tbody>
          </table>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Error rendering leaderboard:", err);
    res.status(500).send("Failed to load leaderboard");
  }
});


export default router;