
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView, Alert } from 'react-native';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { COLORS } from '../../theme/colors';
import usersData from '../../data/users.js';
import { User, UserRole } from '../../types';

const AdminStudentsScreen = () => {
    const [students] = useState<User[]>(
        (usersData as User[]).filter(u => u.role === UserRole.STUDENT)
    );

    const renderStudent = ({ item }: { item: User }) => (
        <Card style={styles.studentCard}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentEmail}>{item.email}</Text>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{item.level}</Text>
                </View>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={students}
                renderItem={renderStudent}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <Button
                        title="+ Add Student"
                        onPress={() => Alert.alert('Add Student', 'This would open a form to add a new student.')}
                        style={styles.addButton}
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
    addButton: {
        marginBottom: 16,
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
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral,
    },
    studentEmail: {
        fontSize: 12,
        color: COLORS['text-secondary'],
        marginBottom: 4
    },
    levelBadge: {
        backgroundColor: `${COLORS.primary}20`,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'flex-start'
    },
    levelText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600'
    }
});

export default AdminStudentsScreen;
