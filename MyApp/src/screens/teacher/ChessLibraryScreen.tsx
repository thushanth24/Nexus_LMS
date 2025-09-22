
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import presetsData from '../../data/chess-presets.js';
import { ChessPreset } from '../../types';

const TeacherChessLibraryScreen = () => {

    const renderPreset = ({ item }: { item: ChessPreset }) => (
        <Card style={styles.presetCard}>
            <Text style={styles.presetLabel}>{item.label}</Text>
            <Text style={styles.presetCode} selectable>{item.fen || item.pgn}</Text>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={presetsData}
                renderItem={renderPreset}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS['base-200'],
    },
    listContent: {
        padding: 16,
    },
    presetCard: {
        marginBottom: 12,
    },
    presetLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral,
        marginBottom: 8,
    },
    presetCode: {
        fontSize: 12,
        color: COLORS['text-secondary'],
        fontFamily: 'monospace', // Use a monospaced font if available
    },
});

export default TeacherChessLibraryScreen;
