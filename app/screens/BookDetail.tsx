import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TopBar } from '../components/TopBar';
import { RatingBadge } from '../components/RatingBadge';
import { useBookStore } from '../store/useBooks';
import { useEntryStore } from '../store/useEntries';
import { useSettingsStore } from '../store/useSettings';
import { colors } from '../theme/colors';
import { fontSizes, lineHeights, margins } from '../theme/typography';
import { Entry } from '../data/types';

type RootStackParamList = {
  BookDetail: { bookId: string };
  EditBook: { bookId: string };
  EditEntryModal: { bookId: string; entry?: Entry };
};

type BookDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookDetail'>;
type BookDetailScreenRouteProp = RouteProp<RootStackParamList, 'BookDetail'>;

export const BookDetail: React.FC = () => {
  const navigation = useNavigation<BookDetailScreenNavigationProp>();
  const route = useRoute<BookDetailScreenRouteProp>();
  const { bookId } = route.params;
  
  const { books } = useBookStore();
  const { entries, loadEntries, loading } = useEntryStore();
  const { fontSize, lineHeight, margin, font, viewMode } = useSettingsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const book = books.find(b => b.id === bookId);

  useEffect(() => {
    loadEntries(bookId);
  }, [bookId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEntries(bookId);
    setRefreshing(false);
  };

  const handleEntryPress = (entry: Entry) => {
    navigation.navigate('EditEntryModal', { bookId, entry });
  };

  const handleAddEntry = () => {
    navigation.navigate('EditEntryModal', { bookId });
  };

  const formatPageRange = (entry: Entry) => {
    if (entry.page_start === entry.page_end) {
      return `p.${entry.page_start}`;
    }
    return `p.${entry.page_start}-${entry.page_end}`;
  };

  const textStyle = {
    fontSize: fontSizes[fontSize],
    lineHeight: fontSizes[fontSize] * lineHeights[lineHeight],
    fontFamily: font === 'mono' ? 'monospace' : undefined,
  };

  const containerStyle = {
    padding: margins[margin],
  };

  if (!book) {
    return (
      <View style={styles.container}>
        <TopBar
          title="책을 찾을 수 없습니다"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const handleEditBook = () => {
    navigation.navigate('EditBook', { bookId });
  };

  const renderCenterContent = () => (
    <View style={styles.headerInfo}>
      <View style={styles.titleRow}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <TouchableOpacity onPress={handleEditBook} style={styles.editButton}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.author}>{book.author}</Text>
        <RatingBadge rating={book.rating} size="small" />
        <Text style={styles.date}>
          {new Date(book.registeredDate).toLocaleDateString('ko-KR')}
        </Text>
      </View>
      {book.review && (
        <Text style={styles.review} numberOfLines={2}>
          {book.review}
        </Text>
      )}
    </View>
  );

  const renderEntry = (entry: Entry) => (
    <TouchableOpacity
      key={entry.id}
      style={styles.entryCard}
      onPress={() => handleEntryPress(entry)}
    >
      <Text style={styles.pageNumber}>{formatPageRange(entry)}</Text>
      <View style={styles.divider} />
      <Text style={[styles.entryText, textStyle]}>{entry.text}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (viewMode === 'page' && entries.length > 0) {
      const totalPages = Math.ceil(entries.length / 1);
      const currentEntry = entries[currentPage];
      
      return (
        <View style={[styles.pageContent, containerStyle]}>
          {currentEntry && renderEntry(currentEntry)}
          <View style={styles.pageControls}>
            <TouchableOpacity
              onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <Text style={[styles.pageButton, currentPage === 0 && styles.disabledButton]}>
                ◀
              </Text>
            </TouchableOpacity>
            <Text style={styles.pageIndicator}>
              {currentPage + 1} / {totalPages}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <Text style={[styles.pageButton, currentPage === totalPages - 1 && styles.disabledButton]}>
                ▶
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={containerStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text}
          />
        }
      >
        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 모음이 없습니다</Text>
            <Text style={styles.emptySubtext}>
              우측 상단 + 버튼으로 모음을 추가하세요
            </Text>
          </View>
        ) : (
          entries.map(renderEntry)
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar
        leftIcon="arrow-back"
        rightIcon="add"
        onLeftPress={() => navigation.goBack()}
        onRightPress={handleAddEntry}
        centerContent={renderCenterContent()}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerInfo: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    padding: 4,
  },
  editIcon: {
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  review: {
    fontSize: 13,
    color: colors.textDimmed,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  author: {
    fontSize: 12,
    color: colors.textDimmed,
  },
  date: {
    fontSize: 12,
    color: colors.textDimmed,
  },
  scrollView: {
    flex: 1,
  },
  pageContent: {
    flex: 1,
  },
  entryCard: {
    marginBottom: 16,
  },
  pageNumber: {
    fontSize: 14,
    color: colors.textDimmed,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  entryText: {
    color: colors.text,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textDimmed,
    textAlign: 'center',
  },
  pageControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  pageButton: {
    fontSize: 24,
    color: colors.text,
    padding: 10,
  },
  disabledButton: {
    opacity: 0.3,
  },
  pageIndicator: {
    fontSize: 14,
    color: colors.textDimmed,
  },
});