import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TopBar } from '../components/TopBar';
import { FormField } from '../components/FormField';
import { RatingBadge } from '../components/RatingBadge';
import { useBookStore } from '../store/useBooks';
import { colors } from '../theme/colors';

type RootStackParamList = {
  Home: undefined;
  EditBook: { bookId: string };
  BookDetail: { bookId: string };
};

type EditBookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditBook'>;
type EditBookScreenRouteProp = RouteProp<RootStackParamList, 'EditBook'>;

export const EditBook: React.FC = () => {
  const navigation = useNavigation<EditBookScreenNavigationProp>();
  const route = useRoute<EditBookScreenRouteProp>();
  const { bookId } = route.params;
  
  const { books, updateBook, deleteBook } = useBookStore();
  const book = books.find(b => b.id === bookId);
  
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [rating, setRating] = useState(book?.rating || 0);
  const [review, setReview] = useState(book?.review || '');
  const [registeredDate, setRegisteredDate] = useState(book?.registeredDate || '');
  const [loading, setLoading] = useState(false);

  if (!book) {
    return (
      <View style={styles.container}>
        <TopBar
          title="책을 찾을 수 없습니다"
          leftIcon="close"
          onLeftPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const handleSave = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('입력 오류', '제목과 저자를 모두 입력해주세요.');
      return;
    }

    if (rating < 0 || rating > 5) {
      Alert.alert('입력 오류', '평점은 0.0에서 5.0 사이여야 합니다.');
      return;
    }

    if (review.length > 80) {
      Alert.alert('입력 오류', '한줄평은 80자 이내로 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await updateBook(bookId, {
        title: title.trim(),
        author: author.trim(),
        rating,
        review: review.trim() || undefined,
        registeredDate,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('수정 실패', '책 정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '책 삭제',
      '이 책과 관련된 모든 모음이 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook(bookId);
              navigation.navigate('Home');
            } catch (error) {
              Alert.alert('삭제 실패', '책 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const incrementRating = () => {
    setRating((prev) => Math.min(5, Math.round((prev + 0.5) * 10) / 10));
  };

  const decrementRating = () => {
    setRating((prev) => Math.max(0, Math.round((prev - 0.5) * 10) / 10));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length >= 6) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
    }
    
    setRegisteredDate(formatted);
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="책 정보 수정"
        leftIcon="close"
        rightIcon="check"
        onLeftPress={() => navigation.goBack()}
        onRightPress={handleSave}
        rightDisabled={loading}
      />
      
      <ScrollView style={styles.content}>
        <FormField label="제목">
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="책 제목"
            placeholderTextColor={colors.textDimmed}
            autoFocus
          />
        </FormField>

        <FormField label="저자">
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="저자명"
            placeholderTextColor={colors.textDimmed}
          />
        </FormField>

        <FormField label="평점">
          <View style={styles.ratingContainer}>
            <TouchableOpacity onPress={decrementRating} style={styles.ratingButton}>
              <Text style={styles.ratingButtonText}>−</Text>
            </TouchableOpacity>
            <RatingBadge rating={rating} size="large" />
            <TouchableOpacity onPress={incrementRating} style={styles.ratingButton}>
              <Text style={styles.ratingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </FormField>

        <FormField label={`한줄평 (${review.length}/80)`}>
          <TextInput
            style={[styles.input, styles.reviewInput]}
            value={review}
            onChangeText={(text) => text.length <= 80 && setReview(text)}
            placeholder="이 책에 대한 짧은 감상을 남겨보세요"
            placeholderTextColor={colors.textDimmed}
            multiline
            numberOfLines={2}
          />
        </FormField>

        <FormField label="등록일">
          <TextInput
            style={styles.input}
            value={formatDate(registeredDate)}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textDimmed}
            keyboardType="numeric"
            maxLength={10}
          />
        </FormField>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>책 삭제</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  reviewInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  ratingButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  ratingButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  deleteButton: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    fontWeight: '500',
  },
});