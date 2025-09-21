
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import scheduleData from '../../data/schedule.js';
import { useAuth } from '../../hooks/useAuth';
import { Session } from '../../types';

const StudentScheduleScreen = () => {
    const { user } = useAuth();
    const studentSessions = (scheduleData as Session[])
        .filter(s => s.attendees.includes(user?.id || ''))
        .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    const renderSession = ({ item }: { item: Session }) => (
        <Card style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>{item.title}</Text>
            <Text style={styles.sessionDate}>{formatDate(item.startsAt)}</Text>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={studentSessions}
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
        marginTop: 4,
    },
});

export default StudentScheduleScreen;
