import { create } from 'zustand';
import * as api from '@/api/notifications';
import type { Notification, NotificationDraft } from '@/types/notification';
import { createId } from '@/lib/utils';

interface NotificationsState {
  items: Notification[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  create: (draft: NotificationDraft, author: string) => Promise<Notification>;
  update: (id: string, draft: NotificationDraft) => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeMany: (ids: string[]) => Promise<void>;
  archiveMany: (ids: string[]) => Promise<void>;
  togglePublish: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const nowISO = () => new Date().toISOString();

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,

  load: async (force = false) => {
    if (get().loading || (get().loaded && !force)) return;
    set({ loading: true, error: null });
    try {
      const items = await api.fetchNotifications();
      set({ items, loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  create: async (draft, author) => {
    const notification: Notification = {
      ...draft,
      id: createId('ntf'),
      read: false,
      createdBy: author,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    set((state) => ({ items: [notification, ...state.items] }));
    await api.createNotification(notification);
    return notification;
  },

  update: async (id, draft) => {
    let updated: Notification | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...draft, updatedAt: nowISO() };
        return updated;
      }),
    }));
    if (updated) await api.updateNotification(updated);
  },

  remove: async (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    await api.deleteNotification(id);
  },

  removeMany: async (ids) => {
    set((state) => ({ items: state.items.filter((item) => !ids.includes(item.id)) }));
    await Promise.all(ids.map((id) => api.deleteNotification(id)));
  },

  archiveMany: async (ids) => {
    set((state) => ({
      items: state.items.map((item) =>
        ids.includes(item.id) ? { ...item, status: 'Archived', updatedAt: nowISO() } : item,
      ),
    }));
  },

  togglePublish: async (id) => {
    let updated: Notification | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        updated = {
          ...item,
          status: item.status === 'Published' ? 'Draft' : 'Published',
          updatedAt: nowISO(),
        };
        return updated;
      }),
    }));
    if (updated) await api.updateNotification(updated);
  },

  duplicate: async (id) => {
    const source = get().items.find((item) => item.id === id);
    if (!source) return;
    const copy: Notification = {
      ...source,
      id: createId('ntf'),
      title: `${source.title} (copy)`,
      status: 'Draft',
      read: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    set((state) => ({ items: [copy, ...state.items] }));
    await api.createNotification(copy);
  },

  markRead: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })),

  markAllRead: () =>
    set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) })),
}));

export const selectUnreadCount = (state: NotificationsState): number =>
  state.items.filter((item) => !item.read && item.status === 'Published').length;

export const selectPendingCount = (state: NotificationsState): number =>
  state.items.filter((item) => item.status === 'Draft').length;
