import { prisma } from "./db";
import { DEFAULT_NOTIFICATIONS, type NotificationPreferences } from "./notification-settings";

export async function getNotificationSettings(): Promise<NotificationPreferences> {
  return await prisma.notificationSettings.findUnique({ where: { id: 1 } }) ?? DEFAULT_NOTIFICATIONS;
}
