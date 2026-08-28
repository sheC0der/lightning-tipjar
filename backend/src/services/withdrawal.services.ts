import crypto from "node:crypto";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";
import { satsToRwf, createTransfer } from "../intergrations/flutterwave/flutterwave.client.js";
import type { CreateWithdrawalInput } from "../schemas/withdrawal.schema.js";
import type { BalanceResponse, WithdrawalResponse } from "../types/withdrawal.types.js";

const MIN_WITHDRAWAL_SATS = 100;

function toWithdrawalResponse(withdrawal: {
  id: string;
  amountSats: number;
  amountRwf: number;
  exchangeRateUsed: number;
  status: WithdrawalResponse["status"];
  createdAt: Date;
  completedAt: Date | null;
  failureReason: string | null;
}): WithdrawalResponse {
  return {
    id: withdrawal.id,
    amountSats: withdrawal.amountSats,
    amountRwf: withdrawal.amountRwf,
    exchangeRateUsed: withdrawal.exchangeRateUsed,
    status: withdrawal.status,
    createdAt: withdrawal.createdAt,
    completedAt: withdrawal.completedAt,
    failureReason: withdrawal.failureReason,
  };
}

async function getAvailableSats(creatorId: string): Promise<number> {
  const result = await prisma.tip.aggregate({
    where: { creatorId, status: "PAID", withdrawnAt: null },
    _sum: { amountSats: true },
  });

  return result._sum.amountSats ?? 0;
}

export async function getCreatorBalance(creatorId: string): Promise<BalanceResponse> {
  const availableSats = await getAvailableSats(creatorId);

  let estimatedRwf = 0;
  if (availableSats > 0) {
    try {
      estimatedRwf = (await satsToRwf(availableSats)).amountRwf;
    } catch (err) {
      logger.warn("Could not fetch live RWF estimate for balance, showing sats only", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { availableSats, estimatedRwf };
}

export async function requestWithdrawal(
  creatorId: string,
  input: CreateWithdrawalInput,
): Promise<WithdrawalResponse> {
  const creator = await prisma.creator.findUnique({ where: { id: creatorId } });

  if (!creator) {
    throw AppError.notFound("Creator not found");
  }

  const availableSats = await getAvailableSats(creatorId);
  const amountSats = input.amountSats ?? availableSats;

  if (amountSats < MIN_WITHDRAWAL_SATS) {
    throw AppError.badRequest(`Minimum withdrawal is ${MIN_WITHDRAWAL_SATS} sats`);
  }

  if (amountSats > availableSats) {
    throw AppError.badRequest("Requested amount exceeds available balance");
  }

  const eligibleTips = await prisma.tip.findMany({
    where: { creatorId, status: "PAID", withdrawnAt: null },
    orderBy: { createdAt: "asc" },
  });

  const tipsToCover: typeof eligibleTips = [];
  let coveredSats = 0;
  for (const tip of eligibleTips) {
    if (coveredSats >= amountSats) break;
    tipsToCover.push(tip);
    coveredSats += tip.amountSats;
  }

  const { amountRwf, exchangeRateUsed } = await satsToRwf(amountSats);
  const reference = `tj${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 42);

  const withdrawal = await prisma.withdrawal.create({
    data: {
      creatorId,
      amountSats,
      amountRwf,
      exchangeRateUsed,
      flutterwaveReference: reference,
      status: "PROCESSING",
    },
  });

  await prisma.tip.updateMany({
    where: { id: { in: tipsToCover.map((t) => t.id) } },
    data: { withdrawalId: withdrawal.id, withdrawnAt: new Date() },
  });

  try {
    const transfer = await createTransfer({
      amountRwf,
      network: creator.mobileMoneyNetwork as "MTN" | "MPS",
      phoneNumber: creator.mobileMoneyNumber,
      displayName: creator.displayName,
      reference,
      narration: `Lightning TipJar payout for @${creator.username}`,
    });

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: transfer.status === "SUCCESSFUL" ? "SUCCESSFUL" : "PROCESSING",
        flutterwaveTransferId: String(transfer.id),
        completedAt: transfer.status === "SUCCESSFUL" ? new Date() : null,
      },
    });

    return toWithdrawalResponse(updated);
  } catch (err) {
    logger.error("Withdrawal transfer failed, reverting covered tips", { withdrawalId: withdrawal.id });

    await prisma.$transaction([
      prisma.tip.updateMany({
        where: { withdrawalId: withdrawal.id },
        data: { withdrawalId: null, withdrawnAt: null },
      }),
      prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "FAILED",
          failureReason: err instanceof AppError ? err.message : "Unknown error contacting Flutterwave",
        },
      }),
    ]);

    throw err;
  }
}

export async function listWithdrawalsForCreator(creatorId: string): Promise<WithdrawalResponse[]> {
  const withdrawals = await prisma.withdrawal.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
  });

  return withdrawals.map(toWithdrawalResponse);
}
