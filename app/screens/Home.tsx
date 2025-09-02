import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TopBar } from '../components/TopBar';
import { DiscList } from '../components/DiscList';
import { useBookStore } from '../store/useBooks';
import { colors } from '../theme/colors';

type RootStackParamList = {
  Home: undefined;
  NewBook: undefined;
  BookDetail: { bookId: string };
  Settings: undefined;
  MonthlySummary: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { books, loadBooks } = useBookStore();

  useEffect(() => {
    loadBooks();
  }, []);

  const handleBookPress = (book: any) => {
    navigation.navigate('BookDetail', { bookId: book.id });
  };

  return (
    <View style={styles.container}>
      <TopBar
        leftIcon="settings-outline"
        rightIcon="add"
        onLeftPress={() => navigation.navigate('Settings')}
        onRightPress={() => navigation.navigate('NewBook')}
        centerContent={
          <TouchableOpacity onPress={() => navigation.navigate('MonthlySummary')}>
            <Text style={styles.monthlyIcon}>📅</Text>
          </TouchableOpacity>
        }
      />
      
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            아직 등록된 책이 없습니다
          </Text>
          <Text style={styles.emptySubtext}>
            우측 상단 + 버튼으로 새 책을 추가하세요
          </Text>
        </View>
      ) : (
        <DiscList books={books} onItemPress={handleBookPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  monthlyIcon: {
    fontSize: 20,
  },
});