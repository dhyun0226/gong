import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar } from '../components/TopBar';
import { useSettingsStore } from '../store/useSettings';
import { colors } from '../theme/colors';

interface SettingItemProps {
  label: string;
  description?: string;
  value: any;
  type: 'select' | 'switch';
  options?: { label: string; value: any }[];
  onChange: (value: any) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  value,
  type,
  options,
  onChange,
}) => {
  if (type === 'switch') {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.border, true: colors.text }}
          thumbColor={colors.background}
        />
      </View>
    );
  }

  return (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <View style={styles.optionsContainer}>
        {options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonActive,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const Settings: React.FC = () => {
  const navigation = useNavigation();
  const settings = useSettingsStore();

  const handleExport = () => {
    Alert.alert('내보내기', '내보내기 기능은 준비 중입니다');
  };

  const handleImport = () => {
    Alert.alert('가져오기', '가져오기 기능은 준비 중입니다');
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="설정"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보기 방식</Text>
          
          <SettingItem
            label="스크롤 모드"
            type="select"
            value={settings.viewMode}
            options={[
              { label: '연속', value: 'continuous' },
              { label: '페이지', value: 'page' },
            ]}
            onChange={(value) => settings.updateSetting('viewMode', value)}
          />
          <Text style={styles.helpText}>
            {settings.viewMode === 'continuous'
              ? '기록을 이어서 내려봅니다.'
              : '한 화면씩 넘깁니다. e-ink에 추천됩니다.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>텍스트</Text>
          
          <SettingItem
            label="글자 크기"
            type="select"
            value={settings.fontSize}
            options={[
              { label: '작게', value: 'small' },
              { label: '보통', value: 'medium' },
              { label: '크게', value: 'large' },
            ]}
            onChange={(value) => settings.updateSetting('fontSize', value)}
          />
          
          <SettingItem
            label="행간"
            type="select"
            value={settings.lineHeight}
            options={[
              { label: '보통', value: 'normal' },
              { label: '넓게', value: 'wide' },
            ]}
            onChange={(value) => settings.updateSetting('lineHeight', value)}
          />
          
          <SettingItem
            label="여백"
            type="select"
            value={settings.margin}
            options={[
              { label: '보통', value: 'normal' },
              { label: '넓게', value: 'wide' },
            ]}
            onChange={(value) => settings.updateSetting('margin', value)}
          />
          
          <SettingItem
            label="폰트"
            type="select"
            value={settings.font}
            options={[
              { label: '산세리프', value: 'sans' },
              { label: '모노', value: 'mono' },
            ]}
            onChange={(value) => settings.updateSetting('font', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>e-ink 모드</Text>
          
          <SettingItem
            label="e-ink 모드"
            description="잔상과 깜빡임을 줄입니다"
            type="switch"
            value={settings.einkMode}
            onChange={(value) => settings.updateSetting('einkMode', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인터랙션</Text>
          
          <SettingItem
            label="햅틱"
            type="switch"
            value={settings.haptic}
            onChange={(value) => settings.updateSetting('haptic', value)}
          />
          
          <SettingItem
            label="사운드"
            type="switch"
            value={settings.sound}
            onChange={(value) => settings.updateSetting('sound', value)}
          />
          
          <SettingItem
            label="스크롤 가속"
            type="select"
            value={settings.scrollAccel}
            options={[
              { label: '느리게', value: 'slow' },
              { label: '보통', value: 'normal' },
            ]}
            onChange={(value) => settings.updateSetting('scrollAccel', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터</Text>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleExport}>
            <Text style={styles.dataButtonText}>내보내기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleImport}>
            <Text style={styles.dataButtonText}>가져오기</Text>
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
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDimmed,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textDimmed,
    marginTop: 2,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonActive: {
    backgroundColor: colors.text,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.background,
  },
  helpText: {
    fontSize: 12,
    color: colors.textDimmed,
    marginTop: -8,
    marginBottom: 8,
  },
  dataButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginBottom: 12,
  },
  dataButtonText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
});