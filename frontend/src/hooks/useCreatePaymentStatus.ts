import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../services/api";

export interface PaymentStatus {
  tipId: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  paidAt: string | null;
}

export function useCreatePaymentStatus(tipId: string | undefined) {
  return useQuery({
    queryKey: ["tip-status", tipId],
    queryFn: () => unwrap<PaymentStatus>(api.get(`/tips/${tipId}/status`)),
    enabled: Boolean(tipId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PAID" || status === "EXPIRED" || status === "FAILED" ? false : 2000;
    },
  });
}
