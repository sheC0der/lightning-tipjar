export interface PaymentStatusResponse {
  tipId: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  paidAt: Date | null;
}
