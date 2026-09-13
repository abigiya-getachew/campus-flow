import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}
