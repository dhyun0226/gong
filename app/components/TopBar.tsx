import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface TopBarProps {
  title?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  centerContent?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  centerContent,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={onLeftPress}
          disabled={!onLeftPress}
        >
          {leftIcon && (
            <Ionicons name={leftIcon} size={24} color={colors.text} />
          )}
        </TouchableOpacity>

        <View style={styles.center}>
          {centerContent || (title && <Text style={styles.title}>{title}</Text>)}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={onRightPress}
          disabled={!onRightPress}
        >
          {rightIcon && (
            <Ionicons name={rightIcon} size={24} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});