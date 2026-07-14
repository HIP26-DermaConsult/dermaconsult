import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useNotifications } from "@/hooks/useNotifications";
import type { AppNotification } from "@/types/notification";
import { relativeTime } from "@/utils/formatters";
import { cn } from "@/utils/formatters";

export function NotificationBell() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function openNotification(n: AppNotification) {
    markRead(n.id);
    setOpen(false);
    const base = user?.role === "dermatologist" ? "/expert/konsile" : "/konsile";
    navigate(`${base}/${n.konsilId}`);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md hover:bg-ink-100 text-ink-600"
        aria-label={t("Benachrichtigungen", "Notifications")}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 ring-2 ring-white text-[10px] font-semibold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-ink-200 bg-white shadow-lg z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
            <span className="text-sm font-semibold text-ink-900">
              {t("Benachrichtigungen", "Notifications")}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                {t("Alle als gelesen markieren", "Mark all as read")}
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-sm text-ink-500 text-center">
              {t("Keine Benachrichtigungen", "No notifications")}
            </div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openNotification(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-ink-100 last:border-0 hover:bg-ink-50 flex gap-2.5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                        n.read ? "bg-transparent" : "bg-brand-500"
                      )}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-900 truncate">{n.title}</div>
                      {n.description && (
                        <div className="text-xs text-ink-500 truncate mt-0.5">{n.description}</div>
                      )}
                      <div className="text-xs text-ink-400 mt-1">
                        {n.konsilId} · {relativeTime(n.createdAt)}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
