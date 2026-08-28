export type LnInvoicePaymentStatus = "PENDING" | "PAID" | "EXPIRED";

export interface BlinkGraphQLError {
  message: string;
}

export interface BlinkGraphQLResponse<T> {
  data?: T;
  errors?: BlinkGraphQLError[];
}

export interface BlinkWallet {
  id: string;
  walletCurrency: "BTC" | "USD";
}

export interface BlinkMeResponse {
  me: {
    defaultAccount: {
      wallets: BlinkWallet[];
    };
  } | null;
}

export interface LnInvoiceCreateResponse {
  lnInvoiceCreate: {
    invoice: {
      paymentRequest: string;
      paymentHash: string;
      satoshis: number;
    } | null;
    errors: BlinkGraphQLError[];
  };
}

export interface LnInvoicePaymentStatusResponse {
  lnInvoicePaymentStatus: {
    status: LnInvoicePaymentStatus;
    paymentHash: string;
    errors: BlinkGraphQLError[];
  };
}

export interface CreateInvoiceParams {
  amountSats: number;
  memo?: string;
}

export interface CreateInvoiceResult {
  paymentRequest: string;
  paymentHash: string;
  satoshis: number;
}
