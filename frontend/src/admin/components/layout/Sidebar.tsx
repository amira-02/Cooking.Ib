import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, ExternalLink, LogOut } from "lucide-react";
import { NAV_GROUPS } from "../../navigation";
import { useNotifications } from "./NotificationsContext";
import { useAuth } from "../../../context/AuthContext";
import { initials } from "../../utils/format";

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { currentUser, profile, logout } = useAuth();
  const { unreadCount, setOpen, open } = useNotifications();
  const navigate = useNavigate();
  const name = profile?.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : "Administrateur";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 pb-6 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-serif text-lg text-cream">C</span>
        <span className="leading-tight">
          <span className="block font-serif text-lg text-ink">
            Cooking <em className="font-light text-rose-dark">Ib</em>
          </span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-ink-light">Administration</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6" aria-label="Administration">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-light/70">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, soon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/admin"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                        isActive ? "bg-ink text-cream shadow-sm" : "text-ink/75 hover:bg-cream hover:text-ink"
                      }`
                    }
                  >
                    <Icon size={17} strokeWidth={1.7} />
                    <span className="flex-1">{label}</span>
                    {soon && (
                      <span className="rounded-full bg-[#F4E9DE] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink-light group-[.bg-ink]:bg-cream/15 group-[.bg-ink]:text-cream/80">
                        Bientôt
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-[#F1E6DA] p-3">
        <button
          type="button"
          data-notifications-trigger
          onClick={() => {
            setOpen(!open);
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink/75 transition-colors hover:bg-cream hover:text-ink"
        >
          <Bell size={17} strokeWidth={1.7} />
          <span className="flex-1 text-left">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-dark px-1.5 py-0.5 text-[10px] font-semibold text-white">{unreadCount}</span>
          )}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink/75 transition-colors hover:bg-cream hover:text-ink"
        >
          <ExternalLink size={17} strokeWidth={1.7} /> Voir la boutique
        </a>

        <div className="mt-2 flex items-center gap-3 rounded-xl bg-cream px-3 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose/60 text-xs font-semibold text-ink">
            {initials(name)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-medium text-ink">{name}</span>
            <span className="block truncate text-[11px] text-ink-light">{currentUser?.email}</span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-light transition-colors hover:bg-white hover:text-rose-dark"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
