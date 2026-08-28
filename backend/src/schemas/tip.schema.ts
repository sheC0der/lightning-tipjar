import { z } from "zod";

export const MIN_TIP_SATS = 100;
export const MAX_TIP_SATS = 10_000_000;

export const createTipSchema = z.object({
  amountSats: z
    .number()
    .int("Amount must be a whole number of sats")
    .min(MIN_TIP_SATS, `Minimum tip is ${MIN_TIP_SATS} sats`)
    .max(MAX_TIP_SATS, "Amount is too large"),
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
