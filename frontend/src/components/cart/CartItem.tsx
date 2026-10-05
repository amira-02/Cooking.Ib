import { Link } from "react-router-dom";
import { AlertCircle, Trash2 } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import { formatPrice } from "../../utils/formatPrice";
import type { CartItem as CartItemType } from "../../context/ShopContext";

interface CartItemProps {
  item: CartItemType;
  max: number;
  unavailable?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

function CartItem({ item, max, unavailable = false, onQuantityChange, onRemove }: CartItemProps) {
  const overMax = item.quantity > max;
  return (
    <li className="flex gap-4 py-5">
      <Link to={`/produits/${item.productId}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F4E9DE] sm:h-28 sm:w-24">
        {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.category && <p className="text-[10px] uppercase tracking-[0.2em] text-ink-light">{item.category}</p>}
            <Link to={`/produits/${item.productId}`} className="font-serif text-lg leading-snug text-ink hover:text-rose-dark">
              {item.name}
            </Link>
            <p className="mt-0.5 text-[13px] text-ink-light">
              {formatPrice(item.price)} × {item.quantity}
            </p>
          </div>
          <p className="shrink-0 text-[15px] font-semibold text-ink">{formatPrice(item.price * item.quantity)}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          {unavailable ? (
            <p className="flex items-center gap-1.5 text-[13px] text-red-700">
              <AlertCircle size={14} /> Ce produit n'est plus disponible
            </p>
          ) : (
            <QuantitySelector value={item.quantity} max={Math.max(1, max)} onChange={onQuantityChange} size="sm" label={`Quantité de ${item.name}`} />
          )}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[13px] text-ink-light transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
        {!unavailable && (item.quantity >= max || overMax) && (
          <p className="mt-2 text-xs text-amber-800" role="status">
            Quantité maximale disponible : {max}
          </p>
        )}
      </div>
    </li>
  );
}

export default CartItem;
