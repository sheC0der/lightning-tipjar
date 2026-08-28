import { prisma } from "../config/db.js";

export const MIN_PAYOUT_SATS = 100;

export interface TipClaim {
  tipId: string;
  amountSats: number;
}

export async function getAvailableSats(creatorId: string): Promise<number> {
  const tips = await prisma.tip.findMany({
    where: { creatorId, status: "PAID" },
    select: { amountSats: true, claimedSats: true },
  });

  return tips.reduce((sum, t) => sum + (t.amountSats - t.claimedSats), 0);
}

/**
 * Selects which tips (and how much of each) to draw `amountSats` from,
 * oldest first, without mutating anything. A tip only partially needed
 * contributes just the remainder, not its full amount — call applyClaims
 * to actually commit the claim once the payout is confirmed.
 */
export async function planClaim(creatorId: string, amountSats: number): Promise<TipClaim[]> {
  const tips = await prisma.tip.findMany({
    where: { creatorId, status: "PAID" },
    orderBy: { createdAt: "asc" },
    select: { id: true, amountSats: true, claimedSats: true },
  });

  const claims: TipClaim[] = [];
  let remaining = amountSats;

  for (const tip of tips) {
    if (remaining <= 0) break;
    const available = tip.amountSats - tip.claimedSats;
    if (available <= 0) continue;
    const take = Math.min(available, remaining);
    claims.push({ tipId: tip.id, amountSats: take });
    remaining -= take;
  }

  return claims;
}

export async function applyClaims(claims: TipClaim[]): Promise<void> {
  if (claims.length === 0) return;
  await prisma.$transaction(
    claims.map((c) =>
      prisma.tip.update({
        where: { id: c.tipId },
        data: { claimedSats: { increment: c.amountSats } },
      }),
    ),
  );
}

export async function revertClaims(claims: TipClaim[]): Promise<void> {
  if (claims.length === 0) return;
  await prisma.$transaction(
    claims.map((c) =>
      prisma.tip.update({
        where: { id: c.tipId },
        data: { claimedSats: { decrement: c.amountSats } },
      }),
    ),
  );
}
