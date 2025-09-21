
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import { COLORS } from '../theme/colors';
import Button from '../components/ui/Button';

const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return <View style={styles.container}><Text>Loading user profile...</Text></View>;
    }

    const ProfileDetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
        if (!value) return null;
        return (
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Card>
                <View style={styles.header}>
                    <Image
                        source={{ uri: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=2F80ED&color=fff&size=128` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.role}>{user.role.toLowerCase()}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <ProfileDetailItem label="Timezone" value={user.timezone} />
                    {user.subjects && <ProfileDetailItem label="Subjects" value={user.subjects.join(', ')} />}
                    {user.level && <ProfileDetailItem label="Level" value={user.level} />}
                </View>
            </Card>

            <View style={{ marginTop: 24 }}>
                <Button title="Logout" onPress={logout} />
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
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    role: {
        fontSize: 16,
        color: COLORS.primary,
        textTransform: 'capitalize',
        marginTop: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginTop: 8,
    },
    detailsContainer: {
        marginTop: 16,
    },
    detailItem: {
        backgroundColor: COLORS['base-200'],
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 12,
        color: COLORS['text-secondary'],
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral,
    },
});

export default ProfileScreen;
