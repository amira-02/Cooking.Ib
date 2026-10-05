import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, PackageCheck, PartyPopper, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import CheckoutSteps from "../../components/cart/CheckoutSteps";
import OrderSummary from "../../components/order/OrderSummary";
import PickupSlotSelector from "../../components/order/PickupSlotSelector";
import PaymentMethodSelector from "../../components/order/PaymentMethodSelector";
import { OrderStatusBadge, OrderTimeline, PickupCodeCard } from "../../components/order/OrderBits";
import AuthMessage from "../../components/auth/AuthMessage";
import PrimaryButton from "../../components/auth/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { getMyOrder, getShopConfig, submitSelection } from "../../services/orderService";
import { cancelPaypalPayment, capturePaypalPayment, startPaypalRedirect } from "../../services/paymentService";
import { toApiError } from "../../services/authApi";
import { clientStepOf, formatLongDate, PAYMENT_METHOD_LABEL, slotText } from "../../utils/orderStatus";
import { formatPrice } from "../../utils/formatPrice";
import type { Order, PaymentMethod } from "../../types/order";

function StatusPanel({ tone, icon, title, children }: { tone: "amber" | "sky" | "emerald" | "stone" | "teal"; icon: ReactNode; title: string; children?: ReactNode }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    teal: "border-teal-200 bg-teal-50 text-teal-900",
    stone: "border-stone-200 bg-stone-50 text-stone-800",
  };
  return (
    <div className={`flex gap-3.5 rounded-2xl border p-4 sm:p-5 ${tones[tone]}`} role="status">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 text-[14px] leading-relaxed">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
}

