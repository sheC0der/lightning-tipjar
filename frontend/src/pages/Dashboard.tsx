import { Loader2, Wallet, Zap } from "lucide-react";
import { useCurrentCreator } from "../hooks/useAuth";
import { useMyBalance, useMyTips, useMyWithdrawals } from "../hooks/useDashboard";
import { useWithdraw } from "../hooks/useWithdraw";
import { useNotify } from "../components/Notification";
import { getErrorMessage } from "../services/api";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function Dashboard() {
  const { data: me } = useCurrentCreator();
  const { data: balance, isLoading: balanceLoading } = useMyBalance();
  const { data: tips } = useMyTips();
  const { data: withdrawals } = useMyWithdrawals();
  const withdraw = useWithdraw();
  const notify = useNotify();

  async function handleWithdraw() {
    try {
      await withdraw.mutateAsync(undefined);
      notify("success", "Withdrawal initiated");
    } catch (err) {
      notify("error", getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Welcome back{me ? `, ${me.displayName}` : ""}
        </h1>
        <p className="text-sm text-slate-500">Here's how your TipJar is doing.</p>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Available balance</p>
          {balanceLoading ? (
            <Loader2 className="mt-2 h-5 w-5 animate-spin text-orange-500" />
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="flex items-center gap-1 text-2xl font-semibold text-slate-900">
                <Zap className="h-5 w-5 text-orange-500" />
                {(balance?.availableSats ?? 0).toLocaleString()} sats
              </span>
              <span className="text-sm text-slate-500">≈ {(balance?.estimatedRwf ?? 0).toLocaleString()} RWF</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={withdraw.isPending || !balance?.availableSats}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Wallet className="h-4 w-4" />
          {withdraw.isPending ? "Processing..." : "Withdraw to Mobile Money"}
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-slate-900">Recent tips</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          {!tips || tips.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No tips yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">From</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Message</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {tips.map((tip) => (
                  <tr key={tip.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{tip.tipperName ?? "Anonymous"}</td>
                    <td className="px-4 py-2">{tip.amountSats.toLocaleString()} sats</td>
                    <td className="max-w-[200px] truncate px-4 py-2 text-slate-500">{tip.message ?? "—"}</td>
                    <td className="px-4 py-2">{tip.status}</td>
                    <td className="px-4 py-2 text-slate-500">{formatDate(tip.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-slate-900">Withdrawal history</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          {!withdrawals || withdrawals.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No withdrawals yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">RWF</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{w.amountSats.toLocaleString()} sats</td>
                    <td className="px-4 py-2">{w.amountRwf.toLocaleString()} RWF</td>
                    <td className="px-4 py-2">{w.status}</td>
                    <td className="px-4 py-2 text-slate-500">{formatDate(w.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
