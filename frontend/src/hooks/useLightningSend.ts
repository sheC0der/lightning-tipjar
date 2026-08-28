import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../services/api";

export interface LightningSendRecord {
  id: string;
  amountSats: number;
  destination: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  createdAt: string;
  completedAt: string | null;
  failureReason: string | null;
}

export interface SendPaymentInput {
  destination: string;
  amountSats?: number;
}

export function useMyLightningSends() {
  return useQuery({
    queryKey: ["my-lightning-sends"],
    queryFn: () => unwrap<LightningSendRecord[]>(api.get("/creators/me/lightning-sends")),
  });
}

export function useSendPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendPaymentInput) => unwrap<LightningSendRecord>(api.post("/lightning-sends", input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-balance"] });
      queryClient.invalidateQueries({ queryKey: ["my-lightning-sends"] });
      queryClient.invalidateQueries({ queryKey: ["my-tips"] });
    },
  });
}
