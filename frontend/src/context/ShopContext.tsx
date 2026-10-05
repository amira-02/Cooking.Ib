import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/catalog";
import { useAuth } from "./AuthContext";
import { track } from "../utils/track";
import { fetchRemoteCart, mergeCarts, saveRemoteCart } from "../services/cartService";
import { getShopConfig } from "../services/orderService";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  // Stock connu au moment de l'ajout (null = non suivi) ; rafraîchi par la page panier
  stock?: number | null;
  quantity: number;
}

export interface AddResult {
  added: number;
  max: number;
  limited: boolean;
}

interface ShopContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number, category?: string) => AddResult;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // Met à jour prix / stock / nom à partir du catalogue actuel
  refreshCartItems: (products: Product[], categoryName: (id: string) => string) => void;
  maxQuantityFor: (item: Pick<CartItem, "stock">) => number;
  favorites: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const CART_KEY = "cookingib.cart";
const FAVORITES_KEY = "cookingib.favorites";
const DEFAULT_MAX_QUANTITY = 20;

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
  const { currentUser, role } = useAuth();
  const uid = currentUser?.uid ?? null;
  const [cart, setCart] = useState<CartItem[]>(() => readStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(FAVORITES_KEY, []));
  const [maxPerItem, setMaxPerItem] = useState(DEFAULT_MAX_QUANTITY);
  // Utilisateur dont le panier serveur a été chargé (avant cela, on n'écrase rien côté serveur)
  const [syncedUid, setSyncedUid] = useState<string | null>(null);
  const [lastUid, setLastUid] = useState<string | null>(uid);

  // Déconnexion : le panier n'est pas laissé à la personne suivante sur un appareil partagé
  if (uid !== lastUid) {
    setLastUid(uid);
    if (!uid && lastUid) {
      setCart([]);
      setSyncedUid(null);
    }
  }

  useEffect(() => writeStorage(CART_KEY, cart), [cart]);
  useEffect(() => writeStorage(FAVORITES_KEY, favorites), [favorites]);

  useEffect(() => {
    getShopConfig()
      .then((config) => setMaxPerItem(config.maxQuantityPerItem))
      .catch(() => {});
  }, []);

  // Connexion : fusion du panier de cet appareil avec celui du compte
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    fetchRemoteCart()
      .then((remote) => {
        if (cancelled) return;
        setCart((local) => mergeCarts(local, remote));
        setSyncedUid(uid);
      })
      .catch(() => !cancelled && setSyncedUid(uid));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Sauvegarde côté serveur (regroupée : une requête après 700 ms sans changement)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!uid || syncedUid !== uid) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveRemoteCart(cart).catch(() => {}), 700);
    return () => clearTimeout(saveTimer.current);
  }, [cart, uid, syncedUid]);

  const maxQuantityFor = useCallback(
    (item: Pick<CartItem, "stock">) =>
      Math.max(0, Math.min(maxPerItem, typeof item.stock === "number" ? item.stock : Infinity)),
    [maxPerItem]
  );

  function addToCart(product: Product, quantity = 1, category?: string): AddResult {
    const max = maxQuantityFor({ stock: product.stock });
    const current = cart.find((i) => i.productId === product.id)?.quantity ?? 0;
    const added = Math.max(0, Math.min(quantity, max - current));
    if (added > 0) {
      if (role !== "admin") track("add_to_cart", product.id);
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + added, stock: product.stock ?? null } : item));
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            category,
            stock: product.stock ?? null,
            quantity: added,
          },
        ];
      });
    }
    return { added, max, limited: added < quantity };
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(Math.floor(quantity) || 1, maxQuantityFor(item) || 1)) } : item
      )
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  const refreshCartItems = useCallback((products: Product[], categoryName: (id: string) => string) => {
    setCart((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;
        const updated = {
          ...item,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? item.image,
          category: categoryName(product.categoryId) || item.category,
          stock: product.stock ?? null,
        };
        if (JSON.stringify(updated) !== JSON.stringify(item)) changed = true;
        return updated;
      });
      return changed ? next : prev;
    });
  }, []);

  function toggleFavorite(productId: string) {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Math.round(cart.reduce((sum, item) => sum + item.quantity * item.price, 0) * 100) / 100;

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCartItems,
        maxQuantityFor,
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
