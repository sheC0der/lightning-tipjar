import { prisma } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { createInvoice } from "../intergrations/blink/blink.client.js";
import { MIN_TIP_SATS, MAX_TIP_SATS } from "../schemas/tip.schema.js";

const MIN_SENDABLE_MSATS = MIN_TIP_SATS * 1000;
const MAX_SENDABLE_MSATS = MAX_TIP_SATS * 1000;

export interface LnurlPayParams {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: "payRequest";
}

function buildDescription(displayName: string, username: string): string {
  return `Tip for ${displayName} (@${username}) on Sangira TipJar`;
}

export function buildLnurlMetadata(displayName: string, username: string): string {
  return JSON.stringify([["text/plain", buildDescription(displayName, username)]]);
}

export async function getLnurlPayParams(username: string, callbackUrl: string): Promise<LnurlPayParams> {
  const creator = await prisma.creator.findUnique({ where: { username } });

  if (!creator) {
    throw AppError.notFound("Creator not found");
  }

  return {
    callback: callbackUrl,
    maxSendable: MAX_SENDABLE_MSATS,
    minSendable: MIN_SENDABLE_MSATS,
    metadata: buildLnurlMetadata(creator.displayName, creator.username),
    tag: "payRequest",
  };
}

export async function createLnurlInvoice(username: string, amountMsats: number): Promise<{ paymentRequest: string }> {
  const creator = await prisma.creator.findUnique({ where: { username } });

  if (!creator) {
    throw AppError.notFound("Creator not found");
  }

  if (!Number.isInteger(amountMsats) || amountMsats % 1000 !== 0) {
    throw AppError.badRequest("Amount must be a whole number of millisatoshis divisible by 1000");
  }

  const amountSats = amountMsats / 1000;

  if (amountSats < MIN_TIP_SATS || amountSats > MAX_TIP_SATS) {
    throw AppError.badRequest(`Amount must be between ${MIN_SENDABLE_MSATS} and ${MAX_SENDABLE_MSATS} millisatoshis`);
  }

  const memo = buildDescription(creator.displayName, creator.username);
  const invoice = await createInvoice({ amountSats, memo });

  await prisma.tip.create({
    data: {
      creatorId: creator.id,
      amountSats,
      blinkPaymentHash: invoice.paymentHash,
      blinkPaymentRequest: invoice.paymentRequest,
    },
  });

  return { paymentRequest: invoice.paymentRequest };
}
