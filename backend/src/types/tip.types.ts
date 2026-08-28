import type { TipStatus } from "@prisma/client";

export interface TipResponse {
  id: string;
  amountSats: number;
  status: TipStatus;
  tipperName: string | null;
  message: string | null;
  createdAt: Date;
  paidAt: Date | null;
}

export interface CreateTipResult {
  tip: TipResponse;
  paymentRequest: string;
}
