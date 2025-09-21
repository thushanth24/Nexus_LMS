
import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Assuming expo-linear-gradient is available
import { COLORS } from '../../theme/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ onPress, title, style, textStyle }) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, style, pressed && styles.pressed]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.lightBlue]}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    transform: [{ translateY: 2 }],
    shadowOpacity: 0.15,
    elevation: 4,
  },
});

export default Button;
