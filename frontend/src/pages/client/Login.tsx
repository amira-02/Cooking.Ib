import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, sendVerificationCode } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    let result;
    try {
      result = await login(email, password);
    } catch (err: any) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }
    if (result.user.emailVerified) {
      navigate("/");
      return;
    }
    // Email pas encore vérifié : on envoie un code (une erreur 429 signifie
    // qu'un code a été envoyé il y a moins d'une minute, il reste valable)
    let sendError = "";
    try {
      await sendVerificationCode();
    } catch (err) {
      if (!axios.isAxiosError(err) || err.response?.status !== 429) {
        sendError = "Le code n'a pas pu être envoyé, cliquez sur « Renvoyer le code »";
      }
    }
    navigate("/verify-email", { state: { sendError } });
  }

  return (
    <div style={{ maxWidth: "400px", margin: "3rem auto", padding: "1rem" }}>
      <h1>Connexion</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p>
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}

export default Login;