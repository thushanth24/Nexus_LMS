
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { COLORS } from '../../theme/colors';
import classesData from '../../data/classes.js';
import usersData from '../../data/users.js';
import { Group, User, UserRole } from '../../types';

const AdminGroupsScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
    const [groups] = useState<Group[]>(classesData.groups);
    const teachers = useMemo(() => new Map(
        (usersData as User[]).filter(u => u.role === UserRole.TEACHER).map(t => [t.id, t.name])
    ), []);

    const renderGroup = ({ item }: { item: Group }) => (
        <Pressable onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}>
            <Card style={styles.groupCard}>
                <Text style={styles.groupTitle}>{item.title}</Text>
                <Text style={styles.groupSubject}>{item.subject}</Text>
                <Text style={styles.groupTeacher}>Teacher: {teachers.get(item.teacherId) || 'N/A'}</Text>
                <View style={styles.groupFooter}>
                    <Text style={styles.groupSize}>{item.currentSize} / {item.cap} Students</Text>
                </View>
            </Card>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={groups}
                renderItem={renderGroup}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <Button
                        title="+ Create Group"
                        onPress={() => Alert.alert('Create Group', 'This would open a form to create a new group.')}
                        style={styles.createButton}
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
    createButton: {
        marginBottom: 16,
    },
    groupCard: {
        marginBottom: 12,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    groupSubject: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginBottom: 8,
    },
    groupTeacher: {
        fontSize: 12,
        color: COLORS['text-secondary'],
    },
    groupFooter: {
        borderTopWidth: 1,
        borderColor: COLORS['base-200'],
        marginTop: 12,
        paddingTop: 8,
        alignItems: 'flex-end',
    },
    groupSize: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral,
    }
});

export default AdminGroupsScreen;
