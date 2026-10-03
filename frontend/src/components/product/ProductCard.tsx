import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductImages from "./ProductImages";
import AddToCartButton from "./AddToCartButton";
import { useShop } from "../../context/ShopContext";
import { formatPrice } from "../../utils/formatPrice";
import { isNewProduct } from "../../utils/catalog";
import type { Product } from "../../types/catalog";

interface ProductCardProps {
  product: Product;
  showDescription?: boolean;
  categoryName?: string;
}

function ProductCard({ product, showDescription = false, categoryName }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useShop();
  const [hovered, setHovered] = useState(false);
  const favorite = isFavorite(product.id);
  const badge = !product.isAvailable ? "Épuisé" : isNewProduct(product) ? "Nouveau" : null;

  return (
    <article className="group flex h-full flex-col">
      <div
        className="relative overflow-hidden rounded-2xl bg-beige transition-shadow duration-500 ease-soft group-hover:shadow-[0_20px_40px_-20px_rgba(74,48,40,0.35)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link
          to={`/produits/${product.id}`}
          className="relative block aspect-[4/5]"
          aria-label={product.name}
        >
          <ProductImages images={product.images ?? []} alt={product.name} hovered={hovered} />
        </Link>

        {badge && (
          <span
            className={`pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
              product.isAvailable ? "bg-cream/90 text-ink" : "bg-ink/80 text-cream"
            }`}
          >
            {badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={favorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink backdrop-blur transition-all duration-300 hover:scale-110 hover:text-rose-dark"
        >
          <Heart
            size={16}
            strokeWidth={1.6}
            className={favorite ? "fill-rose-dark text-rose-dark" : ""}
          />
        </button>
      </div>

      <Link to={`/produits/${product.id}`} className="mt-4 flex flex-1 flex-col">
        {categoryName && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-light">{categoryName}</p>
        )}
        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="font-serif text-base leading-snug text-ink transition-colors duration-300 group-hover:text-rose-dark sm:text-lg">
            {product.name}
          </h3>
          <span className="shrink-0 text-sm text-ink sm:text-[15px]">{formatPrice(product.price)}</span>
        </div>
        {showDescription && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-light">
            {product.description}
          </p>
        )}
      </Link>

      <AddToCartButton product={product} compact className="mt-4" />
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-2xl bg-beige" />
      <div className="mt-4 h-4 w-2/3 rounded bg-beige" />
      <div className="mt-2 h-3 w-1/3 rounded bg-beige" />
      <div className="mt-4 h-11 rounded-full bg-beige" />
    </div>
  );
}

export default ProductCard;
