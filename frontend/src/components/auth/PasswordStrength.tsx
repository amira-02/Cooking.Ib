import { Check } from "lucide-react";
import { passwordChecks, passwordStrength } from "../../utils/validation";

const LEVELS = {
  weak: { label: "Faible", bars: 1, color: "bg-red-400", text: "text-red-700" },
  medium: { label: "Moyen", bars: 2, color: "bg-amber-400", text: "text-amber-700" },
  strong: { label: "Fort", bars: 3, color: "bg-emerald-500", text: "text-emerald-700" },
} as const;

const CRITERIA = [
  { key: "length", label: "8 caractères minimum" },
  { key: "letters", label: "Majuscules et minuscules" },
  { key: "digit", label: "Un chiffre" },
  { key: "symbol", label: "Un symbole (!, ?, #…)" },
] as const;

// Jauge de force du mot de passe (la couleur est toujours doublée d'un libellé)
function PasswordStrength({ password }: { password: string }) {
  const strength = passwordStrength(password);
  if (strength === "empty") return null;
  const level = LEVELS[strength];
  const checks = passwordChecks(password);

  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= level.bars ? level.color : "bg-[#F1E6DA]"}`}
            />
          ))}
        </div>
        <span className={`w-28 text-right text-xs font-medium ${level.text}`}>Force : {level.label}</span>
      </div>
      <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 min-[400px]:grid-cols-2">
        {CRITERIA.map(({ key, label }) => (
          <li key={key} className={`flex items-center gap-1.5 text-xs ${checks[key] ? "text-emerald-700" : "text-ink-light"}`}>
            <Check size={12} strokeWidth={3} className={checks[key] ? "opacity-100" : "opacity-25"} aria-hidden />
            {label}
            <span className="sr-only">{checks[key] ? "(respecté)" : "(manquant)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrength;
