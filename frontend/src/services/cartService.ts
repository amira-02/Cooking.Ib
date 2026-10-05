import { apiRequest } from "./apiClient";
import type { CartItem } from "../context/ShopContext";

// Panier associé au compte (synchronisé entre appareils)
export async function fetchRemoteCart(): Promise<CartItem[]> {
  const data = await apiRequest<{ items: (Omit<CartItem, "price"> & { price: number })[] }>("get", "/api/cart");
  return data.items;
}

export function saveRemoteCart(items: CartItem[]) {
  return apiRequest<{ items: CartItem[] }>("put", "/api/cart", { items });
}

// Fusion à la connexion : on garde chaque produit, avec la plus grande quantité des deux paniers
export function mergeCarts(local: CartItem[], remote: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();
  for (const item of [...remote, ...local]) {
    const existing = merged.get(item.productId);
    merged.set(item.productId, existing ? { ...item, quantity: Math.max(existing.quantity, item.quantity) } : item);
  }
  return [...merged.values()];
}
