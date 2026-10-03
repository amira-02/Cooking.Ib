import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import { NotificationsProvider } from "./NotificationsContext";
import { ToastProvider } from "../../../components/ui/Toast";

// Structure commune de toutes les pages /admin : elle reste montée quand on change
// de page (barre latérale, notifications), seule la zone <Outlet /> change.
function AdminShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <ToastProvider>
      <NotificationsProvider>
        <div className="min-h-screen bg-cream lg:flex">
          {/* Barre latérale fixe (desktop) */}
          <aside className="hidden w-64 shrink-0 border-r border-[#F1E6DA] bg-white lg:sticky lg:top-0 lg:block lg:h-screen">
            <Sidebar />
          </aside>

          {/* Barre latérale en tiroir (mobile / tablette) */}
          <AnimatePresence>
            {menuOpen && (
              <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
                <motion.div
                  className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMenuOpen(false)}
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                  className="absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] bg-white shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Fermer le menu"
                    className="absolute right-3 top-6 flex h-9 w-9 items-center justify-center rounded-full text-ink-light hover:bg-cream hover:text-ink"
                  >
                    <X size={18} />
                  </button>
                  <Sidebar onNavigate={() => setMenuOpen(false)} />
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader onOpenMenu={() => setMenuOpen(true)} />
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
            >
              <Outlet />
            </motion.main>
          </div>
        </div>
      </NotificationsProvider>
    </ToastProvider>
  );
}

export default AdminShell;
