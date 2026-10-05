import { OrderStatusBadge } from "../ui/Badges";
import { formatDateTime, initials } from "../../utils/format";
import { customerName, itemsSummary } from "../../utils/orders";
import { formatPrice } from "../../../utils/formatPrice";
import { formatShortDate } from "../../../utils/orderStatus";
import type { Order } from "../../types";

export function CustomerCell({ order }: { order: Order }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4E9DE] text-[11px] font-semibold text-ink">
        {initials(customerName(order))}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-ink">{customerName(order)}</span>
        <span className="block truncate text-xs text-ink-light">{order.customer.phone || order.customer.email}</span>
      </span>
    </span>
  );
}

export function OrderMobileCard({ order }: { order: Order }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink">{order.orderNumber}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] text-ink">{customerName(order)}</p>
          <p className="truncate text-xs text-ink-light">{itemsSummary(order)}</p>
          <p className="text-xs text-ink-light">
            Souhaitée : {formatShortDate(order.requestedPickupDate)} · reçue le {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span className="shrink-0 text-[15px] font-semibold text-ink">{formatPrice(order.totalAmount)}</span>
      </div>
    </div>
  );
}
