import {
  BarChart3,
  Cake,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareHeart,
  Settings,
  ShoppingBag,
  Tag,
  TicketPercent,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  // Fonctionnalité pas encore branchée : la page existe mais présente ce qui arrive
  soon?: boolean;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Boutique",
    items: [
      { to: "/admin", label: "Dashboard", description: "Vue d'ensemble de votre activité", icon: LayoutDashboard },
      { to: "/admin/orders", label: "Commandes", description: "Suivez et traitez vos commandes", icon: ShoppingBag },
      { to: "/admin/products", label: "Produits", description: "Gérez votre catalogue de créations", icon: Cake },
      { to: "/admin/categories", label: "Catégories", description: "Organisez vos créations", icon: Tag },
      { to: "/admin/customers", label: "Clients", description: "Votre clientèle et son historique", icon: Users },
    ],
  },
  {
    label: "Marketing",
    items: [
      { to: "/admin/promotions", label: "Promotions", description: "Codes promo et offres", icon: TicketPercent, soon: true },
      { to: "/admin/reviews", label: "Avis clients", description: "Modérez les avis de vos clients", icon: MessageSquareHeart, soon: true },
      { to: "/admin/homepage", label: "Page d'accueil", description: "Les photos de votre vitrine", icon: ImageIcon },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { to: "/admin/analytics", label: "Analytics", description: "Performances détaillées de la boutique", icon: BarChart3 },
      { to: "/admin/settings", label: "Paramètres", description: "Boutique, livraison et compte", icon: Settings, soon: true },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function findNavItem(pathname: string) {
  return ALL_ITEMS.find((item) => item.to === pathname) ?? ALL_ITEMS[0];
}
