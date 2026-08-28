import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type NotificationKind = "success" | "processing" | "error";

interface NotificationItem {
  id: number;
  kind: NotificationKind;
  message: string;
}

type NotifyFn = (kind: NotificationKind, message: string) => void;

const NotificationContext = createContext<NotifyFn | null>(null);

export function useNotify(): NotifyFn {
  const notify = useContext(NotificationContext);
  if (!notify) throw new Error("useNotify must be used within a NotificationProvider");
  return notify;
}

const ICONS: Record<NotificationKind, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  processing: <Loader2 className="h-5 w-5 animate-spin text-orange-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
};

function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const notify = useCallback<NotifyFn>((kind, message) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-lg"
          >
            {ICONS[item.kind]}
            {item.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
