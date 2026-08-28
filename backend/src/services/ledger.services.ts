import { prisma } from "../config/db.js";

export const MIN_PAYOUT_SATS = 100;

export async function getAvailableSats(creatorId: string): Promise<number> {
  const result = await prisma.tip.aggregate({
    where: { creatorId, status: "PAID", withdrawnAt: null },
    _sum: { amountSats: true },
  });

  return result._sum.amountSats ?? 0;
}

export async function selectTipsToCover(creatorId: string, amountSats: number) {
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

  return tipsToCover;
}
