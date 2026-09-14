import "./env.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set. Add it to server/.env");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("change-this")) {
    throw new Error("JWT_SECRET is missing or still the placeholder. Set a secure value in server/.env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  const app = express();
  const server = createServer(app);

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
  app.use(cors({ origin: allowedOrigins, credentials: true }));

  // ── Body parsing (20 KB cap — no oversized JSON payloads) ────────────────
  app.use(express.json({ limit: "20kb" }));
  app.use(cookieParser());

  // ── Rate limiting on auth endpoints ──────────────────────────────────────
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // 20 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // ── API routes ────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
