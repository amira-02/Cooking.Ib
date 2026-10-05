import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

// Bloque le scroll de la page et ferme avec Échap tant qu'un panneau est ouvert
function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

// Panneau latéral (détail d'une commande, d'un client…) ; plein écran sur mobile
export function Drawer({ open, onClose, title, subtitle, children, footer }: DrawerProps) {
  useOverlay(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#F1E6DA] px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate font-sans text-base font-semibold text-ink">{title}</h2>
                {subtitle && <div className="mt-1 text-[13px] text-ink-light">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-light transition-colors hover:bg-cream hover:text-ink"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <footer className="border-t border-[#F1E6DA] px-5 py-4 sm:px-6">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Fenêtre de confirmation (suppression, annulation…)
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useOverlay(open, onCancel);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center p-4 sm:items-center" role="alertdialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex gap-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  danger ? "bg-red-50 text-red-600" : "bg-cream text-ink"
                }`}
              >
                <AlertTriangle size={18} />
              </span>
              <div>
                <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>
                <div className="mt-1.5 text-sm text-ink-light">{message}</div>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="h-10 rounded-xl border border-[#EADBCB] px-4 text-[13px] font-medium text-ink transition-colors hover:bg-cream"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`h-10 rounded-xl px-4 text-[13px] font-medium text-white transition-colors disabled:opacity-60 ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-ink hover:bg-rose-dark"
                }`}
              >
                {loading ? "Patientez…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

// Fenêtre modale (formulaires) : plein écran en bas sur mobile, centrée sur grand écran
export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }: ModalProps) {
  useOverlay(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[66] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.22 }}
            className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"}`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#F1E6DA] px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>
                {subtitle && <div className="mt-0.5 text-[13px] text-ink-light">{subtitle}</div>}
              </div>
              <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-light hover:bg-cream hover:text-ink">
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <footer className="border-t border-[#F1E6DA] px-5 py-4 sm:px-6">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
