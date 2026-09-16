import type { Notification } from '@/types/notification';
import { request } from './client';

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalize(raw: any): Notification {
  return {
    id: raw.id ?? '',
    title: raw.title ?? '',
    message: raw.message ?? '',
    category: raw.category ?? 'General',
    priority: raw.priority ?? 'Normal',
    audience: Array.isArray(raw.audience)
      ? raw.audience
      : Array.isArray(raw.targetRoles)
        ? raw.targetRoles
        : ['All'],
    status: raw.status ?? 'Draft',
    publishDate: raw.publishDate ?? raw.createdAt ?? '',
    expiryDate: raw.expiryDate ?? null,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    recipient: raw.recipient ?? null,
    read: raw.read ?? raw.isRead ?? false,
    createdBy: raw.createdByName ?? raw.createdBy ?? '',
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function fetchNotifications(): Promise<Notification[]> {
  const raw = await request<unknown[]>('/notifications/');
  return Array.isArray(raw) ? raw.map(normalize) : [];
}

export async function createNotification(notification: Notification): Promise<Notification> {
  const raw = await request<unknown>('/notifications/', {
    method: 'POST',
    body: JSON.stringify(notification),
  });
  return normalize(raw);
}

export async function updateNotification(notification: Notification): Promise<Notification> {
  const raw = await request<unknown>(`/notifications/${notification.id}/`, {
    method: 'PATCH',
    body: JSON.stringify(notification),
  });
  return normalize(raw);
}

export function deleteNotification(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/notifications/${id}/`, {
    method: 'DELETE',
  });
}

export async function togglePublish(id: string): Promise<Notification> {
  const raw = await request<unknown>(`/notifications/${id}/publish/`, {
    method: 'POST',
  });
  return normalize(raw);
}

export async function duplicateNotification(id: string): Promise<Notification> {
  const raw = await request<unknown>(`/notifications/${id}/duplicate/`, {
    method: 'POST',
  });
  return normalize(raw);
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
