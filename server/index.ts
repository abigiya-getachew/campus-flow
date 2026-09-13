import "./env.js";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  // Serve static files from client/dist
  const staticPath = path.resolve(__dirname, "..", "client", "dist");
  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
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
