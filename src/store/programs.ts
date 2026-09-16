import { create } from 'zustand';
import * as api from '@/api/programs';
import type { Program, ProgramDraft } from '@/types/program';
import { createId } from '@/lib/utils';

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

const nowISO = () => new Date().toISOString();

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
    const program: Program = {
      ...draft,
      id: createId('prg'),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    set((state) => ({ items: [program, ...state.items] }));
    await api.createProgram(program);
    return program;
  },

  update: async (id, draft) => {
    let updated: Program | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...draft, updatedAt: nowISO() };
        return updated;
      }),
    }));
    if (updated) await api.updateProgram(updated);
  },

  remove: async (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    await api.deleteProgram(id);
  },

  toggleStatus: async (id) => {
    let updated: Program | undefined;
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        updated = {
          ...item,
          status: item.status === 'Active' ? 'Inactive' : 'Active',
          updatedAt: nowISO(),
        };
        return updated;
      }),
    }));
    if (updated) await api.updateProgram(updated);
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
