import type { ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

// Conteneur de base de toutes les sections du dashboard
function Card({ title, description, action, children, className = "", bodyClassName = "" }: CardProps) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl border border-[#F1E6DA] bg-white shadow-[0_1px_2px_rgba(74,48,40,0.04)] ${className}`}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="font-sans text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-ink-light">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={`min-w-0 flex-1 p-5 sm:p-6 ${title || action ? "pt-4 sm:pt-4" : ""} ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}

export default Card;
