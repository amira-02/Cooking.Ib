import type { ReactNode } from "react";
import { AlertCircle, Inbox, RotateCw } from "lucide-react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#F4E9DE]/80 ${className}`} />;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-14"}`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-ink-light">
        {icon ?? <Inbox size={20} strokeWidth={1.6} />}
      </span>
      <p className="mt-4 text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-ink-light">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={20} strokeWidth={1.6} />
      </span>
      <p className="mt-4 text-sm font-medium text-ink">Impossible de charger ces données</p>
      {message && <p className="mt-1 max-w-xs text-[13px] text-ink-light">{message}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#EADBCB] px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-cream"
      >
        <RotateCw size={14} /> Réessayer
      </button>
    </div>
  );
}
