import type { AuthenticatedCreator } from "../middleware/auth.middlware.js";

declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
      creator?: AuthenticatedCreator;
    }
  }
}

export {};
