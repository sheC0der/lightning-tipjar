import { Router } from "express";
import { requireAuth } from "../middleware/auth.middlware.js";
import { sensitiveActionRateLimiter } from "../middleware/rate-limit.middlware.js";
import { validateBody, validateParams } from "../middleware/validate.middlware.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../schemas/auth.schema.js";
import { createTipSchema, tipIdParamSchema, usernameParamSchema } from "../schemas/tip.schema.js";
import { createWithdrawalSchema } from "../schemas/withdrawal.schema.js";
import { createLightningSendSchema } from "../schemas/lightning-send.schema.js";

import * as authController from "../controllers/auth.controller.js";
import * as creatorController from "../controllers/creator.controller.js";
import * as tipController from "../controllers/tip.controller.js";
import * as paymentController from "../controllers/payment.controller.js";
import * as withdrawalController from "../controllers/withdrawal.services.js";
import * as lightningSendController from "../controllers/lightning-send.controller.js";

export const router = Router();

// Auth
router.post("/auth/register", sensitiveActionRateLimiter, validateBody(registerSchema), authController.register);
router.post("/auth/login", sensitiveActionRateLimiter, validateBody(loginSchema), authController.login);
router.get("/auth/me", requireAuth, authController.me);

// Creators
router.get("/creators/me/tips", requireAuth, tipController.listMyTips);
router.get("/creators/me/balance", requireAuth, withdrawalController.getMyBalance);
router.get("/creators/me/withdrawals", requireAuth, withdrawalController.listMyWithdrawals);
router.patch("/creators/me", requireAuth, validateBody(updateProfileSchema), creatorController.updateMyProfile);
router.get("/creators/:username", validateParams(usernameParamSchema), creatorController.getCreatorByUsername);

// Tips
router.post(
  "/creators/:username/tips",
  sensitiveActionRateLimiter,
  validateParams(usernameParamSchema),
  validateBody(createTipSchema),
  tipController.createTipHandler,
);
router.get("/tips/:id/status", validateParams(tipIdParamSchema), tipController.getTipStatusHandler);

// Payments
router.post("/payments/webhook/blink", paymentController.blinkWebhookHandler);

// Withdrawals
router.post("/withdrawals", requireAuth, validateBody(createWithdrawalSchema), withdrawalController.createWithdrawalHandler);

// Lightning sends (send available balance to any Lightning address or invoice)
router.get("/creators/me/lightning-sends", requireAuth, lightningSendController.listMyLightningSends);
router.post(
  "/lightning-sends",
  requireAuth,
  sensitiveActionRateLimiter,
  validateBody(createLightningSendSchema),
  lightningSendController.createLightningSendHandler,
);
