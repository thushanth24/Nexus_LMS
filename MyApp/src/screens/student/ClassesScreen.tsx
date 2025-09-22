
import React, { useMemo } from 'react';
import { Text, StyleSheet, FlatList, Pressable, SafeAreaView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import allUsers from '../../data/users.js';
import allClasses from '../../data/classes.js';
import allSchedule from '../../data/schedule.js';
import { UserRole, Group, OneToOne, Session } from '../../types';
import { COLORS } from '../../theme/colors';

type EnrolledClass = (Group | OneToOne) & { teacherName: string };

const StudentClassesScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
    const { user } = useAuth();

    const enrolledClasses = useMemo(() => {
        if (!user) return [];
        const enrolledClassIds = new Set<string>();
        allClasses.oneToOnes.forEach(c => {
            if (c.studentId === user.id) enrolledClassIds.add(c.id);
        });
        (allSchedule as Session[]).forEach(s => {
            if (s.attendees.includes(user.id)) enrolledClassIds.add(s.classId);
        });
        const allClassList = [...allClasses.groups, ...allClasses.oneToOnes];
        const teacherMap = new Map(allUsers.filter(u => u.role === UserRole.TEACHER).map(t => [t.id, t.name]));

        return allClassList
            .filter(c => enrolledClassIds.has(c.id))
            .map(c => ({
                ...c,
                teacherName: teacherMap.get(c.teacherId) || 'N/A'
            }));
    }, [user]);

    const renderClass = ({ item }: { item: EnrolledClass }) => (
        <Pressable onPress={() => navigation.navigate('ClassDetail', { classId: item.id })}>
            <Card style={styles.classCard}>
                <Text style={styles.classTitle}>{item.title}</Text>
                <Text style={styles.classSubject}>{item.subject}</Text>
                <Text style={styles.classTeacher}>Teacher: {item.teacherName}</Text>
            </Card>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={enrolledClasses}
                renderItem={renderClass}
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
    classCard: {
        marginBottom: 12,
    },
    classTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    classSubject: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginTop: 4,
    },
    classTeacher: {
        fontSize: 12,
        color: COLORS['text-secondary'],
        marginTop: 8,
    },
});

export default StudentClassesScreen;
