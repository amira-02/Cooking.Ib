import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/produits", label: "La carte" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleProfileClick() {
    if (!currentUser) {
      navigate("/login");
    } else if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-beige">
      <div className="max-w-6xl mx-auto px-8 h-20 grid grid-cols-3 items-center">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl text-ink tracking-wide">
          Cooking Ib
        </Link>

        {/* Navigation centrale */}
        <div className="flex items-center justify-center gap-10 text-sm text-ink">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative py-1 transition-colors hover:text-rose-dark ${
                  isActive ? "text-rose-dark" : "text-ink"
                } after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:bg-rose-dark after:transition-all ${
                  isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Icônes + CTA */}
        <div className="flex items-center justify-end gap-5">
          <button
            aria-label="Rechercher"
            className="text-ink hover:text-rose-dark transition-colors"
          >
            <Search size={19} strokeWidth={1.6} />
          </button>

          <button
            aria-label="Profil"
            onClick={handleProfileClick}
            className="text-ink hover:text-rose-dark transition-colors"
          >
            <User size={19} strokeWidth={1.6} />
          </button>

          {currentUser && (
            <button
              aria-label="Se déconnecter"
              title="Se déconnecter"
              onClick={handleLogout}
              className="text-ink hover:text-rose-dark transition-colors"
            >
              <LogOut size={19} strokeWidth={1.6} />
            </button>
          )}

          <Link
            to="/panier"
            aria-label="Panier"
            className="text-ink hover:text-rose-dark transition-colors"
          >
            <ShoppingBag size={19} strokeWidth={1.6} />
          </Link>

          <Link
            to="/produits"
            className="rounded-full bg-ink text-cream text-sm px-5 py-2.5 hover:bg-rose-dark transition-colors"
          >
            Commander
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;