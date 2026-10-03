import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type Variant = "error" | "success" | "info";

const STYLES: Record<Variant, { box: string; icon: ReactNode }> = {
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: <AlertCircle size={18} className="shrink-0 text-red-600" /> },
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> },
  info: { box: "border-[#EADBCB] bg-cream text-ink", icon: <Info size={18} className="shrink-0 text-ink-light" /> },
};

// Message global d'un formulaire (erreur API, information, succès) — animé à l'apparition
function AuthMessage({ variant = "error", children }: { variant?: Variant; children?: ReactNode }) {
  const style = STYLES[variant];
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.div
          role={variant === "error" ? "alert" : "status"}
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${style.box}`}>
            {style.icon}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthMessage;
