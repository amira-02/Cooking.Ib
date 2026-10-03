import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Skeleton } from "../ui/States";
import { formatPercent, percentChange } from "../../utils/format";
import type { KpiValue } from "../../types";

interface StatCardProps {
  label: string;
  value: string;
  kpi?: KpiValue;
  icon: ReactNode;
  comparison: string;
  loading?: boolean;
  // Affiché quand il n'y a pas encore de données (ex : aucune visite mesurée)
  emptyHint?: string;
}

// Mini-graphique de tendance (décoratif : la valeur et l'évolution sont écrites à côté)
function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  // Pas de tendance à montrer (moins de 2 points ou série entièrement nulle)
  if (values.length < 2 || max === 0) return null;
  const w = 96;
  const h = 32;
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - 2 - ((v - min) / (max - min || 1)) * (h - 4),
  ]);
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const color = positive ? "#4A3028" : "#B57A7A";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0 overflow-visible">
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={color} opacity={0.07} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ label, value, kpi, icon, comparison, loading = false, emptyHint }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#F1E6DA] bg-white p-5">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="mt-5 h-3 w-24" />
        <Skeleton className="mt-3 h-7 w-32" />
        <Skeleton className="mt-4 h-3 w-40" />
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="rounded-2xl border border-[#F1E6DA] bg-white p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-ink">{icon}</span>
        <p className="mt-4 text-[13px] text-ink-light">{label}</p>
        <p className="mt-1 font-sans text-[1.6rem] font-semibold leading-tight text-ink-light/60">—</p>
        <p className="mt-2 text-xs text-ink-light">{emptyHint ?? "Pas encore de données"}</p>
      </div>
    );
  }

  const change = percentChange(kpi);
  const up = change !== null && change > 0.05;
  const down = change !== null && change < -0.05;
  const TrendIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;

  return (
    <div className="group rounded-2xl border border-[#F1E6DA] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_12px_32px_-18px_rgba(74,48,40,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-ink transition-colors group-hover:bg-[#F4E9DE]">
          {icon}
        </span>
        <Sparkline values={kpi.trend} positive={!down} />
      </div>
      <p className="mt-4 text-[13px] text-ink-light">{label}</p>
      <p className="mt-1 font-sans text-[1.6rem] font-semibold leading-tight tracking-tight text-ink">{value}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {change === null ? (
          <span className="text-ink-light">Pas de comparaison disponible</span>
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${
                up ? "bg-emerald-50 text-emerald-700" : down ? "bg-red-50 text-red-700" : "bg-stone-100 text-stone-600"
              }`}
            >
              <TrendIcon size={13} strokeWidth={2.2} />
              {change > 0 ? "+" : ""}
              {formatPercent(change)}
            </span>
            <span className="text-ink-light">{comparison}</span>
          </>
        )}
      </p>
    </div>
  );
}

export default StatCard;
