import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { currentUser, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard Admin</h1>
      <p>Connecté en tant que : {currentUser?.email}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <Link
          to="/admin/categories"
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          📂 Catégories
        </Link>

        <Link
          to="/admin/products"
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          🎂 Produits
        </Link>

        <Link
          to="/admin/orders"
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          📦 Commandes
        </Link>
      </div>

      <button onClick={logout} style={{ marginTop: "2rem" }}>
        Se déconnecter
      </button>
    </div>
  );
}

export default AdminDashboard;