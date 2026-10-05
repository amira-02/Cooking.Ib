import { apiRequest } from "./apiClient";
import type { Order } from "../types/order";

// PayPal : le paiement se fait sur le site de PayPal (aucune donnée bancaire chez nous).
// Au retour, PayPal ajoute ?paypal=success&token=<id du paiement> (ou ?paypal=cancel) à l'URL de la commande.

export function startPaypalRedirect(approveUrl: string) {
  window.location.assign(approveUrl);
}

export function capturePaypalPayment(orderId: string, paypalOrderId: string) {
  return apiRequest<Order>("post", `/api/orders/${orderId}/paypal/capture`, { paypalOrderId });
}

export function cancelPaypalPayment(orderId: string) {
  return apiRequest<Order>("post", `/api/orders/${orderId}/paypal/cancel`);
}
