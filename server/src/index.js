import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import gameRoutes from "../routes/game.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://photo-tagging-app-1-b6dj.onrender.com"
}));
app.use(express.json());

app.use("/api", gameRoutes);

app.use("/images", express.static("public"));

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("✅ /api/test hit");
  res.json({ message: "Backend is working!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});