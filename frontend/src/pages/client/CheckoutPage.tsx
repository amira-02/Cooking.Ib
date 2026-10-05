import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, MailWarning } from "lucide-react";
import CheckoutSteps from "../../components/cart/CheckoutSteps";
import OrderSummary from "../../components/order/OrderSummary";
import PreOrderForm from "../../components/order/PreOrderForm";
import type { PreOrderValues } from "../../components/order/PreOrderForm";
import AuthMessage from "../../components/auth/AuthMessage";
import { ConfirmDialog } from "../../admin/components/ui/Overlay";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
import { createPreOrder, getShopConfig } from "../../services/orderService";
import { toApiError } from "../../services/authApi";
import { formatLongDate } from "../../utils/orderStatus";
import { formatPrice } from "../../utils/formatPrice";
import type { ShopConfig } from "../../types/order";

function CheckoutPage() {
  const { currentUser, emailVerified, profile, sendVerificationCode } = useAuth();
  const { cart, cartTotal, clearCart } = useShop();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [pending, setPending] = useState<PreOrderValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getShopConfig()
      .then(setConfig)
      .catch(() => setError("Impossible de charger les réglages de la boutique. Réessayez dans quelques instants."));
  }, []);

  // La précommande nécessite un compte : les confirmations sont envoyées par email
  if (!currentUser) return <Navigate to="/login" replace state={{ from: "/precommande" }} />;
  if (cart.length === 0 && !sent) return <Navigate to="/panier" replace />;

  async function send() {
    if (!pending || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const order = await createPreOrder({
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer: { firstName: pending.firstName, lastName: pending.lastName, phone: pending.phone },
        requestedPickupDate: pending.requestedPickupDate,
        customerNote: pending.customerNote,
      });
      setSent(true);
      clearCart();
      navigate(`/mes-commandes/${order.id}`, { replace: true, state: { justCreated: true } });
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError.message);
      setPending(null);
      setSubmitting(false);
    }
  }

  async function goVerify() {
    try {
      await sendVerificationCode();
    } catch {
      // le code pourra être renvoyé depuis la page de vérification
    }
    navigate("/verify-email", { state: { from: "/precommande" } });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="max-w-2xl">
        <CheckoutSteps current={2} />
      </div>
      <Link to="/panier" className="mt-8 inline-flex items-center gap-1.5 text-[13px] text-ink-light hover:text-ink">
        <ArrowLeft size={15} /> Retour au panier
      </Link>
      <h1 className="mt-2 font-serif text-[2rem] font-light text-ink sm:text-4xl">Votre précommande</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-light">
        Vérifiez votre commande et indiquez la date souhaitée. Notre équipe confirmera votre précommande avant de vous proposer vos créneaux de retrait.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <section className="rounded-2xl border border-[#F1E6DA] bg-white p-5 sm:p-8">
          <div className="mb-6">
            <AuthMessage variant="error">
              {error && (
                <>
                  {error}{" "}
                  <Link to="/panier" className="font-medium underline">
                    Modifier mon panier
                  </Link>
                </>
              )}
            </AuthMessage>
          </div>

          {!emailVerified ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <MailWarning size={22} />
              </span>
              <p className="mt-4 text-[15px] font-medium text-ink">Vérifiez votre adresse email pour précommander</p>
              <p className="mt-1 max-w-sm text-sm text-ink-light">Nous en avons besoin pour vous envoyer la confirmation de votre précommande et votre code de retrait.</p>
              <button type="button" onClick={goVerify} className="mt-5 min-h-12 rounded-xl bg-ink px-6 text-sm font-medium text-cream hover:bg-rose-dark">
                Vérifier mon email
              </button>
            </div>
          ) : !config ? (
            <div className="space-y-4" aria-busy>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[#F4E9DE]/80" />
              ))}
            </div>
          ) : (
            <PreOrderForm
              initial={{ firstName: profile?.firstName ?? "", lastName: profile?.lastName ?? "", phone: profile?.phone ?? "" }}
              email={currentUser.email ?? ""}
              earliestDate={config.earliestPickupDate}
              latestDate={config.latestPickupDate}
              minLeadDays={config.minLeadDays}
              submitting={submitting}
              onSubmit={(values) => {
                setError("");
                setPending(values);
              }}
            />
          )}
        </section>

        <div className="lg:sticky lg:top-24">
          <OrderSummary
            title="Votre commande"
            lines={cart.map((i) => ({ key: i.productId, name: i.name, image: i.image ?? "", quantity: i.quantity, unitPrice: i.price }))}
            total={cartTotal}
          />
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Confirmer la précommande"
        confirmLabel="Confirmer la précommande"
        loading={submitting}
        onConfirm={send}
        onCancel={() => !submitting && setPending(null)}
        message={
          pending && (
            <div className="space-y-3">
              <p>Vous êtes sur le point d'envoyer une demande de précommande.</p>
              <ul className="space-y-1 rounded-xl bg-cream p-3 text-[13px] text-ink">
                <li>
                  <strong className="font-medium">{cart.reduce((s, i) => s + i.quantity, 0)} article(s)</strong> · {formatPrice(cartTotal)}
                </li>
                <li>Date souhaitée : {formatLongDate(pending.requestedPickupDate)}</li>
              </ul>
              <p className="text-[13px]">Ce n'est pas encore une commande définitive : notre équipe doit d'abord la valider. Aucun paiement n'est demandé maintenant.</p>
            </div>
          )
        }
      />
    </div>
  );
}

export default CheckoutPage;
