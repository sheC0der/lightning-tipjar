import { prisma } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { createInvoice, getInvoicePaymentStatus } from "../intergrations/blink/blink.client.js";
import type { CreateTipInput } from "../schemas/tip.schema.js";
import type { CreateTipResult, TipResponse } from "../types/tip.types.js";
import type { PaymentStatusResponse } from "../types/payment.types.js";

function toTipResponse(tip: {
  id: string;
  amountSats: number;
  status: TipResponse["status"];
  tipperName: string | null;
  message: string | null;
  createdAt: Date;
  paidAt: Date | null;
}): TipResponse {
  return {
    id: tip.id,
    amountSats: tip.amountSats,
    status: tip.status,
    tipperName: tip.tipperName,
    message: tip.message,
    createdAt: tip.createdAt,
    paidAt: tip.paidAt,
  };
}

export async function createTip(username: string, input: CreateTipInput): Promise<CreateTipResult> {
  const creator = await prisma.creator.findUnique({ where: { username } });

  if (!creator) {
    throw AppError.notFound("Creator not found");
  }

  const invoice = await createInvoice({
    amountSats: input.amountSats,
    memo: `Tip for ${creator.displayName}${input.tipperName ? ` from ${input.tipperName}` : ""}`,
  });

  const tip = await prisma.tip.create({
    data: {
      creatorId: creator.id,
      amountSats: input.amountSats,
      tipperName: input.tipperName ?? null,
      message: input.message ?? null,
      blinkPaymentHash: invoice.paymentHash,
      blinkPaymentRequest: invoice.paymentRequest,
    },
  });

  return { tip: toTipResponse(tip), paymentRequest: invoice.paymentRequest };
}

export async function getTipStatus(tipId: string): Promise<PaymentStatusResponse> {
  const tip = await prisma.tip.findUnique({ where: { id: tipId } });

  if (!tip) {
    throw AppError.notFound("Tip not found");
  }

  if (tip.status !== "PENDING") {
    return { tipId: tip.id, status: tip.status, paidAt: tip.paidAt };
  }

  const blinkStatus = await getInvoicePaymentStatus(tip.blinkPaymentRequest);

  if (blinkStatus === "PENDING") {
    return { tipId: tip.id, status: "PENDING", paidAt: null };
  }

  const updated = await prisma.tip.update({
    where: { id: tip.id },
    data: {
      status: blinkStatus,
      paidAt: blinkStatus === "PAID" ? new Date() : null,
    },
  });

  return { tipId: updated.id, status: updated.status, paidAt: updated.paidAt };
}

export async function listTipsForCreator(creatorId: string): Promise<TipResponse[]> {
  const tips = await prisma.tip.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
  });

  return tips.map(toTipResponse);
}
