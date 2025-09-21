
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Card from '../../components/ui/Card';
import { UsersIcon, BookOpenIcon, ClockIcon } from '../../components/ui/Icons';
import * as api from '../../services/api';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    color: string;
    shadowColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, shadowColor }) => (
    <Card className="flex items-center p-4 overflow-hidden">
        <div className={`p-4 rounded-full ${color} ${shadowColor} shadow-lg`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-neutral">{value}</p>
        </div>
    </Card>
);

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ teachers: 0, students: 0, activeGroups: 0, sessionsThisWeek: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [teachers, students, groups, sessions] = await Promise.all([
                    api.getTeachers(),
                    api.getStudents(),
                    api.getGroups(),
                    api.getMySessions()
                ]);
                setStats({
                    teachers: teachers.length,
                    students: students.length,
                    activeGroups: groups.length,
                    sessionsThisWeek: sessions.length
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const finance = { paid: 132, pending: 38, overdue: 14 };

    const financeData = [
        { name: 'Paid', value: finance.paid, fill: 'var(--color-secondary)' },
        { name: 'Pending', value: finance.pending, fill: 'var(--color-accent)' },
        { name: 'Overdue', value: finance.overdue, fill: 'var(--color-error)' },
    ];
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UsersIcon className="w-8 h-8 text-white"/>} title="Total Teachers" value={loading ? '...' : stats.teachers} color="bg-info" shadowColor="shadow-info/40" />
                <StatCard icon={<UsersIcon className="w-8 h-8 text-white"/>} title="Total Students" value={loading ? '...' : stats.students} color="bg-secondary" shadowColor="shadow-secondary/40" />
                <StatCard icon={<BookOpenIcon className="w-8 h-8 text-white"/>} title="Active Groups" value={loading ? '...' : stats.activeGroups} color="bg-accent" shadowColor="shadow-accent/40" />
                <StatCard icon={<ClockIcon className="w-8 h-8 text-white"/>} title="Sessions This Week" value={loading ? '...' : stats.sessionsThisWeek} color="bg-primary" shadowColor="shadow-primary/40" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2" title="Finance Summary (Invoices)">
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={financeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" tick={{ fill: '#718096' }} />
                                <YAxis tick={{ fill: '#718096' }} />
                                <Tooltip cursor={{fill: 'rgba(249, 250, 251, 0.7)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px' }}/>
                                <Legend />
                                <Bar dataKey="value" name="Invoices" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Quick Overview">
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center">
                            <span className="font-medium text-text-secondary">Paid Invoices</span>
                            <span className="font-bold text-success text-lg">{finance.paid}</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="font-medium text-text-secondary">Pending Invoices</span>
                            <span className="font-bold text-warning text-lg">{finance.pending}</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="font-medium text-text-secondary">Overdue Invoices</span>
                            <span className="font-bold text-error text-lg">{finance.overdue}</span>
                        </li>
                         <li className="flex justify-between items-center border-t border-slate-200/75 pt-4 mt-4">
                            <span className="font-bold text-neutral">Total Invoices</span>
                            <span className="font-extrabold text-primary text-xl">{finance.paid + finance.pending + finance.overdue}</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;