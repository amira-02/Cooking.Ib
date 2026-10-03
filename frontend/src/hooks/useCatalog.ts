import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import type { Category, Product } from "../types/catalog";

interface CatalogState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: boolean;
}

// Charge produits + catégories actives en une fois
export function useCatalog() {
  const [state, setState] = useState<CatalogState>({
    products: [],
    categories: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([axios.get(`${API_URL}/api/products`), axios.get(`${API_URL}/api/categories`)])
      .then(([prodRes, catRes]) => {
        if (cancelled) return;
        setState({
          products: prodRes.data,
          categories: catRes.data.filter((c: Category) => c.isActive),
          loading: false,
          error: false,
        });
      })
      .catch((error) => {
        console.error("Erreur de chargement du catalogue:", error);
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: true }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
