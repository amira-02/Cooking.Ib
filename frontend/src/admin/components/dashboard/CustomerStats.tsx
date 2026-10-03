import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../ui/States";
import { ChartTooltipBox } from "./ChartTooltip";
import { CHART_COLORS } from "../../constants";
import { formatNumber, formatPercent, percentChange } from "../../utils/format";
import type { CustomerStats as Stats, KpiValue } from "../../types";

interface CustomerStatsProps {
  data: Stats | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function MiniStat({ label, kpi, percent = false }: { label: string; kpi: KpiValue; percent?: boolean }) {
  const change = percentChange(kpi);
  return (
    <div className="rounded-xl bg-cream/70 p-3.5">
      <p className="text-xs text-ink-light">{label}</p>
      <p className="mt-1 font-sans text-xl font-semibold text-ink">{percent ? formatPercent(kpi.value, 0) : formatNumber(kpi.value)}</p>
      {change !== null && (
        <p className={`text-xs font-medium ${change >= 0 ? "text-emerald-700" : "text-red-700"}`}>
          {change >= 0 ? "+" : ""}
          {formatPercent(change)}
        </p>
      )}
    </div>
  );
}

function CustomerStats({ data, loading, error, onRetry }: CustomerStatsProps) {
  return (
    <Card
      title="Activité clients"
      description="Acquisition et fidélité sur la période"
      action={
        <Link to="/admin/customers" className="inline-flex items-center gap-1 text-[13px] font-medium text-rose-dark hover:text-ink">
          Voir les clients <ArrowRight size={14} />
        </Link>
      }
    >
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading || !data ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-52 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Nouveaux clients" kpi={data.newCustomers} />
            <MiniStat label="Clients actifs" kpi={data.activeCustomers} />
            <MiniStat label="Clients fidèles (3+ cmd)" kpi={data.loyalCustomers} />
            <MiniStat label="Taux de retour" kpi={data.returnRate} percent />
          </div>

          {data.evolution.every((p) => p.total === 0) ? (
            <EmptyState
              compact
              title="Aucun client inscrit pour l'instant"
              description="La courbe s'affichera dès les premières inscriptions sur la boutique."
            />
          ) : (
          <div>
            <p className="text-xs text-ink-light">Nombre total de clients inscrits</p>
            <div className="mt-2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.evolution} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} minTickGap={18} dy={6} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                    width={44}
                    domain={[(min: number) => Math.max(0, Math.floor(min * 0.9)), (max: number) => Math.max(5, Math.ceil(max * 1.1))]}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: "3 3" }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <ChartTooltipBox
                          title={label}
                          rows={[
                            { color: CHART_COLORS.primary, label: "Clients inscrits", value: formatNumber(payload[0].payload.total) },
                            { label: "Nouveaux", value: `+${formatNumber(payload[0].payload.new)}` },
                          ]}
                        />
                      ) : null
                    }
                  />
                  <Line type="monotone" dataKey="total" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default CustomerStats;
