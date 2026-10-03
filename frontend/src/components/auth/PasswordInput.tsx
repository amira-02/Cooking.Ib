import { forwardRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthInput from "./AuthInput";
import type { AuthInputProps } from "./AuthInput";

// Mot de passe masqué par défaut, avec bouton afficher / masquer
const PasswordInput = forwardRef<HTMLInputElement, Omit<AuthInputProps, "type" | "trailing" | "icon">>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <AuthInput
        ref={ref}
        {...props}
        icon={LockKeyhole}
        type={visible ? "text" : "password"}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
            disabled={props.disabled}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-light transition-colors hover:bg-cream hover:text-ink disabled:opacity-50"
          >
            {visible ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
          </button>
        }
      />
    );
  }
);

export default PasswordInput;
