import { useState } from "react";
import { Zap } from "lucide-react";
import AmountButton from "./AmountButton";
import { useCreateTip } from "../hooks/useCreateTip";
import { useNotify } from "./Notification";
import { getErrorMessage } from "../services/api";

const SUGGESTED_AMOUNTS = [1000, 5000, 10000, 50000];

interface TipFormProps {
  username: string;
  onTipCreated: (result: { tipId: string; paymentRequest: string; amountSats: number }) => void;
}

function TipForm({ username, onTipCreated }: TipFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(SUGGESTED_AMOUNTS[1] ?? null);
  const [customAmount, setCustomAmount] = useState("");
  const [tipperName, setTipperName] = useState("");
  const [message, setMessage] = useState("");
  const notify = useNotify();
  const createTip = useCreateTip(username);

  const amountSats = customAmount ? Number(customAmount) : (selectedAmount ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!amountSats || amountSats < 100) {
      notify("error", "Enter an amount of at least 100 sats");
      return;
    }

    notify("processing", "Creating your Lightning invoice...");

    try {
      const result = await createTip.mutateAsync({
        amountSats,
        tipperName: tipperName.trim() || undefined,
        message: message.trim() || undefined,
      });
      onTipCreated({ tipId: result.tip.id, paymentRequest: result.paymentRequest, amountSats });
    } catch (err) {
      notify("error", getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {SUGGESTED_AMOUNTS.map((sats) => (
          <AmountButton
            key={sats}
            sats={sats}
            selected={!customAmount && selectedAmount === sats}
            onClick={() => {
              setSelectedAmount(sats);
              setCustomAmount("");
            }}
          />
        ))}
      </div>

      <input
        type="number"
        min={100}
        placeholder="Custom amount (sats)"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
      />

      <input
        type="text"
        placeholder="Your name (optional)"
        value={tipperName}
        maxLength={60}
        onChange={(e) => setTipperName(e.target.value)}
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
      />

      <textarea
        placeholder="Why are you tipping? (optional)"
        value={message}
        maxLength={280}
        rows={3}
        onChange={(e) => setMessage(e.target.value)}
        className="resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
      />

      <button
        type="submit"
        disabled={createTip.isPending}
        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
      >
        <Zap className="h-4 w-4" />
        {createTip.isPending ? "Creating invoice..." : "Send tip"}
      </button>
    </form>
  );
}

export default TipForm;
