import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import { User, Session } from '../../types';

const AdminStudents: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [level, setLevel] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const [studentsData, sessionsData] = await Promise.all([
                    api.getStudents(),
                    api.getMySessions(),
                ]);
                setStudents(studentsData);
                setSessions(sessionsData);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch students');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const getStudentInfo = (studentId: string) => {
        const enrolledClasses = new Set<string>();
        let nextSession: Session | null = null;
        const now = new Date();

        sessions.forEach((session) => {
            if (session.attendees.includes(studentId)) {
                enrolledClasses.add(session.classId || '');
                const sessionDate = new Date(session.startsAt);
                if (sessionDate > now) {
                    if (!nextSession || sessionDate < new Date(nextSession.startsAt)) {
                        nextSession = session;
                    }
                }
            }
        });

        return {
            enrolledCount: enrolledClasses.size,
            nextSessionDate: nextSession ? new Date(nextSession.startsAt).toLocaleDateString() : 'N/A',
            paymentStatus: 'N/A',
        };
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid':
                return <span className="px-3 py-1 text-xs font-semibold text-success bg-success/10 rounded-md">{status}</span>;
            case 'Pending':
                return <span className="px-3 py-1 text-xs font-semibold text-warning bg-warning/10 rounded-md">{status}</span>;
            case 'Overdue':
                return <span className="px-3 py-1 text-xs font-semibold text-error bg-error/10 rounded-md">{status}</span>;
            default:
                return <span className="px-3 py-1 text-xs font-semibold text-text-secondary bg-base-200 rounded-md">{status}</span>;
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setLevel('');
        setPassword('');
        setFormError(null);
        setIsSubmitting(false);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setFormError(null);
            const createdStudent = await api.createStudent({
                name,
                email,
                password,
                level,
                timezone: 'Asia/Kolkata',
            });
            setStudents((prev) => [createdStudent, ...prev]);
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            const message = err?.message || 'Failed to create student';
            setFormError(message);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-neutral">Manage Students</h2>
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            resetForm();
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                    >
                        + Add Student
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {loading && <p>Loading students...</p>}
                    {error && <p className="text-error">Error: {error}</p>}
                    {!loading && !error && (
                        <table className="w-full text-left min-w-[720px]">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Name</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Level</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-center">Classes</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Next Session</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Payments</th>
                                    <th className="p-4 font-bold text-sm text-text-secondary uppercase tracking-wider text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => {
                                    const info = getStudentInfo(student.id);
                                    return (
                                        <tr
                                            key={student.id}
                                            className="border-b border-slate-200/75 hover:bg-base-200/60 transition-colors duration-200"
                                        >
                                            <td className="p-4 flex items-center">
                                                <img
                                                    src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}`}
                                                    alt={student.name}
                                                    className="w-10 h-10 rounded-full mr-4 object-cover"
                                                />
                                                <div>
                                                    <p className="font-bold text-neutral">{student.name}</p>
                                                    <p className="text-sm text-text-secondary">{student.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">{student.level || 'N/A'}</td>
                                            <td className="p-4 text-center">{info.enrolledCount}</td>
                                            <td className="p-4">{info.nextSessionDate}</td>
                                            <td className="p-4">{getStatusBadge(info.paymentStatus)}</td>
                                            <td className="p-4">
                                                <button className="text-primary hover:underline font-semibold">View</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title="Add New Student"
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="level" className="block text-sm font-medium text-neutral">Level (e.g., A2, B1)</label>
                        <input
                            id="level"
                            type="text"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                    </div>
                    {formError && <p className="text-error text-sm">{formError}</p>}
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default AdminStudents;