function OrderPage() {
  const { id = "" } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const justCreated = (location.state as { justCreated?: boolean } | null)?.justCreated;

  const [order, setOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState("");
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success" | "info"; text: string } | null>(null);
  const paypalHandled = useRef(false);

  const load = useCallback(() => {
    getMyOrder(id)
      .then(setOrder)
      .catch((e) => setLoadError(toApiError(e).code === "not_found" ? "Commande introuvable." : toApiError(e).message));
  }, [id]);

  useEffect(() => {
    if (!currentUser) return;
    getShopConfig()
      .then((c) => setPaypalEnabled(c.paypalEnabled))
      .catch(() => {});

    // Retour de PayPal : ?paypal=success&token=… (encaissement) ou ?paypal=cancel
    const paypal = params.get("paypal");
    if (paypal && !paypalHandled.current) {
      paypalHandled.current = true;
      const token = params.get("token");
      const clean = () => navigate(`/mes-commandes/${id}`, { replace: true });
      if (paypal === "success" && token) {
        capturePaypalPayment(id, token)
          .then((o) => {
            setOrder(o);
            setMessage({ kind: "success", text: "Paiement PayPal reçu : votre retrait est confirmé." });
          })
          .catch((e) => {
            setMessage({ kind: "error", text: toApiError(e).message });
            load();
          })
          .finally(clean);
        return;
      }
      cancelPaypalPayment(id)
        .then(setOrder)
        .catch(() => load())
        .finally(() => {
          setMessage({ kind: "info", text: "Paiement PayPal interrompu : aucun montant n'a été débité. Vous pouvez choisir à nouveau." });
          clean();
        });
      return;
    }
    load();
  }, [currentUser, id, params, navigate, load]);

  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  async function confirmChoice() {
    if (!order || !slotId || !method || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await submitSelection(order.id, slotId, method);
      if (result.approveUrl) {
        startPaypalRedirect(result.approveUrl);
        return; // la page est quittée
      }
      if (result.order) setOrder(result.order);
      setMessage({ kind: "success", text: "Votre choix est enregistré. À très bientôt !" });
    } catch (e) {
      setMessage({ kind: "error", text: toApiError(e).message });
      load();
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-[15px] text-ink">{loadError}</p>
        <Link to="/mes-commandes" className="mt-4 inline-block text-sm font-medium text-rose-dark underline">
          Voir mes commandes
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 sm:px-6 lg:px-8" aria-busy>
        <div className="h-8 w-64 animate-pulse rounded-lg bg-[#F4E9DE]" />
        <div className="h-40 animate-pulse rounded-2xl bg-[#F4E9DE]/80" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#F4E9DE]/80" />
      </div>
    );
  }

  const step = clientStepOf(order.status);
  const lines = order.items.map((i) => ({ key: i.productId, name: i.productName, image: i.image, quantity: i.quantity, unitPrice: i.unitPrice }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="max-w-2xl">
        <CheckoutSteps current={step} cancelled={order.status === "CANCELLED"} />
      </div>
      <Link to="/mes-commandes" className="mt-8 inline-flex items-center gap-1.5 text-[13px] text-ink-light hover:text-ink">
        <ArrowLeft size={15} /> Mes commandes
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-[2rem] font-light text-ink sm:text-4xl">Commande {order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} client />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          {justCreated && order.status === "PENDING" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <StatusPanel tone="emerald" icon={<CheckCircle2 size={22} />} title="Votre demande a bien été envoyée.">
                Vous recevrez une confirmation de réception par email à {order.customer.email}.
              </StatusPanel>
            </motion.div>
          )}
          {message && <AuthMessage variant={message.kind}>{message.text}</AuthMessage>}

          {order.status === "PENDING" && (
            <StatusPanel tone="amber" icon={<Clock size={22} />} title="Votre commande est en attente de confirmation par notre équipe.">
              <p>Nous vérifions la disponibilité de vos produits. Vous recevrez un email dès qu'elle sera validée, avec vos créneaux de retrait.</p>
              <p className="mt-2">
                Date souhaitée (à confirmer) : <strong className="">{formatLongDate(order.requestedPickupDate)}</strong>
              </p>
            </StatusPanel>
          )}

          {order.status === "AWAITING_CUSTOMER_SELECTION" && (
            <section className="rounded-2xl border border-[#F1E6DA] bg-white p-5 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Précommande confirmée 🎉</p>
              <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">Finalisez votre précommande</h2>
              {order.adminMessage && <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-[14px] italic text-ink">« {order.adminMessage} »</p>}
              {order.paymentStatus === "FAILED" && (
                <div className="mt-4">
                  <AuthMessage variant="error">Le dernier paiement n'a pas abouti. Vous pouvez réessayer ou choisir le paiement en espèces.</AuthMessage>
                </div>
              )}

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="mb-3 font-sans text-[15px] font-semibold text-ink">1. Choisissez votre créneau de retrait</h3>
                  <PickupSlotSelector slots={order.proposedSlots} value={slotId} onChange={setSlotId} disabled={submitting} />
                </div>
                <div>
                  <h3 className="mb-3 font-sans text-[15px] font-semibold text-ink">2. Choisissez votre mode de paiement</h3>
                  <PaymentMethodSelector value={method} onChange={setMethod} paypalEnabled={paypalEnabled} disabled={submitting} />
                </div>
                {order.pickupCode && <PickupCodeCard code={order.pickupCode} />}
                <PrimaryButton
                  type="button"
                  onClick={confirmChoice}
                  disabled={!slotId || !method}
                  loading={submitting}
                  loadingText={method === "PAYPAL" ? "Redirection vers PayPal…" : "Enregistrement…"}
                >
                  {method === "PAYPAL" ? `Payer ${formatPrice(order.totalAmount)} avec PayPal` : "Confirmer mon choix"}
                </PrimaryButton>
              </div>
            </section>
          )}

          {(order.status === "CONFIRMED" || order.status === "READY_FOR_PICKUP") && order.selectedSlot && (
            <>
              {order.status === "READY_FOR_PICKUP" ? (
                <StatusPanel tone="teal" icon={<PackageCheck size={22} />} title="Votre commande est prête !">
                  Elle vous attend : présentez votre code de retrait en boutique.
                </StatusPanel>
              ) : (
                <StatusPanel tone="sky" icon={<CalendarClock size={22} />} title="Votre retrait est planifié.">
                  Nous préparons votre commande. Vous recevrez un email quand elle sera prête.
                </StatusPanel>
              )}
              <section className="grid gap-4 rounded-2xl border border-[#F1E6DA] bg-white p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-light">Retrait</p>
                  <p className="mt-1 text-[15px] font-medium text-ink">{slotText(order.selectedSlot)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-light">Paiement</p>
                  <p className="mt-1 text-[15px] font-medium text-ink">
                    {order.paymentMethod ? PAYMENT_METHOD_LABEL[order.paymentMethod] : "—"}
                    {order.paymentStatus === "PAID" ? " · payé ✓" : order.paymentStatus === "CASH_ON_PICKUP" ? ` · ${formatPrice(order.totalAmount)} à régler sur place` : ""}
                  </p>
                </div>
              </section>
              {order.pickupCode && <PickupCodeCard code={order.pickupCode} />}
            </>
          )}

          {order.status === "COMPLETED" && (
            <StatusPanel tone="emerald" icon={<PartyPopper size={22} />} title="Commande récupérée — merci !">
              Nous espérons que vous vous régalerez. À très bientôt !
            </StatusPanel>
          )}

          {order.status === "CANCELLED" && (
            <StatusPanel tone="stone" icon={<XCircle size={22} />} title="Cette précommande a été annulée.">
              {order.cancellationReason && <p>Motif : « {order.cancellationReason} »</p>}
              {order.paymentStatus === "PAID" && <p className="mt-1">Votre paiement PayPal vous sera remboursé.</p>}
            </StatusPanel>
          )}

          <section className="rounded-2xl border border-[#F1E6DA] bg-white p-5 sm:p-6">
            <h2 className="mb-4 font-sans text-[15px] font-semibold text-ink">Suivi de la commande</h2>
            <OrderTimeline history={order.history} />
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <OrderSummary title="Votre commande" lines={lines} total={order.totalAmount} />
          {order.customerNote && (
            <section className="rounded-2xl border border-[#F1E6DA] bg-white p-5">
              <h2 className="font-sans text-[13px] font-semibold text-ink">Votre message</h2>
              <p className="mt-1 text-[14px] italic text-ink-light">« {order.customerNote} »</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
