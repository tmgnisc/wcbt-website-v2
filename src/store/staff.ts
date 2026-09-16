import { create } from 'zustand';
import * as api from '@/api/staff';
import type { StaffDraft, StaffMember, StaffStatus } from '@/types/staff';
import { createId } from '@/lib/utils';

interface StaffState {
  items: StaffMember[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  create: (draft: StaffDraft, actor: string) => Promise<StaffMember>;
  update: (id: string, draft: Partial<StaffMember>, actor: string, action?: string) => Promise<void>;
  setStatus: (id: string, status: StaffStatus, actor: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  nextStaffId: () => string;
  byId: (id?: string) => StaffMember | undefined;
}

export const useStaffStore = create<StaffState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,

  load: async (force = false) => {
    if (get().loading || (get().loaded && !force)) return;
    set({ loading: true, error: null });
    try {
      const items = await api.fetchStaff();
      set({ items, loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  create: async (draft, actor) => {
    const member: StaffMember = {
      ...draft,
      id: createId('stf'),
      activity: [
        {
          id: createId('act'),
          action: 'Profile created',
          actor,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    set((state) => ({ items: [member, ...state.items] }));
    await api.createStaff(member);
    return member;
  },

  update: async (id, draft, actor, action = 'Profile updated') => {
    let updated: StaffMember | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        updated = {
          ...item,
          ...draft,
          activity: [
            { id: createId('act'), action, actor, timestamp: new Date().toISOString() },
            ...item.activity,
          ],
        };
        return updated;
      }),
    }));
    if (updated) await api.updateStaff(updated);
  },

  setStatus: async (id, status, actor) => {
    await get().update(id, { status }, actor, `Status changed to ${status}`);
  },

  remove: async (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    await api.deleteStaff(id);
  },

  nextStaffId: () => {
    const highest = get().items.reduce((max, item) => {
      const numeric = Number(item.staffId.split('-').at(-1));
      return Number.isFinite(numeric) && numeric > max ? numeric : max;
    }, 0);
    return `WCBT-S-${String(highest + 1).padStart(4, '0')}`;
  },

  byId: (id) => (id ? get().items.find((item) => item.id === id) : undefined),
}));

export const selectActiveStaffCount = (state: StaffState): number =>
  state.items.filter((item) => item.status === 'Active').length;
