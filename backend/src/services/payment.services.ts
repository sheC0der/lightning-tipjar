import crypto from "node:crypto";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/app-error.js";

export function verifyBlinkWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  if (!env.BLINK_WEBHOOK_SECRET) {
    logger.warn("BLINK_WEBHOOK_SECRET not set, skipping webhook signature verification");
    return true;
  }

  if (!signatureHeader) return false;

  const expected = crypto.createHmac("sha256", env.BLINK_WEBHOOK_SECRET).update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
  } catch {
    return false;
  }
}

interface BlinkWebhookPayload {
  eventType?: string;
  data?: {
    paymentHash?: string;
    status?: string;
  };
}

export async function handleBlinkWebhookEvent(payload: BlinkWebhookPayload): Promise<void> {
  const paymentHash = payload.data?.paymentHash;

  if (!paymentHash) {
    throw AppError.badRequest("Webhook payload missing paymentHash");
  }

  const tip = await prisma.tip.findUnique({ where: { blinkPaymentHash: paymentHash } });

  if (!tip) {
    logger.warn("Received Blink webhook for unknown payment hash", { paymentHash });
    return;
  }

  if (tip.status !== "PENDING") {
    return;
  }

  const isPaid = payload.eventType === "receive.lightning" || payload.data?.status === "PAID";

  if (isPaid) {
    await prisma.tip.update({
      where: { id: tip.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    logger.info("Tip marked as paid via webhook", { tipId: tip.id });
  }
}
