
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import homeworkData from '../../data/homework.js';
import submissionsData from '../../data/submissions.js';
import { Homework, Submission } from '../../types';

const TeacherHomeworkScreen = () => {
    const homework = homeworkData as Homework[];
    const submissions = submissionsData as Submission[];

    const getPendingReviews = (homeworkId: string) => {
        return submissions.filter(s => s.homeworkId === homeworkId && s.status === 'SUBMITTED').length;
    };

    const renderHomework = ({ item }: { item: Homework }) => {
        const pendingCount = getPendingReviews(item.id);
        return (
            <Card style={styles.hwCard}>
                <View>
                    <Text style={styles.hwTitle}>{item.title}</Text>
                    <Text style={styles.hwDueDate}>Due: {new Date(item.dueAt).toLocaleDateString()}</Text>
                </View>
                {pendingCount > 0 && (
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>{pendingCount} Pending</Text>
                    </View>
                )}
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={homework}
                renderItem={renderHomework}
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
    hwCard: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    hwTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    hwDueDate: {
        fontSize: 12,
        color: COLORS['text-secondary'],
    },
    pendingBadge: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    pendingText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default TeacherHomeworkScreen;
