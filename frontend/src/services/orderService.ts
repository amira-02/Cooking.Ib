import { apiRequest } from "./apiClient";
import type { Order, PaymentMethod, PreOrderPayload, ShopConfig } from "../types/order";

// --- Client ---
let configPromise: Promise<ShopConfig> | null = null;

// Réglages de la boutique (délai minimum, quantité max, PayPal activé…), mis en cache
export function getShopConfig() {
  configPromise ??= apiRequest<ShopConfig>("get", "/api/orders/config", undefined, { authenticated: false }).catch((error) => {
    configPromise = null;
    throw error;
  });
  return configPromise;
}

export function createPreOrder(payload: PreOrderPayload) {
  return apiRequest<Order>("post", "/api/orders", payload);
}

export function getMyOrders() {
  return apiRequest<Order[]>("get", "/api/orders/mine");
}

export function getMyOrder(id: string) {
  return apiRequest<Order>("get", `/api/orders/${id}`);
}

// Espèces : la commande est confirmée tout de suite. PayPal : renvoie l'URL de paiement.
export function submitSelection(orderId: string, slotId: string, paymentMethod: PaymentMethod) {
  return apiRequest<{ order?: Order; approveUrl?: string }>("post", `/api/orders/${orderId}/selection`, { slotId, paymentMethod });
}

// --- Administration ---
export function adminConfirmOrder(orderId: string, slots: { date: string; startTime: string; endTime: string }[], message: string) {
  return apiRequest<Order>("post", `/api/admin/orders/${orderId}/confirm`, { slots, message });
}

export function adminCancelOrder(orderId: string, reason: string) {
  return apiRequest<Order>("post", `/api/admin/orders/${orderId}/cancel`, { reason });
}

export function adminMarkReady(orderId: string) {
  return apiRequest<Order>("post", `/api/admin/orders/${orderId}/ready`);
}

export function adminVerifyPickupCode(orderId: string, code: string) {
  return apiRequest<{ valid: boolean }>("post", `/api/admin/orders/${orderId}/verify-code`, { code });
}

export function adminCompleteOrder(orderId: string, code: string) {
  return apiRequest<Order>("post", `/api/admin/orders/${orderId}/complete`, { code });
}
