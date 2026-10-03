import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, Phone, Search, Users } from "lucide-react";
import Card from "../../admin/components/ui/Card";
import DataTable, { Pagination } from "../../admin/components/ui/DataTable";
import type { Column } from "../../admin/components/ui/DataTable";
import { CustomerStatusBadge, OrderStatusBadge } from "../../admin/components/ui/Badges";
import { Drawer } from "../../admin/components/ui/Overlay";
import { EmptyState, ErrorState, Skeleton } from "../../admin/components/ui/States";
import { useAsync } from "../../admin/hooks/useAsync";
import { useDebounced } from "../../admin/hooks/useDebounced";
import { getCustomer, getCustomers } from "../../admin/services/dashboardService";
import { formatDate, formatNumber, initials } from "../../admin/utils/format";
import { formatPrice } from "../../utils/formatPrice";
import type { Customer, CustomerStatus } from "../../admin/types";

type SortKey = "name" | "ordersCount" | "totalSpent" | "lastOrderAt" | "createdAt";
const PAGE_SIZE = 10;
const STATUS_TABS: Record<CustomerStatus | "all", string> = {
  all: "Tous",
  new: "Nouveaux",
  active: "Actifs",
  loyal: "Fidèles",
  inactive: "Inactifs",
};

function CustomerCell({ customer }: { customer: Customer }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4E9DE] text-xs font-semibold text-ink">
        {initials(customer.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-ink">{customer.name}</span>
        <span className="block truncate text-xs text-ink-light">{customer.email}</span>
      </span>
    </span>
  );
}

const columns: Column<Customer>[] = [
  { key: "name", header: "Client", sortable: true, render: (c) => <CustomerCell customer={c} /> },
  { key: "ordersCount", header: "Commandes", sortable: true, align: "right", render: (c) => formatNumber(c.ordersCount) },
  { key: "totalSpent", header: "Total dépensé", sortable: true, align: "right", render: (c) => <span className="font-semibold">{formatPrice(c.totalSpent)}</span> },
  { key: "lastOrderAt", header: "Dernière commande", sortable: true, render: (c) => <span className="text-ink-light">{c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}</span> },
  { key: "createdAt", header: "Inscription", sortable: true, render: (c) => <span className="text-ink-light">{formatDate(c.createdAt)}</span> },
  { key: "status", header: "Statut", render: (c) => <CustomerStatusBadge status={c.status} /> },
];

function CustomerDrawer({ customerId, onClose }: { customerId: string | null; onClose: () => void }) {
  const customer = useAsync(() => (customerId ? getCustomer(customerId) : Promise.resolve(null)), [customerId]);
  const c = customer.data;
  return (
    <Drawer
      open={customerId !== null}
      onClose={onClose}
      title={c?.name ?? "Client"}
      subtitle={c && <span className="flex flex-wrap items-center gap-2">Client depuis le {formatDate(c.createdAt)} <CustomerStatusBadge status={c.status} /></span>}
    >
      {customer.error ? (
        <ErrorState message={customer.error} onRetry={customer.retry} />
      ) : customer.loading || !c ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Commandes", value: formatNumber(c.ordersCount) },
              { label: "Total dépensé", value: formatPrice(c.totalSpent) },
              { label: "Panier moyen", value: c.ordersCount ? formatPrice(c.totalSpent / c.ordersCount) : "—" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-cream/70 p-3">
                <p className="text-[11px] text-ink-light">{stat.label}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-2.5 rounded-xl border border-[#F1E6DA] p-4 text-[13px] text-ink">
            <li className="flex items-center gap-3"><Mail size={15} className="shrink-0 text-ink-light" /> <a href={`mailto:${c.email}`} className="break-all hover:text-rose-dark">{c.email}</a></li>
            <li className="flex items-center gap-3"><Phone size={15} className="shrink-0 text-ink-light" /> <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-rose-dark">{c.phone}</a></li>
          </ul>

          <section>
            <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">Historique des commandes</h3>
            {c.orders.length === 0 ? (
              <EmptyState compact title="Aucune commande pour le moment" />
            ) : (
              <ul className="divide-y divide-[#F1E6DA] rounded-xl border border-[#F1E6DA]">
                {c.orders.map((o) => (
                  <li key={o.id}>
                    <Link to={`/admin/orders?commande=${o.id}`} className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-cream/60">
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-ink">{o.number}</span>
                        <span className="block text-xs text-ink-light">{formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} article(s)</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-[13px] font-semibold text-ink">{formatPrice(o.total)}</span>
                        <OrderStatusBadge status={o.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}

function AdminCustomers() {
  const [params, setParams] = useSearchParams();
  const openCustomerId = params.get("client");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "all">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "lastOrderAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);

  const customers = useAsync(
    () => getCustomers({ search: debouncedSearch, status, sortBy: sort.key, sortDir: sort.dir, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, status, sort.key, sort.dir, page]
  );

  function openCustomer(id: string | null) {
    const next = new URLSearchParams(params);
    if (id) next.set("client", id);
    else next.delete("client");
    setParams(next, { replace: true });
  }

  return (
    <div className="space-y-5">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filtrer par statut">
        {(["all", "new", "active", "loyal", "inactive"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={status === value}
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors ${
              status === value ? "bg-ink text-cream" : "border border-[#EADBCB] bg-white text-ink hover:border-ink/30"
            }`}
          >
            {STATUS_TABS[value]}
          </button>
        ))}
      </div>

      <Card>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Nom, email ou téléphone…"
            aria-label="Rechercher un client"
            className="h-10 w-full rounded-xl border border-[#EADBCB] bg-white pl-10 pr-3 text-[13px] text-ink placeholder:text-ink-light/70 focus:border-rose-dark focus:outline-none md:max-w-md"
          />
        </div>

        <div className="mt-4">
          {customers.error ? (
            <ErrorState message={customers.error} onRetry={customers.retry} />
          ) : (
            <>
              <DataTable
                columns={columns}
                rows={customers.data?.items ?? []}
                rowKey={(c) => c.id}
                loading={customers.loading}
                skeletonRows={PAGE_SIZE}
                sort={sort}
                onSortChange={(key) => {
                  setSort((s) => ({ key: key as SortKey, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));
                  setPage(1);
                }}
                onRowClick={(c) => openCustomer(c.id)}
                mobileCard={(c) => (
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <CustomerCell customer={c} />
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold text-ink">{formatPrice(c.totalSpent)}</p>
                      <p className="text-xs text-ink-light">{c.ordersCount} cmd</p>
                    </div>
                  </div>
                )}
                empty={<EmptyState icon={<Users size={20} strokeWidth={1.6} />} title="Aucun client trouvé" description="Essayez une autre recherche ou un autre filtre." />}
              />
              {customers.data && <Pagination page={page} pageSize={PAGE_SIZE} total={customers.data.total} onChange={setPage} />}
            </>
          )}
        </div>
      </Card>

      <CustomerDrawer customerId={openCustomerId} onClose={() => openCustomer(null)} />
    </div>
  );
}

export default AdminCustomers;
