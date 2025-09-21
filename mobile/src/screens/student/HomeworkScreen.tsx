
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import allHomework from '../../data/homework.js';
import allSubmissionsData from '../../data/submissions.js';
import { Homework, Submission } from '../../types';
import { COLORS } from '../../theme/colors';

type HomeworkWithSubmission = Homework & { submission?: Submission };

const StudentHomeworkScreen = () => {
    const { user } = useAuth();

    const myHomework: HomeworkWithSubmission[] = useMemo(() => {
        const mySubmissionMap = new Map(
            (allSubmissionsData as Submission[])
                .filter(s => s.studentId === user?.id)
                .map(s => [s.homeworkId, s])
        );
        return (allHomework as Homework[]).map(hw => ({
            ...hw,
            submission: mySubmissionMap.get(hw.id)
        }));
    }, [user]);

    const getStatusBadge = (submission?: Submission) => {
        const status = submission?.status || 'PENDING';
        let color = COLORS.warning;
        if (status === 'SUBMITTED') color = COLORS.primary;
        if (status === 'GRADED') color = COLORS.success;
        return (
            <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.statusText, { color }]}>{status}</Text>
            </View>
        );
    };

    const renderHomework = ({ item }: { item: HomeworkWithSubmission }) => (
        <Card style={styles.hwCard}>
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.hwTitle}>{item.title}</Text>
                <Text style={styles.hwDueDate}>Due: {new Date(item.dueAt).toLocaleDateString()}</Text>
            </View>
            {getStatusBadge(item.submission)}
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={myHomework}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default StudentHomeworkScreen;
