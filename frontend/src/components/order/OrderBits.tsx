import { CalendarClock, Check, CircleDot, KeyRound } from "lucide-react";
import { formatDateTime, ORDER_STATUS_META } from "../../utils/orderStatus";
import type { OrderHistoryEntry, OrderStatus } from "../../types/order";

export function OrderStatusBadge({ status, client = false }: { status: OrderStatus; client?: boolean }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {client ? meta.clientLabel : meta.label}
    </span>
  );
}

// Code de retrait : grand, lisible, à présenter en boutique
export function PickupCodeCard({ code, hint = "Présentez ce code lors du retrait de votre commande." }: { code: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-rose-dark/50 bg-cream p-5 text-center">
      <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-light">
        <KeyRound size={14} /> Code de retrait
      </p>
      <p className="mt-2 font-mono text-[2rem] font-semibold tracking-[0.3em] text-ink" aria-label={`Code de retrait : ${code.split("").join(" ")}`}>
        {code}
      </p>
      <p className="mt-1 text-xs text-ink-light">{hint}</p>
    </div>
  );
}

// Historique de la commande (du plus ancien au plus récent)
export function OrderTimeline({ history }: { history: OrderHistoryEntry[] }) {
  const entries = [...history].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute bottom-2 left-[7px] top-2 w-px bg-[#EADBCB]" aria-hidden />
      {entries.map((entry, i) => {
        const last = i === entries.length - 1;
        const Icon = entry.type === "slot_selected" ? CalendarClock : last ? CircleDot : Check;
        return (
          <li key={`${entry.at}-${i}`} className="relative">
            <span
              className={`absolute -left-6 top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full ${
                last ? "bg-rose-dark text-white" : entry.visibility === "admin" ? "bg-stone-200 text-stone-500" : "bg-ink text-cream"
              }`}
            >
              <Icon size={9} strokeWidth={3} />
            </span>
            <p className={`text-[13px] ${entry.visibility === "admin" ? "text-ink-light" : "text-ink"}`}>{entry.message}</p>
            <p className="text-[11px] text-ink-light">
              {formatDateTime(entry.at)}
              {entry.visibility === "admin" && " · visible uniquement par l'administration"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
