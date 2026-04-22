import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Package, ClipboardList, CreditCard, ShieldCheck, LogOut, Stethoscope, UserCog } from "lucide-react";
import { useAuth, Role } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Item { to: string; label: string; icon: any; roles: Role[]; }

const items: Item[] = [
  { to: "/",            label: "Tableau de bord", icon: LayoutDashboard, roles: ["admin","employe","caissier","livreur"] },
  { to: "/clients",     label: "Clients",         icon: Users,           roles: ["admin","employe"] },
  { to: "/equipments",  label: "Équipements",     icon: Package,         roles: ["admin","employe","caissier","livreur"] },
  { to: "/orders",      label: "Commandes",       icon: ClipboardList,   roles: ["admin","employe","livreur"] },
  { to: "/payments",    label: "Paiements",       icon: CreditCard,      roles: ["admin","caissier"] },
  { to: "/deposits",    label: "Cautions",        icon: ShieldCheck,     roles: ["admin","caissier","employe"] },
  { to: "/users",       label: "Utilisateurs",    icon: UserCog,         roles: ["admin"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visible = items.filter(i => user && i.roles.includes(user.role));

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">Oxymedic</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">Back-office</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to} end={to === "/"}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs opacity-60 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
