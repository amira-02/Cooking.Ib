import { useEffect, useState } from "react";

// Renvoie la valeur après `delay` ms sans changement (recherche instantanée sans requête à chaque frappe)
export function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
