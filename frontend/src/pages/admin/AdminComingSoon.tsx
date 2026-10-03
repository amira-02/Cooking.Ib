import { useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import Card from "../../admin/components/ui/Card";
import { findNavItem } from "../../admin/navigation";

// Pages préparées : même design system, avec la liste de ce qu'elles contiendront
const ROADMAP: Record<string, string[]> = {
  "/admin/promotions": [
    "Codes promo en pourcentage ou en montant fixe",
    "Dates de début et de fin, nombre d'utilisations maximum",
    "Offres réservées à une catégorie ou à un produit",
    "Suivi du chiffre d'affaires généré par chaque code",
  ],
  "/admin/reviews": [
    "Liste des avis avec note, commentaire et produit concerné",
    "Publication ou masquage d'un avis en un clic",
    "Réponse publique de la pâtisserie",
    "Note moyenne par produit affichée sur la boutique",
  ],
  "/admin/settings": [
    "Informations de la boutique (adresse, téléphone, horaires)",
    "Zones et frais de livraison, créneaux de retrait",
    "Seuils d'alerte de stock",
    "Gestion des comptes administrateurs",
  ],
};

function AdminComingSoon() {
  const { pathname } = useLocation();
  const page = findNavItem(pathname);
  const Icon = page.icon;
  const items = ROADMAP[pathname] ?? [];

  return (
    <Card className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center py-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-ink">
          <Icon size={24} strokeWidth={1.6} />
        </span>
        <span className="mt-5 rounded-full bg-[#F4E9DE] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-light">
          Bientôt disponible
        </span>
        <h2 className="mt-4 font-serif text-2xl text-ink">{page.label}</h2>
        <p className="mt-2 max-w-md text-sm text-ink-light">
          Cette section est prête dans l'interface et sera activée dès que les données correspondantes seront branchées côté serveur.
        </p>
        {items.length > 0 && (
          <ul className="mt-8 w-full max-w-md space-y-3 text-left">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl border border-[#F1E6DA] px-4 py-3 text-[13px] text-ink">
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

export default AdminComingSoon;
