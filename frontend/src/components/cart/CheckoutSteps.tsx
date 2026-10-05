import { Check } from "lucide-react";
import { CLIENT_STEPS } from "../../utils/orderStatus";

// 1. Panier → 2. Précommande → 3. Validation → 4. Retrait : le client sait toujours où il en est
function CheckoutSteps({ current, cancelled = false }: { current: number; cancelled?: boolean }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Étapes de la précommande">
      {CLIENT_STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className={`flex min-w-0 items-center gap-2 sm:gap-3 ${active ? "flex-[1.8]" : "flex-1"}`} aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                cancelled && active
                  ? "bg-stone-300 text-white"
                  : done
                    ? "bg-ink text-cream"
                    : active
                      ? "bg-rose-dark text-white ring-4 ring-rose/25"
                      : "bg-[#F4E9DE] text-ink-light"
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : step}
            </span>
            <span className={`text-xs sm:text-[13px] ${active ? "shrink-0 whitespace-nowrap font-semibold text-ink" : "hidden whitespace-nowrap text-ink-light md:inline"}`}>
              {label}
            </span>
            {step < CLIENT_STEPS.length && <span className={`h-px flex-1 ${done ? "bg-ink/40" : "bg-[#EADBCB]"}`} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export default CheckoutSteps;
