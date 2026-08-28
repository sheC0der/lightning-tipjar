import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BLINK_API_URL: z.string().url().default("https://api.blink.sv/graphql"),
  BLINK_API_KEY: z.string().min(1, "BLINK_API_KEY is required"),
  BLINK_WEBHOOK_SECRET: z.string().optional(),
  FLUTTERWAVE_API_URL: z.string().url().default("https://developersandbox-api.flutterwave.com"),
  FLUTTERWAVE_TOKEN_URL: z
    .string()
    .url()
    .default("https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token"),
  FLUTTERWAVE_CLIENT_ID: z.string().min(1, "FLUTTERWAVE_CLIENT_ID is required"),
  FLUTTERWAVE_CLIENT_SECRET: z.string().min(1, "FLUTTERWAVE_CLIENT_SECRET is required"),
  FLUTTERWAVE_ENCRYPTION_KEY: z.string().optional(),
  FLUTTERWAVE_SENDER_EMAIL: z.string().email().default("payouts@lightningtipjar.app"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error("Environment validation failed. Check your .env file against .env.example.");
  }

  return parsed.data;
}

export const env = loadEnv();
export type Env = typeof env;
