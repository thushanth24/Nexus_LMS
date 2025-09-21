
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, style, title }) => {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS['base-100'],
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.neutral,
    marginBottom: 12,
  },
});

export default Card;
