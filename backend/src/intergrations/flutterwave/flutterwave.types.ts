export type MobileMoneyNetwork = "MTN" | "MPS";

export type TransferStatus = "NEW" | "PENDING" | "INITIATED" | "SUCCESSFUL" | "FAILED" | "CANCELLED";

export interface FlutterwaveMobileNetwork {
  id: string;
  network: string;
  name: string;
}

export interface FlutterwaveListResponse<T> {
  status: "success" | "failed";
  message: string;
  data: T;
}

export interface CreateTransferParams {
  amountRwf: number;
  network: MobileMoneyNetwork;
  phoneNumber: string;
  displayName: string;
  reference: string;
  narration: string;
}

export interface CreateTransferResult {
  id: string;
  reference: string;
  status: TransferStatus;
}

export interface FlutterwaveTransferData {
  id: string;
  reference: string;
  status: TransferStatus;
}

export interface FlutterwaveRateResponse {
  status: "success" | "failed";
  message: string;
  data: {
    rate: string;
    source: { amount: string; currency: string };
    destination: { amount: string; currency: string };
  };
}
