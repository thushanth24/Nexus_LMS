
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import scheduleData from '../../data/schedule.js';
import usersData from '../../data/users.js';
import { Session, User } from '../../types';

const AdminScheduleScreen = () => {
    const sessions = (scheduleData as Session[]).sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
    const userMap = new Map((usersData as User[]).map(user => [user.id, user.name]));
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    const renderSession = ({ item }: { item: Session }) => (
        <Card style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{item.title}</Text>
            <Text style={styles.sessionDate}>{formatDate(item.startsAt)}</Text>
            <View style={styles.separator} />
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Teacher:</Text> {userMap.get(item.teacherId) || 'N/A'}</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Students:</Text> {item.attendees.length}</Text>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={sessions}
                renderItem={renderSession}
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
    sessionCard: {
        marginBottom: 12,
    },
    sessionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    sessionDate: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginBottom: 8,
    },
    separator: {
        height: 1,
        backgroundColor: COLORS['base-200'],
        marginVertical: 8,
    },
    detailLabel: {
        fontWeight: '600',
        color: COLORS.neutral,
    },
    detailText: {
        fontSize: 14,
        color: COLORS['text-secondary'],
    }
});

export default AdminScheduleScreen;
