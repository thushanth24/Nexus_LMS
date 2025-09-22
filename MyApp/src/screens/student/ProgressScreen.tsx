
import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import ChartPlaceholder from '../../components/ui/ChartPlaceholder';

const StudentProgressScreen = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Card title="Overall Progress Trend" style={styles.card}>
                <ChartPlaceholder title="Weekly Score" height={200} />
            </Card>
            <Card title="Skills Radar" style={styles.card}>
                <ChartPlaceholder title="Skill Distribution" height={250} />
            </Card>
            {/* FIX: Add children to Card to resolve missing prop error. */}
            <Card title="Recent Feedback" style={styles.card}>
                <View style={styles.feedbackItem}>
                    <Text style={styles.feedbackAuthor}>From Ms. Karina</Text>
                    <Text style={styles.feedbackText}>"Good improvements this week on your essay structure. Keep focusing on using varied vocabulary."</Text>
                </View>
                <View style={styles.feedbackItem}>
                    <Text style={styles.feedbackAuthor}>From Mr. Deen</Text>
                    <Text style={styles.feedbackText}>"Excellent tactical awareness in the last game. Your understanding of pawn structures is getting better."</Text>
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS['base-200'],
    },
    contentContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16
    },
    feedbackItem: {
        backgroundColor: COLORS['base-200'],
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    feedbackAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral,
    },
    feedbackText: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginTop: 4,
    }
});

export default StudentProgressScreen;