
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import allUsers from '../../data/users.js';
import allClasses from '../../data/classes.js';
import allMaterials from '../../data/materials.js';
import allHomework from '../../data/homework.js';
import allSubmissions from '../../data/submissions.js';
import { Submission } from '../../types';
import { COLORS } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

type ClassDetailScreenRouteProp = RouteProp<{ params: { classId: string } }, 'params'>;

interface Props {
  route: ClassDetailScreenRouteProp;
}

const StudentClassDetailScreen: React.FC<Props> = ({ route }) => {
    const { classId } = route.params;
    const { user } = useAuth();

    const classInfo = useMemo(() => [...allClasses.groups, ...allClasses.oneToOnes].find(c => c.id === classId), [classId]);
    const teacher = useMemo(() => allUsers.find(u => u.id === classInfo?.teacherId), [classInfo]);
    const materials = useMemo(() => allMaterials.filter(m => m.classId === classId), [classId]);
    const homework = useMemo(() => {
        const classHomework = allHomework.filter(hw => hw.classId === classId);
        const mySubmissions = new Map((allSubmissions as Submission[]).filter(s => s.studentId === user!.id).map(s => [s.homeworkId, s]));
        return classHomework.map(hw => ({ ...hw, submission: mySubmissions.get(hw.id) }));
    }, [classId, user]);

    const getStatusBadge = (submission?: Submission) => {
        const status = submission?.status || 'PENDING';
        let color = COLORS.warning;
        if (status === 'SUBMITTED') color = COLORS.primary;
        if (status === 'GRADED') color = COLORS.success;
        return <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}><Text style={[styles.statusText, { color }]}>{status}</Text></View>;
    };

    if (!classInfo) {
        return <View style={styles.container}><Text>Class not found.</Text></View>;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Card style={styles.card}>
                <Text style={styles.title}>{classInfo.title}</Text>
                <Text style={styles.teacher}>Teacher: {teacher?.name}</Text>
            </Card>

            <Card title="Materials" style={styles.card}>
                {materials.map(m => (
                    <View key={m.id} style={styles.materialItem}>
                        <Feather name={m.type === 'pdf' ? 'file-text' : 'video'} size={20} color={COLORS.primary} />
                        <Text style={styles.materialTitle}>{m.title}</Text>
                        <Text style={styles.downloadLink} onPress={() => Linking.openURL(m.url)}>Download</Text>
                    </View>
                ))}
                {materials.length === 0 && <Text style={styles.emptyText}>No materials available.</Text>}
            </Card>

            <Card title="Homework" style={styles.card}>
                {homework.map(hw => (
                    <View key={hw.id} style={styles.hwItem}>
                        <View>
                            <Text style={styles.hwTitle}>{hw.title}</Text>
                            <Text style={styles.hwDueDate}>Due: {new Date(hw.dueAt).toLocaleDateString()}</Text>
                        </View>
                        {getStatusBadge(hw.submission)}
                    </View>
                ))}
                {homework.length === 0 && <Text style={styles.emptyText}>No homework assigned.</Text>}
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS['base-200'] },
    contentContainer: { padding: 16 },
    card: { marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.neutral },
    teacher: { fontSize: 16, color: COLORS['text-secondary'], marginTop: 4 },
    emptyText: { textAlign: 'center', color: COLORS['text-secondary'], paddingVertical: 20 },
    materialItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS['base-200'], padding: 12, borderRadius: 8, marginBottom: 8 },
    materialTitle: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.neutral },
    downloadLink: { color: COLORS.primary, fontWeight: '600' },
    hwItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS['base-200'], padding: 12, borderRadius: 8, marginBottom: 8 },
    hwTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.neutral, flex: 1, marginRight: 8 },
    hwDueDate: { fontSize: 12, color: COLORS['text-secondary'] },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
});

export default StudentClassDetailScreen;


