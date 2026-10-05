import { Banknote, Check, CreditCard } from "lucide-react";
import type { PaymentMethod } from "../../types/order";

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  paypalEnabled: boolean;
  disabled?: boolean;
}

const OPTIONS: { method: PaymentMethod; title: string; text: string; icon: typeof Banknote }[] = [
  { method: "CASH", title: "Espèces", text: "Paiement lors du retrait", icon: Banknote },
  { method: "PAYPAL", title: "PayPal", text: "Paiement en ligne sécurisé", icon: CreditCard },
];

function PaymentMethodSelector({ value, onChange, paypalEnabled, disabled = false }: PaymentMethodSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Mode de paiement" className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2">
      {OPTIONS.map(({ method, title, text, icon: Icon }) => {
        const unavailable = method === "PAYPAL" && !paypalEnabled;
        const selected = value === method;
        return (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || unavailable}
            onClick={() => onChange(method)}
            className={`relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              selected ? "border-ink bg-white ring-2 ring-ink" : "border-[#EADBCB] bg-white hover:border-ink/40"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-ink text-cream" : "bg-cream text-ink"}`}>
              <Icon size={19} strokeWidth={1.7} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-ink">{title}</span>
              <span className="block text-[13px] text-ink-light">{unavailable ? "Bientôt disponible" : text}</span>
            </span>
            {selected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-cream">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default PaymentMethodSelector;
