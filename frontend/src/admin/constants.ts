import type { CustomerStatus, OrderStatus, PaymentMethod, Period, StockStatus } from "./types";

export const PERIOD_OPTIONS: { value: Period; label: string; comparison: string }[] = [
  { value: "today", label: "Aujourd'hui", comparison: "vs hier" },
  { value: "7d", label: "7 derniers jours", comparison: "vs 7 jours précédents" },
  { value: "30d", label: "30 derniers jours", comparison: "vs 30 jours précédents" },
  { value: "3m", label: "3 derniers mois", comparison: "vs 3 mois précédents" },
  { value: "year", label: "Cette année", comparison: "vs année précédente" },
];

export const ORDER_STATUS: Record<OrderStatus, { label: string; badge: string; dot: string }> = {
  pending: { label: "En attente", badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  confirmed: { label: "Confirmée", badge: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  preparing: { label: "En préparation", badge: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
  ready: { label: "Prête / expédiée", badge: "bg-teal-50 text-teal-800 ring-teal-200", dot: "bg-teal-500" },
  delivered: { label: "Livrée", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Annulée", badge: "bg-stone-100 text-stone-600 ring-stone-200", dot: "bg-stone-400" },
};

// Ordre logique du cycle de vie (utilisé par le sélecteur de statut)
export const ORDER_STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Carte bancaire",
  paypal: "PayPal",
  cash: "Espèces (retrait)",
  transfer: "Virement",
};

export const STOCK_STATUS: Record<StockStatus, { label: string; badge: string; bar: string }> = {
  in_stock: { label: "En stock", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", bar: "bg-emerald-500" },
  low: { label: "Stock faible", badge: "bg-amber-50 text-amber-800 ring-amber-200", bar: "bg-amber-500" },
  out: { label: "Rupture", badge: "bg-red-50 text-red-700 ring-red-200", bar: "bg-red-500" },
  untracked: { label: "Non suivi", badge: "bg-stone-100 text-stone-600 ring-stone-200", bar: "bg-stone-300" },
};

export const CUSTOMER_STATUS: Record<CustomerStatus, { label: string; badge: string }> = {
  new: { label: "Nouveau", badge: "bg-sky-50 text-sky-800 ring-sky-200" },
  active: { label: "Actif", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  loyal: { label: "Fidèle", badge: "bg-[#F4E9DE] text-[#4A3028] ring-[#EADBCB]" },
  inactive: { label: "Inactif", badge: "bg-stone-100 text-stone-600 ring-stone-200" },
};

// Couleurs des graphiques.
// Palette catégorielle validée (daltonisme, contraste, séparation) avec le script
// validate_palette — toujours attribuée dans cet ordre, jamais réordonnée.
export const CHART_COLORS = {
  categorical: ["#B0563B", "#00897B", "#D69E2E", "#7A5BB0"],
  primary: "#4A3028",
  primarySoft: "#D9A6A6",
  grid: "#F1E6DA",
  axis: "#85695D",
};
