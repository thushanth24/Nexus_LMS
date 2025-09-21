
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../theme/colors';
import Card from './Card';

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  return (
    <Card style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color={COLORS.white} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 50,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: COLORS['text-secondary'],
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.neutral,
  },
});

export default StatCard;
