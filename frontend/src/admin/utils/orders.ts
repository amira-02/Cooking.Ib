import type { Order } from "../types";

// "Trompe-l'œil Fraise + 2 autres" / "3× Trompe-l'œil Citron"
export function itemsSummary(order: Order) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  const first = order.items[0]?.name ?? "";
  return order.items.length > 1 ? `${first} + ${order.items.length - 1} autre${order.items.length > 2 ? "s" : ""}` : `${count > 1 ? `${count}× ` : ""}${first}`;
}
