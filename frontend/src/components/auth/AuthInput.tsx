import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string | null;
  // Indicateur discret quand la valeur est valide
  valid?: boolean;
  // Élément à droite du champ (ex : bouton afficher / masquer)
  trailing?: ReactNode;
}

// Champ de formulaire : label, icône, états normal / focus / erreur / validé / désactivé
const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, icon: Icon, error, valid = false, trailing, id, className = "", disabled, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  const stateClasses = hasError
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-[#EADBCB] hover:border-[#D9C6B4] focus:border-ink focus:ring-rose/25";

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.7}
            aria-hidden
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              hasError ? "text-red-400" : "text-ink-light/70"
            }`}
          />
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          // text-base sur mobile : évite le zoom automatique d'iOS sur les champs < 16px
          className={`h-12 w-full rounded-xl border bg-white text-base text-ink shadow-[0_1px_2px_rgba(74,48,40,0.04)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-light/55 focus:ring-4 disabled:cursor-not-allowed disabled:bg-cream/70 disabled:text-ink-light sm:text-[15px] ${
            Icon ? "pl-11" : "pl-4"
          } ${trailing || valid ? "pr-11" : "pr-4"} ${stateClasses}`}
          {...props}
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center">
          {trailing}
          {!trailing && valid && !hasError && (
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
              aria-hidden
            >
              <Check size={12} strokeWidth={3} />
            </motion.span>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {hasError && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-1.5 overflow-hidden pt-1.5 text-[13px] text-red-700"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AuthInput;
