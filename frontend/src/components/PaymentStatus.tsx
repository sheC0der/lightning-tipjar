import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Copy, Loader2, XCircle, Zap } from "lucide-react";
import { useCreatePaymentStatus } from "../hooks/useCreatePaymentStatus";

interface PaymentStatusProps {
  tipId: string;
  paymentRequest: string;
  amountSats: number;
  onPaid: () => void;
}

function PaymentStatus({ tipId, paymentRequest, amountSats, onPaid }: PaymentStatusProps) {
  const { data } = useCreatePaymentStatus(tipId);
  const [copied, setCopied] = useState(false);
  const status = data?.status ?? "PENDING";

  useEffect(() => {
    if (status === "PAID") onPaid();
  }, [status, onPaid]);

  async function copyInvoice() {
    await navigator.clipboard.writeText(paymentRequest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "EXPIRED" || status === "FAILED") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="font-medium text-slate-900">
          {status === "EXPIRED" ? "This invoice expired" : "Something went wrong"}
        </p>
        <p className="text-sm text-slate-500">Please try again to send your tip.</p>
      </div>
    );
  }

  if (status === "PAID") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="font-medium text-slate-900">Tip sent successfully!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <QRCodeSVG value={paymentRequest} size={220} />
      </div>
      <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
        <Zap className="h-4 w-4 text-orange-500" />
        {amountSats.toLocaleString()} sats
      </p>
      <button
        type="button"
        onClick={copyInvoice}
        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? "Copied!" : "Copy invoice"}
      </button>
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Waiting for payment...
      </p>
    </div>
  );
}

export default PaymentStatus;
