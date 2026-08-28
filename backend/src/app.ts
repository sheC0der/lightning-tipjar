import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { router } from "./routes/route.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middlware.js";
import { generalRateLimiter } from "./middleware/rate-limit.middlware.js";
import { sendSuccess } from "./utils/reponse.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request).rawBody = buf.toString();
    },
  }),
);
app.use(generalRateLimiter);

app.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok" });
});

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);
