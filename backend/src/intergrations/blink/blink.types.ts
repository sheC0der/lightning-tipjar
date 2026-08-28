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
  lnInvoicePaymentStatusByPaymentRequest: {
    status: LnInvoicePaymentStatus | null;
    paymentHash: string | null;
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

export type PaymentSendResult = "SUCCESS" | "FAILURE" | "PENDING" | "ALREADY_PAID";

export interface PaymentSendResponsePayload {
  status: PaymentSendResult | null;
  errors: BlinkGraphQLError[];
}

export interface LnAddressPaymentSendResponse {
  lnAddressPaymentSend: PaymentSendResponsePayload;
}

export interface LnInvoicePaymentSendResponse {
  lnInvoicePaymentSend: PaymentSendResponsePayload;
}
