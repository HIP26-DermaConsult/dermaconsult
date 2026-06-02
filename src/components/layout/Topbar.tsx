import { Bell, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/RoleBadge";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-ink-200">
      <div className="h-16 px-6 flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 max-w-md flex-1">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              placeholder="Konsile, Patienten suchen…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-ink-200 bg-ink-50 text-sm focus-ring focus:border-brand-500 focus:bg-white"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            className="relative p-2 rounded-md hover:bg-ink-100 text-ink-600"
            aria-label="Benachrichtigungen"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-ink-200">
            <Avatar name={user.name} color={user.avatarColor} />
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-ink-900 leading-tight">{user.name}</div>
              <div className="mt-0.5">
                <RoleBadge role={user.role} size="sm" />
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-md hover:bg-ink-100 text-ink-600"
              aria-label="Abmelden"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
