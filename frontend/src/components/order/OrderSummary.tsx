import type { ReactNode } from "react";
import { formatPrice } from "../../utils/formatPrice";

interface SummaryLine {
  key: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
}

interface OrderSummaryProps {
  title?: string;
  lines: SummaryLine[];
  total: number;
  footer?: ReactNode;
  compact?: boolean;
}

// Récapitulatif produits + total (panier, précommande, page commande)
function OrderSummary({ title = "Récapitulatif", lines, total, footer, compact = false }: OrderSummaryProps) {
  return (
    <section className="rounded-2xl border border-[#F1E6DA] bg-white p-5 sm:p-6">
      <h2 className="font-sans text-[15px] font-semibold text-ink">{title}</h2>
      {!compact && (
        <ul className="mt-4 divide-y divide-[#F1E6DA]">
          {lines.map((line) => (
            <li key={line.key} className="flex items-center gap-3 py-3">
              {line.image !== undefined && (
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F4E9DE]">
                  {line.image && <img src={line.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] text-ink">{line.name}</span>
                <span className="block text-xs text-ink-light">
                  {line.quantity} × {formatPrice(line.unitPrice)}
                </span>
              </span>
              <span className="shrink-0 text-[14px] font-medium text-ink">{formatPrice(line.quantity * line.unitPrice)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-4 space-y-2 border-t border-[#F1E6DA] pt-4 text-[14px]">
        <div className="flex justify-between text-ink-light">
          <dt>Sous-total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between text-ink-light">
          <dt>Retrait en boutique</dt>
          <dd>Gratuit</dd>
        </div>
        <div className="flex justify-between pt-1 text-lg font-semibold text-ink">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {footer && <div className="mt-5">{footer}</div>}
    </section>
  );
}

export default OrderSummary;
