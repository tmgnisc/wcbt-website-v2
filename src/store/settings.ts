import { create } from 'zustand';
import * as api from '@/api/settings';
import type { Settings } from '@/types/settings';

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  load: (force?: boolean) => Promise<void>;
  patch: <K extends keyof Settings>(section: K, value: Settings[K]) => void;
  save: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: null,
  loading: false,
  loaded: false,
  saving: false,

  load: async (force = false) => {
    if (get().loading || (get().loaded && !force)) return;
    set({ loading: true });
    const settings = await api.fetchSettings();
    set({ settings, loading: false, loaded: true });
  },

  patch: (section, value) =>
    set((state) => (state.settings ? { settings: { ...state.settings, [section]: value } } : state)),

  save: async () => {
    const { settings } = get();
    if (!settings) return;
    set({ saving: true });
    await api.saveSettings(settings);
    set({ saving: false });
  },
}));
