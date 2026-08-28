import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../services/api";
import type { WithdrawalRecord } from "./useDashboard";

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amountSats?: number) =>
      unwrap<WithdrawalRecord>(api.post("/withdrawals", amountSats ? { amountSats } : {})),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-balance"] });
      queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["my-tips"] });
    },
  });
}
