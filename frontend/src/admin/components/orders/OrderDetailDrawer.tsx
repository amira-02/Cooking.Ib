import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, CreditCard, Mail, PackageCheck, Phone, ShieldCheck, StickyNote, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Drawer } from "../ui/Overlay";
import { OrderStatusBadge } from "../ui/Badges";
import { ErrorState, Skeleton } from "../ui/States";
import { useToast } from "../../../components/ui/Toast";
import { OrderTimeline, PickupCodeCard } from "../../../components/order/OrderBits";
import ConfirmOrderModal from "./ConfirmOrderModal";
import CancelOrderModal from "./CancelOrderModal";
import { useAsync } from "../../hooks/useAsync";
import { applyOrderUpdate, getOrder, getStockOverview } from "../../services/dashboardService";
import { adminCancelOrder, adminCompleteOrder, adminConfirmOrder, adminMarkReady, adminVerifyPickupCode, getShopConfig } from "../../../services/orderService";
import { formatDateTime } from "../../utils/format";
import { customerName } from "../../utils/orders";
import { formatPrice } from "../../../utils/formatPrice";
import { formatLongDate, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_META, slotText } from "../../../utils/orderStatus";
import type { Order } from "../../types";

interface OrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
  onUpdated: (order: Order) => void;
}

const FALLBACK_TIMES: [string, string][] = [
  ["10:00", "10:30"],
  ["11:00", "11:30"],
  ["14:00", "14:30"],
  ["15:00", "15:30"],
  ["16:00", "16:30"],
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">{title}</h3>
      {children}
    </section>
  );
}

