
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import allSubmissions from '../../data/submissions.js';
import { Session } from '../../types';
import { ClockIcon } from '../../components/ui/Icons';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const sessions = await api.getMySessions();
                setUpcomingSessions(sessions.slice(0, 5)); // API returns sorted, so just slice
            } catch (error) {
                console.error("Failed to fetch sessions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [user]);

    if (!user) return null;

    const pendingReviews = allSubmissions.filter(s => s.status === 'SUBMITTED').length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card title="Upcoming Sessions">
                    {loading ? (
                        <p className="text-text-secondary text-center py-8">Loading sessions...</p>
                    ) : upcomingSessions.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingSessions.map(session => (
                                <div key={session.id} className="p-4 bg-base-200/60 rounded-xl flex items-center justify-between hover:bg-base-300/60 transition-colors duration-200">
                                    <div>
                                        <p className="font-bold text-lg text-neutral">{session.title}</p>
                                        <p className="text-sm text-text-secondary flex items-center">
                                            <ClockIcon className="w-4 h-4 mr-1.5" />
                                            {formatDate(session.startsAt)}
                                        </p>
                                    </div>
                                    <Link to={`/teacher/session/${session.id}`} className="px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                                        Join
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
                        <Link to="/teacher/homework" className="mt-4 inline-block px-6 py-2 bg-warning text-white font-semibold rounded-lg hover:bg-warning/90 transition-transform hover:scale-105">
                            Grade Now
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TeacherDashboard;