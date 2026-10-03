import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../ui/States";
import { TrendingUp } from "lucide-react";
import { ChartTooltipBox } from "./ChartTooltip";
import { CHART_COLORS } from "../../constants";
import { formatNumber, formatPriceRounded } from "../../utils/format";
import type { SalesPoint } from "../../types";

type Metric = "revenue" | "orders";

const METRICS: Record<Metric, { label: string; format: (v: number) => string; axis: (v: number) => string }> = {
  revenue: {
    label: "Chiffre d'affaires",
    format: formatPriceRounded,
    axis: (v) => (v >= 1000 ? `${(v / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k€` : `${v} €`),
  },
  orders: { label: "Commandes", format: (v) => formatNumber(v), axis: (v) => formatNumber(v) },
};

interface SalesChartProps {
  data: SalesPoint[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  periodLabel: string;
}

// Une seule mesure à la fois (pas de double axe) : on bascule entre CA et commandes
function SalesChart({ data, loading, error, onRetry, periodLabel }: SalesChartProps) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const meta = METRICS[metric];
  const total = data?.reduce((sum, p) => sum + p[metric], 0) ?? 0;

  return (
    <Card
      title="Évolution des ventes"
      description={periodLabel}
      action={
        <div role="tablist" aria-label="Mesure affichée" className="inline-flex rounded-xl bg-cream p-1">
          {(Object.keys(METRICS) as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={metric === m}
              onClick={() => setMetric(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                metric === m ? "bg-white text-ink shadow-sm" : "text-ink-light hover:text-ink"
              }`}
            >
              {METRICS[m].label}
            </button>
          ))}
        </div>
      }
    >
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading || !data ? (
        <>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-6 h-64 w-full" />
        </>
      ) : data.every((p) => p.orders === 0) ? (
        <EmptyState
          icon={<TrendingUp size={20} strokeWidth={1.6} />}
          title="Aucune vente sur la période"
          description="La courbe s'affichera dès que les premières commandes seront enregistrées."
        />
      ) : (
        <>
          <p className="font-sans text-2xl font-semibold tracking-tight text-ink">{meta.format(total)}</p>
          <p className="text-xs text-ink-light">{meta.label} sur la période</p>
          <div className="mt-4 h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  minTickGap={18}
                  dy={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                  tickFormatter={meta.axis}
                  width={56}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: "3 3" }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <ChartTooltipBox
                        title={label}
                        rows={[
                          { color: CHART_COLORS.primary, label: "Chiffre d'affaires", value: formatPriceRounded(payload[0].payload.revenue) },
                          { label: "Commandes", value: formatNumber(payload[0].payload.orders) },
                        ]}
                      />
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  name={meta.label}
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#salesFill)"
                  activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}

export default SalesChart;
