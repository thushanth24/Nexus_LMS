
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import allUsers from '../../data/users.js';
import allClasses from '../../data/classes.js';
import allSchedule from '../../data/schedule.js';
import { User, UserRole, Group, Session } from '../../types';

type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

interface TimeSlot {
  id: number;
  day: DayOfWeek;
  time: string;
}

const AdminGroupDetail: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const [activeTab, setActiveTab] = useState('Roster');
    
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const group = (allClasses.groups as Group[]).find(g => g.id === groupId);

    const [sessions, setSessions] = useState<Session[]>(() => 
        (allSchedule as Session[]).filter(s => s.classId === groupId).sort((a,b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    );

    const [roster, setRoster] = useState<User[]>(() => {
        if (!group) return [];
        const studentIds = new Set<string>();
        sessions.forEach(session => {
            session.attendees.forEach(id => studentIds.add(id));
        });
        return (allUsers as User[]).filter(user => user.role === UserRole.STUDENT && studentIds.has(user.id));
    });
    
    // Form State for new session
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState(group?.durationMin || 60);
    const [isChessEnabled, setIsChessEnabled] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringEndDate, setRecurringEndDate] = useState('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ id: 1, day: 'Monday', time: '10:00' }]);


    const availableStudents = useMemo(() => {
        const rosterIds = new Set(roster.map(s => s.id));
        return (allUsers as User[]).filter(u => u.role === UserRole.STUDENT && !rosterIds.has(u.id));
    }, [roster]);

    const userMap = useMemo(() => new Map((allUsers as User[]).map(user => [user.id, user.name])), []);
    const getUserName = (id: string) => userMap.get(id) || `ID: ${id}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    if (!group) {
        return <Card title="Error"><p>Group not found.</p><Link to="/admin/groups" className="text-primary hover:underline mt-4 inline-block">&larr; Back to all groups</Link></Card>;
    }
    
    const teacher = (allUsers as User[]).find(u => u.id === group.teacherId);
    
    const handleEnrollStudent = (student: User) => {
        setRoster(prevRoster => [...prevRoster, student]);
        // Add student to all future sessions for this group
        setSessions(prevSessions => prevSessions.map(s => {
            if (new Date(s.startsAt) > new Date() && !s.attendees.includes(student.id)) {
                return { ...s, attendees: [...s.attendees, student.id] };
            }
            return s;
        }));
    };
    
    const handleUnenrollStudent = (studentId: string) => {
        setRoster(prevRoster => prevRoster.filter(s => s.id !== studentId));
         // Remove student from all future sessions
        setSessions(prevSessions => prevSessions.map(s => {
            if (new Date(s.startsAt) > new Date()) {
                return { ...s, attendees: s.attendees.filter(id => id !== studentId) };
            }
            return s;
        }));
    };

    const handleAddTimeSlot = () => setTimeSlots([...timeSlots, { id: Date.now(), day: 'Monday', time: '10:00' }]);
    const handleTimeSlotChange = (id: number, field: 'day' | 'time', value: string) => setTimeSlots(timeSlots.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
    const handleRemoveTimeSlot = (id: number) => setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    
    const resetSessionForm = () => {
        setTitle('');
        setDate('');
        setDuration(group?.durationMin || 60);
        setIsChessEnabled(false);
        setIsRecurring(false);
        setRecurringEndDate('');
        setTimeSlots([{ id: 1, day: 'Monday', time: '10:00' }]);
    };

    const handleSessionFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSessions: Session[] = [];
        const attendees = roster.map(s => s.id);
        
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
                        if (sessionStartDate > new Date()) {
                            const endsAt = new Date(sessionStartDate.getTime() + duration * 60000);
                            newSessions.push({ id: `sess_${sessionStartDate.getTime()}_${slot.id}`, classId: group.id, type: 'GROUP', title, teacherId: group.teacherId, attendees, startsAt: sessionStartDate.toISOString(), endsAt: endsAt.toISOString(), isChessEnabled });
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else {
            const [hours, minutes] = timeSlots[0].time.split(':');
            const baseStartDate = new Date(date);
            baseStartDate.setHours(Number(hours), Number(minutes), 0, 0);
            const endsAt = new Date(baseStartDate.getTime() + duration * 60000);
            newSessions.push({ id: `sess_${baseStartDate.getTime()}`, classId: group.id, type: 'GROUP', title, teacherId: group.teacherId, attendees, startsAt: baseStartDate.toISOString(), endsAt: endsAt.toISOString(), isChessEnabled });
        }
        
        setSessions(prev => [...prev, ...newSessions].sort((a,b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
        setIsScheduleModalOpen(false);
        resetSessionForm();
    };


    const tabs = ['Roster', 'Schedule', 'Materials'];
    const tabClasses = (tabName: string) => 
        `px-4 sm:px-6 py-3 font-semibold rounded-t-lg cursor-pointer transition-colors duration-200 whitespace-nowrap ${
            activeTab === tabName ? 'bg-base-100 text-primary border-b-2 border-primary -mb-px' : 'bg-transparent text-text-secondary hover:text-primary'
        }`;


    return (
        <>
            <div className="space-y-6">
                <Card>
                    <Link to="/admin/groups" className="text-sm text-primary hover:underline mb-4 block">&larr; Back to all groups</Link>
                    <h2 className="text-3xl font-bold tracking-tight">{group.title}</h2>
                    <p className="text-text-secondary">{group.subject}</p>
                    <p className="text-sm text-text-secondary mt-2">Teacher: {teacher?.name || 'N/A'}</p>
                </Card>

                <div>
                    <div className="border-b border-slate-300 flex overflow-x-auto">
                        {tabs.map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={tabClasses(tab)}>{tab}</button>))}
                    </div>
                    <Card className="rounded-t-none">
                        {activeTab === 'Roster' && (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <h3 className="text-xl font-semibold text-neutral">Student Roster ({roster.length}/{group.cap})</h3>
                                    <button onClick={() => setIsEnrollModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">+ Enroll Student</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[500px]">
                                        <thead>
                                            <tr className="border-b-2 border-slate-200">
                                                <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Name</th>
                                                <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Level</th>
                                                <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roster.map(student => (
                                                <tr key={student.id} className="border-b border-slate-200/75 hover:bg-base-200/60 transition-colors duration-200">
                                                    <td className="p-4 flex items-center"><img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-4 object-cover" /><div><p className="font-bold text-neutral">{student.name}</p><p className="text-sm text-text-secondary">{student.email}</p></div></td>
                                                    <td className="p-4">{student.level}</td>
                                                    <td className="p-4"><button onClick={() => handleUnenrollStudent(student.id)} className="text-error hover:underline font-semibold">Unenroll</button></td>
                                                </tr>
                                            ))}
                                            {roster.length === 0 && (<tr><td colSpan={3} className="text-center p-8 text-text-secondary">No students enrolled in this group yet.</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Schedule' && (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    <h3 className="text-xl font-semibold text-neutral">Group Schedule</h3>
                                    <button onClick={() => setIsScheduleModalOpen(true)} className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">+ Create Session</button>
                                </div>
                                 <div className="space-y-4">
                                    {sessions.map(session => (
                                        <div key={session.id} className="p-4 bg-base-200/60 rounded-xl hover:bg-base-300/60 transition-colors duration-200">
                                            <p className="font-bold text-primary">{session.title}</p>
                                            <p className="text-sm text-text-secondary">{formatDate(session.startsAt)}</p>
                                        </div>
                                    ))}
                                    {sessions.length === 0 && <p className="text-center p-8 text-text-secondary">No sessions scheduled for this group yet.</p>}
                                </div>
                            </div>
                        )}
                        {activeTab === 'Materials' && <p>Material management for this group will be here.</p>}
                    </Card>
                </div>
            </div>

            <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title="Enroll Students">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableStudents.map(student => (
                        <div key={student.id} className="p-3 bg-base-200/50 rounded-lg flex justify-between items-center hover:bg-base-200 transition-colors duration-200">
                            <div><p className="font-semibold">{student.name}</p><p className="text-sm text-text-secondary">{student.email}</p></div>
                            <button onClick={() => handleEnrollStudent(student)} className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 transition">Add</button>
                        </div>
                    ))}
                    {availableStudents.length === 0 && (<p className="text-center p-4 text-text-secondary">All students are already enrolled in this group.</p>)}
                </div>
            </Modal>
            
            <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title={`Create Session for ${group.title}`}>
                 <form onSubmit={handleSessionFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral">Session Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div className="flex items-center">
                        <input id="recurring" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                        <label htmlFor="recurring" className="ml-2 block text-sm font-medium text-neutral">This is a recurring session</label>
                    </div>

                    {isRecurring ? (
                        <div className="space-y-4 bg-base-200/50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label htmlFor="startDate" className="block text-sm font-medium text-neutral">Start Date</label><input id="startDate" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" /></div>
                                <div><label htmlFor="endDate" className="block text-sm font-medium text-neutral">End Date</label><input id="endDate" type="date" value={recurringEndDate} onChange={e => setRecurringEndDate(e.target.value)} required={isRecurring} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral mb-2">Weekly Schedule</label>
                                {timeSlots.map(slot => (
                                    <div key={slot.id} className="flex items-center gap-2 mb-2">
                                        <select value={slot.day} onChange={e => handleTimeSlotChange(slot.id, 'day', e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white">
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <input type="time" value={slot.time} onChange={e => handleTimeSlotChange(slot.id, 'time', e.target.value)} required className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                                        <button type="button" onClick={() => handleRemoveTimeSlot(slot.id)} disabled={timeSlots.length <= 1} className="text-red-500 disabled:opacity-50 p-1 rounded-full hover:bg-red-100 disabled:hover:bg-transparent"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg></button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddTimeSlot} className="text-sm font-medium text-primary hover:underline mt-2">+ Add another time slot</button>
                            </div>
                        </div>
                    ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label htmlFor="date" className="block text-sm font-medium text-neutral">Date</label><input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required={!isRecurring} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" /></div>
                            <div><label htmlFor="time" className="block text-sm font-medium text-neutral">Time</label><input id="time" type="time" value={timeSlots[0].time} onChange={e => handleTimeSlotChange(timeSlots[0].id, 'time', e.target.value)} required={!isRecurring} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" /></div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                        <div><label htmlFor="duration" className="block text-sm font-medium text-neutral">Duration (minutes)</label><input id="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" /></div>
                        <div className="flex items-end pb-1"><div className="flex items-center"><input id="chess" type="checkbox" checked={isChessEnabled} onChange={e => setIsChessEnabled(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" /><label htmlFor="chess" className="ml-2 block text-sm text-neutral">Enable Chessboard</label></div></div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">
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

export default AdminGroupDetail;
