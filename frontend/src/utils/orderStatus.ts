import type { OrderStatus, PaymentMethod, PaymentStatus } from "../types/order";

// Libellés et couleurs des statuts (boutique + administration)
export const ORDER_STATUS_META: Record<OrderStatus, { label: string; clientLabel: string; badge: string; dot: string }> = {
  PENDING: { label: "En attente", clientLabel: "En attente de confirmation", badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  AWAITING_CUSTOMER_SELECTION: { label: "Validée — choix client", clientLabel: "Confirmée — à finaliser", badge: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  CONFIRMED: { label: "Confirmée", clientLabel: "Confirmée", badge: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
  READY_FOR_PICKUP: { label: "Prête", clientLabel: "Prête à être retirée", badge: "bg-teal-50 text-teal-800 ring-teal-200", dot: "bg-teal-500" },
  COMPLETED: { label: "Récupérée", clientLabel: "Récupérée", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  CANCELLED: { label: "Annulée", clientLabel: "Annulée", badge: "bg-stone-100 text-stone-600 ring-stone-200", dot: "bg-stone-400" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; badge: string }> = {
  PENDING: { label: "Non choisi", badge: "bg-stone-100 text-stone-600 ring-stone-200" },
  CASH_ON_PICKUP: { label: "Espèces au retrait", badge: "bg-amber-50 text-amber-800 ring-amber-200" },
  PAID: { label: "Payé", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  FAILED: { label: "Paiement échoué", badge: "bg-red-50 text-red-700 ring-red-200" },
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Espèces au retrait",
  PAYPAL: "PayPal",
};

// Étapes affichées au client : Panier → Précommande → Validation → Retrait
export const CLIENT_STEPS = ["Panier", "Précommande", "Validation", "Retrait"] as const;

// Précommande envoyée -> « Validation » en cours ; validée -> « Retrait » ; récupérée -> tout est fait
export function clientStepOf(status: OrderStatus): number {
  switch (status) {
    case "PENDING":
    case "CANCELLED":
      return 3;
    case "AWAITING_CUSTOMER_SELECTION":
    case "CONFIRMED":
    case "READY_FOR_PICKUP":
      return 4;
    case "COMPLETED":
      return 5;
    default:
      return 3;
  }
}

// "2026-10-15" -> "jeudi 15 octobre 2026" (sans décalage de fuseau)
export function formatLongDate(isoDate: string) {
  if (!isoDate) return "";
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDate(isoDate: string) {
  if (!isoDate) return "";
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const slotText = (slot: { date: string; startTime: string; endTime: string }) =>
  `${formatLongDate(slot.date)} · ${slot.startTime} – ${slot.endTime}`;
