
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Image, SafeAreaView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import allUsers from '../../data/users.js';
import allClasses from '../../data/classes.js';
import allSchedule from '../../data/schedule.js';
import { User, UserRole, Group, Session } from '../../types';

type GroupDetailScreenRouteProp = RouteProp<{ params: { groupId: string } }, 'params'>;

interface Props {
  route: GroupDetailScreenRouteProp;
}

const AdminGroupDetailScreen: React.FC<Props> = ({ route }) => {
    const { groupId } = route.params;

    const group = useMemo(() => (allClasses.groups as Group[]).find(g => g.id === groupId), [groupId]);
    
    const sessions = useMemo(() => (allSchedule as Session[])
        .filter(s => s.classId === groupId)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [groupId]);

    const roster = useMemo(() => {
        if (!group) return [];
        const studentIds = new Set<string>();
        sessions.forEach(session => {
            session.attendees.forEach(id => studentIds.add(id));
        });
        return (allUsers as User[]).filter(user => user.role === UserRole.STUDENT && studentIds.has(user.id));
    }, [group, sessions]);

    const teacher = useMemo(() => {
        if (!group) return null;
        return (allUsers as User[]).find(u => u.id === group.teacherId);
    }, [group]);
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    if (!group) {
        return <View style={styles.container}><Text>Group not found.</Text></View>;
    }
    
    const renderStudent = ({ item }: { item: User }) => (
        <View style={styles.studentItem}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            <View>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentEmail}>{item.email}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Card style={styles.headerCard}>
                <Text style={styles.title}>{group.title}</Text>
                <Text style={styles.subject}>{group.subject}</Text>
                <Text style={styles.teacher}>Teacher: {teacher?.name || 'N/A'}</Text>
            </Card>

            <Card title={`Roster (${roster.length}/${group.cap})`} style={styles.card}>
                <FlatList
                    data={roster}
                    renderItem={renderStudent}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={styles.emptyText}>No students enrolled.</Text>}
                />
            </Card>
            
            <Card title="Schedule" style={styles.card}>
                {sessions.map(session => (
                    <View key={session.id} style={styles.sessionItem}>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
                        <Text style={styles.sessionDate}>{formatDate(session.startsAt)}</Text>
                    </View>
                ))}
                {sessions.length === 0 && <Text style={styles.emptyText}>No sessions scheduled.</Text>}
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
    headerCard: {
        marginBottom: 16,
    },
    card: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    subject: {
        fontSize: 16,
        color: COLORS['text-secondary'],
        marginTop: 4,
    },
    teacher: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS['text-secondary'],
        paddingVertical: 20
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: COLORS['base-200']
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral
    },
    studentEmail: {
        fontSize: 12,
        color: COLORS['text-secondary']
    },
    sessionItem: {
        backgroundColor: COLORS['base-200'],
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    sessionTitle: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    sessionDate: {
        fontSize: 12,
        color: COLORS['text-secondary'],
    }
});

export default AdminGroupDetailScreen;
