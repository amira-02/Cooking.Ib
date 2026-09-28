import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err) && err.response?.data?.error) return err.response.data.error;
  return fallback;
}

function VerifyEmail() {
  const { currentUser, emailVerified, sendVerificationCode, verifyEmailCode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>(location.state?.sendError ?? "");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (emailVerified) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await verifyEmailCode(code);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de vérifier le code"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await sendVerificationCode();
      setInfo("Un nouveau code a été envoyé");
    } catch (err) {
      setError(getErrorMessage(err, "Impossible d'envoyer le code"));
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "3rem auto", padding: "1rem" }}>
      <h1>Vérifiez votre email</h1>
      <p>
        Entrez le code à 6 chiffres envoyé à <strong>{currentUser.email}</strong>.
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {info && <p style={{ color: "green" }}>{info}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          placeholder="Code à 6 chiffres"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          required
        />
        <button type="submit" disabled={loading || code.length !== 6}>
          {loading ? "Vérification..." : "Vérifier"}
        </button>
      </form>
      <p>
        Pas reçu ?{" "}
        <button type="button" onClick={handleResend} disabled={resending}>
          {resending ? "Envoi..." : "Renvoyer le code"}
        </button>
      </p>
    </div>
  );
}

export default VerifyEmail;
