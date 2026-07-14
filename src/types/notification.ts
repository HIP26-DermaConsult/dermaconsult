export type NotificationType = "konsil_submitted" | "rueckfrage" | "message" | "answered";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description?: string;
  konsilId: string;
  createdAt: string;
  read: boolean;
}
