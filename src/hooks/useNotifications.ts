import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { notificationService, NOTIFICATIONS_UPDATED_EVENT } from "@/services/notificationService";
import type { AppNotification } from "@/types/notification";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(() => {
    setNotifications(user ? notificationService.listForUser(user.id) : []);
  }, [user]);

  useEffect(() => {
    refresh();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markRead: notificationService.markRead,
    markAllRead: () => user && notificationService.markAllReadForUser(user.id),
  };
}
