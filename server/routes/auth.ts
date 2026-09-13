import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import type { Response } from "express";

const router = Router();

const TOKEN_TTL = "7d";

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, { expiresIn: TOKEN_TTL });
}

function publicUser(user: { _id: unknown; name: string; email: string; createdAt?: Date }) {
  return { id: String(user._id), name: user.name, email: user.email, createdAt: user.createdAt?.toISOString() };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || !password
    ) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters." });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email, password: hashed });

    res.status(201).json({ token: signToken(String(user._id)), user: publicUser(user) });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ message: "Please check your details and try again." });
      return;
    }
    console.error("Register failed:", error);
    res.status(500).json({ message: "Could not create your account. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    res.json({ token: signToken(String(user._id)), user: publicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Could not sign you in. Please try again." });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ message: "Account not found. Please sign in again." });
      return;
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Session check failed:", error);
    res.status(500).json({ message: "Could not verify your session." });
  }
});

export default router;
