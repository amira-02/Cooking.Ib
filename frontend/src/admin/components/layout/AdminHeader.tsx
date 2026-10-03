import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, LogOut, Menu, Plus, Search, Settings, X } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { Dropdown } from "../ui/Dropdown";
import { findNavItem } from "../../navigation";
import { useAuth } from "../../../context/AuthContext";
import { initials } from "../../utils/format";

function AdminHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, profile, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const page = findNavItem(pathname);
  const name = profile?.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : "Administrateur";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/admin/orders?q=${encodeURIComponent(q)}`);
    setQuery("");
    setMobileSearch(false);
  }

  const searchInput = (autoFocus = false) => (
    <form onSubmit={handleSearch} role="search" className="relative w-full">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Rechercher une commande, un client…"
        aria-label="Rechercher une commande ou un client"
        className="h-10 w-full rounded-xl border border-[#EADBCB] bg-white pl-10 pr-3 text-[13px] text-ink placeholder:text-ink-light/70 focus:border-rose-dark focus:outline-none"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[#F1E6DA] bg-cream/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Ouvrir le menu"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink transition-colors hover:bg-white lg:hidden"
        >
          <Menu size={20} strokeWidth={1.7} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-sans text-base font-semibold text-ink sm:text-lg">{page.label}</h1>
          <p className="hidden truncate text-xs text-ink-light sm:block">{page.description}</p>
        </div>

        <div className="hidden w-72 xl:block">{searchInput()}</div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setMobileSearch((o) => !o)}
            aria-label="Rechercher"
            aria-expanded={mobileSearch}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-white xl:hidden"
          >
            {mobileSearch ? <X size={19} strokeWidth={1.7} /> : <Search size={19} strokeWidth={1.7} />}
          </button>

          <NotificationDropdown />

          <Link
            to="/admin/products?nouveau=1"
            className="hidden h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-[13px] font-medium text-cream transition-colors hover:bg-rose-dark md:inline-flex"
          >
            <Plus size={16} /> Ajouter un produit
          </Link>

          <Dropdown
            panelClassName="w-60"
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-label="Menu du profil"
                className="flex h-10 items-center gap-2 rounded-xl pl-1 pr-1 transition-colors hover:bg-white sm:pr-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/60 text-xs font-semibold text-ink">
                  {initials(name)}
                </span>
                <span className="hidden max-w-[9rem] truncate text-[13px] font-medium text-ink lg:block">{name}</span>
                <ChevronDown size={14} className="hidden text-ink-light sm:block" />
              </button>
            )}
          >
            {(close) => (
              <div>
                <div className="border-b border-[#F1E6DA] px-3 pb-3 pt-2">
                  <p className="truncate text-[13px] font-medium text-ink">{name}</p>
                  <p className="truncate text-xs text-ink-light">{currentUser?.email}</p>
                </div>
                <div className="pt-1.5">
                  <Link to="/admin/settings" onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-ink hover:bg-cream">
                    <Settings size={15} className="text-ink-light" /> Paramètres
                  </Link>
                  <a href="/" target="_blank" rel="noopener noreferrer" onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-ink hover:bg-cream">
                    <ExternalLink size={15} className="text-ink-light" /> Voir la boutique
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      close();
                      await logout();
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-rose-dark hover:bg-cream"
                  >
                    <LogOut size={15} /> Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Recherche sur mobile / tablette */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden xl:hidden"
          >
            <div className="px-4 pb-3 sm:px-6 lg:px-8">{searchInput(true)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default AdminHeader;
