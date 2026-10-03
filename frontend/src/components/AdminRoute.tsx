import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }: { children: ReactNode }) {
  const { currentUser, role } = useAuth();
  const location = useLocation();

  // Après connexion, l'admin revient sur la page qu'il voulait ouvrir
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;