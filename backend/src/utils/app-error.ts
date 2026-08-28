export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(403, message);
  }

  static notFound(message = "Not found") {
    return new AppError(404, message);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(409, message, details);
  }

  static internal(message = "Internal server error", details?: unknown) {
    return new AppError(500, message, details);
  }

  static badGateway(message: string, details?: unknown) {
    return new AppError(502, message, details);
  }
}
