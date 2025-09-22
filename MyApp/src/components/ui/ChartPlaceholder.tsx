
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface ChartPlaceholderProps {
    title: string;
    height?: number;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, height = 200 }) => {
    return (
        <View style={[styles.container, { height }]}>
            <Feather name="bar-chart-2" size={32} color={COLORS['base-300']} />
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.subtext}>Chart will be displayed here</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS['base-200'],
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    text: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS['text-secondary'],
    },
    subtext: {
        fontSize: 12,
        color: COLORS['text-secondary'],
    }
});

export default ChartPlaceholder;

