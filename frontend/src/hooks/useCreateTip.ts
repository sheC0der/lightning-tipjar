import { useMutation } from "@tanstack/react-query";
import { api, unwrap } from "../services/api";

export interface CreateTipInput {
  amountSats: number;
  tipperName?: string;
  message?: string;
}

export interface TipRecord {
  id: string;
  amountSats: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  tipperName: string | null;
  message: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface CreateTipResult {
  tip: TipRecord;
  paymentRequest: string;
}

export function useCreateTip(username: string | undefined) {
  return useMutation({
    mutationFn: (input: CreateTipInput) =>
      unwrap<CreateTipResult>(api.post(`/creators/${username}/tips`, input)),
  });
}
