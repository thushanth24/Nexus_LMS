
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import allSessions from '../../data/schedule.js';
import allSubmissions from '../../data/submissions.js';
import { Session } from '../../types';
import { COLORS } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';
import Button from '../../components/ui/Button';
import ChartPlaceholder from '../../components/ui/ChartPlaceholder';

const StudentDashboardScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) return null;

    const upcomingSessions = (allSessions as Session[])
        .filter(s => s.attendees.includes(user.id) && new Date(s.startsAt) > new Date())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .slice(0, 1);
    
    const homework = {
        pending: allSubmissions.filter(s => s.studentId === user.id && s.status === 'PENDING').length,
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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

            <Card title="Next Session">
                {upcomingSessions.length > 0 ? (
                    <View style={styles.nextSessionCard}>
                        <View>
                            <Text style={styles.sessionTitle}>{upcomingSessions[0].title}</Text>
                            <Text style={styles.sessionTime}>{formatDate(upcomingSessions[0].startsAt)}</Text>
                        </View>
                        <Button title="Join Now" onPress={() => {}} />
                    </View>
                ) : (
                    <Text style={styles.noSessionsText}>No upcoming sessions. Great job staying on top of your work!</Text>
                )}
            </Card>

            <View style={styles.grid}>
                <View style={styles.column}>
                    <Card title="Homework">
                        <View style={styles.hwCard}>
                            <Text style={styles.hwValue}>{homework.pending}</Text>
                            <Text style={styles.hwLabel}>Pending</Text>
                        </View>
                    </Card>
                </View>
                <View style={styles.column}>
                     <Card title="Progress">
                        <ChartPlaceholder title="Trend" height={120} />
                     </Card>
                </View>
            </View>
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
    nextSessionCard: {
        backgroundColor: `${COLORS.primary}15`,
        borderRadius: 12,
        padding: 16,
    },
    sessionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    sessionTime: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginBottom: 16,
    },
    noSessionsText: {
        textAlign: 'center',
        paddingVertical: 20,
        color: COLORS['text-secondary'],
    },
    grid: {
        flexDirection: 'row',
        marginHorizontal: -8,
        marginTop: 16,
    },
    column: {
        flex: 1,
        paddingHorizontal: 8,
    },
    hwCard: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 120
    },
    hwValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.warning,
    },
    hwLabel: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginTop: -4,
    },
});

export default StudentDashboardScreen;
