import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Session, User } from '../../types';

const TeacherSchedule: React.FC = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [sessionsData, studentsData] = await Promise.all([
                    api.getMySessions(),
                    api.getStudents(),
                ]);
                setSessions(sessionsData);
                setStudents(studentsData);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch schedule');
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [user]);

    const studentMap = useMemo(
        () => new Map(students.map((s) => [s.id, s.name])),
        [students],
    );

    const upcomingSessions = useMemo(
        () =>
            sessions
                .filter((s) => new Date(s.startsAt) > new Date())
                .sort(
                    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
                ),
        [sessions],
    );

    const allSessionsSorted = useMemo(
        () =>
            [...sessions].sort(
                (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
            ),
        [sessions],
    );

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

    const tabClasses = (tabName: 'upcoming' | 'all') =>
        `px-4 py-2 font-semibold rounded-lg transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-primary text-white shadow'
                : 'bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary'
        }`;

    const renderSessionList = (sessionList: Session[]) => (
        <div className="space-y-4">
            {sessionList.length > 0 ? (
                sessionList.map((session) => {
                    const isCompleted = new Date(session.startsAt) < new Date();
                    const studentNames = session.attendees
                        .map((id) => studentMap.get(id) || 'Unknown')
                        .join(', ');
                    const className = session.classTitle ?? session.title;

                    return (
                        <Card
                            key={session.id}
                            className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                <div>
                                    <p className="text-sm text-text-secondary">
                                        {formatDate(session.startsAt)}
                                    </p>
                                    <h4 className="text-xl font-semibold text-neutral mt-1">
                                        {session.title}
                                    </h4>
                                    <p className="text-sm text-text-secondary mt-2">
                                        <strong>Class:</strong> {className}
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        <strong>Students:</strong> {studentNames || '—'}
                                    </p>
                                </div>
                                <div className="mt-4 md:mt-0 flex flex-col items-start gap-3">
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold rounded-md ${
                                            session.type === 'GROUP'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-secondary/10 text-secondary'
                                        }`}
                                    >
                                        {session.type === 'GROUP' ? 'Group' : '1-to-1'}
                                    </span>
                                    {session.isChessEnabled && (
                                        <span className="px-3 py-1 text-xs font-semibold rounded-md bg-accent/10 text-accent">
                                            Chess Enabled
                                        </span>
                                    )}
                                    <Link
                                        to={`/teacher/session/${session.id}`}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                            isCompleted
                                                ? 'bg-base-200 text-text-secondary cursor-not-allowed'
                                                : 'bg-gradient-to-r from-secondary to-green-400 text-white hover:shadow-lg hover:-translate-y-px'
                                        }`}
                                    >
                                        {isCompleted ? 'Completed' : 'Open Session'}
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    );
                })
            ) : (
                <p className="text-center text-text-secondary py-8">
                    No sessions to display.
                </p>
            )}
        </div>
    );

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex space-x-2 p-1 bg-base-200 rounded-xl">
                    <button onClick={() => setActiveTab('upcoming')} className={tabClasses('upcoming')}>
                        Upcoming
                    </button>
                    <button onClick={() => setActiveTab('all')} className={tabClasses('all')}>
                        All Sessions
                    </button>
                </div>
            </div>

            {loading && <p>Loading schedule...</p>}
            {error && <p className="text-error">Error: {error}</p>}
            {!loading && !error && (
                activeTab === 'upcoming'
                    ? renderSessionList(upcomingSessions)
                    : renderSessionList(allSessionsSorted)
            )}
        </Card>
    );
};

export default TeacherSchedule;
