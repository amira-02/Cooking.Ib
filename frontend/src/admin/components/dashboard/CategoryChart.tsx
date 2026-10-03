import { PieChart } from "lucide-react";
import Card from "../ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../ui/States";
import { formatNumber, formatPercent, formatPriceRounded } from "../../utils/format";
import type { CategorySales } from "../../types";

interface CategoryChartProps {
  data: CategorySales[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// Barres horizontales classées : lisibles quel que soit le nombre de catégories
// (un donut devient illisible au-delà de 4 parts)
function CategoryChart({ data, loading, error, onRetry }: CategoryChartProps) {
  const total = data?.reduce((s, c) => s + c.revenue, 0) ?? 0;
  const max = Math.max(...(data?.map((c) => c.revenue) ?? [0]), 1);

  return (
    <Card title="Ventes par catégorie" description="Part du chiffre d'affaires">
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading || !data ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          compact
          icon={<PieChart size={20} strokeWidth={1.6} />}
          title="Aucune vente sur la période"
          description="La répartition par catégorie apparaîtra dès vos premières commandes."
        />
      ) : (
        <>
          <p className="font-sans text-2xl font-semibold tracking-tight text-ink">{formatPriceRounded(total)}</p>
          <p className="text-xs text-ink-light">Chiffre d'affaires total</p>
          <ul className="mt-5 space-y-4">
            {data.map((c) => (
              <li key={c.category}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="truncate text-ink">{c.category}</span>
                  <span className="shrink-0 font-semibold text-ink">
                    {formatPercent(c.percent, 0)}
                    <span className="ml-2 font-normal text-ink-light">{formatNumber(c.sales)} ventes</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream" aria-hidden>
                  <div className="h-full rounded-full bg-ink transition-all duration-700" style={{ width: `${(c.revenue / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export default CategoryChart;
