import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  rightElement,
  ...inputProps
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            inputProps.multiline && styles.multilineInput,
            error && styles.errorInput,
          ]}
          placeholderTextColor={colors.textDimmed}
          {...inputProps}
        />
        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#FF5252',
  },
  error: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 4,
  },
  rightElement: {
    marginLeft: 8,
  },
});