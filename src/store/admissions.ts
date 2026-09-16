import { create } from 'zustand';
import * as api from '@/api/admissions';
import type { Admission, AdmissionDraft, AdmissionStage } from '@/types/admission';

interface AdmissionsState {
  items: Admission[];
  trend: { month: string; applications: number; enrolled: number }[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  create: (draft: AdmissionDraft) => Promise<Admission>;
  update: (id: string, draft: Partial<Admission>) => Promise<void>;
  setStatus: (id: string, status: AdmissionStage) => Promise<void>;
  setStatusMany: (ids: string[], status: AdmissionStage) => Promise<void>;
  convertToStudent: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeMany: (ids: string[]) => Promise<void>;
  nextApplicationId: () => string;
}

export const useAdmissionsStore = create<AdmissionsState>()((set, get) => ({
  items: [],
  trend: [],
  loading: false,
  loaded: false,
  error: null,

  load: async (force = false) => {
    if (get().loading || (get().loaded && !force)) return;
    set({ loading: true, error: null });
    try {
      const [items, trend] = await Promise.all([api.fetchAdmissions(), api.fetchAdmissionsTrend()]);
      set({ items, trend, loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  create: async (draft) => {
    const tempId = `adm-temp-${Date.now()}`;
    const admission: Admission = { ...draft, id: tempId };
    set((state) => ({ items: [admission, ...state.items] }));
    try {
      const serverAdmission = await api.createAdmission(admission);
      set((state) => ({
        items: state.items.map((item) => (item.id === tempId ? serverAdmission : item)),
      }));
      return serverAdmission;
    } catch (error) {
      set((state) => ({ items: state.items.filter((item) => item.id !== tempId) }));
      throw error;
    }
  },

  update: async (id, draft) => {
    let previous: Admission | undefined;
    let updated: Admission | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        previous = item;
        updated = { ...item, ...draft };
        return updated;
      }),
    }));
    if (updated) {
      try {
        await api.updateAdmission(updated);
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

  setStatus: async (id, status) => {
    await get().update(id, { status });
  },

  setStatusMany: async (ids, status) => {
    const previous: Admission[] = [];
    set((state) => ({
      items: state.items.map((item) => {
        if (ids.includes(item.id)) {
          previous.push(item);
          return { ...item, status };
        }
        return item;
      }),
    }));
    try {
      await api.bulkUpdateStatus(ids, status);
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

  convertToStudent: async (id) => {
    let previous: Admission | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        previous = item;
        return { ...item, convertedToStudent: true };
      }),
    }));
    try {
      const updated = await api.convertToStudent(id);
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

  remove: async (id) => {
    let removed: Admission | undefined;
    set((state) => {
      removed = state.items.find((item) => item.id === id);
      return { items: state.items.filter((item) => item.id !== id) };
    });
    try {
      await api.deleteAdmission(id);
    } catch (error) {
      if (removed) {
        set((state) => ({ items: [...state.items, removed!] }));
      }
      throw error;
    }
  },

  removeMany: async (ids) => {
    let removed: Admission[] = [];
    set((state) => {
      removed = state.items.filter((item) => ids.includes(item.id));
      return { items: state.items.filter((item) => !ids.includes(item.id)) };
    });
    try {
      await Promise.all(ids.map((id) => api.deleteAdmission(id)));
    } catch (error) {
      set((state) => ({ items: [...state.items, ...removed] }));
      throw error;
    }
  },

  nextApplicationId: () => {
    const year = new Date().getFullYear();
    const sequence = get().items.length + 101;
    return `WCBT-${year}-0${sequence}`;
  },
}));

export const selectPendingApplications = (state: AdmissionsState): number =>
  state.items.filter((item) => item.status !== 'Enrolled' && item.status !== 'Rejected').length;

export const selectNewThisMonth = (state: AdmissionsState): number => {
  const now = new Date();
  return state.items.filter((item) => {
    const applied = new Date(item.appliedDate);
    return applied.getMonth() === now.getMonth() && applied.getFullYear() === now.getFullYear();
  }).length;
};
