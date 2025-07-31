import express from "express";

export default function gameRouter(prismaInstance) {
  const router = express.Router();
  const prisma = prismaInstance;

  router.get("/levels/:id/characters", async (req, res) => {
    const levelId = parseInt(req.params.id);
    console.log(`[BACKEND] Fetching characters for level ${levelId}`);
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
      console.log(`[BACKEND] Found ${characters.length} characters.`);
      res.json(characters);
    } catch (err) {
      console.error(`[BACKEND ERROR] Failed to load characters for level ${levelId}:`, err);
      res.status(500).json({ error: "Failed to load characters", details: err.message });
    }
  });

  // GET /levels
  router.get("/levels", async (req, res) => {
    console.log("[BACKEND] Fetching all levels");
    try {
      const levels = await prisma.level.findMany({
        select: {
          id: true,
          name: true,
          thumbnail: true
        }
      });
      console.log(`[BACKEND] Found ${levels.length} levels.`);
      res.json(levels);
    } catch (err) {
      console.error("[BACKEND ERROR] Failed to load levels:", err);
      res.status(500).json({ error: "Failed to load levels", details: err.message });
    }
  });

  router.get("/levels/:id", async (req, res) => {
    const levelId = parseInt(req.params.id);
    console.log(`[BACKEND] Fetching level ${levelId}`);
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
      if (!level) {
        console.log(`[BACKEND] Level ${levelId} not found.`);
        return res.status(404).json({ error: "Level not found" });
      }
      console.log(`[BACKEND] Successfully fetched level ${levelId}.`);
      res.json(level);
    } catch (err) {
      console.error(`[BACKEND ERROR] Failed to load level ${levelId}:`, err.message, err.stack);
      res.status(500).json({ error: "Failed to load level data", details: err.message });
    }
  });


  // POST /validate-click
  router.post("/validate-click", async (req, res) => {
    console.log(`[BACKEND] Received validation request:`, req.body);
    
    try {
      const { levelId, character, x, y } = req.body;
      
      // Validate required fields
      if (!levelId || !character || x == null || y == null) {
        console.log("❌ Missing required fields:", { levelId, character, x, y });
        return res.status(400).json({ 
          correct: false, 
          error: "Missing required fields",
          received: { levelId, character, x, y }
        });
      }

      console.log(`[BACKEND] Validating click for level ${levelId}, char "${character}" at (${x}, ${y})`);
      
      const match = await prisma.character.findFirst({
        where: {
          levelId: parseInt(levelId),
          name: character
        }
      });

      if (!match) {
        console.log(`❌ Character not found: "${character}" in level ${levelId}`);
        return res.status(200).json({ 
          correct: false, 
          message: "Character not found",
          character: character,
          levelId: levelId
        });
      }

      console.log(`[BACKEND] Found character:`, {
        name: match.name,
        x: match.x,
        y: match.y,
        width: match.width,
        height: match.height
      });

      const userX = Number(x);
      const userY = Number(y);
      const withinX = userX >= match.x && userX <= match.x + match.width;
      const withinY = userY >= match.y && userY <= match.y + match.height;

      console.log(`[BACKEND] Click validation:`, {
        userClick: `(${userX}, ${userY})`,
        targetArea: `(${match.x}, ${match.y}) to (${match.x + match.width}, ${match.y + match.height})`,
        withinX,
        withinY,
        result: withinX && withinY
      });

      const result = { correct: withinX && withinY };
      console.log(`[BACKEND] Sending response:`, result);
      
      res.json(result);
    } catch (err) {
      console.error("❌ Server error in validate-click:", err);
      console.error("❌ Error stack:", err.stack);
      return res.status(500).json({ 
        correct: false,
        error: "Server error", 
        details: err.message 
      });
    }
  });

  // POST /scores - for final game completion
  router.post("/scores", async (req, res) => {
    const { name, time, completedAt } = req.body;
    
    if (!name || time == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(`[BACKEND] Submitting score for ${name} with time ${time}`);
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
      res.status(500).json({ error: "Failed to save score", details: error.message });
    }
  });


  router.get("/scores", async (req, res) => {
    console.log("[BACKEND] Fetching all completion scores");
    try {
      const scores = await prisma.completionScore.findMany({
        select: {
          id: true,
          playerName: true,
          totalTime: true,
          completedAt: true
        },
        orderBy: {
          totalTime: 'asc'
        }
      });
      
      const transformedScores = scores.map(score => ({
        name: score.playerName,
        time: score.totalTime,
        completedAt: score.completedAt
      }));
      
      console.log(`Returning ${transformedScores.length} completion scores`);
      res.json(transformedScores);
    } catch (error) {
      console.error("Error fetching completion scores:", error);
      res.status(500).json({ error: "Failed to fetch scores", details: error.message });
    }
  });


  router.get("/scores/:levelId", (req, res) => {
    console.log(`[BACKEND] Hitting stub for scores for level ${req.params.levelId}`);
    res.json([]);
  });

  router.get("/leaderboard", async (req, res) => {
    console.log("[BACKEND] Rendering leaderboard HTML page");
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
              body { font-family: sans-serif; padding: 2rem; background: #f9fafb; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
              th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
              th { background: #e2e8f0; }
              h1 { margin-bottom: 1rem; }
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
      res.status(500).send("Failed to load leaderboard - Server Error");
    }
  });

  return router;
} 