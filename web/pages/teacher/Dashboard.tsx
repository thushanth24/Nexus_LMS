import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import { Homework, Session, Submission } from '../../types';
import { ClockIcon } from '../../components/ui/Icons';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [pendingReviews, setPendingReviews] = useState<number>(0);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                setLoadingSessions(true);
                const [sessions, groups, pairs] = await Promise.all([
                    api.getMySessions(),
                    api.getMyTeachingGroups(),
                    api.getMyTeachingPairs(),
                ]);

                setUpcomingSessions(sessions.slice(0, 5));

                const classes = [
                    ...groups.map((g) => ({ id: g.id })),
                    ...pairs.map((p) => ({ id: p.id })),
                ];

                const homeworkLists = await Promise.all(
                    classes.map(async (klass) => api.getHomeworkForClass(klass.id)),
                );

                const pending = homeworkLists.flat().reduce((total: number, hw: Homework) => {
                    const submissions = hw.submissions ?? [];
                    const awaiting = submissions.filter((s: Submission) => s.status === 'SUBMITTED');
                    return total + awaiting.length;
                }, 0);

                setPendingReviews(pending);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard');
            } finally {
                setLoadingSessions(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (!user) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card title="Upcoming Sessions">
                    {loadingSessions ? (
                        <p className="text-text-secondary text-center py-8">Loading sessions...</p>
                    ) : error ? (
                        <p className="text-error text-center py-8">{error}</p>
                    ) : upcomingSessions.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 bg-base-200/60 rounded-xl flex items-center justify-between hover:bg-base-300/60 transition-colors duration-200"
                                >
                                    <div>
                                        <p className="font-bold text-lg text-neutral">{session.title}</p>
                                        <p className="text-sm text-text-secondary flex items-center">
                                            <ClockIcon className="w-4 h-4 mr-1.5" />
                                            {formatDate(session.startsAt)}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/teacher/session/${session.id}`}
                                        className="px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                                    >
                                        Open
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary text-center py-8">No upcoming sessions. Enjoy the break!</p>
                    )}
                </Card>
            </div>
            <div>
                <Card title="Quick Actions">
                    <div className="p-4 bg-warning/10 rounded-xl text-center">
                        <p className="text-sm text-yellow-700 font-semibold">Pending Reviews</p>
                        <p className="text-5xl font-extrabold text-warning">{pendingReviews}</p>
                        <Link
                            to="/teacher/homework"
                            className="mt-4 inline-block px-6 py-2 bg-warning text-white font-semibold rounded-lg hover:bg-warning/90 transition-transform hover:scale-105"
                        >
                            Review Now
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TeacherDashboard;
