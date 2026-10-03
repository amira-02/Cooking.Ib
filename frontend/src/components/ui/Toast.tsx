import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-600" />,
  error: <AlertCircle size={18} className="text-red-600" />,
  info: <Info size={18} className="text-sky-600" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* aria-live : les lecteurs d'écran annoncent les messages */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-[#F1E6DA] bg-white px-4 py-3 shadow-[0_12px_32px_-12px_rgba(74,48,40,0.3)]"
            >
              <span className="mt-0.5 shrink-0">{ICONS[toast.kind]}</span>
              <p className="flex-1 text-[13px] text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Fermer"
                className="shrink-0 text-ink-light hover:text-ink"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast doit être utilisé dans un ToastProvider");
  return show;
}
