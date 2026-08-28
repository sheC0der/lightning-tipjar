import { prisma } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";
import { payInvoice, payToLightningAddress } from "../intergrations/blink/blink.client.js";
import { getAvailableSats, selectTipsToCover, MIN_PAYOUT_SATS } from "./ledger.services.js";
import type { CreateLightningSendInput } from "../schemas/lightning-send.schema.js";
import type { LightningSendStatus } from "@prisma/client";

export interface LightningSendResponse {
  id: string;
  amountSats: number;
  destination: string;
  status: LightningSendStatus;
  createdAt: Date;
  completedAt: Date | null;
  failureReason: string | null;
}

function toResponse(send: {
  id: string;
  amountSats: number;
  destination: string;
  status: LightningSendStatus;
  createdAt: Date;
  completedAt: Date | null;
  failureReason: string | null;
}): LightningSendResponse {
  return send;
}

function isLightningAddress(destination: string): boolean {
  return destination.includes("@");
}

export async function requestLightningSend(
  creatorId: string,
  input: CreateLightningSendInput,
): Promise<LightningSendResponse> {
  const availableSats = await getAvailableSats(creatorId);
  const amountSats = input.amountSats ?? availableSats;

  if (amountSats < MIN_PAYOUT_SATS) {
    throw AppError.badRequest(`Minimum send is ${MIN_PAYOUT_SATS} sats`);
  }

  if (amountSats > availableSats) {
    throw AppError.badRequest("Requested amount exceeds available balance");
  }

  const tipsToCover = await selectTipsToCover(creatorId, amountSats);

  const send = await prisma.lightningSend.create({
    data: {
      creatorId,
      amountSats,
      destination: input.destination,
      status: "PENDING",
    },
  });

  await prisma.tip.updateMany({
    where: { id: { in: tipsToCover.map((t) => t.id) } },
    data: { lightningSendId: send.id, withdrawnAt: new Date() },
  });

  try {
    const result = isLightningAddress(input.destination)
      ? await payToLightningAddress(amountSats, input.destination)
      : await payInvoice(input.destination);

    const succeeded = result === "SUCCESS" || result === "ALREADY_PAID";

    if (result === "FAILURE") {
      throw AppError.badGateway("Blink reported the payment failed");
    }

    const updated = await prisma.lightningSend.update({
      where: { id: send.id },
      data: {
        status: succeeded ? "SUCCESSFUL" : "PENDING",
        completedAt: succeeded ? new Date() : null,
      },
    });

    return toResponse(updated);
  } catch (err) {
    logger.error("Lightning send failed, reverting covered tips", { sendId: send.id });

    await prisma.$transaction([
      prisma.tip.updateMany({
        where: { lightningSendId: send.id },
        data: { lightningSendId: null, withdrawnAt: null },
      }),
      prisma.lightningSend.update({
        where: { id: send.id },
        data: {
          status: "FAILED",
          failureReason: err instanceof AppError ? err.message : "Unknown error sending payment",
        },
      }),
    ]);

    throw err;
  }
}

export async function listLightningSendsForCreator(creatorId: string): Promise<LightningSendResponse[]> {
  const sends = await prisma.lightningSend.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
  });

  return sends.map(toResponse);
}
