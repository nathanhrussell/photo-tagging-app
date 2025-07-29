import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import gameRouter from "../routes/game.js";

dotenv.config();

const app = express();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], 
});
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://photo-tagging-app-1-b6dj.onrender.com"
}));
app.use(express.json());


app.use("/api", gameRouter(prisma));

app.use("/images", express.static("public"));

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("✅ /api/test hit");
  res.json({ message: "Backend is working!" });
});


app.use((err, req, res, next) => {
  console.error("GLOBAL EXPRESS ERROR CAUGHT:", err.stack);
  res.status(500).send('Something broke on the server!');
});


process.on('unhandledRejection', (reason, promise) => {
    console.error('GLOBAL UNHANDLED REJECTION IN INDEX.JS (process crash likely):', reason, 'at promise:', promise);

});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});