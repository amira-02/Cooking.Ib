import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CircleCheck, CircleX } from "lucide-react";
import Card from "../ui/Card";
import { StockBadge } from "../ui/Badges";
import { EmptyState, ErrorState, Skeleton } from "../ui/States";
import { STOCK_STATUS } from "../../constants";
import type { StockItem, StockStatus } from "../../types";

interface StockAlertProps {
  data: { items: StockItem[]; counts: Record<StockStatus, number> } | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SUMMARY: { status: StockStatus; icon: typeof CircleCheck; tone: string }[] = [
  { status: "in_stock", icon: CircleCheck, tone: "text-emerald-600" },
  { status: "low", icon: AlertTriangle, tone: "text-amber-600" },
  { status: "out", icon: CircleX, tone: "text-red-600" },
];

function StockAlert({ data, loading, error, onRetry }: StockAlertProps) {
  const alerts = data?.items.filter((i) => i.stockStatus === "low" || i.stockStatus === "out") ?? [];
  const tracked = data ? data.items.length - data.counts.untracked : 0;

  return (
    <Card
      title="État du stock"
      description="Produits à réapprovisionner"
      action={
        <Link to="/admin/products" className="inline-flex items-center gap-1 text-[13px] font-medium text-rose-dark hover:text-ink">
          Gérer le stock <ArrowRight size={14} />
        </Link>
      }
    >
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading || !data ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Statut = icône + libellé + nombre, jamais la couleur seule */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-cream/70 p-3">
            {SUMMARY.map(({ status, icon: Icon, tone }) => (
              <div key={status} className="text-center">
                <Icon size={16} className={`mx-auto ${tone}`} />
                <p className="mt-1 font-sans text-lg font-semibold text-ink">{data.counts[status]}</p>
                <p className="text-[11px] text-ink-light">{STOCK_STATUS[status].label}</p>
              </div>
            ))}
          </div>

          {data.counts.untracked > 0 && (
            <p className="mt-3 text-xs text-ink-light">
              {data.counts.untracked} produit{data.counts.untracked > 1 ? "s" : ""} sans suivi de stock —{" "}
              <Link to="/admin/products" className="font-medium text-rose-dark hover:text-ink">
                renseigner le stock
              </Link>
            </p>
          )}

          {tracked === 0 ? (
            <EmptyState
              compact
              icon={<CircleCheck size={20} />}
              title="Stock pas encore suivi"
              description="Indiquez la quantité disponible de vos produits pour recevoir des alertes de stock faible."
            />
          ) : alerts.length === 0 ? (
            <EmptyState compact icon={<CircleCheck size={20} />} title="Tout est en stock" description="Aucun produit sous son seuil d'alerte." />
          ) : (
            <ul className="mt-4 space-y-3.5">
              {alerts.map((item) => {
                const stock = item.stock ?? 0;
                const ratio = Math.min(1, stock / (item.lowStockThreshold * 2));
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-ink">{item.name}</p>
                        <StockBadge status={item.stockStatus} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4E9DE]" aria-hidden>
                          <div className={`h-full rounded-full ${STOCK_STATUS[item.stockStatus].bar}`} style={{ width: `${Math.max(ratio * 100, 4)}%` }} />
                        </div>
                        <span className="w-20 shrink-0 text-right text-xs text-ink-light">
                          {stock === 0 ? "épuisé" : `${stock} restant${stock > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

export default StockAlert;
