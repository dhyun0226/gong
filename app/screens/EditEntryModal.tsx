import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TopBar } from '../components/TopBar';
import { FormField } from '../components/FormField';
import { useEntryStore } from '../store/useEntries';
import { colors } from '../theme/colors';
import { parsePage } from '../data/parsePage';
import { Entry } from '../data/types';

type RootStackParamList = {
  EditEntryModal: { bookId: string; entry?: Entry };
};

type EditEntryModalNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditEntryModal'>;
type EditEntryModalRouteProp = RouteProp<RootStackParamList, 'EditEntryModal'>;

export const EditEntryModal: React.FC = () => {
  const navigation = useNavigation<EditEntryModalNavigationProp>();
  const route = useRoute<EditEntryModalRouteProp>();
  const { bookId, entry } = route.params;
  
  const { addEntry, updateEntry } = useEntryStore();
  
  const [pageInput, setPageInput] = useState('');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      if (entry.page_start === entry.page_end) {
        setPageInput(entry.page_start.toString());
      } else {
        setPageInput(`${entry.page_start}-${entry.page_end}`);
      }
      setText(entry.text);
    }
  }, [entry]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const pageRange = parsePage(pageInput);
    if (!pageRange) {
      newErrors.page = '페이지는 숫자 또는 범위(예: 19-20)로 입력해 주세요';
    }
    
    if (!text.trim()) {
      newErrors.text = '내용을 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    const pageRange = parsePage(pageInput);
    if (!pageRange) return;
    
    try {
      if (entry) {
        await updateEntry(entry.id, {
          page_start: pageRange.start,
          page_end: pageRange.end,
          text: text.trim(),
        });
      } else {
        await addEntry({
          book_id: bookId,
          page_start: pageRange.start,
          page_end: pageRange.end,
          text: text.trim(),
        });
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '저장에 실패했습니다');
    }
  };

  const isValid = parsePage(pageInput) !== null && text.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar
        title={entry ? '모음 수정' : '새 모음'}
        leftIcon="close"
        rightIcon={isValid ? "checkmark" : undefined}
        onLeftPress={() => navigation.goBack()}
        onRightPress={isValid ? handleSave : undefined}
      />
      
      <ScrollView style={styles.content}>
        <FormField
          label="페이지"
          value={pageInput}
          onChangeText={setPageInput}
          error={errors.page}
          placeholder="16 또는 19-20"
          keyboardType="numeric"
        />
        
        <FormField
          label="내용"
          value={text}
          onChangeText={setText}
          error={errors.text}
          placeholder="이 부분에서 느낀 점..."
          multiline
          numberOfLines={8}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
});