import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { Session } from '../../types';

type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

const AdminSchedule: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeDay, setActiveDay] = useState<DayOfWeek | 'All'>('All');

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setLoading(true);
                const data = await api.getMySessions();
                setSessions(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch schedule');
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    const groupedByDay = sessions.reduce<Record<DayOfWeek, Session[]>>((acc, session) => {
        const date = new Date(session.startsAt);
        const day = date.toLocaleDateString(undefined, { weekday: 'long' }) as DayOfWeek;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(session);
        return acc;
    }, {
        Sunday: [],
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
    });

    const days: (DayOfWeek | 'All')[] = ['All', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const filteredSessions = activeDay === 'All'
        ? sessions
        : groupedByDay[activeDay];

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                activeDay === day
                                    ? 'bg-primary text-white shadow'
                                    : 'bg-base-200 text-text-secondary hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </Card>

            {loading && <Card><p>Loading schedule...</p></Card>}
            {error && <Card><p className="text-error">{error}</p></Card>}

            {!loading && !error && (
                <Card title={activeDay === 'All' ? 'All Upcoming Sessions' : `${activeDay}'s Sessions`}>
                    {filteredSessions.length === 0 ? (
                        <p className="text-text-secondary">No sessions scheduled.</p>
                    ) : (
                        <div className="space-y-3">
                            {filteredSessions
                                .slice()
                                .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
                                .map((session) => (
                                    <div key={session.id} className="p-4 bg-base-200/60 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                        <div>
                                            <p className="font-semibold text-neutral">{session.title}</p>
                                            <p className="text-sm text-text-secondary">
                                                {new Date(session.startsAt).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>
                                        <span className="mt-3 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary uppercase">
                                            {session.type === 'GROUP' ? 'Group' : '1-to-1'}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default AdminSchedule;
