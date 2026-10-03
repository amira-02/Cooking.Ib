import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import AuthHeading from "../../components/auth/AuthHeading";
import AuthInput from "../../components/auth/AuthInput";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthMessage from "../../components/auth/AuthMessage";
import { requestPasswordReset, toApiError } from "../../services/authApi";
import { otpErrorMessage } from "../../utils/authErrors";
import { isValidEmail } from "../../utils/validation";

function ForgotPassword() {
  const navigate = useNavigate();
  const initialEmail = (useLocation().state as { email?: string } | null)?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [touched, setTouched] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailError = touched && !isValidEmail(email) ? "Veuillez saisir une adresse email valide." : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (loading || !isValidEmail(email)) return;
    setFormError("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      navigate("/reset-code", { state: { email: email.trim() } });
    } catch (error) {
      // Un code a été envoyé il y a moins de 45 s : il reste valable, on passe à la saisie
      if (toApiError(error).code === "cooldown") {
        navigate("/reset-code", { state: { email: email.trim() } });
        return;
      }
      setFormError(otpErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeading
        icon={<KeyRound size={22} strokeWidth={1.7} />}
        title="Mot de passe oublié ?"
        subtitle="Entrez votre adresse email et nous vous enverrons un code pour réinitialiser votre mot de passe."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthMessage variant="error">{formError}</AuthMessage>
        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Votre adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={emailError}
          valid={touched && isValidEmail(email)}
          disabled={loading}
          autoFocus
        />
        <PrimaryButton type="submit" loading={loading} loadingText="Envoi du code…">
          Envoyer le code
        </PrimaryButton>
      </form>

      <p className="mt-8 text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-light transition-colors hover:text-ink">
          <ArrowLeft size={15} /> Retour à la connexion
        </Link>
      </p>
    </>
  );
}

export default ForgotPassword;
