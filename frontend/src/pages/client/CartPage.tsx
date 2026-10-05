import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, ShoppingBag } from "lucide-react";
import CheckoutSteps from "../../components/cart/CheckoutSteps";
import CartItem from "../../components/cart/CartItem";
import OrderSummary from "../../components/order/OrderSummary";
import { useShop } from "../../context/ShopContext";
import { useCatalog } from "../../hooks/useCatalog";

function CartPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart, maxQuantityFor, refreshCartItems } = useShop();
  const { products, categories, loading } = useCatalog();

  // Prix, stock et disponibilité actualisés à partir du catalogue
  useEffect(() => {
    if (!loading && products.length) {
      refreshCartItems(products, (id) => categories.find((c) => c.id === id)?.name ?? "");
    }
  }, [loading, products, categories, refreshCartItems]);

  const isUnavailable = (productId: string) => {
    if (loading) return false;
    const product = products.find((p) => p.id === productId);
    return !product || !product.isAvailable || product.stock === 0;
  };
  const hasIssues = cart.some((item) => isUnavailable(item.productId) || item.quantity > maxQuantityFor(item));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="max-w-2xl">
        <CheckoutSteps current={1} />
      </div>
      <h1 className="mt-8 font-serif text-[2rem] font-light text-ink sm:text-4xl">Votre panier</h1>

      {cart.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-[#F1E6DA] bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-ink-light">
            <ShoppingBag size={22} strokeWidth={1.6} />
          </span>
          <p className="mt-5 text-[15px] font-medium text-ink">Votre panier est vide</p>
          <p className="mt-1 text-sm text-ink-light">Découvrez nos trompe-l'œil et créations du moment.</p>
          <Link to="/produits" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-medium text-cream hover:bg-rose-dark">
            Découvrir nos créations
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <section className="rounded-2xl border border-[#F1E6DA] bg-white px-5 sm:px-6" aria-label="Articles du panier">
            <ul className="divide-y divide-[#F1E6DA]">
              {cart.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  max={maxQuantityFor(item)}
                  unavailable={isUnavailable(item.productId)}
                  onQuantityChange={(q) => updateQuantity(item.productId, q)}
                  onRemove={() => removeFromCart(item.productId)}
                />
              ))}
            </ul>
          </section>

          <div className="space-y-4 lg:sticky lg:top-24">
            <OrderSummary
              compact
              lines={[]}
              total={cartTotal}
              footer={
                <div className="space-y-3">
                  {hasIssues && (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-800" role="alert">
                      Retirez les produits indisponibles ou ajustez les quantités pour continuer.
                    </p>
                  )}
                  <Link
                    to={hasIssues ? "#" : "/precommande"}
                    aria-disabled={hasIssues}
                    onClick={(e) => hasIssues && e.preventDefault()}
                    className={`flex min-h-12 w-full items-center justify-center rounded-xl text-[15px] font-medium transition-colors ${
                      hasIssues ? "cursor-not-allowed bg-ink/40 text-cream" : "bg-ink text-cream hover:bg-rose-dark"
                    }`}
                  >
                    Précommander
                  </Link>
                  <Link to="/produits" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] text-ink-light hover:text-ink">
                    <ArrowLeft size={15} /> Continuer mes achats
                  </Link>
                </div>
              }
            />
            <p className="flex gap-2.5 rounded-2xl bg-[#F4E9DE]/70 p-4 text-[13px] leading-relaxed text-ink">
              <Info size={16} className="mt-0.5 shrink-0 text-ink-light" />
              Aucun paiement maintenant : vous envoyez une demande de précommande, que notre équipe confirme avant de vous proposer vos créneaux de retrait.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
