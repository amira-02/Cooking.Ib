import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  label?: string;
  size?: "sm" | "md";
}

// −  2  +  : jamais en dessous du minimum ni au-dessus du maximum disponible
function QuantitySelector({ value, onChange, min = 1, max, label = "Quantité", size = "md" }: QuantitySelectorProps) {
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const atMax = value >= max;
  return (
    <div className="inline-flex items-center rounded-full border border-[#EADBCB] bg-white" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className={`${box} flex items-center justify-center rounded-full text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <Minus size={15} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const next = Math.floor(Number(e.target.value));
          if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next)));
        }}
        aria-label={label}
        className="w-9 appearance-none bg-transparent text-center text-[15px] font-medium tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={atMax}
        aria-label="Augmenter la quantité"
        title={atMax ? `Quantité maximale disponible : ${max}` : undefined}
        className={`${box} flex items-center justify-center rounded-full text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

export default QuantitySelector;
