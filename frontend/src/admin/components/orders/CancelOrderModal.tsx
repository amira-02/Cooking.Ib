import { useState } from "react";
import { Modal } from "../ui/Overlay";
import type { Order } from "../../types";

interface CancelOrderModalProps {
  order: Order | null;
  open: boolean;
  loading: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const SUGGESTIONS = ["Rupture d'un ingrédient", "Date demandée indisponible", "Capacité de production atteinte"];

// Le motif est obligatoire : il est envoyé au client par email
function CancelOrderModal({ order, open, loading, onConfirm, onClose }: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const error = touched && reason.trim().length < 3 ? "Indiquez le motif de l'annulation (il sera envoyé au client)." : null;

  function close() {
    if (loading) return;
    setReason("");
    setTouched(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Pourquoi souhaitez-vous annuler cette commande ?"
      subtitle={order && `${order.orderNumber} · ${order.customer.firstName} ${order.customer.lastName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={close} className="h-10 rounded-xl border border-[#EADBCB] px-4 text-[13px] font-medium text-ink hover:bg-cream">
            Retour
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setTouched(true);
              if (reason.trim().length >= 3) onConfirm(reason.trim());
            }}
            className="h-10 rounded-xl bg-red-600 px-4 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Annulation…" : "Annuler la commande"}
          </button>
        </div>
      }
    >
      <label htmlFor="cancel-reason" className="mb-1.5 block text-[13px] font-medium text-ink">
        Motif de l'annulation
      </label>
      <textarea
        id="cancel-reason"
        rows={4}
        maxLength={500}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="Motif de l'annulation..."
        aria-invalid={Boolean(error)}
        className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-[15px] text-ink outline-none focus:ring-4 ${
          error ? "border-red-300 focus:ring-red-100" : "border-[#EADBCB] focus:border-ink focus:ring-rose/25"
        }`}
      />
      {error && <p className="mt-1.5 text-[13px] text-red-700">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setReason(s)} className="rounded-full border border-[#EADBCB] px-3 py-1 text-xs text-ink-light hover:border-ink/30 hover:text-ink">
            {s}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-light">
        Le client recevra un email avec ce motif. {order?.paymentStatus === "PAID" && "Ce client a déjà payé par PayPal : pensez à le rembourser depuis votre compte PayPal."}
      </p>
    </Modal>
  );
}

export default CancelOrderModal;
