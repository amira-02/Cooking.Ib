import { useEffect, useState } from "react";
import { AlertCircle, Check, ShoppingBag } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import type { Product } from "../../types/catalog";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  categoryName?: string;
  variant?: "outline" | "solid";
  // Libellé court sur petit écran (cartes en 2 colonnes)
  compact?: boolean;
  className?: string;
}

type Feedback = { kind: "added" } | { kind: "limit"; max: number } | null;

// Ajoute au panier ; affiche « Ajouté » ou la quantité maximale atteinte pendant un court instant
function AddToCartButton({ product, quantity = 1, categoryName, variant = "outline", compact = false, className = "" }: AddToCartButtonProps) {
  const { addToCart } = useShop();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const outOfStock = product.stock === 0;
  const disabled = !product.isAvailable || outOfStock;

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), feedback.kind === "limit" ? 2600 : 1600);
    return () => clearTimeout(timer);
  }, [feedback]);

  const styles =
    variant === "solid"
      ? "bg-ink text-cream hover:bg-rose-dark disabled:hover:bg-ink"
      : "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-cream disabled:hover:bg-transparent disabled:hover:text-ink disabled:hover:border-ink/20";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        const result = addToCart(product, quantity, categoryName);
        setFeedback(result.added === 0 ? { kind: "limit", max: result.max } : { kind: "added" });
      }}
      aria-live="polite"
      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {outOfStock ? (
        "Rupture de stock"
      ) : !product.isAvailable ? (
        "Indisponible"
      ) : feedback?.kind === "limit" ? (
        <>
          <AlertCircle size={14} /> {compact ? `Max : ${feedback.max}` : `Quantité max : ${feedback.max}`}
        </>
      ) : feedback?.kind === "added" ? (
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
