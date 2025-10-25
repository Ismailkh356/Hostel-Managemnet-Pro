import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import session from "express-session";

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAccountLocked(lockedUntil: string | null): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil) > new Date();
}

export function getLockExpiryTime(): string {
  const lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
  return lockUntil.toISOString();
}

export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= MAX_LOGIN_ATTEMPTS;
}

declare module 'express-session' {
  interface SessionData {
    adminId?: number;
    username?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  session: session.Session & Partial<session.SessionData>;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (authReq.session && authReq.session.adminId) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
}

export function isAuthenticated(req: Request): boolean {
  const authReq = req as AuthenticatedRequest;
  return !!(authReq.session && authReq.session.adminId);
}
