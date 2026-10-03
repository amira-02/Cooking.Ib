import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Card from "../ui/Card";
import DataTable from "../ui/DataTable";
import { EmptyState, ErrorState } from "../ui/States";
import { orderColumns } from "../orders/orderColumns";
import { OrderMobileCard } from "../orders/OrderCells";
import type { Order } from "../../types";

interface RecentOrdersProps {
  data: Order[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// Version compacte pour le dashboard : la page Commandes affiche toutes les colonnes
const COMPACT_KEYS = ["number", "customer", "createdAt", "total", "status"];
const compactColumns = orderColumns.filter((col) => COMPACT_KEYS.includes(col.key));

function RecentOrders({ data, loading, error, onRetry }: RecentOrdersProps) {
  const navigate = useNavigate();
  return (
    <Card
      title="Commandes récentes"
      description="Les dernières commandes passées sur la boutique"
      action={
        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-[13px] font-medium text-rose-dark hover:text-ink">
          Voir toutes les commandes <ArrowRight size={14} />
        </Link>
      }
    >
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <DataTable
          columns={compactColumns}
          rows={data ?? []}
          rowKey={(o) => o.id}
          loading={loading}
          skeletonRows={6}
          onRowClick={(o) => navigate(`/admin/orders?commande=${o.id}`)}
          mobileCard={(o) => <OrderMobileCard order={o} />}
          empty={
            <EmptyState
              icon={<ShoppingBag size={20} strokeWidth={1.6} />}
              title="Vous n'avez encore aucune commande."
              description="Les nouvelles commandes apparaîtront ici dès qu'un client passera commande."
            />
          }
        />
      )}
    </Card>
  );
}

export default RecentOrders;
