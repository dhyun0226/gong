import * as SQLite from 'expo-sqlite';

const DB_NAME = 'gong.db';

export const db = SQLite.openDatabase(DB_NAME);

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            rating REAL NOT NULL CHECK (rating >= 0.0 AND rating <= 5.0),
            startedDate TEXT NOT NULL,
            review TEXT
          );`
        );

        // Migration: Add review column if it doesn't exist
        tx.executeSql(
          `PRAGMA table_info(books);`,
          [],
          (_, { rows }) => {
            const columns = rows._array.map(col => col.name);
            if (!columns.includes('review')) {
              tx.executeSql(`ALTER TABLE books ADD COLUMN review TEXT;`);
            }
          }
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            book_id TEXT NOT NULL,
            page_start INTEGER NOT NULL,
            page_end INTEGER NOT NULL,
            text TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
          );`
        );

        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_entries_book 
           ON entries(book_id, page_start, page_end, created_at);`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );`
        );

        const defaultSettings = {
          viewMode: 'page',
          fontSize: 'medium',
          lineHeight: 'normal',
          margin: 'normal',
          font: 'sans',
          einkMode: 'false',
          haptic: 'false',
          sound: 'false',
          scrollAccel: 'normal'
        };

        Object.entries(defaultSettings).forEach(([key, value]) => {
          tx.executeSql(
            `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?);`,
            [key, value]
          );
        });

        // 초기 더미 데이터 (선택사항)
        tx.executeSql(
          `INSERT OR IGNORE INTO books (id, title, author, rating, startedDate, review) 
           VALUES 
           ('demo-1', '데미안', '헤르만 헤세', 4.5, '2024-01-01', '성장과 자아 찾기의 여정을 그린 명작'),
           ('demo-2', '어린 왕자', '생텍쥐페리', 4.8, '2024-01-15', '어른들이 잊고 사는 소중한 것들에 대한 이야기'),
           ('demo-3', '1984', '조지 오웰', 4.3, '2024-02-01', '감시 사회의 무서움을 생생하게 보여주는 소설');`
        );

        tx.executeSql(
          `INSERT OR IGNORE INTO entries (id, book_id, page_start, page_end, text, created_at)
           VALUES 
           ('entry-1', 'demo-1', 16, 16, '새는 알에서 나오려고 투쟁한다. 알은 세계이다.', 1704067200000),
           ('entry-2', 'demo-1', 19, 20, '그대가 누군가를 사랑한다면 그에게 아무런 흔적도 남기지 말아야 한다.', 1704067300000),
           ('entry-3', 'demo-1', 16, 16, '두 번째 메모: 같은 페이지에 대한 추가 생각', 1704067400000),
           ('entry-4', 'demo-2', 1, 1, '어른들은 정말 이상해', 1705267200000),
           ('entry-5', 'demo-2', 27, 27, '가장 중요한 것은 눈에 보이지 않아', 1705267300000);`
        );
      },
      reject,
      () => resolve()
    );
  });
};