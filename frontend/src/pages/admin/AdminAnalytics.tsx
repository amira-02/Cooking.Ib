import { useState } from "react";
import { Euro, Percent, ShoppingBag, ShoppingBasket } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../admin/components/ui/Card";
import PeriodSelect from "../../admin/components/ui/PeriodSelect";
import { EmptyState, ErrorState, Skeleton } from "../../admin/components/ui/States";
import StatCard from "../../admin/components/dashboard/StatCard";
import SalesChart from "../../admin/components/dashboard/SalesChart";
import CustomerStats from "../../admin/components/dashboard/CustomerStats";
import { ChartTooltipBox } from "../../admin/components/dashboard/ChartTooltip";
import { useAsync } from "../../admin/hooks/useAsync";
import { getAnalytics } from "../../admin/services/dashboardService";
import { CHART_COLORS, PERIOD_OPTIONS } from "../../admin/constants";
import { formatNumber, formatPercent, formatPriceRounded } from "../../admin/utils/format";
import { formatPrice } from "../../utils/formatPrice";
import type { FunnelStep, Period, ProductPerformance } from "../../admin/types";

const NEW_COLOR = CHART_COLORS.categorical[0];
const RETURNING_COLOR = CHART_COLORS.categorical[1];

// Entonnoir en barres HTML : chaque étape affiche sa valeur et le taux de passage
function Funnel({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0]?.value || 1;
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => {
        const rate = i > 0 && steps[i - 1].value ? (step.value / steps[i - 1].value) * 100 : null;
        return (
          <li key={step.label}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-ink">{step.label}</span>
              <span className="font-semibold text-ink">
                {formatNumber(step.value)}
                {rate !== null && <span className="ml-2 text-xs font-normal text-ink-light">{formatPercent(rate)} de l'étape précédente</span>}
              </span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-cream" aria-hidden>
              <div className="h-full rounded-full bg-ink transition-all duration-700" style={{ width: `${Math.max((step.value / max) * 100, 1.5)}%`, opacity: 1 - i * 0.18 }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ProductRanking({ title, description, items, unit, emptyText }: { title: string; description: string; items: ProductPerformance[]; unit: string; emptyText: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Card title={title} description={description}>
      {items.length === 0 ? (
        <EmptyState compact title={emptyText} />
      ) : (
      <ol className="space-y-3.5">
        {items.map((p, i) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-xs text-ink-light">{i + 1}</span>
            <img src={p.image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" loading="lazy" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-medium text-ink">{p.name}</p>
                <p className="shrink-0 text-xs font-semibold text-ink">
                  {formatNumber(p.value)} <span className="font-normal text-ink-light">{unit}</span>
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream" aria-hidden>
                <div className="h-full rounded-full bg-rose-dark" style={{ width: `${(p.value / max) * 100}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      )}
    </Card>
  );
}

function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const periodMeta = PERIOD_OPTIONS.find((p) => p.value === period)!;
  const analytics = useAsync(() => getAnalytics(period), [period]);
  const a = analytics.data;
  const loading = analytics.loading || !a;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-light">Analyse détaillée · {periodMeta.label.toLowerCase()}</p>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {analytics.error ? (
        <Card>
          <ErrorState message={analytics.error} onRetry={analytics.retry} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Chiffre d'affaires" value={a ? formatPriceRounded(a.stats.revenue.value) : ""} kpi={a?.stats.revenue} icon={<Euro size={18} strokeWidth={1.8} />} comparison={periodMeta.comparison} loading={loading} />
            <StatCard label="Commandes" value={a ? formatNumber(a.stats.orders.value) : ""} kpi={a?.stats.orders} icon={<ShoppingBag size={18} strokeWidth={1.8} />} comparison={periodMeta.comparison} loading={loading} />
            <StatCard label="Panier moyen" value={a ? formatPrice(a.stats.averageBasket.value) : ""} kpi={a?.stats.averageBasket} icon={<ShoppingBasket size={18} strokeWidth={1.8} />} comparison={periodMeta.comparison} loading={loading} />
            <StatCard label="Taux de conversion" value={a?.conversionRate ? formatPercent(a.conversionRate.value, 2) : ""} kpi={a?.conversionRate ?? undefined} emptyHint="Aucune visite mesurée sur la période" icon={<Percent size={18} strokeWidth={1.8} />} comparison={periodMeta.comparison} loading={loading} />
          </div>

          <SalesChart data={a?.sales ?? null} loading={loading} error={null} onRetry={analytics.retry} periodLabel={periodMeta.label} />

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Tunnel de conversion" description="Du premier clic à la commande">
              {loading ? <Skeleton className="h-56 w-full" /> : <Funnel steps={a.funnel} />}
            </Card>

            <Card title="Nouveaux clients vs récurrents" description="Commandes passées par type de client">
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : a.newVsReturning.every((b) => b.new + b.returning === 0) ? (
                <EmptyState compact title="Aucune commande sur la période" description="La répartition apparaîtra avec vos premières commandes." />
              ) : (
                <>
                  {/* Légende toujours visible : l'identité ne repose pas sur la couleur seule */}
                  <ul className="mb-3 flex gap-4 text-xs text-ink-light">
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: NEW_COLOR }} /> Nouveaux clients</li>
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: RETURNING_COLOR }} /> Clients récurrents</li>
                  </ul>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={a.newVsReturning} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="22%">
                        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} minTickGap={14} dy={6} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} allowDecimals={false} width={44} />
                        <Tooltip
                          cursor={{ fill: "#F4E9DE", opacity: 0.5 }}
                          content={({ active, payload, label }) =>
                            active && payload?.length ? (
                              <ChartTooltipBox
                                title={label}
                                rows={[
                                  { color: NEW_COLOR, label: "Nouveaux", value: formatNumber(payload[0].payload.new) },
                                  { color: RETURNING_COLOR, label: "Récurrents", value: formatNumber(payload[0].payload.returning) },
                                ]}
                              />
                            ) : null
                          }
                        />
                        {/* Contour blanc de 2px : séparation nette entre les segments empilés */}
                        <Bar dataKey="new" stackId="c" fill={NEW_COLOR} stroke="#fff" strokeWidth={2} />
                        <Bar dataKey="returning" stackId="c" fill={RETURNING_COLOR} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </Card>
          </div>

          <CustomerStats data={a?.customers ?? null} loading={loading} error={null} onRetry={analytics.retry} />

          <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
            ) : (
              <>
                <ProductRanking title="Produits les plus vendus" description="Articles vendus" items={a.bestSellers} unit="ventes" emptyText="Aucune vente sur la période" />
                <ProductRanking title="Produits les moins vendus" description="À mettre en avant ou à revoir" items={a.worstSellers} unit="ventes" emptyText="Aucun produit au catalogue" />
                <ProductRanking title="Produits les plus consultés" description="Pages produit vues" items={a.mostViewed} unit="vues" emptyText="Aucune consultation mesurée sur la période" />
              </>
            )}
          </div>

          <p className="text-center text-xs text-ink-light">
            {a?.trackingSince
              ? `Visites, consultations et ajouts au panier mesurés sur la boutique depuis le ${new Date(a.trackingSince).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.`
              : "Les visites, consultations et ajouts au panier seront mesurés dès les premières visites sur la boutique."}
          </p>
        </>
      )}
    </div>
  );
}

export default AdminAnalytics;
