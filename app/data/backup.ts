import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { db } from './db';
import { Book, Entry } from './types';

interface BackupData {
  version: string;
  timestamp: number;
  books: Book[];
  entries: Entry[];
  settings: { key: string; value: string }[];
}

export class BackupService {
  static async exportBackup(): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        let backupData: BackupData = {
          version: '1.0.0',
          timestamp: Date.now(),
          books: [],
          entries: [],
          settings: []
        };

        // 책 데이터 가져오기
        tx.executeSql(
          'SELECT * FROM books',
          [],
          (_, { rows }) => {
            backupData.books = rows._array;
          }
        );

        // 엔트리 데이터 가져오기
        tx.executeSql(
          'SELECT * FROM entries',
          [],
          (_, { rows }) => {
            backupData.entries = rows._array;
          }
        );

        // 설정 데이터 가져오기
        tx.executeSql(
          'SELECT * FROM settings',
          [],
          (_, { rows }) => {
            backupData.settings = rows._array;
          }
        );
      }, 
      reject,
      async () => {
        try {
          // 백업 데이터 저장
          const filename = `gong_backup_${new Date().toISOString().split('T')[0]}.json`;
          const fileUri = `${FileSystem.documentDirectory}${filename}`;
          
          const backupData = await new Promise<BackupData>((resolve) => {
            db.transaction((tx) => {
              let data: BackupData = {
                version: '1.0.0',
                timestamp: Date.now(),
                books: [],
                entries: [],
                settings: []
              };

              tx.executeSql(
                'SELECT * FROM books',
                [],
                (_, { rows }) => {
                  data.books = rows._array;
                }
              );

              tx.executeSql(
                'SELECT * FROM entries',
                [],
                (_, { rows }) => {
                  data.entries = rows._array;
                }
              );

              tx.executeSql(
                'SELECT * FROM settings',
                [],
                (_, { rows }) => {
                  data.settings = rows._array;
                }
              );
            }, undefined, () => {
              resolve(data);
            });
          });

          await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(backupData, null, 2)
          );

          // 파일 공유
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  static async importBackup(): Promise<boolean> {
    try {
      // 파일 선택
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets?.[0]) {
        return false;
      }

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const backupData: BackupData = JSON.parse(content);

      // 데이터 유효성 검사
      if (!backupData.version || !backupData.books || !backupData.entries) {
        throw new Error('Invalid backup file format');
      }

      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          // 기존 데이터 삭제
          tx.executeSql('DELETE FROM entries');
          tx.executeSql('DELETE FROM books');
          tx.executeSql('DELETE FROM settings');

          // 책 데이터 복원
          backupData.books.forEach((book) => {
            tx.executeSql(
              'INSERT INTO books (id, title, author, rating, startedDate, review) VALUES (?, ?, ?, ?, ?, ?)',
              [book.id, book.title, book.author, book.rating, book.registeredDate, book.review || null]
            );
          });

          // 엔트리 데이터 복원
          backupData.entries.forEach((entry) => {
            tx.executeSql(
              'INSERT INTO entries (id, book_id, page_start, page_end, text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
              [entry.id, entry.book_id, entry.page_start, entry.page_end, entry.text, entry.created_at]
            );
          });

          // 설정 데이터 복원
          if (backupData.settings) {
            backupData.settings.forEach((setting) => {
              tx.executeSql(
                'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                [setting.key, setting.value]
              );
            });
          }
        },
        () => {
          reject(new Error('Failed to restore backup'));
        },
        () => {
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Backup import failed:', error);
      return false;
    }
  }
}