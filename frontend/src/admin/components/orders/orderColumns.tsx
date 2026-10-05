import { OrderStatusBadge } from "../ui/Badges";
import type { Column } from "../ui/DataTable";
import { CustomerCell } from "./OrderCells";
import { formatPrice } from "../../../utils/formatPrice";
import { formatShortDate, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_META } from "../../../utils/orderStatus";
import type { Order } from "../../types";

// Colonnes partagées par « Commandes récentes » et la page Commandes
// (les produits et la date de réception sont visibles dans le détail de la commande)
export const orderColumns: Column<Order>[] = [
  { key: "orderNumber", header: "Commande", sortable: true, render: (o) => <span className="whitespace-nowrap font-medium text-ink">{o.orderNumber}</span> },
  { key: "customer", header: "Client", sortable: true, render: (o) => <CustomerCell order={o} /> },
  {
    key: "requestedPickupDate",
    header: "Retrait",
    sortable: true,
    render: (o) => (
      <span className="whitespace-nowrap text-ink-light">
        {o.selectedSlot ? `${formatShortDate(o.selectedSlot.date)} ${o.selectedSlot.startTime}` : `${formatShortDate(o.requestedPickupDate)} (souhaité)`}
      </span>
    ),
  },
  { key: "totalAmount", header: "Montant", sortable: true, align: "right", render: (o) => <span className="font-semibold">{formatPrice(o.totalAmount)}</span> },
  {
    key: "payment",
    header: "Paiement",
    render: (o) => (
      <span className="whitespace-nowrap text-ink-light">
        {o.paymentMethod ? PAYMENT_METHOD_LABEL[o.paymentMethod] : "—"}
        {o.paymentStatus === "PAID" && <span className="ml-1 text-emerald-700">· {PAYMENT_STATUS_META.PAID.label}</span>}
      </span>
    ),
  },
  { key: "pickupCode", header: "Code", render: (o) => <span className="font-mono text-[12px] tracking-wider text-ink-light">{o.pickupCode ?? "—"}</span> },
  { key: "status", header: "Statut", sortable: true, render: (o) => <OrderStatusBadge status={o.status} /> },
];
