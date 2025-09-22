
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import Button from '../../components/ui/Button';
import allClasses from '../../data/classes.js';
import allHomeworkData from '../../data/homework.js';
import allSubmissionsData from '../../data/submissions.js';
import { Homework, Submission } from '../../types';

type ClassDetailScreenRouteProp = RouteProp<{ params: { classId: string } }, 'params'>;

interface Props {
  route: ClassDetailScreenRouteProp;
}

const TeacherClassDetailScreen: React.FC<Props> = ({ route }) => {
    const { classId } = route.params;

    const classInfo = useMemo(() => {
        return [...allClasses.groups, ...allClasses.oneToOnes].find(c => c.id === classId);
    }, [classId]);
    
    const homework = useMemo(() => (allHomeworkData as Homework[]).filter(hw => hw.classId === classId), [classId]);
    const submissions = useMemo(() => (allSubmissionsData as Submission[]), []);

    const getSubmissionStatusForHw = (homeworkId: string) => {
        const total = submissions.filter(s => s.homeworkId === homeworkId).length;
        const graded = submissions.filter(s => s.homeworkId === homeworkId && s.status === 'GRADED').length;
        return `${graded} / ${total} Graded`;
    };

    if (!classInfo) {
        return <View style={styles.container}><Text>Class not found.</Text></View>;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Card title="Homework">
                <Button 
                    title="+ Assign Homework" 
                    onPress={() => Alert.alert("Assign Homework", "This would open a form to create new homework.")}
                    style={{marginBottom: 16}}
                />
                {homework.map(hw => (
                    <View key={hw.id} style={styles.hwItem}>
                        <Text style={styles.hwTitle}>{hw.title}</Text>
                        <Text style={styles.hwDueDate}>Due: {new Date(hw.dueAt).toLocaleDateString()}</Text>
                        <Text style={styles.hwStatus}>{getSubmissionStatusForHw(hw.id)}</Text>
                    </View>
                ))}
                {homework.length === 0 && <Text style={styles.emptyText}>No homework assigned.</Text>}
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
    hwItem: {
        backgroundColor: COLORS['base-100'],
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS['base-200']
    },
    hwTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    hwDueDate: {
        fontSize: 12,
        color: COLORS['text-secondary'],
        marginVertical: 4
    },
    hwStatus: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS['text-secondary'],
        paddingVertical: 20
    }
});

export default TeacherClassDetailScreen;
