import type { Response } from "express";

interface ErrorPayload {
  message: string;
  details?: unknown;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

export function sendError(res: Response, statusCode: number, message: string, details?: unknown) {
  const error: ErrorPayload = { message, ...(details !== undefined ? { details } : {}) };
  return res.status(statusCode).json({
    success: false,
    error,
  });
}
