
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Session } from '../../types';

const StudentSchedule: React.FC = () => {
    const { user } = useAuth();
    const [studentSessions, setStudentSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const data = await api.getMySessions();
                setStudentSessions(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch schedule');
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [user]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <Card title="My Schedule">
            {loading && <p>Loading schedule...</p>}
            {error && <p className="text-error">Error: {error}</p>}
            {!loading && !error && (
                <div className="space-y-4">
                    {studentSessions.length > 0 ? studentSessions.map(session => (
                        <div key={session.id} className="p-4 bg-base-200/50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{session.title}</p>
                                <p className="text-sm text-gray-600">{formatDate(session.startsAt)}</p>
                            </div>
                            <Link to={`/student/session/${session.id}`} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition">
                                Join
                            </Link>
                        </div>
                    )) : (
                        <p className="text-center text-text-secondary py-8">No sessions on your schedule.</p>
                    )}
                </div>
            )}
        </Card>
    );
};

export default StudentSchedule;