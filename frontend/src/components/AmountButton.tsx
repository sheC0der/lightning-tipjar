import { Zap } from "lucide-react";

interface AmountButtonProps {
  sats: number;
  selected: boolean;
  onClick: () => void;
}

function AmountButton({ sats, selected, onClick }: AmountButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-xl border px-4 py-3 font-medium transition-colors ${
        selected
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50"
      }`}
    >
      <Zap className="h-4 w-4" />
      {sats.toLocaleString()} sats
    </button>
  );
}

export default AmountButton;
