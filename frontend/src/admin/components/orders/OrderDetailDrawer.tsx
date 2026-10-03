import { useState } from "react";
import { CalendarClock, CreditCard, Mail, MapPin, Phone, Store, StickyNote, Truck } from "lucide-react";
import { Drawer, ConfirmDialog } from "../ui/Overlay";
import { OrderStatusBadge } from "../ui/Badges";
import { SelectMenu } from "../ui/Dropdown";
import { ErrorState, Skeleton } from "../ui/States";
import { useToast } from "../../../components/ui/Toast";
import { useAsync } from "../../hooks/useAsync";
import { getOrder, updateOrderStatus } from "../../services/dashboardService";
import { ORDER_STATUS, ORDER_STATUS_FLOW, PAYMENT_LABELS } from "../../constants";
import { formatDate, formatDateTime } from "../../utils/format";
import { formatPrice } from "../../../utils/formatPrice";
import type { Order, OrderStatus } from "../../types";

interface OrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
  onUpdated: (order: Order) => void;
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[13px] text-ink">
      <span className="mt-0.5 shrink-0 text-ink-light">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

function OrderDetailDrawer({ orderId, onClose, onUpdated }: OrderDetailDrawerProps) {
  const toast = useToast();
  const order = useAsync(() => (orderId ? getOrder(orderId) : Promise.resolve(null)), [orderId]);
  const [nextStatus, setNextStatus] = useState<OrderStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const data = order.data;
  const selectedStatus = nextStatus ?? data?.status ?? "pending";

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      const updated = await updateOrderStatus(data.id, selectedStatus);
      order.setData(() => updated);
      onUpdated(updated);
      setNextStatus(null);
      toast(`${updated.number} : statut « ${ORDER_STATUS[updated.status].label} »`);
    } catch {
      toast("Le statut n'a pas pu être mis à jour", "error");
    } finally {
      setSaving(false);
      setConfirmCancel(false);
    }
  }

  return (
    <>
      <Drawer
        open={orderId !== null}
        onClose={() => {
          setNextStatus(null);
          onClose();
        }}
        title={data ? `Commande ${data.number}` : "Commande"}
        subtitle={data && <span className="flex flex-wrap items-center gap-2">{formatDateTime(data.createdAt)} <OrderStatusBadge status={data.status} /></span>}
        footer={
          data && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SelectMenu
                  label="Nouveau statut"
                  align="left"
                  value={selectedStatus}
                  onChange={setNextStatus}
                  options={ORDER_STATUS_FLOW.map((s) => ({ value: s, label: ORDER_STATUS[s].label }))}
                />
              </div>
              <button
                type="button"
                disabled={saving || selectedStatus === data.status}
                onClick={() => (selectedStatus === "cancelled" ? setConfirmCancel(true) : save())}
                className="h-10 rounded-xl bg-ink px-4 text-[13px] font-medium text-cream transition-colors hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "Enregistrement…" : "Mettre à jour le statut"}
              </button>
            </div>
          )
        }
      >
        {order.error ? (
          <ErrorState message={order.error} onRetry={order.retry} />
        ) : order.loading || !data ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">Client</h3>
              <ul className="space-y-2.5 rounded-xl border border-[#F1E6DA] p-4">
                <li className="text-sm font-semibold text-ink">{data.customer.name}</li>
                <InfoRow icon={<Mail size={15} />}>
                  <a href={`mailto:${data.customer.email}`} className="hover:text-rose-dark">{data.customer.email}</a>
                </InfoRow>
                <InfoRow icon={<Phone size={15} />}>
                  <a href={`tel:${data.customer.phone.replace(/\s/g, "")}`} className="hover:text-rose-dark">{data.customer.phone}</a>
                </InfoRow>
              </ul>
            </section>

            <section>
              <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">Livraison & paiement</h3>
              <ul className="space-y-2.5 rounded-xl border border-[#F1E6DA] p-4">
                <InfoRow icon={data.delivery.mode === "pickup" ? <Store size={15} /> : <Truck size={15} />}>
                  {data.delivery.mode === "pickup" ? "Retrait en boutique" : "Livraison à domicile"}
                </InfoRow>
                {data.delivery.address && <InfoRow icon={<MapPin size={15} />}>{data.delivery.address}</InfoRow>}
                <InfoRow icon={<CalendarClock size={15} />}>Prévue le {formatDate(data.delivery.date)}</InfoRow>
                <InfoRow icon={<CreditCard size={15} />}>{PAYMENT_LABELS[data.paymentMethod]}</InfoRow>
                {data.note && <InfoRow icon={<StickyNote size={15} />}>« {data.note} »</InfoRow>}
              </ul>
            </section>

            <section>
              <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">
                Produits ({data.items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
              <ul className="divide-y divide-[#F1E6DA] rounded-xl border border-[#F1E6DA]">
                {data.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 p-3">
                    <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink-light">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold text-ink">{formatPrice(item.quantity * item.unitPrice)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1.5 px-1 text-[13px]">
                <div className="flex justify-between text-ink-light">
                  <dt>Sous-total</dt>
                  <dd>{formatPrice(data.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-ink-light">
                  <dt>Livraison</dt>
                  <dd>{data.shipping ? formatPrice(data.shipping) : "Offerte"}</dd>
                </div>
                <div className="flex justify-between border-t border-[#F1E6DA] pt-2 text-[15px] font-semibold text-ink">
                  <dt>Total</dt>
                  <dd>{formatPrice(data.total)}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmCancel}
        danger
        title="Annuler cette commande ?"
        message={data ? `La commande ${data.number} de ${data.customer.name} passera au statut « Annulée ». Pensez à prévenir le client.` : ""}
        confirmLabel="Annuler la commande"
        loading={saving}
        onConfirm={save}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}

export default OrderDetailDrawer;
