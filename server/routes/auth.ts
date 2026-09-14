import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { RevokedToken } from "../models/RevokedToken.js";
import { User } from "../models/User.js";

const router = Router();

const TOKEN_TTL = "7d";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Cookie options shared by login, register, and logout. */
const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge,
});

function signToken(userId: string): { token: string; jti: string } {
  const jti = randomUUID();
  const token = jwt.sign(
    { sub: userId, jti },
    process.env.JWT_SECRET as string,
    { expiresIn: TOKEN_TTL }
  );
  return { token, jti };
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

/** Set the auth cookie and return the public user object. */
function sendAuthResponse(
  res: import("express").Response,
  user: { _id: unknown; name: string; email: string; createdAt?: Date },
  status = 200
) {
  const { token } = signToken(String(user._id));
  res
    .status(status)
    .cookie("campusflow_token", token, cookieOptions(TOKEN_TTL_MS))
    .json({ user: publicUser(user) });
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

    sendAuthResponse(res, user, 201);
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

    sendAuthResponse(res, user);
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Could not sign you in. Please try again." });
  }
});

router.post("/logout", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Extract jti from the cookie token to add to the denylist.
    const token = (req.cookies as Record<string, string | undefined>)?.campusflow_token;
    if (token) {
      const payload = jwt.decode(token) as jwt.JwtPayload | null;
      if (payload?.jti && payload?.exp) {
        await RevokedToken.create({
          jti: payload.jti,
          expiresAt: new Date(payload.exp * 1000),
        });
      }
    }

    // Clear the cookie.
    res.clearCookie("campusflow_token", cookieOptions(0)).json({ ok: true });
  } catch (error) {
    console.error("Logout failed:", error);
    // Best-effort: still clear the cookie even if DB write fails.
    res.clearCookie("campusflow_token", cookieOptions(0)).json({ ok: true });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
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
