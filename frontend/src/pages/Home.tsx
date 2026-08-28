import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, Wallet, Zap } from "lucide-react";
import { isAuthenticated } from "../hooks/useAuth";

function Home() {
  const authed = isAuthenticated();

  return (
    <div className="flex flex-col items-center gap-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white">
          <Zap className="h-8 w-8" />
        </div>
        <h1 className="max-w-xl text-3xl font-bold text-slate-900 sm:text-4xl">
          Send sats globally. Receive value locally.
        </h1>
        <p className="max-w-lg text-slate-600">
          Sangira TipJar lets anyone support creators, workers, and developers with Bitcoin over the Lightning
          Network — and cash out straight to Mobile Money in Rwandan Francs.
        </p>
        <Link
          to={authed ? "/dashboard" : "/register"}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
        >
          {authed ? "Go to your dashboard" : "Create your TipJar"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-6">
          <Zap className="h-6 w-6 text-orange-500" />
          <h3 className="font-medium text-slate-900">Instant tips</h3>
          <p className="text-sm text-slate-500">Fans send sats over Lightning in seconds, no bank account needed.</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-6">
          <Wallet className="h-6 w-6 text-orange-500" />
          <h3 className="font-medium text-slate-900">Real balance</h3>
          <p className="text-sm text-slate-500">Every tip is tracked in your dashboard, ready to withdraw anytime.</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-6">
          <Smartphone className="h-6 w-6 text-orange-500" />
          <h3 className="font-medium text-slate-900">Mobile Money payouts</h3>
          <p className="text-sm text-slate-500">Convert your sats to RWF and withdraw directly to your phone.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
