import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Homework, Submission } from '../../types';

interface TeacherClassHomework {
    classId: string;
    classTitle: string;
    type: 'GROUP' | 'ONE_TO_ONE';
    items: Homework[];
}

const TeacherHomework: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classHomework, setClassHomework] = useState<TeacherClassHomework[]>([]);

    useEffect(() => {
        const fetchHomework = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [groups, pairs] = await Promise.all([
                    api.getMyTeachingGroups(),
                    api.getMyTeachingPairs(),
                ]);

                const classes = [
                    ...groups.map((g) => ({ id: g.id, title: g.title, type: 'GROUP' as const })),
                    ...pairs.map((p) => ({ id: p.id, title: p.title, type: 'ONE_TO_ONE' as const })),
                ];

                const homeworkByClass = await Promise.all(
                    classes.map(async (klass) => {
                        const homeworkItems = await api.getHomeworkForClass(klass.id);
                        return {
                            classId: klass.id,
                            classTitle: klass.title,
                            type: klass.type,
                            items: homeworkItems,
                        } as TeacherClassHomework;
                    }),
                );

                setClassHomework(homeworkByClass);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch homework');
            } finally {
                setLoading(false);
            }
        };

        fetchHomework();
    }, [user]);

    const pendingReviews = useMemo(() => {
        return classHomework.reduce((total, klass) => {
            const pending = klass.items.flatMap((hw) => hw.submissions ?? []).filter(
                (submission: Submission) => submission.status === 'SUBMITTED',
            );
            return total + pending.length;
        }, 0);
    }, [classHomework]);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-neutral">Homework Overview</h2>
                        <p className="text-text-secondary">Review and track submissions across your classes.</p>
                    </div>
                    <div className="px-4 py-2 bg-warning/10 rounded-lg text-warning font-semibold">
                        Pending Reviews: {pendingReviews}
                    </div>
                </div>
            </Card>

            {loading && <Card><p>Loading homework...</p></Card>}
            {error && <Card><p className="text-error">Error: {error}</p></Card>}

            {!loading && !error && classHomework.length === 0 && (
                <Card>
                    <p className="text-center text-text-secondary py-12">No homework assigned yet.</p>
                </Card>
            )}

            {!loading && !error && classHomework.map((klass) => (
                <Card key={klass.classId} title={klass.classTitle}>
                    {klass.items.length === 0 ? (
                        <p className="text-text-secondary">No assignments for this class.</p>
                    ) : (
                        <div className="space-y-4">
                            {klass.items.map((hw) => {
                                const submissions = hw.submissions ?? [];
                                const submittedCount = submissions.filter((s) => s.status === 'SUBMITTED').length;
                                const gradedCount = submissions.filter((s) => s.status === 'GRADED').length;

                                return (
                                    <div
                                        key={hw.id}
                                        className="p-4 bg-base-200/60 rounded-xl border border-base-200"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-neutral">{hw.title}</h3>
                                                <p className="text-sm text-text-secondary">
                                                    Due: {new Date(hw.dueAt).toLocaleString(undefined, {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </p>
                                                <p className="text-sm text-text-secondary mt-2 max-w-2xl">
                                                    {hw.instructions}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary">
                                                    {hw.type.toUpperCase()}
                                                </span>
                                                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-base-300 text-neutral">
                                                    {submittedCount} submitted
                                                </span>
                                                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-secondary/10 text-secondary">
                                                    {gradedCount} graded
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default TeacherHomework;
