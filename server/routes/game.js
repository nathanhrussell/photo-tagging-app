import express from "express";
const router = express.Router();

// --- Static sample data for demo/testing ---
const levels = [
  {
    id: 1,
    name: "Level 1",
    thumbnail: "/images/level1-thumb.png"
  },
  {
    id: 2,
    name: "Level 2",
    thumbnail: "/images/level2-thumb.png"
  }
];

const levelDetails = {
  1: {
    id: 1,
    image: "/images/level1.png",
    characters: [
      {
        name: "Character 1",
        x: 23.1,
        y: 55.2,
        width: 3.2,
        height: 5.1,
        thumbnail: "/images/characters/character1.png"
      },
      {
        name: "Character 2",
        x: 40.5,
        y: 30.2,
        width: 2.7,
        height: 4.9,
        thumbnail: "/images/characters/character2.png"
      },
      {
        name: "Character 3",
        x: 65.2,
        y: 75.8,
        width: 2.9,
        height: 3.3,
        thumbnail: "/images/characters/character3.png"
      }
    ]
  }
  // Add more levels as needed...
};

// Dummy leaderboard per level (swap for DB)
const leaderboard = {
  1: [
    { name: "Player1", time: 88, date: "2024-07-17" },
    { name: "Player2", time: 102, date: "2024-07-16" }
  ]
  // More levels...
};

// --- ROUTES ---

// GET /levels
router.get("/levels", (req, res) => {
  res.json(levels);
});

// GET /levels/:id
router.get("/levels/:id", (req, res) => {
  const level = levelDetails[req.params.id];
  if (!level) return res.status(404).json({ error: "Level not found" });
  res.json(level);
});

router.post("/validate-click", (req, res) => {
  const { levelId, character, x, y } = req.body;
  const level = levelDetails[levelId];
  if (!level) return res.status(404).json({ error: "Level not found" });

  // Find the character
  const char = level.characters.find((c) => c.name === character);
  if (!char) {
    console.log("Character not found:", character);
    return res.json({ correct: false });
  }

  // Ensure numbers
  const userX = Number(x);
  const userY = Number(y);
  const charX = Number(char.x);
  const charY = Number(char.y);

  // Use a distance-based tolerance (increase if needed)
  const tolerance = 5;

  const dx = userX - charX;
  const dy = userY - charY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  console.log(
    `User click: (${userX}, ${userY}) | Target: (${charX}, ${charY}) | Distance: ${distance} | Tolerance: ${tolerance}`
  );

  res.json({ correct: distance <= tolerance });
});



// POST /scores
router.post("/scores", (req, res) => {
  const { name, levelId, time } = req.body;
  if (!name || !levelId || time == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // For demo, push to in-memory array (swap for DB)
  if (!leaderboard[levelId]) leaderboard[levelId] = [];
  leaderboard[levelId].push({
    name,
    time,
    date: new Date().toISOString().slice(0, 10)
  });
  // Optionally, sort leaderboard for this level by time
  leaderboard[levelId].sort((a, b) => a.time - b.time);
  res.json({ success: true });
});

// GET /scores/:levelId
router.get("/scores/:levelId", (req, res) => {
  const scores = leaderboard[req.params.levelId] || [];
  // Top 20 fastest times
  res.json(scores.slice(0, 20));
});

export default router;
