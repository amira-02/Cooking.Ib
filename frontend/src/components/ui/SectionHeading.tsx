import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] ${
        light ? "text-cream/70" : "text-ink-light"
      }`}
    >
      <span className="h-px w-8 bg-gold" aria-hidden />
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  light = false,
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal className={`${centered ? "text-center flex flex-col items-center" : ""} ${className}`}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-4 font-serif font-light text-[2rem] leading-[1.1] sm:text-5xl ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 max-w-xl text-[15px] leading-relaxed ${
            light ? "text-cream/70" : "text-ink-light"
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export default SectionHeading;
