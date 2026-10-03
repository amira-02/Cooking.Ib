import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, LockKeyhole } from "lucide-react";
import AuthHeading from "../../components/auth/AuthHeading";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordStrength from "../../components/auth/PasswordStrength";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthMessage from "../../components/auth/AuthMessage";
import { resetPassword, toApiError } from "../../services/authApi";
import { otpErrorMessage } from "../../utils/authErrors";
import { passwordError } from "../../utils/validation";

function ResetPassword() {
  const navigate = useNavigate();
  const state = (useLocation().state as { email?: string; resetToken?: string } | null) ?? {};
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [formError, setFormError] = useState("");
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Accès direct sans être passé par le code : on recommence la procédure
  if (!state.email || !state.resetToken) return <Navigate to="/forgot-password" replace />;
  const { email, resetToken } = state;

  const passwordMsg = touched.password ? passwordError(password) : null;
  const confirmMsg = touched.confirm
    ? !confirm
      ? "Veuillez confirmer votre mot de passe."
      : confirm !== password
        ? "Les mots de passe ne correspondent pas."
        : null
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (loading || passwordError(password) || !confirm || confirm !== password) return;
    setFormError("");
    setLoading(true);
    try {
      await resetPassword(email, resetToken, password);
      setDone(true);
    } catch (error) {
      setExpired(toApiError(error).code === "invalid_token");
      setFormError(otpErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <Check size={30} strokeWidth={2.5} />
        </motion.span>
        <h1 className="mt-6 font-serif text-[2rem] font-light leading-tight text-ink">Mot de passe modifié</h1>
        <p className="mt-3 text-[15px] text-ink-light" role="status">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <PrimaryButton className="mt-8" onClick={() => navigate("/login", { replace: true, state: { email } })}>
          Se connecter
        </PrimaryButton>
      </div>
    );
  }

  return (
    <>
      <AuthHeading
        icon={<LockKeyhole size={22} strokeWidth={1.7} />}
        title="Créer un nouveau mot de passe"
        subtitle="Choisissez un mot de passe que vous n'utilisez pas sur d'autres sites."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthMessage variant="error">
          {formError && (
            <>
              {formError}{" "}
              {expired && (
                <Link to="/forgot-password" state={{ email }} className="font-medium underline">
                  Recommencer
                </Link>
              )}
            </>
          )}
        </AuthMessage>

        <div>
          <PasswordInput
            label="Nouveau mot de passe"
            autoComplete="new-password"
            placeholder="Créez un mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={passwordMsg}
            disabled={loading}
            autoFocus
          />
          <PasswordStrength password={password} />
        </div>
        <PasswordInput
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          placeholder="Confirmez votre mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={confirmMsg}
          disabled={loading}
        />

        <PrimaryButton type="submit" loading={loading} loadingText="Réinitialisation…">
          Réinitialiser le mot de passe
        </PrimaryButton>
      </form>
    </>
  );
}

export default ResetPassword;
