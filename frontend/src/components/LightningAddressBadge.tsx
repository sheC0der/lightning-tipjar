import { useState } from "react";
import { Copy, Zap } from "lucide-react";

interface LightningAddressBadgeProps {
  address: string;
}

function LightningAddressBadge({ address }: LightningAddressBadgeProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50"
      title="Copy Lightning Address"
    >
      <Zap className="h-3.5 w-3.5 text-orange-500" />
      {address}
      <Copy className="h-3.5 w-3.5 text-slate-400" />
      {copied && <span className="text-xs text-emerald-600">Copied!</span>}
    </button>
  );
}

export default LightningAddressBadge;
