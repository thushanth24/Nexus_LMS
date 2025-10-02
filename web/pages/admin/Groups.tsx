import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Group, User, MeetingDayDto } from '../../types';

const AdminGroups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [meetingDays, setMeetingDays] = useState<Array<{
        day: string;
        startTime: string;
        endTime: string;
    }>>([]);
    const [cap, setCap] = useState(10);
    
    // Helper function to normalize meetingDays to an array of MeetingDayDto
    const normalizeMeetingDays = (days: Group['meetingDays']): MeetingDayDto[] => {
        if (!days) return [];
        
        // If it's already an array of MeetingDayDto, ensure it has the correct shape
        if (Array.isArray(days)) {
            return days
                .filter((day): day is MeetingDayDto => 
                    day && 
                    typeof day === 'object' && 
                    'day' in day && 
                    'startTime' in day && 
                    'endTime' in day
                )
                .map(day => ({
                    day: String(day.day).toLowerCase(),
                    startTime: String(day.startTime || '09:00'),
                    endTime: String(day.endTime || '10:00')
                }));
        }
        
        // If it's a string, try to parse it
        if (typeof days === 'string') {
            try {
                const parsed = JSON.parse(days);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter((day: any): day is MeetingDayDto => 
                            day && 
                            typeof day === 'object' && 
                            'day' in day
                        )
                        .map(day => ({
                            day: String(day.day).toLowerCase(),
                            startTime: String(day.startTime || '09:00'),
                            endTime: String(day.endTime || '10:00')
                        }));
                }
            } catch (e) {
                console.error('Error parsing meetingDays:', e);
            }
        }
        
        return [];
    };
    
    const daysOfWeek = [
        { id: 'monday', label: 'Monday' },
        { id: 'tuesday', label: 'Tuesday' },
        { id: 'wednesday', label: 'Wednesday' },
        { id: 'thursday', label: 'Thursday' },
        { id: 'friday', label: 'Friday' },
        { id: 'saturday', label: 'Saturday' },
        { id: 'sunday', label: 'Sunday' },
    ] as const;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [groupsData, teachersData] = await Promise.all([
                    api.getGroups(),
                    api.getTeachers(),
                ]);
                setGroups(groupsData);
                setTeachers(teachersData);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const resetForm = () => {
        setTitle('');
        setSubject('');
        setTeacherId('');
        setMeetingDays([] as Array<{ day: string; startTime: string; endTime: string; }>);
        setCap(10);
        setFormError(null);
        setIsSubmitting(false);
    };

    const toggleDay = (day: string) => {
        setMeetingDays(prev => {
            const existingDayIndex = prev.findIndex(d => d.day === day);
            if (existingDayIndex >= 0) {
                return prev.filter(d => d.day !== day);
            } else {
                return [...prev, { 
                    day, 
                    startTime: '09:00', 
                    endTime: '10:00' 
                }];
            }
        });
    };

    const updateDayTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
        setMeetingDays(prev => 
            prev.map(d => 
                d.day === day ? { ...d, [field]: value } : d
            )
        );
    };

    const isDaySelected = (day: string) => {
        return meetingDays.some(d => d.day === day);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherId) {
            setFormError('Please select a teacher.');
            return;
        }

        if (meetingDays.length === 0) {
            setFormError('Please add at least one meeting day and time.');
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError(null);
            
            // Ensure meeting days are in the correct format for the API
            const meetingDaysPayload: api.MeetingDayDto[] = meetingDays
                .filter((day): day is { day: string; startTime: string; endTime: string } => {
                    return !!(day && typeof day === 'object' && 'day' in day);
                })
                .map(day => {
                    // Format time to ensure it's in HH:MM format
                    const formatTime = (time: string) => {
                        if (!time || typeof time !== 'string') return '09:00';
                        const [hours, minutes = '00'] = time.split(':');
                        return `${hours.padStart(2, '0')}:${minutes.padEnd(2, '0')}`;
                    };
                    
                    return {
                        day: String(day.day).toLowerCase(),
                        startTime: formatTime(day.startTime),
                        endTime: formatTime(day.endTime)
                    };
                });
            
            if (meetingDaysPayload.length === 0) {
                throw new Error('No valid meeting days provided');
            }
            
            // Calculate duration in minutes based on meeting times
            const durationMin = meetingDaysPayload.reduce((total, day) => {
                const [startH, startM] = day.startTime.split(':').map(Number);
                const [endH, endM] = day.endTime.split(':').map(Number);
                return total + ((endH * 60 + endM) - (startH * 60 + startM));
            }, 0) / meetingDaysPayload.length;
            
            // Create the group with properly typed payload
            const payload: api.CreateGroupPayload = {
                title: title.trim(),
                subject: subject.trim(),
                teacherId,
                meetingDays: meetingDaysPayload,
                durationMin: Math.round(durationMin),
                cap
            };
            
            const newGroup = await api.createGroup(payload);
            
            setGroups(prev => [newGroup, ...prev]);
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            console.error('Error creating group:', err);
            const message = err?.response?.data?.message || err?.message || 'Failed to create group';
            setFormError(message);
            setIsSubmitting(false);
        }
    };
    
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                     <h2 className="text-2xl font-bold tracking-tight text-neutral">Manage Groups</h2>
                    <button
                        onClick={() => { setIsModalOpen(true); resetForm(); }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                    >
                        + Create Group
                    </button>
                </div>
                {loading && <p>Loading groups...</p>}
                {error && <p className="text-error">Error: {error}</p>}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <Card key={group.id} className="flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                                <h4 className="font-bold text-lg text-primary">{group.title}</h4>
                                <p className="text-sm text-text-secondary mb-1">{group.subject}</p>
                                <p className="text-xs text-text-secondary">Teacher: {getTeacherName(group.teacherId)}</p>
                                
                                <div className="my-4 space-y-2 bg-base-200/60 p-3 rounded-lg">
                                    <p><strong className="font-medium text-neutral">Schedule:</strong> {
                                        (() => {
                                            const normalizedDays = normalizeMeetingDays(group.meetingDays);
                                            return normalizedDays.map((day, i) => (
                                                <span key={i}>
                                                    {day.day.charAt(0).toUpperCase() + day.day.slice(1)} ({day.startTime}-{day.endTime}){i < normalizedDays.length - 1 ? ', ' : ''}
                                                </span>
                                            ));
                                        })()
                                    }</p>
                                </div>
                                
                                <div className="flex-grow"></div>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/75">
                                    <div>
                                        <span className="font-bold text-lg text-neutral">{group.currentSize}</span> / {group.cap} Students
                                    </div>
                                    <Link to={`/admin/groups/${group.id}`} className="text-primary hover:underline font-semibold">
                                        Manage
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title="Create New Group">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral">Group Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-neutral">Subject</label>
                        <input id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-neutral">Teacher</label>
                        <select id="teacher" value={teacherId} onChange={e => setTeacherId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition bg-white">
                            <option value="" disabled>Select a teacher</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cap" className="block text-sm font-medium text-neutral">Capacity</label>
                        <input id="cap" type="number" value={cap} min={1} onChange={e => setCap(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meeting Days & Times
                        </label>
                        <div className="space-y-2">
                            {daysOfWeek.map(({ id, label }) => (
                                <div key={id} className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`day-${id}`}
                                            checked={isDaySelected(id)}
                                            onChange={() => toggleDay(id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`day-${id}`} className="ml-2 block text-sm text-gray-700">
                                            {label}
                                        </label>
                                    </div>
                                    {isDaySelected(id) && (
                                        <div className="flex space-x-2">
                                            <input
                                                type="time"
                                                className="text-sm px-2 py-1 border border-gray-300 rounded-md shadow-sm"
                                                value={meetingDays.find(d => d.day === id)?.startTime || '09:00'}
                                                onChange={(e) => updateDayTime(id, 'startTime', e.target.value)}
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                className="text-sm px-2 py-1 border border-gray-300 rounded-md shadow-sm"
                                                value={meetingDays.find(d => d.day === id)?.endTime || '10:00'}
                                                onChange={(e) => updateDayTime(id, 'endTime', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    {formError && <p className="text-error text-sm">{formError}</p>}
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AdminGroups;
