import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Card from "../ui/Card";
import DataTable from "../ui/DataTable";
import type { Column } from "../ui/DataTable";
import { StockBadge } from "../ui/Badges";
import { EmptyState, ErrorState } from "../ui/States";
import { formatNumber, formatPriceRounded } from "../../utils/format";
import { formatPrice } from "../../../utils/formatPrice";
import type { TopProduct } from "../../types";

interface TopProductsProps {
  data: TopProduct[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function ProductCell({ product }: { product: TopProduct }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-cream object-cover" loading="lazy" />
      <span className="min-w-0">
        <span className="block truncate font-medium text-ink">{product.name}</span>
        <span className="block truncate text-xs text-ink-light">{product.category}</span>
      </span>
    </span>
  );
}

const columns: Column<TopProduct>[] = [
  { key: "rank", header: "#", render: () => null, className: "w-8 text-ink-light" },
  { key: "product", header: "Produit", render: (p) => <ProductCell product={p} /> },
  { key: "sales", header: "Ventes", align: "right", render: (p) => formatNumber(p.sales) },
  { key: "price", header: "Prix", align: "right", render: (p) => formatPrice(p.price) },
  { key: "revenue", header: "Revenus", align: "right", render: (p) => <span className="font-semibold">{formatPriceRounded(p.revenue)}</span> },
  { key: "stock", header: "Stock", align: "right", render: (p) => <StockBadge status={p.stockStatus} stock={p.stock ?? undefined} /> },
];

function TopProducts({ data, loading, error, onRetry }: TopProductsProps) {
  // Le rang dépend de la position : on l'injecte ici plutôt que dans les données
  const rankedColumns = columns.map((col) =>
    col.key === "rank" ? { ...col, render: (p: TopProduct) => (data?.indexOf(p) ?? 0) + 1 } : col
  );

  return (
    <Card
      title="Produits les plus populaires"
      description="Classés par nombre d'articles vendus"
      action={
        <Link to="/admin/products" className="inline-flex items-center gap-1 text-[13px] font-medium text-rose-dark hover:text-ink">
          Voir tous les produits <ArrowRight size={14} />
        </Link>
      }
    >
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <DataTable
          columns={rankedColumns}
          rows={data ?? []}
          rowKey={(p) => p.id}
          loading={loading}
          skeletonRows={5}
          empty={<EmptyState compact title="Aucune vente sur la période" />}
          mobileCard={(p) => (
            <div className="flex items-center gap-3">
              <span className="w-4 text-xs text-ink-light">{(data?.indexOf(p) ?? 0) + 1}</span>
              <div className="min-w-0 flex-1">
                <ProductCell product={p} />
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[13px] font-semibold text-ink">{formatPriceRounded(p.revenue)}</p>
                <p className="text-xs text-ink-light">{formatNumber(p.sales)} ventes</p>
              </div>
            </div>
          )}
        />
      )}
    </Card>
  );
}

export default TopProducts;
