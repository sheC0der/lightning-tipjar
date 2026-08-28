import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { router } from "./routes/route.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middlware.js";
import { generalRateLimiter } from "./middleware/rate-limit.middlware.js";
import { sendSuccess } from "./utils/reponse.js";

export const app = express();

// Railway (and most PaaS hosts) sit behind a single reverse proxy hop, so trust
// the X-Forwarded-For header it sets — otherwise express-rate-limit can't
// identify real client IPs and logs ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set("trust proxy", 1);

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
