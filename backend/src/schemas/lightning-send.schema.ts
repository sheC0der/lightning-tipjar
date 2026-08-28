import { z } from "zod";

const lightningAddressPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const invoicePattern = /^ln(bc|tb)[a-z0-9]+$/i;

export const createLightningSendSchema = z.object({
  destination: z
    .string()
    .min(1, "Destination is required")
    .refine(
      (value) => lightningAddressPattern.test(value) || invoicePattern.test(value),
      "Enter a valid Lightning Address (user@wallet.com) or a Lightning invoice",
    ),
  amountSats: z.number().int().positive().optional(),
});

export type CreateLightningSendInput = z.infer<typeof createLightningSendSchema>;
