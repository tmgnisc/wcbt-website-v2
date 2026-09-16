import { create } from 'zustand';
import * as api from '@/api/notifications';
import type { Notification, NotificationDraft } from '@/types/notification';

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
    const tempId = `ntf-temp-${Date.now()}`;
    const notification: Notification = {
      ...draft,
      id: tempId,
      read: false,
      createdBy: author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ items: [notification, ...state.items] }));
    try {
      const serverNotification = await api.createNotification(draft as Notification);
      set((state) => ({
        items: state.items.map((item) => (item.id === tempId ? serverNotification : item)),
      }));
      return serverNotification;
    } catch (error) {
      set((state) => ({ items: state.items.filter((item) => item.id !== tempId) }));
      throw error;
    }
  },

  update: async (id, draft) => {
    let previous: Notification | undefined;
    let updated: Notification | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        previous = item;
        updated = { ...item, ...draft, updatedAt: new Date().toISOString() };
        return updated;
      }),
    }));
    if (updated) {
      try {
        await api.updateNotification(updated);
      } catch (error) {
        if (previous) {
          set((state) => ({
            items: state.items.map((item) => (item.id === id ? previous! : item)),
          }));
        }
        throw error;
      }
    }
  },

  remove: async (id) => {
    let removed: Notification | undefined;
    set((state) => {
      removed = state.items.find((item) => item.id === id);
      return { items: state.items.filter((item) => item.id !== id) };
    });
    try {
      await api.deleteNotification(id);
    } catch (error) {
      if (removed) {
        set((state) => ({ items: [...state.items, removed!] }));
      }
      throw error;
    }
  },

  removeMany: async (ids) => {
    let removed: Notification[] = [];
    set((state) => {
      removed = state.items.filter((item) => ids.includes(item.id));
      return { items: state.items.filter((item) => !ids.includes(item.id)) };
    });
    try {
      await api.bulkDelete(ids);
    } catch (error) {
      set((state) => ({ items: [...state.items, ...removed] }));
      throw error;
    }
  },

  archiveMany: async (ids) => {
    let previous: Notification[] = [];
    set((state) => {
      previous = state.items.filter((item) => ids.includes(item.id));
      return {
        items: state.items.map((item) =>
          ids.includes(item.id)
            ? { ...item, status: 'Archived' as const, updatedAt: new Date().toISOString() }
            : item,
        ),
      };
    });
    try {
      await api.bulkArchive(ids);
    } catch (error) {
      set((state) => ({
        items: state.items.map((item) => {
          const prev = previous.find((p) => p.id === item.id);
          return prev ?? item;
        }),
      }));
      throw error;
    }
  },

  togglePublish: async (id) => {
    let previous: Notification | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        previous = item;
        return {
          ...item,
          status: item.status === 'Published' ? ('Draft' as const) : ('Published' as const),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    try {
      const updated = await api.togglePublish(id);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
      }));
    } catch (error) {
      if (previous) {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? previous! : item)),
        }));
      }
      throw error;
    }
  },

  duplicate: async (id) => {
    const duplicated = await api.duplicateNotification(id);
    set((state) => ({ items: [duplicated, ...state.items] }));
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
