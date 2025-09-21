
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import usersData from '../../data/users.js';
import classesData from '../../data/classes.js';
import { useAuth } from '../../hooks/useAuth';
import { Session, User, UserRole } from '../../types';

const TeacherSchedule: React.FC = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState('upcoming');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [studentId, setStudentId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('10:00');
    const [duration, setDuration] = useState(45);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user) return;
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
    }, [user]);

    const userMap = useMemo(() => new Map(usersData.map(u => [u.id, u.name])), []);
    const classMap = useMemo(() => {
        const allClasses = [...classesData.groups, ...classesData.oneToOnes];
        return new Map(allClasses.map(c => [c.id, c.title]));
    }, []);

    const teacherStudents = useMemo(() => {
        if (!user) return [];
        const studentIds = new Set<string>();
        classesData.oneToOnes.forEach(oto => {
            if (oto.teacherId === user.id) studentIds.add(oto.studentId);
        });
        // A more robust implementation would fetch student lists per class from the API
        // For now, we infer from static data.
        return usersData.filter(u => u.role === UserRole.STUDENT);
    }, [user]);
    
    const upcomingSessions = useMemo(() => 
        sessions.filter(s => new Date(s.startsAt) > new Date()), 
        [sessions]
    );

    const allSessionsSorted = useMemo(() => 
        [...sessions].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
        [sessions]
    );

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || !date || !time) {
            alert("Please fill out all fields.");
            return;
        }

        const selectedStudent = teacherStudents.find(s => s.id === studentId);
        const sessionTitle = title || `1:1 – ${selectedStudent?.name}`;

        const [hours, minutes] = time.split(':');
        const startsAt = new Date(date);
        startsAt.setHours(Number(hours), Number(minutes), 0, 0);

        const endsAt = new Date(startsAt.getTime() + duration * 60000);

        const newSession: Session = {
            id: `sess_${new Date().getTime()}`,
            classId: `p_new_${studentId}`,
            type: 'ONE_TO_ONE',
            title: sessionTitle,
            teacherId: user!.id,
            attendees: [studentId],
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            isChessEnabled: false,
        };
        // NOTE: This is a client-side only update
        setSessions(prev => [...prev, newSession].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
        setIsModalOpen(false);
        setTitle('');
        setStudentId('');
        setDate('');
        setTime('10:00');
        setDuration(45);
    };

    const tabClasses = (tabName: string) => 
        `px-4 py-2 font-semibold rounded-lg transition-colors duration-200 ${
            activeTab === tabName ? 'bg-primary text-white shadow' : 'bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary'
        }`;

    const renderSessionList = (sessionList: Session[]) => (
        <div className="space-y-4">
            {sessionList.length > 0 ? sessionList.map(session => {
                const isCompleted = new Date(session.startsAt) < new Date();
                const studentNames = session.attendees.map(id => userMap.get(id) || 'Unknown').join(', ');
                const className = classMap.get(session.classId) || session.title;

                return (
                    <Card key={session.id} className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-lg text-primary">{session.title}</h4>
                                    {session.isChessEnabled && (
                                        <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary">Chess Enabled</span>
                                    )}
                                    {activeTab === 'all' && (
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-md ${isCompleted ? 'bg-slate-200 text-slate-600' : 'bg-secondary/10 text-secondary'}`}>
                                            {isCompleted ? 'Completed' : 'Upcoming'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary font-medium">{formatDate(session.startsAt)}</p>
                            </div>
                            {!isCompleted && (
                                 <Link to={`/teacher/session/${session.id}`} className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-px transition-all duration-200 text-center">
                                    Join Session
                                </Link>
                            )}
                        </div>
                         <div className="mt-3 border-t border-slate-200/75 pt-3 space-y-1 text-sm">
                            <p><strong className="font-semibold text-text-secondary w-20 inline-block">Class:</strong> {className}</p>
                            <p><strong className="font-semibold text-text-secondary w-20 inline-block align-top">Students:</strong> <span className="inline-block w-[calc(100%-5rem)]">{studentNames}</span></p>
                        </div>
                    </Card>
                );
            }) : <p className="text-center text-text-secondary py-8">No sessions to display.</p>}
        </div>
    );

    return (
        <>
            <Card>
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex space-x-2 p-1 bg-base-200 rounded-xl">
                        <button onClick={() => setActiveTab('upcoming')} className={tabClasses('upcoming')}>Upcoming</button>
                        <button onClick={() => setActiveTab('all')} className={tabClasses('all')}>All Sessions</button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                        + Create 1:1 Session
                    </button>
                </div>
                
                {loading && <p>Loading schedule...</p>}
                {error && <p className="text-error">Error: {error}</p>}
                {!loading && !error && (
                    activeTab === 'upcoming' ? renderSessionList(upcomingSessions) : renderSessionList(allSessionsSorted)
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create 1:1 Session">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="student" className="block text-sm font-medium text-neutral">Student</label>
                        <select id="student" value={studentId} onChange={e => setStudentId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition bg-white">
                            <option value="" disabled>Select a student</option>
                            {teacherStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral">Session Title (optional)</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={`1:1 Session`} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-neutral">Date</label>
                            <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-neutral">Time</label>
                            <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-neutral">Duration (minutes)</label>
                        <input id="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                            Create Session
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default TeacherSchedule;