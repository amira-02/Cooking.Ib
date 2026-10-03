import { OrderStatusBadge } from "../ui/Badges";
import type { Column } from "../ui/DataTable";
import { CustomerCell } from "./OrderCells";
import { PAYMENT_LABELS } from "../../constants";
import { formatDateTime } from "../../utils/format";
import { itemsSummary } from "../../utils/orders";
import { formatPrice } from "../../../utils/formatPrice";
import type { Order } from "../../types";

// Colonnes partagées par « Commandes récentes » et la page Commandes
export const orderColumns: Column<Order>[] = [
  { key: "number", header: "Commande", sortable: true, render: (o) => <span className="font-medium text-ink">{o.number}</span> },
  { key: "customer", header: "Client", sortable: true, render: (o) => <CustomerCell order={o} /> },
  { key: "createdAt", header: "Date", sortable: true, render: (o) => <span className="whitespace-nowrap text-ink-light">{formatDateTime(o.createdAt)}</span> },
  { key: "items", header: "Produits", render: (o) => <span className="block max-w-[14rem] truncate text-ink-light">{itemsSummary(o)}</span> },
  { key: "total", header: "Montant", sortable: true, align: "right", render: (o) => <span className="font-semibold">{formatPrice(o.total)}</span> },
  { key: "payment", header: "Paiement", render: (o) => <span className="whitespace-nowrap text-ink-light">{PAYMENT_LABELS[o.paymentMethod]}</span> },
  { key: "status", header: "Statut", sortable: true, render: (o) => <OrderStatusBadge status={o.status} /> },
];
