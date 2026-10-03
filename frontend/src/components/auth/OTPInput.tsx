import { forwardRef, useImperativeHandle, useRef } from "react";
import { motion } from "framer-motion";

export interface OTPInputHandle {
  focus: () => void;
}

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  // Appelé dès que les 6 chiffres sont saisis (validation automatique)
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  // Change à chaque erreur pour rejouer l'animation de secousse
  shakeKey?: number;
  success?: boolean;
}

// 6 cases séparées : avance automatique, retour arrière, collage d'un code, chiffres uniquement
const OTPInput = forwardRef<OTPInputHandle, OTPInputProps>(function OTPInput(
  { value, onChange, onComplete, length = 6, disabled = false, error = false, shakeKey = 0, success = false },
  ref
) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useImperativeHandle(ref, () => ({
    focus: () => inputs.current[Math.min(value.length, length - 1)]?.focus(),
  }));

  function focusBox(index: number) {
    const box = inputs.current[Math.max(0, Math.min(index, length - 1))];
    box?.focus();
    box?.select();
  }

  function update(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  }

  function handleInput(index: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // Plusieurs chiffres d'un coup (collage, remplissage automatique du clavier) : on remplit à partir d'ici
    const next = (value.slice(0, index) + typed + value.slice(index + typed.length)).slice(0, length);
    update(next);
    focusBox(index + typed.length);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        update(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        update(value.slice(0, index - 1) + value.slice(index));
        focusBox(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    update(pasted);
    focusBox(pasted.length);
  }

  return (
    <motion.div
      key={shakeKey}
      role="group"
      aria-label={`Code de vérification à ${length} chiffres`}
      animate={shakeKey ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : undefined}
      transition={{ duration: 0.45 }}
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          value={digit}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          // Sur mobile, le clavier propose directement le code reçu par email/SMS
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`Chiffre ${i + 1}`}
          className={`aspect-[4/5] h-auto max-h-16 w-full min-w-0 rounded-xl border bg-white text-center font-sans text-2xl font-semibold text-ink caret-rose-dark shadow-[0_1px_2px_rgba(74,48,40,0.04)] outline-none transition-[border-color,box-shadow,transform] duration-200 focus:scale-[1.04] focus:ring-4 disabled:opacity-70 sm:text-[1.7rem] ${
            success
              ? "border-emerald-400 bg-emerald-50/60 text-emerald-800"
              : error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : digit
                  ? "border-ink/40 focus:border-ink focus:ring-rose/25"
                  : "border-[#EADBCB] focus:border-ink focus:ring-rose/25"
          }`}
        />
      ))}
    </motion.div>
  );
});

export default OTPInput;
