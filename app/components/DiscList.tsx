import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors } from '../theme/colors';
import { Book } from '../data/types';

interface DiscListProps {
  books: Book[];
  onItemPress: (book: Book) => void;
}

const ITEM_HEIGHT = 48;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const VISIBLE_ITEMS = Math.floor((WINDOW_HEIGHT - 200) / ITEM_HEIGHT);
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

export const DiscList: React.FC<DiscListProps> = ({ books, onItemPress }) => {
  const leftScrollRef = useRef<ScrollView>(null);
  const rightScrollRef = useRef<ScrollView>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const isScrollingProgrammatically = useRef(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>, source: 'left' | 'right') => {
      if (isScrollingProgrammatically.current) {
        return;
      }

      const offsetY = event.nativeEvent.contentOffset.y;
      const newIndex = Math.round(offsetY / ITEM_HEIGHT);
      setFocusedIndex(newIndex);

      isScrollingProgrammatically.current = true;
      const targetRef = source === 'left' ? rightScrollRef : leftScrollRef;
      targetRef.current?.scrollTo({ y: offsetY, animated: false });
      
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 10);
    },
    []
  );

  const handleItemPress = (book: Book, index: number) => {
    setFocusedIndex(index);
    const scrollY = index * ITEM_HEIGHT;
    
    isScrollingProgrammatically.current = true;
    leftScrollRef.current?.scrollTo({ y: scrollY, animated: true });
    rightScrollRef.current?.scrollTo({ y: scrollY, animated: true });
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 300);

    onItemPress(book);
  };

  const renderLeftItem = (book: Book, index: number) => {
    const isFocused = index === focusedIndex;
    return (
      <TouchableOpacity
        key={book.id}
        style={styles.leftItem}
        onPress={() => handleItemPress(book, index)}
      >
        <Text
          style={[
            styles.bookTitle,
            isFocused && styles.focusedText,
            !isFocused && styles.dimmedText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {book.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRightItem = (book: Book, index: number) => {
    const isFocused = index === focusedIndex;
    return (
      <View key={book.id} style={styles.rightItem}>
        <Text
          style={[
            styles.rating,
            isFocused && styles.focusedText,
            !isFocused && styles.dimmedText,
          ]}
        >
          {book.rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={leftScrollRef}
        style={styles.leftColumn}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => handleScroll(e, 'left')}
        scrollEventThrottle={16}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      >
        {books.map(renderLeftItem)}
      </ScrollView>

      <ScrollView
        ref={rightScrollRef}
        style={styles.rightColumn}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => handleScroll(e, 'right')}
        scrollEventThrottle={16}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      >
        {books.map(renderRightItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  leftColumn: {
    flex: 0.82,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  rightColumn: {
    flex: 0.18,
  },
  scrollContent: {
    paddingVertical: WINDOW_HEIGHT / 2 - ITEM_HEIGHT / 2,
  },
  leftItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rightItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 16,
    color: colors.text,
  },
  rating: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  focusedText: {
    fontWeight: 'bold',
    color: colors.focus,
  },
  dimmedText: {
    opacity: 0.5,
  },
});