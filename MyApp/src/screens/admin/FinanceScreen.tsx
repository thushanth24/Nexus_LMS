
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Card from '../../components/ui/Card';
import { COLORS } from '../../theme/colors';
import usersData from '../../data/users.js';
import classesData from '../../data/classes.js';
import scheduleData from '../../data/schedule.js';
import { UserRole, Session } from '../../types';

interface PaymentRecord {
    id: string;
    personName: string;
    amount: number;
    status: 'Paid' | 'Pending';
}

const AdminFinanceScreen = () => {
    const payments = useMemo(() => {
        const studentPayments: PaymentRecord[] = [];
        const students = usersData.filter(u => u.role === UserRole.STUDENT);
        const studentEnrollments = new Map<string, Set<string>>();
        (scheduleData as Session[]).forEach(session => {
            session.attendees.forEach(studentId => {
                if (!studentEnrollments.has(studentId)) {
                    studentEnrollments.set(studentId, new Set());
                }
                studentEnrollments.get(studentId)!.add(session.classId);
            });
        });

        students.forEach(student => {
            const classCount = studentEnrollments.get(student.id)?.size || 0;
            if (classCount > 0) {
                studentPayments.push({
                    id: student.id,
                    personName: student.name,
                    amount: 120 * classCount,
                    status: student.id === 's_11' ? 'Paid' : 'Pending',
                });
            }
        });
        return studentPayments;
    }, []);

    const getStatusStyle = (status: 'Paid' | 'Pending') => {
        return status === 'Paid' ? styles.paid : styles.pending;
    };

    const renderPayment = ({ item }: { item: PaymentRecord }) => (
        <Card style={styles.paymentCard}>
            <View>
                <Text style={styles.personName}>{item.personName}</Text>
                <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </View>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={payments}
                renderItem={renderPayment}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={<Text style={styles.header}>Student Payments</Text>}
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
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.neutral,
        marginBottom: 16,
    },
    paymentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    personName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral,
    },
    amount: {
        fontSize: 14,
        color: COLORS['text-secondary'],
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    paid: {
        backgroundColor: COLORS.success,
    },
    pending: {
        backgroundColor: COLORS.warning,
    },
});

export default AdminFinanceScreen;
