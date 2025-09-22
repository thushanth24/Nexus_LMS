

import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import classes from '../../data/classes.js';
import { User } from '../../types';

const AdminTeachers: React.FC = () => {
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subjects, setSubjects] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true);
                const data = await api.getTeachers();
                setTeachers(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch teachers');
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    const getTeacherStats = (teacherId: string) => {
        const groups = classes.groups.filter(g => g.teacherId === teacherId).length;
        const oneToOnes = classes.oneToOnes.filter(o => o.teacherId === teacherId).length;
        const rating = (4.5 + Math.random() * 0.5).toFixed(1); 
        return { groups, oneToOnes, rating };
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setSubjects('');
        setPassword('');
        setFormError(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formattedSubjects = subjects.split(',').map(s => s.trim()).filter(Boolean);

        try {
            setIsSubmitting(true);
            setFormError(null);

            const invitedTeacher = await api.inviteTeacher({
                name,
                email,
                password,
                subjects: formattedSubjects,
                timezone: 'America/New_York',
            });

            setTeachers(prev => [...prev, invitedTeacher]);
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            const message = err?.message || 'Failed to invite teacher';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                     <h2 className="text-2xl font-bold tracking-tight text-neutral">Manage Teachers</h2>
                    <button 
                        onClick={() => { setIsModalOpen(true); resetForm(); }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                    >
                        + Invite Teacher
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {loading && <p>Loading teachers...</p>}
                    {error && <p className="text-error">Error: {error}</p>}
                    {!loading && !error && (
                        <table className="w-full text-left min-w-[640px]">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Name</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Subjects</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-center">Groups</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-center">1-to-1s</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Rating</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(teacher => {
                                    const stats = getTeacherStats(teacher.id);
                                    return (
                                        <tr key={teacher.id} className="border-b border-slate-200/75 hover:bg-base-200/60 transition-colors duration-200">
                                            <td className="p-4 flex items-center">
                                                <img src={teacher.avatarUrl || `https://ui-avatars.com/api/?name=${teacher.name.replace(' ', '+')}`} alt={teacher.name} className="w-10 h-10 rounded-full mr-4 object-cover" />
                                                <div>
                                                    <p className="font-bold text-neutral">{teacher.name}</p>
                                                    <p className="text-sm text-text-secondary">{teacher.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">{teacher.subjects?.join(', ')}</td>
                                            <td className="p-4 text-center">{stats.groups}</td>
                                            <td className="p-4 text-center">{stats.oneToOnes}</td>
                                            <td className="p-4 text-yellow-500 font-bold">{stats.rating} ?~.</td>
                                            <td className="p-4">
                                                <button className="text-primary hover:underline font-semibold">View</button>
                                                <button className="text-accent hover:underline ml-4 font-semibold">Edit</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title="Invite New Teacher">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral">Full Name</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral">Email Address</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                     <div>
                        <label htmlFor="subjects" className="block text-sm font-medium text-neutral">Subjects (comma-separated)</label>
                        <input id="subjects" type="text" value={subjects} onChange={e => setSubjects(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral">Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    {formError && <p className="text-error text-sm">{formError}</p>}
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AdminTeachers;
