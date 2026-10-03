import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, User, ShoppingBag, LogOut, Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { EASE_SOFT } from "./ui/motion";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/produits", label: "Nos créations" },
  { to: "/produits?categorie=trompe", label: "Trompe-l'œil" },
  { to: "/produits?categorie=gateau", label: "Gâteaux" },
  { to: "/#savoir-faire", label: "À propos" },
  { to: "/#contact", label: "Contact" },
];

const iconButton =
  "relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-beige hover:text-rose-dark";

function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const { cartCount } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  // Ferme les panneaux à chaque changement de page
  const [lastLocationKey, setLastLocationKey] = useState(location.key);
  if (location.key !== lastLocationKey) {
    setLastLocationKey(location.key);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // NavLink ignore la query string : on compare chemin + paramètres nous-mêmes
  function isActive(to: string) {
    if (to.includes("#")) return false;
    const current = location.pathname + location.search;
    return to === "/" ? current === "/" && !location.hash : current === to;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/produits?q=${encodeURIComponent(q)}` : "/produits");
    setQuery("");
  }

  function handleProfileClick() {
    if (!currentUser) navigate("/login");
    else if (role === "admin") navigate("/admin");
    else navigate("/");
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-beige/80 bg-cream/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 font-serif text-[1.35rem] tracking-wide text-ink">
          Cooking <em className="font-light text-rose-dark">Ib</em>
        </Link>

        {/* Liens desktop */}
        <ul className="hidden items-center gap-8 xl:flex">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`relative py-1 text-[13px] tracking-wide transition-colors hover:text-rose-dark after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-rose-dark after:transition-all after:duration-300 ${
                    active ? "text-rose-dark after:w-full" : "text-ink after:w-0 hover:after:w-full"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Rechercher"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((o) => !o);
              setMenuOpen(false);
            }}
            className={iconButton}
          >
            <Search size={18} strokeWidth={1.6} />
          </button>

          <button
            type="button"
            aria-label={currentUser ? "Mon compte" : "Se connecter"}
            onClick={handleProfileClick}
            className={`${iconButton} hidden xl:flex`}
          >
            <User size={18} strokeWidth={1.6} />
          </button>

          {currentUser && (
            <button
              type="button"
              aria-label="Se déconnecter"
              title="Se déconnecter"
              onClick={handleLogout}
              className={`${iconButton} hidden xl:flex`}
            >
              <LogOut size={18} strokeWidth={1.6} />
            </button>
          )}

          <Link to="/panier" aria-label={`Panier (${cartCount} article${cartCount > 1 ? "s" : ""})`} className={iconButton}>
            <ShoppingBag size={18} strokeWidth={1.6} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-dark px-1 text-[10px] font-semibold text-white"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <Link
            to="/produits"
            className="ml-2 hidden min-h-10 items-center rounded-full bg-ink px-5 text-[13px] font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-rose-dark sm:inline-flex"
          >
            Commander
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((o) => !o);
              setSearchOpen(false);
            }}
            className={`${iconButton} xl:hidden`}
          >
            {menuOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
          </button>
        </div>
      </nav>

      {/* Recherche */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_SOFT }}
            className="overflow-hidden border-t border-beige/80"
          >
            <form onSubmit={handleSearch} className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
              <Search size={18} strokeWidth={1.6} className="shrink-0 text-ink-light" />
              <input
                ref={searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une création : fraise, chocolat, mariage…"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink placeholder:text-ink-light/70 focus:outline-none"
              />
              <button type="submit" aria-label="Lancer la recherche" className={iconButton}>
                <ArrowRight size={18} strokeWidth={1.6} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_SOFT }}
            className="overflow-hidden border-t border-beige/80 xl:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 pb-6 pt-2 sm:px-6">
              <ul>
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4, ease: EASE_SOFT }}
                    className="border-b border-beige/80"
                  >
                    <Link
                      to={link.to}
                      className={`flex min-h-13 items-center justify-between font-serif text-xl ${
                        isActive(link.to) ? "text-rose-dark" : "text-ink"
                      }`}
                    >
                      {link.label}
                      <ArrowRight size={16} strokeWidth={1.4} className="text-ink-light" />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/produits"
                  className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-ink text-sm font-medium text-cream sm:hidden"
                >
                  Commander
                </Link>
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ink/20 text-sm text-ink"
                >
                  <User size={16} strokeWidth={1.6} />
                  {currentUser ? (role === "admin" ? "Administration" : "Mon compte") : "Se connecter"}
                </button>
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ink/20 text-sm text-ink"
                  >
                    <LogOut size={16} strokeWidth={1.6} /> Se déconnecter
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
