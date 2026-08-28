import { z } from "zod";

export const createWithdrawalSchema = z.object({
  amountSats: z.number().int().positive().optional(),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
