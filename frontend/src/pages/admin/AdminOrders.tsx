import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import Card from "../../admin/components/ui/Card";
import DataTable, { Pagination } from "../../admin/components/ui/DataTable";
import { EmptyState, ErrorState } from "../../admin/components/ui/States";
import { orderColumns } from "../../admin/components/orders/orderColumns";
import { OrderMobileCard } from "../../admin/components/orders/OrderCells";
import OrderDetailDrawer from "../../admin/components/orders/OrderDetailDrawer";
import { useAsync } from "../../admin/hooks/useAsync";
import { useDebounced } from "../../admin/hooks/useDebounced";
import { getOrders } from "../../admin/services/dashboardService";
import type { OrdersQuery } from "../../admin/types";

type StatusFilter = NonNullable<OrdersQuery["status"]>;
type SortKey = NonNullable<OrdersQuery["sortBy"]>;

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "confirmed_any", label: "Confirmées" },
  { value: "AWAITING_CUSTOMER_SELECTION", label: "Choix client" },
  { value: "CONFIRMED", label: "À préparer" },
  { value: "READY_FOR_PICKUP", label: "Prêtes" },
  { value: "COMPLETED", label: "Terminées" },
  { value: "CANCELLED", label: "Annulées" },
];

const PAGE_SIZE = 10;
const inputClass =
  "h-10 w-full rounded-xl border border-[#EADBCB] bg-white px-3 text-[13px] text-ink placeholder:text-ink-light/70 focus:border-rose-dark focus:outline-none";

function AdminOrders() {
  // Recherche, statut et commande ouverte vivent dans l'URL (liens depuis le dashboard et les notifications)
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = (params.get("statut") as StatusFilter) ?? "all";
  const openOrderId = params.get("commande");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounced(search);
  const query: OrdersQuery = {
    search: debouncedSearch,
    status,
    from: from || undefined,
    to: to || undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    sortBy: sort.key,
    sortDir: sort.dir,
    page,
    pageSize: PAGE_SIZE,
  };
  const orders = useAsync(() => getOrders(query), [JSON.stringify(query)]);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  function changeSort(key: string) {
    setSort((s) => ({ key: key as SortKey, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));
    setPage(1);
  }

  const advancedCount = [from, to, minAmount, maxAmount].filter(Boolean).length;
  const hasFilters = advancedCount > 0 || status !== "all" || search !== "";

  function resetFilters() {
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
    setParams(openOrderId ? { commande: openOrderId } : {}, { replace: true });
  }

  return (
    <div className="space-y-5">
      {/* Filtres rapides par statut (défilent horizontalement sur mobile) */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filtrer par statut">
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            role="tab"
            aria-selected={status === chip.value}
            onClick={() => {
              setParam("statut", chip.value === "all" ? null : chip.value);
              setPage(1);
            }}
            className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors ${
              status === chip.value ? "bg-ink text-cream" : "border border-[#EADBCB] bg-white text-ink hover:border-ink/30"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <Card>
        {/* Recherche + filtres avancés */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
            <input
              value={search}
              onChange={(e) => {
                setParam("q", e.target.value || null);
                setPage(1);
              }}
              placeholder="N° de commande, code de retrait, nom ou email…"
              aria-label="Rechercher une commande"
              className={`${inputClass} pl-10`}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#EADBCB] bg-white px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30"
            >
              <SlidersHorizontal size={15} className="text-ink-light" /> Filtres
              {advancedCount > 0 && <span className="rounded-full bg-ink px-1.5 text-[10px] text-cream">{advancedCount}</span>}
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-rose-dark hover:bg-cream"
              >
                <X size={14} /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-3 grid gap-3 rounded-xl bg-cream/60 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs text-ink-light">
              Du
              <input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-ink-light">
              Au
              <input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-ink-light">
              Montant min (€)
              <input type="number" min={0} inputMode="decimal" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(1); }} placeholder="0" className={`${inputClass} mt-1`} />
            </label>
            <label className="text-xs text-ink-light">
              Montant max (€)
              <input type="number" min={0} inputMode="decimal" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }} placeholder="Illimité" className={`${inputClass} mt-1`} />
            </label>
          </div>
        )}

        <div className="mt-4">
          {orders.error ? (
            <ErrorState message={orders.error} onRetry={orders.retry} />
          ) : (
            <>
              <DataTable
                columns={orderColumns}
                rows={orders.data?.items ?? []}
                rowKey={(o) => o.id}
                loading={orders.loading}
                skeletonRows={PAGE_SIZE}
                sort={sort}
                onSortChange={changeSort}
                onRowClick={(o) => setParam("commande", o.id)}
                mobileCard={(o) => <OrderMobileCard order={o} />}
                empty={
                  hasFilters ? (
                    <EmptyState
                      title="Aucune commande ne correspond à ces filtres"
                      action={
                        <button type="button" onClick={resetFilters} className="text-[13px] font-medium text-rose-dark hover:text-ink">
                          Réinitialiser les filtres
                        </button>
                      }
                    />
                  ) : (
                    <EmptyState icon={<ShoppingBag size={20} strokeWidth={1.6} />} title="Vous n'avez encore aucune commande." />
                  )
                }
              />
              {orders.data && <Pagination page={page} pageSize={PAGE_SIZE} total={orders.data.total} onChange={setPage} />}
            </>
          )}
        </div>
      </Card>

      <OrderDetailDrawer
        orderId={openOrderId}
        onClose={() => setParam("commande", null)}
        onUpdated={(updated) =>
          orders.setData((d) => d && { ...d, items: d.items.map((o) => (o.id === updated.id ? updated : o)) })
        }
      />
    </div>
  );
}

export default AdminOrders;
