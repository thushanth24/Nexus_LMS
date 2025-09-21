

import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Group, OneToOne, User, Session } from '../../types';

// Using a simplified type for classes, as the API doesn't distinguish 1-to-1s yet.
// FIX: Changed type from 'Group' to 'Groups' to align with filter state values
type ClassType = (Group & { type: 'Groups' });

const TeacherClasses: React.FC = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState<'All' | 'Groups' | 'One-to-One'>('All');
    const [classes, setClasses] = useState<ClassType[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [groupsData, sessionsData, studentsData] = await Promise.all([
                    api.getGroups(),
                    api.getMySessions(),
                    api.getStudents() // Fetch all students to map them to classes
                ]);
                
                // FIX: Changed type from 'Group' to 'Groups' to align with filter state values
                const teacherGroups = groupsData
                    .filter((g: Group) => g.teacherId === user.id)
                    .map((g: Group) => ({ ...g, type: 'Groups' as const }));

                setClasses(teacherGroups);
                setSessions(sessionsData);
                setStudents(studentsData);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to fetch class data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);
    
    const filteredClasses = useMemo(() => {
        if (filter === 'All') return classes;
        return classes.filter(c => c.type === filter);
    }, [filter, classes]);

    const getNextSessionInfo = (classId: string): { text: string; isJoinable: boolean; sessionId?: string } => {
        const now = new Date();
        const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000);

        const next = sessions
            .filter(s => s.classId === classId && new Date(s.startsAt) > now)
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
            [0];
        
        if (!next) return { text: 'Not scheduled', isJoinable: false };

        const sessionDate = new Date(next.startsAt);
        const isJoinable = sessionDate <= thirtyMinsFromNow;

        return {
            text: sessionDate.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }),
            isJoinable,
            sessionId: next.id,
        };
    };

    const getStudentsForClass = (classInfo: ClassType): User[] => {
        const studentIds = new Set<string>();
        sessions.forEach(session => {
            if (session.classId === classInfo.id) {
                session.attendees.forEach(id => studentIds.add(id));
            }
        });
        return students.filter(u => studentIds.has(u.id));
    };

    const filterButtonClasses = (btnFilter: typeof filter) => 
        `px-4 py-2 font-semibold rounded-lg transition-colors duration-200 ${
            filter === btnFilter ? 'bg-primary text-white shadow' : 'bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary'
        }`;

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-neutral">My Classes</h2>
                <div className="flex space-x-2 p-1 bg-base-200 rounded-xl">
                    <button onClick={() => setFilter('All')} className={filterButtonClasses('All')}>All</button>
                    <button onClick={() => setFilter('Groups')} className={filterButtonClasses('Groups')}>Groups</button>
                    <button onClick={() => setFilter('One-to-One')} className={filterButtonClasses('One-to-One')} disabled>One-to-One</button>
                </div>
            </div>

            {loading && <p className="text-center py-12">Loading classes...</p>}
            {error && <p className="text-center text-error py-12">Error: {error}</p>}
            
            {!loading && !error && (
                filteredClasses.length === 0 ? (
                    <p className="text-center text-text-secondary py-12">No {filter !== 'All' ? filter.toLowerCase() : ''} classes found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClasses.map(c => {
                            const classStudents = getStudentsForClass(c);
                            const nextSession = getNextSessionInfo(c.id);

                            return (
                                <Card key={c.id} className="flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg text-primary flex-1 pr-2">{c.title}</h4>
                                        {/* FIX: Changed 'Group' to 'Groups' to match the updated type */}
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-md ${c.type === 'Groups' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                            {c.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary mb-2">{c.subject}</p>
                                    
                                    <div className="my-4 space-y-3">
                                        <div className="flex items-center text-sm">
                                            <strong className="w-24 text-neutral font-medium">Students:</strong> 
                                            <div className="flex items-center">
                                                <div className="flex -space-x-3">
                                                    {classStudents.slice(0, 4).map(s => <img key={s.id} src={s.avatarUrl || ''} alt={s.name} className="w-8 h-8 rounded-full border-2 border-white" title={s.name} />)}
                                                </div>
                                                {classStudents.length > 4 && <span className="ml-4 text-text-secondary">+{classStudents.length - 4} more</span>}
                                            </div>
                                        </div>
                                        <p className="text-sm"><strong className="w-24 inline-block text-neutral font-medium">Next Session:</strong> {nextSession.text}</p>
                                    </div>
                                    
                                    <div className="flex-grow"></div>
                                    <div className="mt-auto pt-4 border-t border-slate-200/75 flex justify-between items-center">
                                        <Link to={`/teacher/classes/${c.id}`} className="text-primary hover:underline font-semibold text-sm">
                                            Manage
                                        </Link>
                                        {nextSession.isJoinable && (
                                            <Link to={`/teacher/session/${nextSession.sessionId}`} className="px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all duration-200 animate-pulse">
                                                Start Session
                                            </Link>
                                        )}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )
            )}
        </Card>
    );
};

export default TeacherClasses;