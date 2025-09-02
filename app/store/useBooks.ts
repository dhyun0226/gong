import { create } from 'zustand';
import { Book } from '../data/types';
import { BookRepository } from '../data/repositories';

interface BookStore {
  books: Book[];
  selectedBookId: string | null;
  loading: boolean;
  
  loadBooks: () => Promise<void>;
  addBook: (book: Omit<Book, 'id'>) => Promise<string>;
  updateBook: (id: string, updates: Partial<Omit<Book, 'id'>>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  selectBook: (id: string | null) => void;
  getSelectedBook: () => Book | null;
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  selectedBookId: null,
  loading: false,

  loadBooks: async () => {
    set({ loading: true });
    try {
      const books = await BookRepository.getAll();
      set({ books, loading: false });
    } catch (error) {
      console.error('Failed to load books:', error);
      set({ loading: false });
    }
  },

  addBook: async (book) => {
    try {
      const id = await BookRepository.create(book);
      await get().loadBooks();
      return id;
    } catch (error) {
      console.error('Failed to add book:', error);
      throw error;
    }
  },

  updateBook: async (id, updates) => {
    try {
      await BookRepository.update(id, updates);
      await get().loadBooks();
    } catch (error) {
      console.error('Failed to update book:', error);
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      await BookRepository.delete(id);
      await get().loadBooks();
      if (get().selectedBookId === id) {
        set({ selectedBookId: null });
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      throw error;
    }
  },

  selectBook: (id) => {
    set({ selectedBookId: id });
  },

  getSelectedBook: () => {
    const { books, selectedBookId } = get();
    return books.find(b => b.id === selectedBookId) || null;
  }
}));