import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Mail, Phone, User } from "lucide-react";
import AuthHeading from "../../components/auth/AuthHeading";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordStrength from "../../components/auth/PasswordStrength";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthMessage from "../../components/auth/AuthMessage";
import { AuthDivider, SocialLoginButton } from "../../components/auth/SocialLoginButton";
import { useAuth } from "../../context/AuthContext";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { authErrorMessage, isCancelledPopup } from "../../utils/authErrors";
import { isValidEmail, isValidPhone, passwordError } from "../../utils/validation";

type Field = "firstName" | "lastName" | "email" | "phone" | "password" | "confirm" | "terms";

function SignUp() {
  const { currentUser, emailVerified, register, loginWithGoogle } = useAuth();
  const redirectAfterAuth = useAuthRedirect();

  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [handling, setHandling] = useState(false);

  // Règles de validation de chaque champ (null = valide)
  const rules: Record<Field, string | null> = {
    firstName: values.firstName.trim() ? null : "Veuillez saisir votre prénom.",
    lastName: values.lastName.trim() ? null : "Veuillez saisir votre nom.",
    email: isValidEmail(values.email) ? null : "Veuillez saisir une adresse email valide.",
    phone: isValidPhone(values.phone) ? null : "Veuillez saisir un numéro valide (ex : 06 12 34 56 78).",
    password: passwordError(values.password),
    confirm: !values.confirm
      ? "Veuillez confirmer votre mot de passe."
      : values.confirm !== values.password
        ? "Les mots de passe ne correspondent pas."
        : null,
    terms: terms ? null : "Vous devez accepter les conditions pour créer un compte.",
  };
  const errorOf = (field: Field) => (touched[field] ? rules[field] : null);
  const isValid = (field: Field) => Boolean(touched[field]) && !rules[field];

  if (currentUser && emailVerified && !handling) return <Navigate to="/" replace />;

  function field(name: Exclude<Field, "terms">) {
    return {
      name,
      value: values[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [name]: e.target.value })),
      onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
      error: errorOf(name),
      disabled: loading,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const all = Object.keys(rules) as Field[];
    setTouched(Object.fromEntries(all.map((f) => [f, true])));
    if (loading || all.some((f) => rules[f])) return;

    setFormError("");
    setLoading(true);
    setHandling(true);
    try {
      const user = await register(values.email, values.password, values.firstName.trim(), values.lastName.trim(), values.phone.trim());
      // Le compte est créé : le code OTP est envoyé puis on passe à la vérification
      await redirectAfterAuth(user, "client");
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
      const { user, role } = await loginWithGoogle();
      await redirectAfterAuth(user, role);
    } catch (error) {
      setHandling(false);
      if (!isCancelledPopup(error)) setFormError(authErrorMessage(error));
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <AuthHeading title="Créer votre compte" subtitle="Rejoignez-nous et découvrez nos créations gourmandes." />

      <div className="space-y-5">
        <AuthMessage variant="error">{formError}</AuthMessage>

        <SocialLoginButton onClick={handleGoogle} loading={googleLoading} disabled={loading} />
        <AuthDivider label="ou avec votre email" />

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthInput label="Prénom" icon={User} autoComplete="given-name" placeholder="Votre prénom" valid={isValid("firstName")} {...field("firstName")} />
            <AuthInput label="Nom" autoComplete="family-name" placeholder="Votre nom" valid={isValid("lastName")} {...field("lastName")} />
          </div>
          <AuthInput label="Email" icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="Votre adresse email" valid={isValid("email")} {...field("email")} />
          <AuthInput label="Téléphone" icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="Votre numéro de téléphone" valid={isValid("phone")} {...field("phone")} />

          <div>
            <PasswordInput label="Mot de passe" autoComplete="new-password" placeholder="Créez un mot de passe" {...field("password")} />
            <PasswordStrength password={values.password} />
          </div>
          <PasswordInput label="Confirmation du mot de passe" autoComplete="new-password" placeholder="Confirmez votre mot de passe" {...field("confirm")} />

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink-light">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  setTouched((t) => ({ ...t, terms: true }));
                }}
                disabled={loading}
                aria-invalid={Boolean(errorOf("terms"))}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded accent-[#4A3028]"
              />
              <span>
                J'accepte les <span className="font-medium text-ink">conditions générales d'utilisation</span> et la{" "}
                <span className="font-medium text-ink">politique de confidentialité</span>.
              </span>
            </label>
            {errorOf("terms") && <p className="mt-1.5 pl-[30px] text-[13px] text-red-700" role="alert">{errorOf("terms")}</p>}
          </div>

          <PrimaryButton type="submit" loading={loading} loadingText="Création du compte…" disabled={googleLoading}>
            Créer mon compte
          </PrimaryButton>
        </form>
      </div>

      <p className="mt-8 text-center text-[14px] text-ink-light">
        Vous avez déjà un compte ?{" "}
        <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}

export default SignUp;
