import { notificationsSeed } from '@/data/notifications';
import type { Notification } from '@/types/notification';
import { clone, request } from './client';

export function fetchNotifications(): Promise<Notification[]> {
  return request(clone(notificationsSeed));
}

export function createNotification(notification: Notification): Promise<Notification> {
  return request(notification);
}

export function updateNotification(notification: Notification): Promise<Notification> {
  return request(notification);
}

export function deleteNotification(id: string): Promise<{ id: string }> {
  return request({ id });
}
