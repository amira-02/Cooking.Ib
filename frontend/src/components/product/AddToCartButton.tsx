import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import type { Product } from "../../types/catalog";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  variant?: "outline" | "solid";
  // Libellé court sur petit écran (cartes en 2 colonnes)
  compact?: boolean;
  className?: string;
}

// Ajoute au panier et affiche « Ajouté » pendant un court instant
function AddToCartButton({ product, quantity = 1, variant = "outline", compact = false, className = "" }: AddToCartButtonProps) {
  const { addToCart } = useShop();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  const styles =
    variant === "solid"
      ? "bg-ink text-cream hover:bg-rose-dark disabled:hover:bg-ink"
      : "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-cream disabled:hover:bg-transparent disabled:hover:text-ink disabled:hover:border-ink/20";

  return (
    <button
      type="button"
      disabled={!product.isAvailable}
      onClick={() => {
        addToCart(product, quantity);
        setAdded(true);
      }}
      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {!product.isAvailable ? (
        "Indisponible"
      ) : added ? (
        <>
          <Check size={14} /> Ajouté
        </>
      ) : (
        <>
          <ShoppingBag size={14} strokeWidth={1.8} />
          {compact ? (
            <>
              <span className="sm:hidden">Ajouter</span>
              <span className="hidden sm:inline">Ajouter au panier</span>
            </>
          ) : (
            "Ajouter au panier"
          )}
        </>
      )}
    </button>
  );
}

export default AddToCartButton;
