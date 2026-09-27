import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { LayoutDashboard, Tag, Cake, Package } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Catégories", icon: Tag },
  { to: "/admin/products", label: "Produits", icon: Cake },
  { to: "/admin/orders", label: "Commandes", icon: Package },
];

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="w-56 shrink-0 border-r border-beige bg-white px-4 py-8">
        <p className="font-serif text-lg text-ink px-3 mb-8">Admin</p>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-rose text-ink"
                    : "text-ink-light hover:bg-beige/60"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-10 py-10 max-w-4xl">{children}</main>
    </div>
  );
}

export default AdminLayout;