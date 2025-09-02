import { db } from './db';
import { Book, Entry, Settings } from './types';
import { v4 as uuidv4 } from 'uuid';

export class BookRepository {
  static getAll(): Promise<Book[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM books ORDER BY title COLLATE NOCASE;',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static getById(id: string): Promise<Book | null> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM books WHERE id = ?;',
          [id],
          (_, { rows }) => resolve(rows.length > 0 ? rows.item(0) : null),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static create(book: Omit<Book, 'id'>): Promise<string> {
    const id = uuidv4();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO books (id, title, author, rating, startedDate, review) VALUES (?, ?, ?, ?, ?, ?);',
          [id, book.title, book.author, book.rating, book.registeredDate, book.review || null],
          () => resolve(id),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static update(id: string, updates: Partial<Omit<Book, 'id'>>): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        const fields = [];
        const values = [];
        
        if (updates.title !== undefined) {
          fields.push('title = ?');
          values.push(updates.title);
        }
        if (updates.author !== undefined) {
          fields.push('author = ?');
          values.push(updates.author);
        }
        if (updates.rating !== undefined) {
          fields.push('rating = ?');
          values.push(updates.rating);
        }
        if (updates.registeredDate !== undefined) {
          fields.push('startedDate = ?');
          values.push(updates.registeredDate);
        }
        if (updates.review !== undefined) {
          fields.push('review = ?');
          values.push(updates.review || null);
        }
        
        if (fields.length === 0) {
          resolve();
          return;
        }
        
        values.push(id);
        const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?;`;
        
        tx.executeSql(
          sql,
          values,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM books WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export class EntryRepository {
  static getByBookId(bookId: string): Promise<Entry[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM entries 
           WHERE book_id = ? 
           ORDER BY page_start ASC, page_end ASC, created_at ASC;`,
          [bookId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static create(entry: Omit<Entry, 'id' | 'created_at'>): Promise<string> {
    const id = uuidv4();
    const created_at = Date.now();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO entries (id, book_id, page_start, page_end, text, created_at) VALUES (?, ?, ?, ?, ?, ?);',
          [id, entry.book_id, entry.page_start, entry.page_end, entry.text, created_at],
          () => resolve(id),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static update(id: string, updates: Partial<Entry>): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        const fields = [];
        const values = [];
        
        if (updates.page_start !== undefined) {
          fields.push('page_start = ?');
          values.push(updates.page_start);
        }
        if (updates.page_end !== undefined) {
          fields.push('page_end = ?');
          values.push(updates.page_end);
        }
        if (updates.text !== undefined) {
          fields.push('text = ?');
          values.push(updates.text);
        }
        
        if (fields.length === 0) {
          resolve();
          return;
        }
        
        values.push(id);
        const sql = `UPDATE entries SET ${fields.join(', ')} WHERE id = ?;`;
        
        tx.executeSql(
          sql,
          values,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM entries WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export class SettingsRepository {
  static getAll(): Promise<Settings> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM settings;',
          [],
          (_, { rows }) => {
            const settings: any = {};
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              const key = item.key;
              let value: any = item.value;
              
              if (value === 'true') value = true;
              else if (value === 'false') value = false;
              
              settings[key] = value;
            }
            resolve(settings as Settings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  static update(key: keyof Settings, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        const stringValue = typeof value === 'boolean' ? value.toString() : value;
        tx.executeSql(
          'UPDATE settings SET value = ? WHERE key = ?;',
          [stringValue, key],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}