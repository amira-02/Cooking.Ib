import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthHeading from "../../components/auth/AuthHeading";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthMessage from "../../components/auth/AuthMessage";
import { AuthDivider, SocialLoginButton } from "../../components/auth/SocialLoginButton";
import { useAuth } from "../../context/AuthContext";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { authErrorMessage, isCancelledPopup } from "../../utils/authErrors";
import { isValidEmail } from "../../utils/validation";

interface LocationState {
  email?: string;
  notice?: string;
}

function SignIn() {
  const { currentUser, emailVerified, role, login, loginWithGoogle } = useAuth();
  const redirectAfterAuth = useAuthRedirect();
  const state = (useLocation().state as LocationState | null) ?? {};

  const [email, setEmail] = useState(state.email ?? "");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Pendant une connexion en cours, on laisse redirectAfterAuth choisir la destination
  const [handling, setHandling] = useState(false);

  const emailError = touched.email && !isValidEmail(email) ? "Veuillez saisir une adresse email valide." : null;
  const passwordError = touched.password && !password ? "Veuillez saisir votre mot de passe." : null;

  // Déjà connecté et vérifié : inutile d'afficher la connexion
  if (currentUser && emailVerified && !handling) {
    return <Navigate to={role === "admin" ? "/admin" : "/"} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (loading || !isValidEmail(email) || !password) return;
    setFormError("");
    setLoading(true);
    setHandling(true);
    try {
      const { user, role: userRole } = await login(email, password);
      await redirectAfterAuth(user, userRole);
    } catch (error) {
      setHandling(false);
      setFormError(authErrorMessage(error));
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (googleLoading || loading) return;
    setFormError("");
    setGoogleLoading(true);
    setHandling(true);
    try {
      const { user, role: userRole } = await loginWithGoogle();
      await redirectAfterAuth(user, userRole);
    } catch (error) {
      setHandling(false);
      if (!isCancelledPopup(error)) setFormError(authErrorMessage(error));
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <AuthHeading title="Bienvenue !" subtitle="Connectez-vous à votre compte pour continuer." />

      <div className="space-y-5">
        <AuthMessage variant="success">{state.notice}</AuthMessage>
        <AuthMessage variant="error">{formError}</AuthMessage>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <AuthInput
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={emailError}
            valid={touched.email && isValidEmail(email)}
            disabled={loading}
            autoFocus={!state.email}
          />

          <div>
            <PasswordInput
              label="Mot de passe"
              name="password"
              autoComplete="current-password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={passwordError}
              disabled={loading}
              autoFocus={Boolean(state.email)}
            />
            <div className="mt-2 flex justify-end">
              <Link
                to="/forgot-password"
                state={{ email: isValidEmail(email) ? email : undefined }}
                className="text-[13px] font-medium text-rose-dark transition-colors hover:text-ink"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <PrimaryButton type="submit" loading={loading} loadingText="Connexion…" disabled={googleLoading}>
            Se connecter
          </PrimaryButton>
        </form>

        <AuthDivider />
        <SocialLoginButton onClick={handleGoogle} loading={googleLoading} disabled={loading} />
      </div>

      <p className="mt-8 text-center text-[14px] text-ink-light">
        Vous n'avez pas encore de compte ?{" "}
        <Link to="/register" className="font-medium text-ink underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}

export default SignIn;
