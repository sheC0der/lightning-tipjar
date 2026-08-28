import type { Request, Response } from "express";
import { sendSuccess } from "../utils/reponse.js";
import { AppError } from "../utils/app-error.js";
import { handleBlinkWebhookEvent, verifyBlinkWebhookSignature } from "../services/payment.services.js";

export async function blinkWebhookHandler(req: Request, res: Response) {
  const signature = req.headers["x-webhook-signature"] as string | undefined;
  const isValid = verifyBlinkWebhookSignature(req.rawBody ?? JSON.stringify(req.body), signature);

  if (!isValid) {
    throw AppError.unauthorized("Invalid webhook signature");
  }

  await handleBlinkWebhookEvent(req.body);
  sendSuccess(res, { received: true });
}
