import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/utils/formatters";

type ToastVariant = "success" | "error" | "info";
interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((all) => [...all, { ...t, id }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-white shadow-elevated p-3 animate-in fade-in slide-in-from-bottom-2",
              t.variant === "success" && "border-emerald-200",
              t.variant === "error" && "border-rose-200",
              t.variant === "info" && "border-brand-200"
            )}
          >
            {t.variant === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />}
            {t.variant === "error" && <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />}
            {t.variant === "info" && <Info className="w-5 h-5 text-brand-600 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-ink-900">{t.title}</div>
              {t.description && <div className="text-xs text-ink-600 mt-0.5">{t.description}</div>}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-ink-400 hover:text-ink-700"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
