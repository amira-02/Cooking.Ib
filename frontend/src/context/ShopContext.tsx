import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/catalog";
import { useAuth } from "./AuthContext";
import { track } from "../utils/track";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface ShopContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const CART_KEY = "cookingib.cart";
const FAVORITES_KEY = "cookingib.favorites";

// localStorage peut être indisponible (navigation privée…) : on ne plante jamais
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignoré
  }
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(FAVORITES_KEY, []));

  useEffect(() => writeStorage(CART_KEY, cart), [cart]);
  useEffect(() => writeStorage(FAVORITES_KEY, favorites), [favorites]);

  const { role } = useAuth();

  function addToCart(product: Product, quantity = 1) {
    if (role !== "admin") track("add_to_cart", product.id);
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          quantity,
        },
      ];
    });
  }

  function toggleFavorite(productId: string) {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        favorites,
        isFavorite: (id) => favorites.includes(id),
        toggleFavorite,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop doit être utilisé dans un ShopProvider");
  return context;
}
