import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TopBar } from '../components/TopBar';
import { FormField } from '../components/FormField';
import { useBookStore } from '../store/useBooks';
import { colors } from '../theme/colors';

type RootStackParamList = {
  Home: undefined;
  NewBook: undefined;
};

type NewBookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewBook'>;

export const NewBook: React.FC = () => {
  const navigation = useNavigation<NewBookScreenNavigationProp>();
  const { addBook } = useBookStore();
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    if (!author.trim()) {
      newErrors.author = '저자를 입력해주세요';
    }
    
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      newErrors.rating = '별점은 0.0~5.0까지만 입력할 수 있어요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    try {
      const bookId = await addBook({
        title: title.trim(),
        author: author.trim(),
        rating: parseFloat(rating),
        startedDate: date.toISOString(),
      });
      
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('오류', '책 추가에 실패했습니다');
    }
  };

  const isValid = title.trim() && author.trim() && 
    !isNaN(parseFloat(rating)) && 
    parseFloat(rating) >= 0 && 
    parseFloat(rating) <= 5;

  return (
    <View style={styles.container}>
      <TopBar
        title="새 책 추가"
        leftIcon="close"
        rightIcon={isValid ? "checkmark" : undefined}
        onLeftPress={() => navigation.goBack()}
        onRightPress={isValid ? handleSave : undefined}
      />
      
      <ScrollView style={styles.content}>
        <FormField
          label="제목"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          placeholder="책 제목"
        />
        
        <FormField
          label="저자"
          value={author}
          onChangeText={setAuthor}
          error={errors.author}
          placeholder="저자명"
        />
        
        <FormField
          label="별점 (0.0 ~ 5.0)"
          value={rating}
          onChangeText={setRating}
          error={errors.rating}
          placeholder="4.5"
          keyboardType="decimal-pad"
        />
        
        <View style={styles.dateContainer}>
          <Text style={styles.label}>시작일</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString('ko-KR')}
            </Text>
          </TouchableOpacity>
        </View>
        
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
  dateContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
});