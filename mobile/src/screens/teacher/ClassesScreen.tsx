
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import classesData from '../../data/classes.js';
import { Group, OneToOne } from '../../types';
import { COLORS } from '../../theme/colors';

type ClassType = (Group & { type: 'Group' }) | (OneToOne & { type: 'One-to-One' });

const TeacherClassesScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
    const { user } = useAuth();

    const teacherClasses: ClassType[] = useMemo(() => {
        if (!user) return [];
        const groups: ClassType[] = classesData.groups
            .filter(g => g.teacherId === user.id)
            .map(g => ({ ...g, type: 'Group' }));
        const oneToOnes: ClassType[] = classesData.oneToOnes
            .filter(o => o.teacherId === user.id)
            .map(o => ({ ...o, type: 'One-to-One' }));
        return [...groups, ...oneToOnes].sort((a,b) => a.title.localeCompare(b.title));
    }, [user]);

    const renderClass = ({ item }: { item: ClassType }) => (
        <Pressable onPress={() => navigation.navigate('ClassDetail', { classId: item.id })}>
            <Card style={styles.classCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.classTitle}>{item.title}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: item.type === 'Group' ? COLORS.primary : COLORS.secondary }]}>
                        <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                </View>
                <Text style={styles.classSubject}>{item.subject}</Text>
            </Card>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={teacherClasses}
                renderItem={renderClass}
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
    classCard: {
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    classTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.neutral,
        flex: 1,
        marginRight: 8
    },
    classSubject: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        marginTop: 4,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default TeacherClassesScreen;
