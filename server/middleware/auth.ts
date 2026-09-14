import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RevokedToken } from "../models/RevokedToken.js";

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Reads the JWT from the `campusflow_token` HttpOnly cookie (preferred) or
 * the Authorization Bearer header (kept for backward-compat during migration).
 * Also checks the revocation denylist so logged-out tokens are rejected even
 * if they are still within their expiry window.
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Prefer the secure HttpOnly cookie; fall back to Bearer header.
  const cookieToken = (req.cookies as Record<string, string | undefined>)?.campusflow_token;
  const headerToken = (() => {
    const h = req.headers.authorization;
    return h?.startsWith("Bearer ") ? h.slice(7) : null;
  })();
  const token = cookieToken ?? headerToken ?? null;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
    return;
  }

  // Check revocation denylist.
  if (payload.jti) {
    const revoked = await RevokedToken.exists({ jti: payload.jti });
    if (revoked) {
      res.status(401).json({ message: "Session expired. Please sign in again." });
      return;
    }
  }

  req.userId = payload.sub as string;
  next();
}
