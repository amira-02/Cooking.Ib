import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

// Bouton principal : désactivé + spinner pendant le chargement (empêche le double clic)
function PrimaryButton({ loading = false, loadingText, children, disabled, className = "", ...props }: PrimaryButtonProps) {
  return (
    <motion.button
      whileTap={loading || disabled ? undefined : { scale: 0.985 }}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[15px] font-medium text-cream shadow-[0_8px_20px_-10px_rgba(74,48,40,0.6)] transition-colors duration-300 hover:bg-[#3B261F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

export default PrimaryButton;
