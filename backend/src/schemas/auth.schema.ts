import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9-]+$/, "Username may only contain lowercase letters, numbers, and hyphens");

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required").max(80),
  bio: z.string().max(280).optional(),
  mobileMoneyNetwork: z.enum(["MTN", "MPS"]),
  mobileMoneyNumber: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Enter a valid mobile money phone number"),
});

export const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional(),
  mobileMoneyNetwork: z.enum(["MTN", "MPS"]).optional(),
  mobileMoneyNumber: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Enter a valid mobile money phone number")
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
