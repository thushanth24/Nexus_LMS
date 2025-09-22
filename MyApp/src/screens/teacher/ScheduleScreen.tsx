
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import scheduleData from '../../data/schedule.js';
import { useAuth } from '../../hooks/useAuth';
import { Session } from '../../types';

const TeacherScheduleScreen = () => {
    const { user } = useAuth();
    const sessions = (scheduleData as Session[])
        .filter(s => s.teacherId === user?.id)
        .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    const renderSession = ({ item }: { item: Session }) => {
        const isCompleted = new Date(item.startsAt) < new Date();
        return (
            <Card style={styles.sessionCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.sessionTitle}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isCompleted ? COLORS['text-secondary'] : COLORS.success }]}>
                        <Text style={styles.statusText}>{isCompleted ? 'Completed' : 'Upcoming'}</Text>
                    </View>
                </View>
                <Text style={styles.sessionDate}>{formatDate(item.startsAt)}</Text>
            </Card>
        );
    };

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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    sessionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        flex: 1,
        marginRight: 8
    },
    sessionDate: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default TeacherScheduleScreen;
