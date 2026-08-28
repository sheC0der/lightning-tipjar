import type { WithdrawalStatus } from "@prisma/client";

export interface WithdrawalResponse {
  id: string;
  amountSats: number;
  amountRwf: number;
  exchangeRateUsed: number;
  status: WithdrawalStatus;
  createdAt: Date;
  completedAt: Date | null;
  failureReason: string | null;
}

export interface BalanceResponse {
  availableSats: number;
  estimatedRwf: number;
}
