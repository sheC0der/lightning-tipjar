import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { sendError } from "../utils/reponse.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, "Validation failed", err.flatten());
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendError(res, 409, "A record with that value already exists", { fields: err.meta?.target });
    }
    if (err.code === "P2025") {
      return sendError(res, 404, "Record not found");
    }
  }

  logger.error("Unhandled error", {
    path: req.originalUrl,
    method: req.method,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  return sendError(res, 500, "Internal server error");
}
