import type { ReactNode } from "react";

// Infobulle commune aux graphiques Recharts (texte en couleurs du thème, pastille = identité)
export function ChartTooltipBox({ title, rows }: { title?: ReactNode; rows: { color?: string; label: string; value: string }[] }) {
  return (
    <div className="min-w-[10rem] rounded-xl border border-[#F1E6DA] bg-white px-3.5 py-2.5 text-xs shadow-[0_12px_28px_-12px_rgba(74,48,40,0.35)]">
      {title && <p className="mb-1.5 font-medium text-ink">{title}</p>}
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-ink-light">
              {row.color && <span className="h-2 w-2 rounded-full" style={{ background: row.color }} />}
              {row.label}
            </span>
            <span className="font-semibold text-ink">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
