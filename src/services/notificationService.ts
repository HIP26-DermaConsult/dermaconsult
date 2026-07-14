import type { AppNotification, NotificationType } from "@/types/notification";
import { uid } from "@/utils/formatters";

const STORAGE_KEY = "derma_consult_notifications";

// Fired whenever notifications change, so open tabs re-read immediately.
// (The native `storage` event only fires in *other* tabs, not the writer's own.)
export const NOTIFICATIONS_UPDATED_EVENT = "derma-consult:notifications-updated";

function load(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppNotification[];
  } catch {
    /* ignore */
  }
  return [];
}

function save(notifications: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

export const notificationService = {
  listForUser(userId: string): AppNotification[] {
    return load()
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  unreadCountForUser(userId: string): number {
    return load().filter((n) => n.userId === userId && !n.read).length;
  },

  notify(
    userIds: string[],
    input: { type: NotificationType; title: string; description?: string; konsilId: string }
  ) {
    const recipients = [...new Set(userIds)];
    if (recipients.length === 0) return;
    const now = new Date().toISOString();
    const created: AppNotification[] = recipients.map((userId) => ({
      id: uid("notif"),
      userId,
      type: input.type,
      title: input.title,
      description: input.description,
      konsilId: input.konsilId,
      createdAt: now,
      read: false,
    }));
    save([...created, ...load()]);
  },

  markRead(id: string) {
    save(load().map((n) => (n.id === id ? { ...n, read: true } : n)));
  },

  markAllReadForUser(userId: string) {
    save(load().map((n) => (n.userId === userId ? { ...n, read: true } : n)));
  },
};
