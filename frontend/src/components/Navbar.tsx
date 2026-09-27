import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-beige bg-cream">
      <Link to="/" className="font-serif text-xl text-ink">
        Cooking.Ib
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {role === "admin" && (
          <Link to="/admin" className="text-ink-light hover:text-ink transition-colors">
            Dashboard admin
          </Link>
        )}

        {currentUser ? (
          <>
            <span className="text-ink-light">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-rose px-4 py-1.5 text-ink hover:bg-rose hover:text-white transition-colors"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-ink-light hover:text-ink transition-colors">
              Connexion
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-rose px-4 py-1.5 text-white hover:bg-rose-dark transition-colors"
            >
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;