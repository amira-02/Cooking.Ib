import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "light" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:bg-rose-dark",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-cream",
  light: "bg-cream text-ink hover:bg-rose hover:text-ink",
  ghost: "text-ink hover:text-rose-dark px-0!",
};

interface ButtonLinkProps {
  to: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
}

// Lien stylé comme un bouton (CTA). `external` ouvre un site externe dans un nouvel onglet.
function ButtonLink({ to, children, variant = "primary", className = "", external }: ButtonLinkProps) {
  const classes = `group inline-flex min-h-12 items-center whitespace-nowrap justify-center gap-2 rounded-full px-7 text-sm font-medium tracking-wide transition-all duration-300 ease-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-dark ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}

export default ButtonLink;
