import type { KpiValue } from "../types";

const numberFormatter = new Intl.NumberFormat("fr-FR");
const compactPrice = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

// 12450 -> "12 450 €" (sans centimes, pour les gros montants des KPI et graphiques)
export function formatPriceRounded(value: number) {
  return compactPrice.format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: digits })} %`;
}

// Évolution en % par rapport à la période précédente (null si pas de référence)
export function percentChange({ value, previous }: Pick<KpiValue, "value" | "previous">) {
  if (!previous) return null;
  return ((value - previous) / previous) * 100;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "il y a 5 min", "il y a 3 h", "hier", "il y a 4 j"
export function formatRelative(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} j`;
  return formatDate(iso);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
