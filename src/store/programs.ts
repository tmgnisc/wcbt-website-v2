import { create } from 'zustand';
import * as api from '@/api/programs';
import type { Program, ProgramDraft } from '@/types/program';

interface ProgramsState {
  items: Program[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  create: (draft: ProgramDraft) => Promise<Program>;
  update: (id: string, draft: ProgramDraft) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export const useProgramsStore = create<ProgramsState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,

  load: async (force = false) => {
    if (get().loading || (get().loaded && !force)) return;
    set({ loading: true, error: null });
    try {
      const items = await api.fetchPrograms();
      set({ items, loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  create: async (draft) => {
    const tempId = `prg-temp-${Date.now()}`;
    const program: Program = {
      ...draft,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ items: [program, ...state.items] }));
    try {
      const serverProgram = await api.createProgram(program);
      set((state) => ({
        items: state.items.map((item) => (item.id === tempId ? serverProgram : item)),
      }));
      return serverProgram;
    } catch (error) {
      set((state) => ({ items: state.items.filter((item) => item.id !== tempId) }));
      throw error;
    }
  },

  update: async (id, draft) => {
    let previous: Program | undefined;
    let updated: Program | undefined;
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
        await api.updateProgram(updated);
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
    let removed: Program | undefined;
    set((state) => {
      removed = state.items.find((item) => item.id === id);
      return { items: state.items.filter((item) => item.id !== id) };
    });
    try {
      await api.deleteProgram(id);
    } catch (error) {
      if (removed) {
        set((state) => ({ items: [...state.items, removed!] }));
      }
      throw error;
    }
  },

  toggleStatus: async (id) => {
    let previous: Program | undefined;
    let updated: Program | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        previous = item;
        updated = {
          ...item,
          status: item.status === 'Active' ? 'Inactive' : 'Active',
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }),
    }));
    if (updated) {
      try {
        await api.updateProgram(updated);
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
}));

/**
 * Codes offered to applicants; retired programs stay out of the admission selects.
 * Derived from `items` in the caller rather than as a store selector, which would hand
 * `useSyncExternalStore` a new array on every read.
 */
export const activeProgramCodes = (items: Program[]): string[] =>
  items.filter((item) => item.status === 'Active').map((item) => item.code);

export const selectTotalSeats = (state: ProgramsState): number =>
  state.items.filter((item) => item.status === 'Active').reduce((total, item) => total + item.seats, 0);
