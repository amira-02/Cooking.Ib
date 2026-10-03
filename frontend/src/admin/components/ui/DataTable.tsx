import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "./States";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  onRowClick?: (row: T) => void;
  sort?: { key: string; dir: "asc" | "desc" };
  onSortChange?: (key: string) => void;
  // Rendu en carte sous 768px (les tableaux larges ne tiennent pas sur mobile)
  mobileCard: (row: T) => ReactNode;
  empty?: ReactNode;
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 6,
  onRowClick,
  sort,
  onSortChange,
  mobileCard,
  empty,
}: DataTableProps<T>) {
  if (!loading && rows.length === 0 && empty) return <>{empty}</>;

  return (
    <>
      {/* Mobile : cartes */}
      <ul className="divide-y divide-[#F1E6DA] md:hidden">
        {loading
          ? Array.from({ length: skeletonRows }).map((_, i) => (
              <li key={i} className="space-y-2 py-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </li>
            ))
          : rows.map((row) => (
              <li key={rowKey(row)}>
                {onRowClick ? (
                  <button
                    type="button"
                    onClick={() => onRowClick(row)}
                    className="-mx-2 block w-[calc(100%+1rem)] rounded-xl px-2 py-4 text-left transition-colors hover:bg-cream/70"
                  >
                    {mobileCard(row)}
                  </button>
                ) : (
                  <div className="py-4">{mobileCard(row)}</div>
                )}
              </li>
            ))}
      </ul>

      {/* Desktop : tableau, défilement horizontal si l'espace manque */}
      <div className="-mx-5 hidden overflow-x-auto sm:-mx-6 md:block">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="border-y border-[#F1E6DA] bg-cream/50 text-[11px] uppercase tracking-wider text-ink-light">
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={`px-4 py-3 font-medium first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 ${
                      col.align === "right" ? "text-right" : ""
                    } ${col.className ?? ""}`}
                  >
                    {col.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(col.key)}
                        className={`inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-ink ${
                          active ? "text-ink" : ""
                        }`}
                      >
                        {col.header}
                        {active ? (
                          sort?.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1E6DA]">
            {loading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-4 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6">
                        <Skeleton className="h-4 w-full max-w-[8rem]" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
                    className={onRowClick ? "cursor-pointer transition-colors hover:bg-cream/60 focus-visible:bg-cream/60 focus-visible:outline-none" : ""}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 align-middle text-ink first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 ${
                          col.align === "right" ? "text-right" : ""
                        } ${col.className ?? ""}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const button =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-[#EADBCB] text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-[13px] text-ink-light">
      <p>
        <span className="font-medium text-ink">{from}–{to}</span> sur {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={button} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Page précédente">
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[4.5rem] text-center">
          Page {page} / {pages}
        </span>
        <button type="button" className={button} onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Page suivante">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default DataTable;
