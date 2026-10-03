import { CUSTOMER_STATUS, ORDER_STATUS, STOCK_STATUS } from "../../constants";
import type { CustomerStatus, OrderStatus, StockStatus } from "../../types";

function Badge({ label, className, dot }: { label: string; className: string; dot?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />}
      {label}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS[status];
  return <Badge label={meta.label} className={meta.badge} dot={meta.dot} />;
}

export function StockBadge({ status, stock }: { status: StockStatus; stock?: number }) {
  const meta = STOCK_STATUS[status];
  const label = stock !== undefined && status !== "out" ? `${meta.label} · ${stock}` : meta.label;
  return <Badge label={label} className={meta.badge} />;
}

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const meta = CUSTOMER_STATUS[status];
  return <Badge label={meta.label} className={meta.badge} />;
}
