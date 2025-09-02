import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface RatingBadgeProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  size = 'medium' 
}) => {
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.star, { fontSize }]}>★</Text>
      <Text style={[styles.rating, { fontSize }]}>{rating.toFixed(1)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: colors.text,
    marginRight: 4,
  },
  rating: {
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});