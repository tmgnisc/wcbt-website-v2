import { create } from 'zustand';
import * as api from '@/api/admissions';
import type { Admission, AdmissionDraft, AdmissionStage } from '@/types/admission';
import { createId } from '@/lib/utils';

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
    const admission: Admission = { ...draft, id: createId('adm') };
    set((state) => ({ items: [admission, ...state.items] }));
    await api.createAdmission(admission);
    return admission;
  },

  update: async (id, draft) => {
    let updated: Admission | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...draft };
        return updated;
      }),
    }));
    if (updated) await api.updateAdmission(updated);
  },

  setStatus: async (id, status) => {
    await get().update(id, { status });
  },

  setStatusMany: async (ids, status) => {
    set((state) => ({
      items: state.items.map((item) => (ids.includes(item.id) ? { ...item, status } : item)),
    }));
  },

  convertToStudent: async (id) => {
    await get().update(id, { convertedToStudent: true });
  },

  remove: async (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    await api.deleteAdmission(id);
  },

  removeMany: async (ids) => {
    set((state) => ({ items: state.items.filter((item) => !ids.includes(item.id)) }));
    await Promise.all(ids.map((id) => api.deleteAdmission(id)));
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
