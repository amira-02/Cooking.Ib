export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// Numéros français : 06 12 34 56 78, 0612345678, +33 6 12 34 56 78…
export function isValidPhone(phone: string) {
  return /^(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/.test(phone.trim());
}

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export function passwordChecks(password: string) {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    letters: /[a-z]/.test(password) && /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function passwordStrength(password: string): PasswordStrength {
  if (!password) return "empty";
  const checks = passwordChecks(password);
  if (!checks.length) return "weak";
  const score = [checks.letters, checks.digit, checks.symbol, password.length >= 12].filter(Boolean).length;
  return score >= 3 ? "strong" : score >= 1 ? "medium" : "weak";
}

// Mot de passe accepté : au moins « moyen »
export function passwordError(password: string) {
  if (!password) return "Veuillez saisir un mot de passe.";
  if (password.length < MIN_PASSWORD_LENGTH) return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  if (passwordStrength(password) === "weak") return "Ajoutez des majuscules, des chiffres ou des symboles.";
  return null;
}

// am***@gmail.com
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}***@${domain}`;
}
