import { TextStyle } from 'react-native';

export const fontSizes = {
  small: 14,
  medium: 16,
  large: 18,
} as const;

export const lineHeights = {
  normal: 1.6,
  wide: 1.8,
} as const;

export const margins = {
  normal: 16,
  wide: 24,
} as const;

export const typography = {
  title: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  mono: {
    fontFamily: 'monospace',
  },
} as const;