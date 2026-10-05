import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { OrderStatusBadge } from "../../components/order/OrderBits";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders } from "../../services/orderService";
import { formatDateTime } from "../../utils/orderStatus";
import { formatPrice } from "../../utils/formatPrice";
import type { Order } from "../../types/order";

function MyOrdersPage() {
  const { currentUser, role } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    getMyOrders()
      .then(setOrders)
      .catch((e: Error) => setError(e.message));
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/login" replace state={{ from: "/mes-commandes" }} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <h1 className="font-serif text-[2rem] font-light text-ink sm:text-4xl">Mes commandes</h1>
      <p className="mt-2 text-[15px] text-ink-light">Suivez vos précommandes, de la demande jusqu'au retrait.</p>
      {role === "admin" && (
        <p className="mt-4 rounded-xl bg-[#F4E9DE] px-4 py-3 text-[13px] text-ink">
          Vous êtes administratrice : les commandes de vos clients sont dans{" "}
          <Link to="/admin/orders" className="font-medium underline">
            l'espace d'administration
          </Link>
          .
        </p>
      )}

      <div className="mt-8">
        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        ) : !orders ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F4E9DE]/80" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-[#F1E6DA] bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-ink-light">
              <Package size={20} strokeWidth={1.6} />
            </span>
            <p className="mt-4 text-[15px] font-medium text-ink">Vous n'avez encore aucune commande.</p>
            <Link to="/produits" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-cream hover:bg-rose-dark">
              Découvrir nos créations
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/mes-commandes/${order.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-[#F1E6DA] bg-white p-4 transition-shadow hover:shadow-[0_12px_28px_-18px_rgba(74,48,40,0.4)] sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-ink">{order.orderNumber}</span>
                      <OrderStatusBadge status={order.status} client />
                    </div>
                    <p className="mt-1 truncate text-[13px] text-ink-light">
                      {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-light">Envoyée le {formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className="shrink-0 text-[15px] font-semibold text-ink">{formatPrice(order.totalAmount)}</span>
                  <ChevronRight size={18} className="shrink-0 text-ink-light transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