function Banner({ tone, icon, children }: { tone: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] ${tone}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

function OrderDetailDrawer({ orderId, onClose, onUpdated }: OrderDetailDrawerProps) {
  const toast = useToast();
  const order = useAsync(() => (orderId ? getOrder(orderId) : Promise.resolve(null)), [orderId]);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<"idle" | "valid" | "invalid">("idle");
  const [codeError, setCodeError] = useState("");
  const [defaultTimes, setDefaultTimes] = useState<[string, string][]>(FALLBACK_TIMES);
  const [stockById, setStockById] = useState<Record<string, number | null>>({});

  useEffect(() => {
    getShopConfig()
      .then((c) => setDefaultTimes(c.defaultSlotTimes))
      .catch(() => {});
  }, []);

  // Nouvelle commande ouverte : on repart d'une vérification de code vierge
  const [forId, setForId] = useState(orderId);
  if (orderId !== forId) {
    setForId(orderId);
    setCode("");
    setCodeState("idle");
    setCodeError("");
  }

  const data = order.data;

  async function run(action: string, fn: () => Promise<Order>, message: string) {
    setBusy(action);
    try {
      const updated = await fn();
      applyOrderUpdate(updated);
      order.setData(() => updated);
      onUpdated(updated);
      toast(message);
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : "L'action a échoué", "error");
      return false;
    } finally {
      setBusy(null);
    }
  }

  function openConfirm() {
    setConfirmOpen(true);
    getStockOverview()
      .then(({ items }) => setStockById(Object.fromEntries(items.map((i) => [i.id, i.stock]))))
      .catch(() => {});
  }

  async function verifyCode() {
    if (!data || !code.trim()) return;
    setBusy("verify");
    setCodeError("");
    try {
      await adminVerifyPickupCode(data.id, code);
      setCodeState("valid");
    } catch (e) {
      setCodeState("invalid");
      setCodeError(e instanceof Error ? e.message : "Code incorrect");
    } finally {
      setBusy(null);
    }
  }

  const canCancel = data && data.status !== "COMPLETED" && data.status !== "CANCELLED";

  const footer = data && (canCancel || data.status === "PENDING" || data.status === "CONFIRMED") && (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      {canCancel ? (
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          disabled={Boolean(busy)}
          className="h-10 rounded-xl px-4 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          Annuler la commande
        </button>
      ) : (
        <span />
      )}
      {data.status === "PENDING" && (
        <button type="button" onClick={openConfirm} className="h-10 rounded-xl bg-ink px-5 text-[13px] font-medium text-cream hover:bg-rose-dark">
          Confirmer la commande
        </button>
      )}
      {data.status === "CONFIRMED" && (
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => run("ready", () => adminMarkReady(data.id), `${data.orderNumber} : marquée prête, le client est prévenu`)}
          className="h-10 rounded-xl bg-ink px-5 text-[13px] font-medium text-cream hover:bg-rose-dark disabled:opacity-50"
        >
          {busy === "ready" ? "Enregistrement…" : "Marquer comme prête"}
        </button>
      )}
    </div>
  );

  return (
    <>
      <Drawer
        open={orderId !== null}
        onClose={onClose}
        title={data ? `Commande ${data.orderNumber}` : "Commande"}
        subtitle={
          data && (
            <span className="flex flex-wrap items-center gap-2">
              Reçue le {formatDateTime(data.createdAt)} <OrderStatusBadge status={data.status} />
            </span>
          )
        }
        footer={footer || undefined}
      >
        {order.error ? (
          <ErrorState message={order.error} onRetry={order.retry} />
        ) : order.loading || !data ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-7">
            {data.status === "PENDING" && (
              <Banner tone="border-amber-200 bg-amber-50 text-amber-900" icon={<Clock size={17} />}>
                <strong>Précommande en attente de validation.</strong> Vérifiez la commande puis confirmez-la en proposant des créneaux, ou annulez-la avec un motif.
              </Banner>
            )}
            {data.status === "AWAITING_CUSTOMER_SELECTION" && (
              <Banner tone="border-sky-200 bg-sky-50 text-sky-900" icon={<CalendarClock size={17} />}>
                <strong>En attente du client</strong> : il doit choisir un créneau et son mode de paiement.
                {data.paymentStatus === "FAILED" && " Son dernier paiement PayPal a échoué."}
              </Banner>
            )}
            {data.status === "CONFIRMED" && (
              <Banner tone="border-violet-200 bg-violet-50 text-violet-900" icon={<PackageCheck size={17} />}>
                <strong>À préparer</strong> pour le <span className="">{data.selectedSlot ? slotText(data.selectedSlot) : "créneau choisi"}</span>. Marquez-la comme
                prête pour prévenir le client.
              </Banner>
            )}
            {data.status === "COMPLETED" && (
              <Banner tone="border-emerald-200 bg-emerald-50 text-emerald-900" icon={<CheckCircle2 size={17} />}>
                <strong>Récupérée</strong> le {data.completedAt && formatDateTime(data.completedAt)}
                {data.completedBy && ` · validé par ${data.completedBy.email}`}
              </Banner>
            )}
            {data.status === "CANCELLED" && (
              <Banner tone="border-stone-200 bg-stone-50 text-stone-800" icon={<XCircle size={17} />}>
                <strong>Annulée</strong>
                {data.cancelledAt && ` le ${formatDateTime(data.cancelledAt)}`} — motif : « {data.cancellationReason} »
                {data.paymentStatus === "PAID" && (
                  <span className="mt-1 flex items-center gap-1.5 font-medium text-red-700">
                    <AlertTriangle size={14} /> Payée par PayPal : remboursement à effectuer depuis votre compte PayPal.
                  </span>
                )}
              </Banner>
            )}

            {/* Retrait : vérification du code présenté par le client */}
            {(data.status === "CONFIRMED" || data.status === "READY_FOR_PICKUP") && data.pickupCode && (
              <Section title="Retrait">
                <div className="space-y-3 rounded-xl border border-[#F1E6DA] p-4">
                  <p className="text-[13px] text-ink-light">Demandez son code au client et saisissez-le :</p>
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setCodeState("idle");
                        setCodeError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                      placeholder="Code client"
                      aria-label="Code de retrait fourni par le client"
                      maxLength={10}
                      autoComplete="off"
                      className={`h-11 min-w-0 flex-1 rounded-xl border bg-white px-3 font-mono text-lg uppercase tracking-[0.25em] text-ink outline-none focus:ring-4 ${
                        codeState === "invalid"
                          ? "border-red-300 focus:ring-red-100"
                          : codeState === "valid"
                            ? "border-emerald-400 focus:ring-emerald-100"
                            : "border-[#EADBCB] focus:border-ink focus:ring-rose/25"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={verifyCode}
                      disabled={!code.trim() || Boolean(busy)}
                      className="h-11 shrink-0 rounded-xl border border-[#EADBCB] px-4 text-[13px] font-medium text-ink hover:border-ink/40 disabled:opacity-50"
                    >
                      {busy === "verify" ? "…" : "Vérifier"}
                    </button>
                  </div>
                  {codeState === "invalid" && <p className="text-[13px] text-red-700">{codeError}</p>}
                  {codeState === "valid" && (
                    <>
                      <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[14px] font-semibold text-emerald-800">
                        <ShieldCheck size={18} /> Commande vérifiée
                      </p>
                      {data.paymentStatus === "CASH_ON_PICKUP" && (
                        <p className="text-[13px] text-ink">
                          À encaisser en espèces : <strong>{formatPrice(data.totalAmount)}</strong>
                        </p>
                      )}
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => run("complete", () => adminCompleteOrder(data.id, code), `${data.orderNumber} : commande récupérée`)}
                        className="h-11 w-full rounded-xl bg-emerald-700 text-[14px] font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {busy === "complete" ? "Enregistrement…" : "Marquer comme récupérée"}
                      </button>
                    </>
                  )}
                  <details className="text-xs text-ink-light">
                    <summary className="cursor-pointer select-none">Afficher le code attendu</summary>
                    <div className="mt-2">
                      <PickupCodeCard code={data.pickupCode} hint="Code envoyé au client." />
                    </div>
                  </details>
                </div>
              </Section>
            )}

            <Section title="Client">
              <ul className="space-y-2 rounded-xl border border-[#F1E6DA] p-4 text-[13px] text-ink">
                <li className="text-sm font-semibold">{customerName(data)}</li>
                <li className="flex items-center gap-3">
                  <Mail size={15} className="shrink-0 text-ink-light" />
                  <a href={`mailto:${data.customer.email}`} className="break-all hover:text-rose-dark">
                    {data.customer.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={15} className="shrink-0 text-ink-light" />
                  <a href={`tel:${data.customer.phone.replace(/\s/g, "")}`} className="hover:text-rose-dark">
                    {data.customer.phone}
                  </a>
                </li>
              </ul>
            </Section>

            <Section title="Retrait et paiement">
              <ul className="space-y-2.5 rounded-xl border border-[#F1E6DA] p-4 text-[13px] text-ink">
                <li className="flex items-start gap-3">
                  <CalendarClock size={15} className="mt-0.5 shrink-0 text-ink-light" />
                  <span>
                    Date souhaitée : <span className="">{formatLongDate(data.requestedPickupDate)}</span>
                    {data.selectedSlot && <span className="mt-0.5 block font-semibold">Créneau choisi : {slotText(data.selectedSlot)}</span>}
                    {!data.selectedSlot && data.proposedSlots.length > 0 && (
                      <span className="mt-0.5 block text-ink-light">{data.proposedSlots.length} créneau(x) proposé(s) au client</span>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CreditCard size={15} className="mt-0.5 shrink-0 text-ink-light" />
                  <span>
                    {data.paymentMethod ? PAYMENT_METHOD_LABEL[data.paymentMethod] : "Mode de paiement pas encore choisi"} ·{" "}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${PAYMENT_STATUS_META[data.paymentStatus].badge}`}>
                      {PAYMENT_STATUS_META[data.paymentStatus].label}
                    </span>
                    {data.payment?.transactionId && <span className="mt-0.5 block text-xs text-ink-light">Transaction PayPal : {data.payment.transactionId}</span>}
                  </span>
                </li>
                {data.customerNote && (
                  <li className="flex items-start gap-3 rounded-lg bg-[#F4E9DE]/70 p-2.5">
                    <StickyNote size={15} className="mt-0.5 shrink-0 text-ink-light" />
                    <span className="italic">« {data.customerNote} »</span>
                  </li>
                )}
                {data.adminMessage && <li className="text-xs text-ink-light">Votre message au client : « {data.adminMessage} »</li>}
              </ul>
            </Section>

            <Section title={`Produits (${data.items.reduce((s, i) => s + i.quantity, 0)})`}>
              <ul className="divide-y divide-[#F1E6DA] rounded-xl border border-[#F1E6DA]">
                {data.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 p-3">
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#F4E9DE]">
                      {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{item.productName}</p>
                      <p className="text-xs text-ink-light">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold text-ink">{formatPrice(item.totalPrice)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between px-1 text-[15px] font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(data.totalAmount)}</span>
              </p>
            </Section>

            <Section title="Historique">
              <OrderTimeline history={data.history} />
            </Section>
          </div>
        )}
      </Drawer>

      <ConfirmOrderModal
        order={data}
        open={confirmOpen}
        loading={busy === "confirm"}
        defaultTimes={defaultTimes}
        stockById={stockById}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async (slots, message) => {
          if (!data) return;
          const ok = await run("confirm", () => adminConfirmOrder(data.id, slots, message), `${data.orderNumber} confirmée : le client a reçu ses créneaux par email`);
          if (ok) setConfirmOpen(false);
        }}
      />
      <CancelOrderModal
        order={data}
        open={cancelOpen}
        loading={busy === "cancel"}
        onClose={() => setCancelOpen(false)}
        onConfirm={async (reason) => {
          if (!data) return;
          const ok = await run("cancel", () => adminCancelOrder(data.id, reason), `${data.orderNumber} annulée : le client a été prévenu`);
          if (ok) setCancelOpen(false);
        }}
      />
    </>
  );
}

export default OrderDetailDrawer;
