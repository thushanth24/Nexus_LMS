import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { User, Group } from '../../types';

interface FinanceSummary {
    totalTeachers: number;
    totalStudents: number;
    activeGroups: number;
}

const AdminFinance: React.FC = () => {
    const [summary, setSummary] = useState<FinanceSummary>({
        totalTeachers: 0,
        totalStudents: 0,
        activeGroups: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [teachers, students, groups] = await Promise.all([
                    api.getTeachers(),
                    api.getStudents(),
                    api.getGroups(),
                ]);

                setSummary({
                    totalTeachers: teachers.length,
                    totalStudents: students.length,
                    activeGroups: groups.length,
                });
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load finance summary');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <Card title="Key Metrics">
                {loading ? (
                    <p>Loading metrics...</p>
                ) : error ? (
                    <p className="text-error">{error}</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-base-200/60 rounded-lg">
                            <p className="text-sm text-text-secondary">Total Teachers</p>
                            <p className="text-2xl font-bold text-neutral">{summary.totalTeachers}</p>
                        </div>
                        <div className="p-4 bg-base-200/60 rounded-lg">
                            <p className="text-sm text-text-secondary">Total Students</p>
                            <p className="text-2xl font-bold text-neutral">{summary.totalStudents}</p>
                        </div>
                        <div className="p-4 bg-base-200/60 rounded-lg">
                            <p className="text-sm text-text-secondary">Active Groups</p>
                            <p className="text-2xl font-bold text-neutral">{summary.activeGroups}</p>
                        </div>
                    </div>
                )}
            </Card>

            <Card title="Invoices & Payments">
                <p className="text-text-secondary">
                    Finance tracking is not yet connected to the live system. Once payment data
                    is available, this section will display up-to-date summaries of invoices and payouts.
                </p>
            </Card>
        </div>
    );
};

export default AdminFinance;
