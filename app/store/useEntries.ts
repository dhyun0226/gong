import { create } from 'zustand';
import { Entry } from '../data/types';
import { EntryRepository } from '../data/repositories';

interface EntryStore {
  entries: Entry[];
  currentBookId: string | null;
  loading: boolean;
  editingEntry: Entry | null;
  
  loadEntries: (bookId: string) => Promise<void>;
  addEntry: (entry: Omit<Entry, 'id' | 'created_at'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setEditingEntry: (entry: Entry | null) => void;
  clearEntries: () => void;
}

export const useEntryStore = create<EntryStore>((set, get) => ({
  entries: [],
  currentBookId: null,
  loading: false,
  editingEntry: null,

  loadEntries: async (bookId) => {
    set({ loading: true, currentBookId: bookId });
    try {
      const entries = await EntryRepository.getByBookId(bookId);
      set({ entries, loading: false });
    } catch (error) {
      console.error('Failed to load entries:', error);
      set({ loading: false });
    }
  },

  addEntry: async (entry) => {
    try {
      await EntryRepository.create(entry);
      const { currentBookId } = get();
      if (currentBookId) {
        await get().loadEntries(currentBookId);
      }
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error;
    }
  },

  updateEntry: async (id, updates) => {
    try {
      await EntryRepository.update(id, updates);
      const { currentBookId } = get();
      if (currentBookId) {
        await get().loadEntries(currentBookId);
      }
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      await EntryRepository.delete(id);
      const { currentBookId } = get();
      if (currentBookId) {
        await get().loadEntries(currentBookId);
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  },

  setEditingEntry: (entry) => {
    set({ editingEntry: entry });
  },

  clearEntries: () => {
    set({ entries: [], currentBookId: null, editingEntry: null });
  }
}));