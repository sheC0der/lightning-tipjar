import axios from "axios";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { logger } from "../../utils/logger.js";
import type {
  BlinkGraphQLResponse,
  BlinkMeResponse,
  CreateInvoiceParams,
  CreateInvoiceResult,
  LnInvoiceCreateResponse,
  LnInvoicePaymentStatus,
  LnInvoicePaymentStatusResponse,
} from "./blink.types.js";

const blinkHttp = axios.create({
  baseURL: env.BLINK_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": env.BLINK_API_KEY,
  },
  timeout: 15_000,
});

async function blinkRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await blinkHttp.post<BlinkGraphQLResponse<T>>("", { query, variables });

    if (data.errors?.length) {
      throw AppError.badGateway(`Blink API error: ${data.errors.map((e) => e.message).join(", ")}`);
    }

    if (!data.data) {
      throw AppError.badGateway("Blink API returned no data");
    }

    return data.data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error("Blink request failed", { error: err instanceof Error ? err.message : String(err) });
    throw AppError.badGateway("Unable to reach the Blink Lightning API");
  }
}

let cachedWalletId: string | null = null;

const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      defaultAccount {
        wallets {
          id
          walletCurrency
        }
      }
    }
  }
`;

export async function getDefaultWalletId(): Promise<string> {
  if (cachedWalletId) return cachedWalletId;

  const result = await blinkRequest<BlinkMeResponse>(ME_QUERY);
  const wallets = result.me?.defaultAccount.wallets ?? [];
  const btcWallet = wallets.find((w) => w.walletCurrency === "BTC");

  if (!btcWallet) {
    throw AppError.badGateway("No BTC wallet found on the configured Blink account");
  }

  cachedWalletId = btcWallet.id;
  return cachedWalletId;
}

const LN_INVOICE_CREATE_MUTATION = /* GraphQL */ `
  mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
    lnInvoiceCreate(input: $input) {
      invoice {
        paymentRequest
        paymentHash
        satoshis
      }
      errors {
        message
      }
    }
  }
`;

export async function createInvoice({ amountSats, memo }: CreateInvoiceParams): Promise<CreateInvoiceResult> {
  const walletId = await getDefaultWalletId();

  const result = await blinkRequest<LnInvoiceCreateResponse>(LN_INVOICE_CREATE_MUTATION, {
    input: {
      walletId,
      amount: amountSats,
      memo,
    },
  });

  const { invoice, errors } = result.lnInvoiceCreate;

  if (errors?.length || !invoice) {
    throw AppError.badGateway(`Failed to create Lightning invoice: ${errors.map((e) => e.message).join(", ")}`);
  }

  return invoice;
}

const LN_INVOICE_PAYMENT_STATUS_QUERY = /* GraphQL */ `
  query LnInvoicePaymentStatus($input: LnInvoicePaymentStatusInput!) {
    lnInvoicePaymentStatus(input: $input) {
      status
      paymentHash
      errors {
        message
      }
    }
  }
`;

export async function getInvoicePaymentStatus(paymentRequest: string): Promise<LnInvoicePaymentStatus> {
  const result = await blinkRequest<LnInvoicePaymentStatusResponse>(LN_INVOICE_PAYMENT_STATUS_QUERY, {
    input: { paymentRequest },
  });

  const { status, errors } = result.lnInvoicePaymentStatus;

  if (errors?.length) {
    throw AppError.badGateway(`Failed to check invoice status: ${errors.map((e) => e.message).join(", ")}`);
  }

  return status;
}
