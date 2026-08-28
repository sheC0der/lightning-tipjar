import crypto from "node:crypto";
import axios from "axios";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { logger } from "../../utils/logger.js";
import type {
  CreateTransferParams,
  CreateTransferResult,
  FlutterwaveListResponse,
  FlutterwaveMobileNetwork,
  FlutterwaveRateResponse,
  FlutterwaveTransferData,
  MobileMoneyNetwork,
} from "./flutterwave.types.js";

interface FlutterwaveErrorBody {
  message?: string;
  error?: {
    message?: string;
    validation_errors?: { field_name: string; message: string }[];
  };
}

function handleFlutterwaveError(err: unknown, action: string): never {
  let message: string;

  if (axios.isAxiosError(err)) {
    const body = err.response?.data as FlutterwaveErrorBody | undefined;
    const validationDetail = body?.error?.validation_errors
      ?.map((v) => `${v.field_name}: ${v.message}`)
      .join("; ");
    message = validationDetail || body?.error?.message || body?.message || err.message;
  } else {
    message = err instanceof Error ? err.message : String(err);
  }

  logger.error(`Flutterwave ${action} failed`, { error: message });
  throw AppError.badGateway(`Flutterwave ${action} failed: ${message}`);
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const params = new URLSearchParams({
      client_id: env.FLUTTERWAVE_CLIENT_ID,
      client_secret: env.FLUTTERWAVE_CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    const { data } = await axios.post<{ access_token: string; expires_in: number }>(
      env.FLUTTERWAVE_TOKEN_URL,
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 15_000 },
    );

    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 30) * 1000,
    };

    return cachedToken.token;
  } catch (err) {
    handleFlutterwaveError(err, "OAuth2 token exchange");
  }
}

const flutterwaveHttp = axios.create({
  baseURL: env.FLUTTERWAVE_API_URL,
  timeout: 15_000,
});

flutterwaveHttp.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Trace-Id"] = crypto.randomUUID();
  return config;
});

let cachedRwandaNetworks: FlutterwaveMobileNetwork[] | null = null;

export async function getRwandaNetworkCode(network: MobileMoneyNetwork): Promise<string> {
  if (!cachedRwandaNetworks) {
    try {
      const { data } = await flutterwaveHttp.get<FlutterwaveListResponse<FlutterwaveMobileNetwork[]>>(
        "/mobile-networks",
        { params: { country: "RW" } },
      );
      cachedRwandaNetworks = data.data;
    } catch (err) {
      handleFlutterwaveError(err, "mobile network lookup");
    }
  }

  const match = cachedRwandaNetworks.find((n) => n.network === network);

  if (!match) {
    throw AppError.badGateway(`Flutterwave does not currently support the ${network} network for Rwanda payouts`);
  }

  return match.network;
}

const BTC_USD_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

async function getBtcUsdRate(): Promise<number> {
  try {
    const { data } = await axios.get<{ bitcoin: { usd: number } }>(BTC_USD_PRICE_URL, { timeout: 10_000 });
    return data.bitcoin.usd;
  } catch (err) {
    handleFlutterwaveError(err, "BTC/USD rate lookup");
  }
}

async function getUsdRwfRate(): Promise<number> {
  try {
    const { data } = await flutterwaveHttp.post<FlutterwaveRateResponse>("/transfers/rates", {
      source: { currency: "USD" },
      destination: { currency: "RWF", amount: 1 },
    });
    return Number.parseFloat(data.data.rate);
  } catch (err) {
    handleFlutterwaveError(err, "USD/RWF rate lookup");
  }
}

export async function satsToRwf(amountSats: number): Promise<{ amountRwf: number; exchangeRateUsed: number }> {
  const [btcUsd, usdRwf] = await Promise.all([getBtcUsdRate(), getUsdRwfRate()]);
  const satUsd = btcUsd / 100_000_000;
  const exchangeRateUsed = satUsd * usdRwf;
  const amountRwf = Math.round(amountSats * exchangeRateUsed * 100) / 100;

  return { amountRwf, exchangeRateUsed };
}

function splitName(displayName: string): { first: string; last: string } {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0] ?? "TipJar", last: "Creator" };
  return { first: parts[0] ?? "TipJar", last: parts.slice(1).join(" ") };
}

export async function createTransfer({
  amountRwf,
  network,
  phoneNumber,
  displayName,
  reference,
  narration,
}: CreateTransferParams): Promise<CreateTransferResult> {
  const networkCode = await getRwandaNetworkCode(network);
  const recipientName = splitName(displayName);

  try {
    const { data } = await flutterwaveHttp.post<FlutterwaveListResponse<FlutterwaveTransferData>>(
      "/direct-transfers",
      {
        type: "mobile_money",
        action: "instant",
        reference,
        narration,
        payment_instruction: {
          source_currency: "RWF",
          destination_currency: "RWF",
          amount: { value: amountRwf, applies_to: "destination_currency" },
          recipient: {
            name: recipientName,
            mobile_money: { network: networkCode, country: "RW", msisdn: phoneNumber },
          },
          sender: {
            name: { first: "Lightning", last: "TipJar" },
            phone: { country_code: "250", number: phoneNumber.replace(/^0/, "") },
            email: env.FLUTTERWAVE_SENDER_EMAIL,
            address: { city: "Kigali", country: "RW", line1: "N/A", postal_code: "0000", state: "Kigali" },
          },
        },
      },
      { headers: { "X-Idempotency-Key": reference } },
    );

    return { id: data.data.id, reference: data.data.reference, status: data.data.status };
  } catch (err) {
    handleFlutterwaveError(err, "transfer creation");
  }
}

export async function getTransferStatus(transferId: string): Promise<FlutterwaveTransferData> {
  try {
    const { data } = await flutterwaveHttp.get<FlutterwaveListResponse<FlutterwaveTransferData>>(
      `/transfers/${transferId}`,
    );
    return data.data;
  } catch (err) {
    handleFlutterwaveError(err, "transfer status lookup");
  }
}
