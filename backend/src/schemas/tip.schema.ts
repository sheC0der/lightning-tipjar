import { z } from "zod";

export const createTipSchema = z.object({
  amountSats: z
    .number()
    .int("Amount must be a whole number of sats")
    .min(100, "Minimum tip is 100 sats")
    .max(10_000_000, "Amount is too large"),
  tipperName: z.string().max(60).optional(),
  message: z.string().max(280).optional(),
});

export const usernameParamSchema = z.object({
  username: z.string().min(1),
});

export const tipIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateTipInput = z.infer<typeof createTipSchema>;
