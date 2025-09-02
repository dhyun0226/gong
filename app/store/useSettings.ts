import { create } from 'zustand';
import { Settings } from '../data/types';
import { SettingsRepository } from '../data/repositories';

interface SettingsStore extends Settings {
  loaded: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  viewMode: 'page',
  fontSize: 'medium',
  lineHeight: 'normal',
  margin: 'normal',
  font: 'sans',
  einkMode: false,
  haptic: false,
  sound: false,
  scrollAccel: 'normal',
  loaded: false,

  loadSettings: async () => {
    try {
      const settings = await SettingsRepository.getAll();
      set({ ...settings, loaded: true });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ loaded: true });
    }
  },

  updateSetting: async (key, value) => {
    try {
      await SettingsRepository.update(key, value);
      set({ [key]: value } as any);
    } catch (error) {
      console.error('Failed to update setting:', error);
      throw error;
    }
  }
}));