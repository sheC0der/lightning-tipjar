import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export interface AuthenticatedCreator {
  id: string;
  username: string;
}

export function signAuthToken(creator: AuthenticatedCreator): string {
  const options = { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions;
  return jwt.sign(creator, env.JWT_SECRET, options);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or invalid Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthenticatedCreator;
    req.creator = { id: payload.id, username: payload.username };
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}
