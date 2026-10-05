import { useMemo, useState } from "react";
import { AlertTriangle, Check, Plus, X } from "lucide-react";
import { Modal } from "../ui/Overlay";
import { formatPrice } from "../../../utils/formatPrice";
import { formatLongDate, formatShortDate } from "../../../utils/orderStatus";
import type { Order } from "../../types";

interface SlotInput {
  date: string;
  startTime: string;
  endTime: string;
}

interface ConfirmOrderModalProps {
  order: Order | null;
  open: boolean;
  loading: boolean;
  defaultTimes: [string, string][];
  // Stock actuel par produit (null = non suivi)
  stockById: Record<string, number | null>;
  onConfirm: (slots: SlotInput[], message: string) => void;
  onClose: () => void;
}

const keyOf = (s: SlotInput) => `${s.date}|${s.startTime}|${s.endTime}`;
const today = () => new Date().toLocaleDateString("en-CA");

// Vérification de la commande + choix des créneaux de retrait proposés au client
function ConfirmOrderModal({ order, open, loading, defaultTimes, stockById, onConfirm, onClose }: ConfirmOrderModalProps) {
  const initialDate = order && order.requestedPickupDate >= today() ? order.requestedPickupDate : today();
  const [dates, setDates] = useState<string[]>([initialDate]);
  const [newDate, setNewDate] = useState("");
  const [selected, setSelected] = useState<Map<string, SlotInput>>(new Map());
  const [custom, setCustom] = useState({ date: initialDate, startTime: "", endTime: "" });
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  // Réinitialisation quand on ouvre la modale pour une autre commande
  const [forOrder, setForOrder] = useState(order?.id);
  if (order?.id !== forOrder) {
    setForOrder(order?.id);
    setDates([initialDate]);
    setSelected(new Map());
    setCustom({ date: initialDate, startTime: "", endTime: "" });
    setMessage("");
    setTouched(false);
  }

  const stockIssues = useMemo(
    () => (order?.items ?? []).filter((i) => typeof stockById[i.productId] === "number" && (stockById[i.productId] as number) < i.quantity),
    [order, stockById]
  );

  function toggle(slot: SlotInput) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(keyOf(slot))) next.delete(keyOf(slot));
      else next.set(keyOf(slot), slot);
      return next;
    });
  }

  function addDate() {
    if (!newDate || newDate < today() || dates.includes(newDate)) return;
    setDates((d) => [...d, newDate].sort());
    setCustom((c) => ({ ...c, date: newDate }));
    setNewDate("");
  }

  function addCustom() {
    if (!custom.date || !custom.startTime || !custom.endTime || custom.endTime <= custom.startTime) return;
    if (!dates.includes(custom.date)) setDates((d) => [...d, custom.date].sort());
    setSelected((prev) => new Map(prev).set(keyOf(custom), { ...custom }));
    setCustom((c) => ({ ...c, startTime: "", endTime: "" }));
  }

  const slots = [...selected.values()].sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
  const error = touched && slots.length === 0 ? "Sélectionnez au moins un créneau de retrait." : null;
  const inputClass = "h-10 rounded-xl border border-[#EADBCB] bg-white px-3 text-[13px] text-ink outline-none focus:border-ink focus:ring-4 focus:ring-rose/25";

  return (
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      size="lg"
      title="Confirmer la commande"
      subtitle={order && `${order.orderNumber} · ${order.customer.firstName} ${order.customer.lastName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="h-10 rounded-xl border border-[#EADBCB] px-4 text-[13px] font-medium text-ink hover:bg-cream">
            Retour
          </button>
          <button
            type="button"
            disabled={loading || stockIssues.length > 0}
            onClick={() => {
              setTouched(true);
              if (slots.length) onConfirm(slots, message.trim());
            }}
            className="h-10 rounded-xl bg-ink px-4 text-[13px] font-medium text-cream hover:bg-rose-dark disabled:opacity-50"
          >
            {loading ? "Confirmation…" : `Confirmer et envoyer ${slots.length || ""} créneau${slots.length > 1 ? "x" : ""} au client`}
          </button>
        </div>
      }
    >
      {order && (
        <div className="space-y-7">
          {/* 1. Vérification */}
          <section>
            <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">1. Vérifiez la commande</h3>
            <ul className="divide-y divide-[#F1E6DA] rounded-xl border border-[#F1E6DA]">
              {order.items.map((item) => {
                const stock = stockById[item.productId];
                const short = typeof stock === "number" && stock < item.quantity;
                return (
                  <li key={item.productId} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                      {item.quantity} × {item.productName}
                    </span>
                    <span className={`shrink-0 text-xs ${short ? "font-medium text-red-700" : "text-ink-light"}`}>
                      {stock === undefined || stock === null ? "Stock non suivi" : short ? `⚠ Stock : ${stock}` : `Stock : ${stock}`}
                    </span>
                    <span className="w-16 shrink-0 text-right text-[13px] font-medium text-ink">{formatPrice(item.totalPrice)}</span>
                  </li>
                );
              })}
              <li className="flex justify-between px-3 py-2.5 text-[14px] font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </li>
            </ul>
            {stockIssues.length > 0 && (
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-800">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" /> Stock insuffisant : réapprovisionnez le produit ou annulez la commande.
              </p>
            )}
            <p className="mt-3 text-[13px] text-ink">
              Date souhaitée par le client : <strong className="">{formatLongDate(order.requestedPickupDate)}</strong>
            </p>
            {order.customerNote && <p className="mt-1 text-[13px] italic text-ink-light">« {order.customerNote} »</p>}
          </section>

          {/* 2. Créneaux */}
          <section>
            <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">2. Créneaux de retrait proposés</h3>
            <div className="space-y-4">
              {dates.map((date) => (
                <div key={date}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[13px] font-medium text-ink">{formatLongDate(date)}</p>
                    {dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setDates((d) => d.filter((x) => x !== date));
                          setSelected((prev) => new Map([...prev].filter(([, s]) => s.date !== date)));
                        }}
                        className="text-xs text-ink-light hover:text-red-700"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {defaultTimes.map(([startTime, endTime]) => {
                      const slot = { date, startTime, endTime };
                      const on = selected.has(keyOf(slot));
                      return (
                        <button
                          key={startTime}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => toggle(slot)}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] tabular-nums transition-colors ${
                            on ? "border-ink bg-ink text-cream" : "border-[#EADBCB] bg-white text-ink hover:border-ink/40"
                          }`}
                        >
                          {on && <Check size={13} strokeWidth={3} />}
                          {startTime} – {endTime}
                        </button>
                      );
                    })}
                    {[...selected.values()]
                      .filter((s) => s.date === date && !defaultTimes.some(([a, b]) => a === s.startTime && b === s.endTime))
                      .map((s) => (
                        <button key={keyOf(s)} type="button" onClick={() => toggle(s)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink bg-ink px-3 text-[13px] text-cream">
                          {s.startTime} – {s.endTime} <X size={13} />
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 rounded-xl bg-cream/70 p-3 sm:grid-cols-2">
              <div className="flex gap-2">
                <input type="date" min={today()} value={newDate} onChange={(e) => setNewDate(e.target.value)} aria-label="Autre date" className={`${inputClass} min-w-0 flex-1`} />
                <button type="button" onClick={addDate} className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-[#EADBCB] bg-white px-3 text-[13px] text-ink hover:border-ink/30">
                  <Plus size={14} /> Date
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={custom.date} onChange={(e) => setCustom((c) => ({ ...c, date: e.target.value }))} aria-label="Date du créneau personnalisé" className={`${inputClass} min-w-0 flex-1`}>
                  {dates.map((d) => (
                    <option key={d} value={d}>
                      {formatShortDate(d)}
                    </option>
                  ))}
                </select>
                <input type="time" value={custom.startTime} onChange={(e) => setCustom((c) => ({ ...c, startTime: e.target.value }))} aria-label="Début" className={`${inputClass} w-[6.5rem]`} />
                <input type="time" value={custom.endTime} onChange={(e) => setCustom((c) => ({ ...c, endTime: e.target.value }))} aria-label="Fin" className={`${inputClass} w-[6.5rem]`} />
                <button type="button" onClick={addCustom} className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#EADBCB] bg-white px-3 text-[13px] text-ink hover:border-ink/30">
                  <Plus size={14} /> Créneau
                </button>
              </div>
            </div>
            {error && <p className="mt-2 text-[13px] text-red-700">{error}</p>}
          </section>

          {/* 3. Message */}
          <section>
            <h3 className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">3. Message au client (facultatif)</h3>
            <textarea
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex : Votre gâteau sera prêt dès 10h, nous avons ajouté l'inscription demandée."
              className="w-full resize-y rounded-xl border border-[#EADBCB] bg-white px-4 py-3 text-[14px] text-ink outline-none focus:border-ink focus:ring-4 focus:ring-rose/25"
            />
            <p className="mt-2 text-xs text-ink-light">
              Le client reçoit un email avec ces créneaux, son code de retrait et le choix du paiement. Le stock des produits suivis est réservé.
            </p>
          </section>
        </div>
      )}
    </Modal>
  );
}

export default ConfirmOrderModal;
