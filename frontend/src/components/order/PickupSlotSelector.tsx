import { Check } from "lucide-react";
import { formatShortDate } from "../../utils/orderStatus";
import type { PickupSlot } from "../../types/order";

interface PickupSlotSelectorProps {
  slots: PickupSlot[];
  value: string | null;
  onChange: (slotId: string) => void;
  disabled?: boolean;
}

// Créneaux proposés par la pâtisserie : un seul choix possible (boutons radio accessibles)
function PickupSlotSelector({ slots, value, onChange, disabled = false }: PickupSlotSelectorProps) {
  const today = new Date().toLocaleDateString("en-CA");
  return (
    <div role="radiogroup" aria-label="Créneau de retrait" className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2">
      {slots.map((slot) => {
        const selected = value === slot.id;
        const past = slot.date < today;
        return (
          <button
            key={slot.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || past}
            onClick={() => onChange(slot.id)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? "border-ink bg-ink text-cream shadow-[0_10px_24px_-14px_rgba(74,48,40,0.7)]" : "border-[#EADBCB] bg-white text-ink hover:border-ink/40"
            }`}
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-cream bg-cream text-ink" : "border-[#D9C6B4]"}`}>
              {selected && <Check size={12} strokeWidth={3} />}
            </span>
            <span>
              <span className="block text-[13px] opacity-80">{formatShortDate(slot.date)}</span>
              <span className="block text-[17px] font-semibold tabular-nums">
                {slot.startTime} – {slot.endTime}
              </span>
              {past && <span className="block text-xs">Créneau passé</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PickupSlotSelector;
