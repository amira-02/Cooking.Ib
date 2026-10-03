import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, KeyRound, MailCheck } from "lucide-react";
import AuthHeading from "../../components/auth/AuthHeading";
import OTPInput from "../../components/auth/OTPInput";
import type { OTPInputHandle } from "../../components/auth/OTPInput";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthMessage from "../../components/auth/AuthMessage";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { requestPasswordReset, toApiError, verifyResetCode } from "../../services/authApi";
import { otpErrorMessage } from "../../utils/authErrors";
import { maskEmail } from "../../utils/validation";

const RESEND_SECONDS = 45;
const CODE_LENGTH = 6;

interface LocationState {
  email?: string;
  sendError?: string;
  from?: string | null;
}

// mode "email" : vérification de l'adresse après inscription (utilisateur connecté)
// mode "reset" : code reçu pour réinitialiser un mot de passe oublié
function VerifyOTP({ mode }: { mode: "email" | "reset" }) {
  const { currentUser, emailVerified, sendVerificationCode, verifyEmailCode } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const state = (useLocation().state as LocationState | null) ?? {};
  const otpRef = useRef<OTPInputHandle>(null);

  const [code, setCode] = useState("");
  const [error, setError] = useState(state.sendError ?? "");
  const [shakeKey, setShakeKey] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  // Si l'envoi initial a échoué, on autorise le renvoi immédiatement
  const [countdown, setCountdown] = useState(state.sendError ? 0 : RESEND_SECONDS);

  const email = mode === "email" ? currentUser?.email ?? "" : state.email ?? "";

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Pages inaccessibles sans contexte (accès direct à l'URL)
  if (mode === "email" && !currentUser) return <Navigate to="/login" replace />;
  if (mode === "email" && emailVerified && !success) return <Navigate to="/" replace />;
  if (mode === "reset" && !state.email) return <Navigate to="/forgot-password" replace />;

  async function verify(value: string) {
    if (verifying || success || value.length !== CODE_LENGTH) return;
    setError("");
    setVerifying(true);
    try {
      if (mode === "email") {
        await verifyEmailCode(value);
        setSuccess(true);
        setTimeout(() => navigate(state.from && !state.from.startsWith("/admin") ? state.from : "/", { replace: true }), 1500);
      } else {
        const resetToken = await verifyResetCode(email, value);
        setSuccess(true);
        setTimeout(() => navigate("/reset-password", { replace: true, state: { email, resetToken } }), 1100);
      }
    } catch (err) {
      setError(otpErrorMessage(err));
      setShakeKey((k) => k + 1);
      setCode("");
      setTimeout(() => otpRef.current?.focus(), 50);
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    if (resending || countdown > 0) return;
    setError("");
    setResending(true);
    try {
      if (mode === "email") await sendVerificationCode();
      else await requestPasswordReset(email);
      toast("Un nouveau code a été envoyé.");
      setCode("");
      setCountdown(RESEND_SECONDS);
      otpRef.current?.focus();
    } catch (err) {
      const apiError = toApiError(err);
      setError(otpErrorMessage(apiError));
      if (apiError.code === "cooldown") setCountdown(RESEND_SECONDS);
    } finally {
      setResending(false);
    }
  }

  const timer = `00:${String(countdown).padStart(2, "0")}`;

  return (
    <>
      <AuthHeading
        icon={mode === "email" ? <MailCheck size={22} strokeWidth={1.7} /> : <KeyRound size={22} strokeWidth={1.7} />}
        title={mode === "email" ? "Vérifiez votre adresse email" : "Saisissez votre code"}
        subtitle={
          <>
            {mode === "email"
              ? "Nous avons envoyé un code de vérification à votre adresse email"
              : "Si un compte existe pour cette adresse, nous y avons envoyé un code de réinitialisation"}{" "}
            <span className="font-medium text-ink">{maskEmail(email)}</span>.
          </>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="space-y-6"
      >
        <OTPInput
          ref={otpRef}
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError("");
          }}
          onComplete={verify}
          disabled={verifying || success}
          error={Boolean(error)}
          shakeKey={shakeKey}
          success={success}
        />

        <AuthMessage variant="error">{error}</AuthMessage>

        <AnimatePresence mode="wait" initial={false}>
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 rounded-xl bg-emerald-50 py-3.5 text-[15px] font-medium text-emerald-800"
              role="status"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.1 }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white"
              >
                <Check size={16} strokeWidth={3} />
              </motion.span>
              {mode === "email" ? "Email vérifié avec succès" : "Code validé"}
            </motion.div>
          ) : (
            <motion.div key="button" exit={{ opacity: 0 }}>
              <PrimaryButton type="submit" loading={verifying} loadingText="Vérification…" disabled={code.length !== CODE_LENGTH}>
                Vérifier le code
              </PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {!success && (
        <div className="mt-8 text-center text-[14px] text-ink-light">
          <p>Vous n'avez pas reçu le code ?</p>
          {countdown > 0 ? (
            <p className="mt-1" aria-live="polite">
              Renvoyer le code dans <span className="font-medium tabular-nums text-ink">{timer}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="mt-1 font-medium text-rose-dark underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-60"
            >
              {resending ? "Envoi…" : "Renvoyer le code"}
            </button>
          )}
          <p className="mt-6 text-xs">
            Pensez à vérifier vos courriers indésirables.{" "}
            {mode === "reset" && (
              <Link to="/forgot-password" state={{ email }} className="font-medium text-ink hover:underline">
                Changer d'adresse
              </Link>
            )}
          </p>
        </div>
      )}
    </>
  );
}

export default VerifyOTP;
