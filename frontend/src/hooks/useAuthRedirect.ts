import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { toApiError } from "../services/authApi";

// Page demandée avant d'être envoyé vers la connexion (ex : /admin)
export function useRedirectTarget() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return from && from.startsWith("/") && !from.startsWith("//") ? from : null;
}

// Après connexion : email non vérifié -> code OTP ; admin -> dashboard ; sinon page d'origine ou accueil
export function useAuthRedirect() {
  const navigate = useNavigate();
  const { sendVerificationCode } = useAuth();
  const from = useRedirectTarget();

  return async function redirectAfterAuth(user: User, role: string) {
    if (!user.emailVerified) {
      let sendError = "";
      try {
        await sendVerificationCode();
      } catch (error) {
        // « cooldown » : un code vient d'être envoyé, il reste valable
        if (toApiError(error).code !== "cooldown") {
          sendError = "Le code n'a pas pu être envoyé. Utilisez « Renvoyer le code ».";
        }
      }
      navigate("/verify-email", { replace: true, state: { sendError, from } });
      return;
    }
    navigate(role === "admin" ? from ?? "/admin" : from && !from.startsWith("/admin") ? from : "/", { replace: true });
  };
}
