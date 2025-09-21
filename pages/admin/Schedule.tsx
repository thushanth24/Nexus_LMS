
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import usersData from '../../data/users.js';
import classesData from '../../data/classes.js';
import { User, Session, Group } from '../../types';

type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

interface TimeSlot {
  id: number;
  day: DayOfWeek;
  time: string;
}

const AdminSchedule: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [groupId, setGroupId] = useState('');
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState(60);
    const [isChessEnabled, setIsChessEnabled] = useState(false);
    
    // Recurring sessions state
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringEndDate, setRecurringEndDate] = useState('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ id: 1, day: 'Monday', time: '10:00' }]);

    const [teacherId, setTeacherId] = useState('');
    const [attendees, setAttendees] = useState<string[]>([]);
    
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

    const userMap = new Map((usersData as User[]).map(user => [user.id, user.name]));
    const getUserName = (id: string) => userMap.get(id) || `ID: ${id}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    useEffect(() => {
        if (groupId) {
            const group = (classesData.groups as Group[]).find(g => g.id === groupId);
            if (group) {
                setTeacherId(group.teacherId);
                const groupSessions = sessions.filter(s => s.classId === groupId);
                if (groupSessions.length > 0) {
                    setAttendees(Array.from(new Set(groupSessions.flatMap(s => s.attendees))));
                } else {
                    setAttendees([]);
                }
            }
        } else {
            setTeacherId('');
            setAttendees([]);
        }
    }, [groupId, sessions]);
    
    const resetForm = () => {
        setTitle('');
        setGroupId('');
        setDate('');
        setDuration(60);
        setIsChessEnabled(false);
        setIsRecurring(false);
        setRecurringEndDate('');
        setTimeSlots([{ id: 1, day: 'Monday', time: '10:00' }]);
    };
    
    const handleAddTimeSlot = () => {
        setTimeSlots([...timeSlots, { id: Date.now(), day: 'Monday', time: '10:00' }]);
    };
    
    const handleTimeSlotChange = (id: number, field: 'day' | 'time', value: string) => {
        setTimeSlots(timeSlots.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
    };

    const handleRemoveTimeSlot = (id: number) => {
        setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newSessions: Session[] = [];
        
        if (isRecurring && recurringEndDate) {
            const dayNameToIndex: Record<DayOfWeek, number> = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
            let currentDate = new Date(date + 'T00:00:00');
            const recurrenceEndDate = new Date(recurringEndDate + 'T23:59:59');

            while (currentDate <= recurrenceEndDate) {
                const currentDayOfWeek = currentDate.getDay();
                for (const slot of timeSlots) {
                    if (dayNameToIndex[slot.day] === currentDayOfWeek) {
                        const [hours, minutes] = slot.time.split(':');
                        const sessionStartDate = new Date(currentDate);
                        sessionStartDate.setHours(Number(hours), Number(minutes), 0, 0);
                        
                        if (sessionStartDate > new Date()) { // Only schedule for the future
                            const endsAt = new Date(sessionStartDate.getTime() + duration * 60000);
                            newSessions.push({
                                id: `sess_${sessionStartDate.getTime()}_${slot.id}`,
                                classId: groupId, type: 'GROUP', title, teacherId, attendees,
                                startsAt: sessionStartDate.toISOString(),
                                endsAt: endsAt.toISOString(),
                                isChessEnabled,
                            });
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else {
            if (!date || timeSlots.length === 0 || !timeSlots[0].time) {
                alert("Please provide a valid date and time for the session.");
                return;
            }
            const [hours, minutes] = timeSlots[0].time.split(':');
            const baseStartDate = new Date(date);
            baseStartDate.setHours(Number(hours), Number(minutes), 0, 0);

            const endsAt = new Date(baseStartDate.getTime() + duration * 60000);
            newSessions.push({
                id: `sess_${baseStartDate.getTime()}`,
                classId: groupId, type: 'GROUP', title, teacherId, attendees,
                startsAt: baseStartDate.toISOString(),
                endsAt: endsAt.toISOString(),
                isChessEnabled,
            });
        }
        // NOTE: This is a client-side only update.
        setSessions(prev => [...prev, ...newSessions].sort((a,b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
        setIsModalOpen(false);
        resetForm();
    };
    
    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                     <h2 className="text-2xl font-bold tracking-tight text-neutral">Global Schedule</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                    >
                        + Create Session
                    </button>
                </div>
                <div className="space-y-4">
                    {loading && <p>Loading schedule...</p>}
                    {error && <p className="text-error">Error: {error}</p>}
                    {!loading && !error && sessions.map(session => (
                        <div key={session.id} className="p-4 bg-base-100 rounded-xl shadow-md border border-slate-200/75 hover:bg-base-200/60 transition-colors duration-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-primary">{session.title}</p>
                                    <p className="text-sm text-text-secondary capitalize">{session.type.replace('_', ' ').toLowerCase()}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-md ${session.isChessEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'}`}>
                                    {session.isChessEnabled ? 'Chess Enabled' : 'Standard'}
                                </span>
                            </div>
                            <div className="mt-3 border-t border-slate-200/75 pt-3 space-y-2 text-sm">
                                <p className="flex flex-col sm:flex-row"><strong className="font-semibold text-text-secondary w-20 flex-shrink-0">Time:</strong> <span>{formatDate(session.startsAt)}</span></p>
                                <p className="flex flex-col sm:flex-row"><strong className="font-semibold text-text-secondary w-20 flex-shrink-0">Teacher:</strong> <span>{getUserName(session.teacherId)}</span></p>
                                <p className="flex flex-col sm:flex-row"><strong className="font-semibold text-text-secondary w-20 flex-shrink-0">Students:</strong> <span className="break-words">{session.attendees.map(getUserName).join(', ')}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Session">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral">Session Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div>
                        <label htmlFor="group" className="block text-sm font-medium text-neutral">Group</label>
                        <select id="group" value={groupId} onChange={e => setGroupId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition bg-white">
                            <option value="" disabled>Select a group</option>
                            {classesData.groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                    </div>
                     {teacherId && (
                        <div className="bg-base-200/50 p-3 rounded-lg text-sm">
                            <p><span className="font-semibold">Teacher:</span> {getUserName(teacherId)}</p>
                        </div>
                    )}
                    
                    <div className="flex items-center">
                        <input id="recurring" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                        <label htmlFor="recurring" className="ml-2 block text-sm font-medium text-neutral">This is a recurring session</label>
                    </div>

                    {isRecurring ? (
                        <div className="space-y-4 bg-base-200/50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-neutral">Start Date</label>
                                    <input id="startDate" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-neutral">End Date</label>
                                    <input id="endDate" type="date" value={recurringEndDate} onChange={e => setRecurringEndDate(e.target.value)} required={isRecurring} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">Weekly Schedule</label>
                                {timeSlots.map((slot, index) => (
                                    <div key={slot.id} className="flex items-center gap-2 mb-2">
                                        <select value={slot.day} onChange={e => handleTimeSlotChange(slot.id, 'day', e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white">
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <input type="time" value={slot.time} onChange={e => handleTimeSlotChange(slot.id, 'time', e.target.value)} required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                                        <button type="button" onClick={() => handleRemoveTimeSlot(slot.id)} disabled={timeSlots.length <= 1} className="text-red-500 disabled:opacity-50 p-1 rounded-full hover:bg-red-100 disabled:hover:bg-transparent">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddTimeSlot} className="text-sm font-medium text-primary hover:underline mt-2">+ Add another time slot</button>
                            </div>
                        </div>
                    ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-neutral">Date</label>
                                <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required={!isRecurring} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-neutral">Time</label>
                                <input id="time" type="time" value={timeSlots[0].time} onChange={e => handleTimeSlotChange(timeSlots[0].id, 'time', e.target.value)} required={!isRecurring} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-neutral">Duration (minutes)</label>
                            <input id="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                        </div>
                        <div className="flex items-end pb-1">
                             <div className="flex items-center">
                                <input id="chess" type="checkbox" checked={isChessEnabled} onChange={e => setIsChessEnabled(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                                <label htmlFor="chess" className="ml-2 block text-sm text-neutral">Enable Chessboard</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                            Create Session(s)
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AdminSchedule;