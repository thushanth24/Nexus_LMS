
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import allSessions from '../../data/schedule.js';
import allSubmissions from '../../data/submissions.js';
import { Session } from '../../types';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/Feather';

const TeacherDashboardScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) return null;

    const upcomingSessions = (allSessions as Session[])
        .filter(s => s.teacherId === user.id && new Date(s.startsAt) > new Date())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .slice(0, 5);

    const pendingReviews = allSubmissions.filter(s => s.status === 'SUBMITTED').length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
             <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Welcome, {user?.name}!</Text>
                </View>
                <Pressable onPress={() => navigation.navigate('Profile')}>
                    <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} />
                </Pressable>
            </View>

            <Card title="Upcoming Sessions">
                {upcomingSessions.length > 0 ? (
                    <View>
                        {upcomingSessions.map(session => (
                            <View key={session.id} style={styles.sessionItem}>
                                <View>
                                    <Text style={styles.sessionTitle}>{session.title}</Text>
                                    <Text style={styles.sessionTime}>{formatDate(session.startsAt)}</Text>
                                </View>
                                <Pressable style={styles.joinButton}>
                                    <Text style={styles.joinButtonText}>Join</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noSessionsText}>No upcoming sessions. Enjoy the break!</Text>
                )}
            </Card>

            <Card title="Quick Actions" style={{ marginTop: 16 }}>
                <View style={styles.actionCard}>
                    <Text style={styles.actionTitle}>Pending Reviews</Text>
                    <Text style={styles.actionValue}>{pendingReviews}</Text>
                    <Pressable style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Grade Now</Text>
                    </Pressable>
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
     header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS['text-secondary'],
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    sessionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS['base-200'],
        borderRadius: 8,
        marginBottom: 8,
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    sessionTime: {
        fontSize: 12,
        color: COLORS['text-secondary'],
    },
    joinButton: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    joinButtonText: {
        color: COLORS.white,
        fontWeight: '600',
    },
    noSessionsText: {
        textAlign: 'center',
        paddingVertical: 20,
        color: COLORS['text-secondary'],
    },
    actionCard: {
        backgroundColor: `${COLORS.warning}20`, // transparent warning color
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    actionTitle: {
        color: COLORS.warning,
        fontWeight: '600',
    },
    actionValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.warning,
        marginVertical: 8,
    },
    actionButton: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 6,
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
});

export default TeacherDashboardScreen;