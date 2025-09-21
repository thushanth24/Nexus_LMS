
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../hooks/useAuth';
import usersData from '../../data/users.js';
import classesData from '../../data/classes.js';
import { User, UserRole } from '../../types';

const TeacherStudentsScreen = () => {
    const { user } = useAuth();
    
    const assignedStudents = useMemo(() => {
        if (!user) return [];
        // This is a simplified logic. A real app would have more direct links.
        const assignedStudentIds = new Set(['s_10', 's_11']);
        classesData.oneToOnes.forEach(o => {
            if (o.teacherId === user.id) assignedStudentIds.add(o.studentId);
        });
        return (usersData as User[]).filter(u => u.role === UserRole.STUDENT && assignedStudentIds.has(u.id));
    }, [user]);

    const renderStudent = ({ item }: { item: User }) => (
        <Card style={styles.studentCard}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            <View>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentEmail}>{item.email}</Text>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={assignedStudents}
                renderItem={renderStudent}
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
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    studentEmail: {
        fontSize: 12,
        color: COLORS['text-secondary'],
    },
});

export default TeacherStudentsScreen;
