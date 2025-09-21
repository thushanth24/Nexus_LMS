
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Group, User } from '../../types';

const AdminGroups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [meetingDays, setMeetingDays] = useState('');
    const [cap, setCap] = useState(10);
    const [levelSpread, setLevelSpread] = useState('');

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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherId) {
            alert("Please select a teacher.");
            return;
        }

        const newGroup: Group = {
            id: `g_${new Date().getTime()}`,
            title,
            subject,
            teacherId,
            meetingDays: meetingDays.split(',').map(s => s.trim()),
            cap: Number(cap),
            levelSpread: levelSpread.split(',').map(s => s.trim()),
            currentSize: 0, // New groups start empty
            durationMin: 60, // Default
        };
        // NOTE: This is a client-side only update.
        setGroups(prev => [...prev, newGroup]);

        // Close and reset
        setIsModalOpen(false);
        setTitle('');
        setSubject('');
        setTeacherId('');
        setMeetingDays('');
        setCap(10);
        setLevelSpread('');
    };
    
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                     <h2 className="text-2xl font-bold tracking-tight text-neutral">Manage Groups</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
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
                                
                                <div className="my-4 space-y-2 text-sm bg-base-200/60 p-3 rounded-lg">
                                    <p><strong className="font-medium text-neutral">Levels:</strong> {group.levelSpread.join(', ')}</p>
                                    <p><strong className="font-medium text-neutral">Schedule:</strong> {group.meetingDays.join(', ')}</p>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Group">
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
                        <input id="cap" type="number" value={cap} onChange={e => setCap(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div>
                        <label htmlFor="levelSpread" className="block text-sm font-medium text-neutral">Levels (e.g. B1, B2)</label>
                        <input id="levelSpread" type="text" value={levelSpread} onChange={e => setLevelSpread(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div>
                        <label htmlFor="meetingDays" className="block text-sm font-medium text-neutral">Meeting Days (e.g. Mon, Wed)</label>
                        <input id="meetingDays" type="text" value={meetingDays} onChange={e => setMeetingDays(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                            Create Group
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AdminGroups;