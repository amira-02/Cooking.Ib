import type { ReactNode } from "react";

// Titre + sous-titre communs à toutes les pages d'authentification
function AuthHeading({ title, subtitle, icon }: { title: string; subtitle?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-8">
      {icon && (
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4E9DE] text-ink">{icon}</span>
      )}
      <h1 className="font-serif text-[2rem] font-light leading-tight text-ink sm:text-[2.25rem]">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink-light">{subtitle}</p>}
    </div>
  );
}

export default AuthHeading;
