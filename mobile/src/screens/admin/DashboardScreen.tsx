
import React from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import ChartPlaceholder from '../../components/ui/ChartPlaceholder';
import { COLORS } from '../../theme/colors';

import usersData from '../../data/users.js';
import classesData from '../../data/classes.js';
import scheduleData from '../../data/schedule.js';
import { UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Image } from 'react-native';

const AdminDashboardScreen = ({ navigation }: StackScreenProps<any>) => {
    const { user } = useAuth();
    
    const totals = {
        teachers: usersData.filter(u => u.role === UserRole.TEACHER).length,
        students: usersData.filter(u => u.role === UserRole.STUDENT).length,
        activeGroups: classesData.groups.length,
        sessionsThisWeek: scheduleData.length,
    };
    
    const finance = { paid: 132, pending: 38, overdue: 14 };

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

            <View style={styles.statsGrid}>
                <View style={styles.statsColumn}>
                    <StatCard icon="users" title="Teachers" value={totals.teachers} color={COLORS.info} />
                    <StatCard icon="book-open" title="Groups" value={totals.activeGroups} color={COLORS.accent} />
                </View>
                <View style={styles.statsColumn}>
                    <StatCard icon="users" title="Students" value={totals.students} color={COLORS.success} />
                    <StatCard icon="clock" title="Sessions" value={totals.sessionsThisWeek} color={COLORS.primary} />
                </View>
            </View>

            <Card title="Finance Summary" style={{ marginTop: 16 }}>
                <ChartPlaceholder title="Invoice Status" />
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
    statsGrid: {
        flexDirection: 'row',
        marginHorizontal: -8,
    },
    statsColumn: {
        flex: 1,
        paddingHorizontal: 8,
        justifyContent: 'space-between',
    },
});

export default AdminDashboardScreen;