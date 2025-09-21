
import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import usersData from '../../data/users.js';
import classesData from '../../data/classes.js';
import scheduleData from '../../data/schedule.js';
import { User, UserRole, Session } from '../../types';
import { CheckCircleIcon } from '../../components/ui/Icons';

interface PaymentRecord {
    id: string;
    personId: string;
    personName: string;
    month: string;
    amount: number;
    status: 'Paid' | 'Pending';
    note: string;
}

const AdminFinance: React.FC = () => {
    const [activeTab, setActiveTab] = useState('students');

    // Generate initial payment state from data
    const initialPayments = useMemo(() => {
        const studentPayments: PaymentRecord[] = [];
        const teacherPayouts: PaymentRecord[] = [];
        const month = "September 2025";
        const students = usersData.filter(u => u.role === UserRole.STUDENT);
        const teachers = usersData.filter(u => u.role === UserRole.TEACHER);

        // Student Payments
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
                // Mock payment logic: $120 per class
                studentPayments.push({
                    id: `${student.id}-${month.replace(' ', '-')}`,
                    personId: student.id,
                    personName: student.name,
                    month: month,
                    amount: 120 * classCount,
                    status: student.id === 's_11' ? 'Paid' : 'Pending', // Pre-set one as Paid for demo
                    note: student.id === 's_11' ? '' : 'Awaiting transfer'
                });
            }
        });

        // Teacher Payouts
        teachers.forEach(teacher => {
            const groupCount = classesData.groups.filter(g => g.teacherId === teacher.id).length;
             const oneToOneCount = classesData.oneToOnes.filter(g => g.teacherId === teacher.id).length;
            if (groupCount + oneToOneCount > 0) {
                // Mock payout logic: $500 per group/1-1
                 teacherPayouts.push({
                    id: `${teacher.id}-${month.replace(' ', '-')}`,
                    personId: teacher.id,
                    personName: teacher.name,
                    month: month,
                    amount: 500 * (groupCount + oneToOneCount),
                    status: 'Pending',
                    note: 'Scheduled for end of month'
                });
            }
        });
        
        return { studentPayments, teacherPayouts };
    }, []);

    const [studentPayments, setStudentPayments] = useState<PaymentRecord[]>(initialPayments.studentPayments);
    const [teacherPayouts, setTeacherPayouts] = useState<PaymentRecord[]>(initialPayments.teacherPayouts);

    const handleMarkPaid = (id: string, type: 'student' | 'teacher') => {
        if (type === 'student') {
            setStudentPayments(prev =>
                prev.map(p => (p.id === id ? { ...p, status: 'Paid', note: 'Payment confirmed' } : p))
            );
        } else {
            setTeacherPayouts(prev => 
                prev.map(p => (p.id === id ? { ...p, status: 'Paid', note: 'Payout sent' } : p))
            );
        }
    };
    
    const tabClasses = (tabName: string) => 
        `px-4 sm:px-6 py-3 font-semibold rounded-t-lg cursor-pointer transition-colors duration-200 whitespace-nowrap ${
            activeTab === tabName ? 'bg-base-100 text-primary border-b-2 border-primary -mb-px' : 'bg-transparent text-text-secondary hover:text-primary'
        }`;
        
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid': return <span className="px-3 py-1 text-xs font-semibold text-success bg-success/10 rounded-md">{status}</span>;
            case 'Pending': return <span className="px-3 py-1 text-xs font-semibold text-warning bg-warning/10 rounded-md">{status}</span>;
            default: return null;
        }
    };

    const renderTable = (data: PaymentRecord[], type: 'student' | 'teacher') => (
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
                <thead>
                    <tr className="border-b-2 border-slate-200">
                        <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">{type === 'student' ? 'Student' : 'Teacher'}</th>
                        <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Month</th>
                        <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Amount</th>
                        <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Status</th>
                        <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id} className="border-b border-slate-200/75 hover:bg-base-200/60">
                            <td className="p-4 font-medium text-neutral">{item.personName}</td>
                            <td className="p-4">{item.month}</td>
                            <td className="p-4 font-semibold text-neutral">${item.amount.toFixed(2)}</td>
                            <td className="p-4">{getStatusBadge(item.status)}</td>
                            <td className="p-4">
                                {item.status === 'Pending' ? (
                                    <button 
                                        onClick={() => handleMarkPaid(item.id, type)}
                                        className="px-3 py-1.5 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-secondary/90 transition-all transform hover:scale-105"
                                    >
                                        Mark as Paid
                                    </button>
                                ) : (
                                    <button 
                                        disabled 
                                        className="px-3 py-1.5 bg-success/10 text-success text-sm font-semibold rounded-md flex items-center cursor-not-allowed"
                                    >
                                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                        Paid
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <div className="border-b border-slate-300 flex overflow-x-auto">
                <button onClick={() => setActiveTab('students')} className={tabClasses('students')}>Student Payments</button>
                <button onClick={() => setActiveTab('teachers')} className={tabClasses('teachers')}>Teacher Payouts</button>
            </div>
            <Card className="rounded-t-none">
                {activeTab === 'students' && renderTable(studentPayments, 'student')}
                {activeTab === 'teachers' && renderTable(teacherPayouts, 'teacher')}
            </Card>
        </div>
    );
};

export default AdminFinance;
