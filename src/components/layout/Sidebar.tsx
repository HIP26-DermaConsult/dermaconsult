import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  FileText,
  Users,
  Inbox,
  Activity,
  Settings,
  LifeBuoy,
  HeartPulse,
} from "lucide-react";
import type { UserRole } from "@/types/auth";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/utils/formatters";

const hausarztNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/konsile/new", label: "Neues Konsil", icon: ClipboardPlus, accent: true },
  { to: "/konsile", label: "Konsile", icon: FileText },
  { to: "/patients", label: "Patienten", icon: Users },
];

const expertNav = [
  { to: "/expert/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expert/konsile", label: "Anfragen", icon: Inbox },
  { to: "/expert/activity", label: "Verlauf", icon: Activity },
];

const patientNav = [
  { to: "/portal", label: "Meine Behandlung", icon: HeartPulse },
];

const navByRole: Record<UserRole, typeof hausarztNav> = {
  hausarzt: hausarztNav,
  dermatologist: expertNav,
  patient: patientNav,
};

export function Sidebar({ role }: { role: UserRole }) {
  const nav = navByRole[role];
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink-200 bg-white h-screen sticky top-0">
      <div className="p-5 border-b border-ink-100">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard" || item.to === "/expert/dashboard" || item.to === "/portal"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                "accent" in item && (item as { accent?: boolean }).accent && !isActive && "text-brand-700"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-ink-100 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-600 hover:bg-ink-50">
          <Settings className="w-4 h-4" /> Einstellungen
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-600 hover:bg-ink-50">
          <LifeBuoy className="w-4 h-4" /> Hilfe
        </button>
      </div>
    </aside>
  );
}
