import { Link } from "react-router-dom";
import { ChefHat, ChevronRight, Clock, PackageCheck } from "lucide-react";
import Card from "../ui/Card";
import { ErrorState, Skeleton } from "../ui/States";
import type { OrdersToProcess as Counts } from "../../types";

interface OrdersToProcessProps {
  data: Counts | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const ROWS = [
  { key: "pending", label: "En attente de validation", hint: "À confirmer", icon: Clock, status: "pending", tone: "bg-amber-50 text-amber-700" },
  { key: "preparing", label: "À préparer", hint: "Confirmées ou en cours", icon: ChefHat, status: "to_prepare", tone: "bg-violet-50 text-violet-700" },
  { key: "ready", label: "Prêtes", hint: "À remettre ou expédier", icon: PackageCheck, status: "ready", tone: "bg-teal-50 text-teal-700" },
] as const;

function OrdersToProcess({ data, loading, error, onRetry }: OrdersToProcessProps) {
  const total = data ? data.pending + data.preparing + data.ready : 0;
  return (
    <Card
      title="À traiter aujourd'hui"
      description={
        !data
          ? "Commandes en cours"
          : total === 0
            ? "Aucune commande en attente"
            : `${total} commande${total > 1 ? "s" : ""} demande${total > 1 ? "nt" : ""} votre attention`
      }
    >
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <ul className="space-y-2">
          {ROWS.map(({ key, label, hint, icon: Icon, status, tone }) => (
            <li key={key}>
              {loading || !data ? (
                <Skeleton className="h-[4.25rem] w-full rounded-xl" />
              ) : (
                <Link
                  to={`/admin/orders?statut=${status}`}
                  className="group flex items-center gap-3.5 rounded-xl border border-[#F1E6DA] px-3.5 py-3 transition-all hover:border-ink/15 hover:bg-cream/60"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">{label}</span>
                    <span className="block text-xs text-ink-light">{hint}</span>
                  </span>
                  <span className="font-sans text-xl font-semibold text-ink">{data[key]}</span>
                  <ChevronRight size={16} className="text-ink-light transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default OrdersToProcess;
