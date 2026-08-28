import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../services/api";
import type { TipRecord } from "./useCreateTip";

export interface Balance {
  availableSats: number;
  estimatedRwf: number;
}

export interface WithdrawalRecord {
  id: string;
  amountSats: number;
  amountRwf: number;
  exchangeRateUsed: number;
  status: "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";
  createdAt: string;
  completedAt: string | null;
  failureReason: string | null;
}

export function useMyBalance() {
  return useQuery({
    queryKey: ["my-balance"],
    queryFn: () => unwrap<Balance>(api.get("/creators/me/balance")),
  });
}

export function useMyTips() {
  return useQuery({
    queryKey: ["my-tips"],
    queryFn: () => unwrap<TipRecord[]>(api.get("/creators/me/tips")),
  });
}

export function useMyWithdrawals() {
  return useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: () => unwrap<WithdrawalRecord[]>(api.get("/creators/me/withdrawals")),
  });
}
