import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, CalendarCheck, CreditCard, PackageCheck, ShoppingBag, UserPlus } from "lucide-react";
import { useNotifications } from "./NotificationsContext";
import { Skeleton } from "../ui/States";
import { formatRelative } from "../../utils/format";
import type { NotificationType } from "../../types";

const TYPE_META: Record<NotificationType, { icon: typeof Bell; className: string }> = {
  order: { icon: ShoppingBag, className: "bg-[#F4E9DE] text-ink" },
  stock: { icon: AlertTriangle, className: "bg-amber-50 text-amber-700" },
  customer: { icon: UserPlus, className: "bg-sky-50 text-sky-700" },
  payment: { icon: CreditCard, className: "bg-emerald-50 text-emerald-700" },
  ready: { icon: PackageCheck, className: "bg-teal-50 text-teal-700" },
  slot: { icon: CalendarCheck, className: "bg-violet-50 text-violet-700" },
};

function NotificationDropdown() {
  const { notifications, unreadCount, loading, open, setOpen, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      // Le raccourci de la barre latérale ouvre aussi ce panneau : on ignore son clic
      const target = e.target as HTMLElement;
      if (ref.current?.contains(target) || target.closest("[data-notifications-trigger]")) return;
      setOpen(false);
    }
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} non lues)` : ""}`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-white"
      >
        <Bell size={19} strokeWidth={1.7} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-dark px-1 text-[10px] font-semibold text-white ring-2 ring-cream">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-[4.25rem] z-40 overflow-hidden rounded-2xl border border-[#F1E6DA] bg-white shadow-[0_16px_40px_-12px_rgba(74,48,40,0.3)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-[#F1E6DA] px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs font-medium text-rose-dark hover:text-ink">
                  Tout marquer comme lu
                </button>
              )}
            </div>
            <ul className="max-h-[min(26rem,70vh)] overflow-y-auto py-1">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex gap-3 px-4 py-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </li>
                  ))
                : notifications.length === 0 ? (
                    <li className="px-4 py-10 text-center text-[13px] text-ink-light">Aucune notification pour le moment.</li>
                  ) : (
                    notifications.map((n) => {
                      const meta = TYPE_META[n.type];
                      const Icon = meta.icon;
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              markRead(n.id);
                              setOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-cream/70 ${n.read ? "" : "bg-cream/40"}`}
                          >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
                              <Icon size={16} strokeWidth={1.8} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="truncate text-[13px] font-medium text-ink">{n.title}</span>
                                {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-dark" aria-label="Non lue" />}
                              </span>
                              <span className="block truncate text-xs text-ink-light">{n.message}</span>
                              <span className="mt-0.5 block text-[11px] text-ink-light/80">{n.createdAt ? formatRelative(n.createdAt) : "Alerte en cours"}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
