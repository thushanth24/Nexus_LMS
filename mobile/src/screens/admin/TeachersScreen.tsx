
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { COLORS } from '../../theme/colors';
import usersData from '../../data/users.js';
import { User, UserRole } from '../../types';

const AdminTeachersScreen = () => {
    const [teachers] = useState<User[]>(
        (usersData as User[]).filter(u => u.role === UserRole.TEACHER)
    );

    const renderTeacher = ({ item }: { item: User }) => (
        <Card style={styles.teacherCard}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>{item.name}</Text>
                <Text style={styles.teacherEmail}>{item.email}</Text>
                <Text style={styles.teacherSubjects}>{item.subjects?.join(', ')}</Text>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={teachers}
                renderItem={renderTeacher}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <Button
                        title="+ Invite Teacher"
                        onPress={() => alert('Invite Teacher Modal')}
                        style={styles.inviteButton}
                    />
                }
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
    inviteButton: {
        marginBottom: 16,
    },
    teacherCard: {
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
    teacherInfo: {
        flex: 1,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    teacherEmail: {
        fontSize: 12,
        color: COLORS['text-secondary'],
    },
    teacherSubjects: {
        fontSize: 12,
        color: COLORS.primary,
        marginTop: 4,
    },
});

export default AdminTeachersScreen;