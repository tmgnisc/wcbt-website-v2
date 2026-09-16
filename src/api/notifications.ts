import type { Notification } from '@/types/notification';
import { request } from './client';

export function fetchNotifications(): Promise<Notification[]> {
  return request<Notification[]>('/notifications/');
}

export function createNotification(notification: Notification): Promise<Notification> {
  return request<Notification>('/notifications/', {
    method: 'POST',
    body: JSON.stringify(notification),
  });
}

export function updateNotification(notification: Notification): Promise<Notification> {
  return request<Notification>(`/notifications/${notification.id}/`, {
    method: 'PATCH',
    body: JSON.stringify(notification),
  });
}

export function deleteNotification(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/notifications/${id}/`, {
    method: 'DELETE',
  });
}

export function togglePublish(id: string): Promise<Notification> {
  return request<Notification>(`/notifications/${id}/publish/`, {
    method: 'POST',
  });
}

export function duplicateNotification(id: string): Promise<Notification> {
  return request<Notification>(`/notifications/${id}/duplicate/`, {
    method: 'POST',
  });
}

export function markRead(id: string): Promise<void> {
  return request<void>(`/notifications/${id}/read/`, {
    method: 'POST',
  });
}

export function markAllRead(): Promise<void> {
  return request<void>('/notifications/read-all/', {
    method: 'POST',
  });
}

export function bulkArchive(ids: string[]): Promise<void> {
  return request<void>('/notifications/bulk-archive/', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export function bulkDelete(ids: string[]): Promise<void> {
  return request<void>('/notifications/bulk-delete/', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}
