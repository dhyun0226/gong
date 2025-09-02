import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar } from '../components/TopBar';
import { colors } from '../theme/colors';
import { db } from '../data/db';
import { Book } from '../data/types';

interface BookWithMoeumCount extends Book {
  moeum_count: number;
}

interface MonthlySummaryData {
  bookCount: number;
  moeumCount: number;
  avgRating: number;
  books: BookWithMoeumCount[];
}

export const MonthlySummary: React.FC = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [data, setData] = useState<MonthlySummaryData>({
    bookCount: 0,
    moeumCount: 0,
    avgRating: 0,
    books: [],
  });

  useEffect(() => {
    loadMonthlyData();
  }, [selectedDate]);

  const loadMonthlyData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    // 해당 월에 시작한 책과 전체 모음 개수 조회
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT b.id, b.title, b.rating, b.review, 
                COALESCE(COUNT(e.id), 0) AS moeum_count
         FROM books b
         LEFT JOIN entries e ON e.book_id = b.id
         WHERE date(b.startedDate) >= date(?) AND date(b.startedDate) <= date(?)
         GROUP BY b.id, b.title, b.rating, b.review
         ORDER BY b.title COLLATE NOCASE ASC;`,
        [startDate, endDate],
        (_, { rows }) => {
          const books = rows._array;
          
          // 요약 통계
          const bookCount = books.length;
          const moeumCount = books.reduce((sum, book) => sum + book.moeum_count, 0);
          const avgRating = bookCount > 0 
            ? books.reduce((sum, book) => sum + book.rating, 0) / bookCount 
            : 0;

          setData({
            bookCount,
            moeumCount,
            avgRating: Math.round(avgRating * 10) / 10,
            books,
          });
        }
      );
    });
  };

  const handleShare = async () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}.${month}`;
    
    let shareText = `# 공(空) · 월간 독서 기록 · ${monthStr}\n`;
    shareText += `- 총 ${data.bookCount}권 · 모음 ${data.moeumCount}개 · 평균 ★${data.avgRating}\n\n`;
    
    data.books.forEach((book) => {
      shareText += `${book.title} · ★${book.rating.toFixed(1)}  |  ${book.moeum_count}\n`;
      if (book.review) {
        shareText += `${book.review}\n`;
      }
      shareText += `\n`;
    });

    try {
      await Share.share({
        message: shareText,
        title: `공(空) 월간 기록 · ${monthStr}`,
      });
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const formatMonth = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    return `${year}.${month}`;
  };

  return (
    <View style={styles.container}>
      <TopBar
        leftIcon="arrow-back"
        rightIcon="share-outline"
        onLeftPress={() => navigation.goBack()}
        onRightPress={handleShare}
        centerContent={
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Text style={styles.monthArrow}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>{formatMonth()}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Text style={styles.monthArrow}>▶</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>공(空) · 월간 독서 기록 · {formatMonth()}</Text>
          <Text style={styles.summary}>
            총 {data.bookCount}권 · 모음 {data.moeumCount}개 · 평균 ★{data.avgRating}
          </Text>
          <View style={styles.divider} />
        </View>

        {data.books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>이번 달 기록이 없습니다</Text>
          </View>
        ) : (
          <View style={styles.bookList}>
            {data.books.map((book) => (
              <View key={book.id} style={styles.bookRow}>
                <View style={styles.bookInfoContainer}>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.bookRating}>★{book.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.separator}>|</Text>
                  <Text style={styles.moeumCount}>{book.moeum_count}</Text>
                </View>
                {book.review && (
                  <Text style={styles.bookReview} numberOfLines={2}>
                    {book.review}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  monthArrow: {
    fontSize: 16,
    color: colors.text,
    padding: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: colors.textDimmed,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  bookList: {
    paddingHorizontal: 20,
  },
  bookRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  bookRating: {
    fontSize: 14,
    color: colors.textDimmed,
    fontVariant: ['tabular-nums'],
  },
  separator: {
    fontSize: 16,
    color: colors.border,
    marginHorizontal: 16,
  },
  moeumCount: {
    fontSize: 16,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    width: 30,
    textAlign: 'right',
  },
  bookReview: {
    fontSize: 12,
    color: colors.textDimmed,
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textDimmed,
  },
});