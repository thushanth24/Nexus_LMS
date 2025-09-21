import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import allUsers from '../../data/users.js';
import allClasses from '../../data/classes.js';
import allSchedule from '../../data/schedule.js';
import allMaterials from '../../data/materials.js';
import allHomeworkData from '../../data/homework.js';
import allSubmissionsData from '../../data/submissions.js';
import { User, UserRole, Homework, Submission } from '../../types';

const TeacherClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [activeTab, setActiveTab] = useState('Homework');

    const [homework, setHomework] = useState<Homework[]>(() => 
        (allHomeworkData as Homework[]).filter(hw => hw.classId === classId)
    );
    const [submissions, setSubmissions] = useState<Submission[]>(() => 
        allSubmissionsData as Submission[]
    );
    
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

    // Form state for new homework
    const [hwTitle, setHwTitle] = useState('');
    const [hwInstructions, setHwInstructions] = useState('');
    const [hwDueDate, setHwDueDate] = useState('');
    
    // Form state for grading
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    const classInfo = useMemo(() => {
        const group = allClasses.groups.find(g => g.id === classId);
        const oneToOne = allClasses.oneToOnes.find(o => o.id === classId);
        return group || oneToOne;
    }, [classId]);

    const roster = useMemo(() => {
        if (!classInfo) return [];
        if ('studentId' in classInfo) {
            return allUsers.filter(u => u.id === classInfo.studentId);
        }
        const studentIds = new Set<string>();
        allSchedule.forEach(session => {
            if (session.classId === classId) {
                session.attendees.forEach(id => studentIds.add(id));
            }
        });
        return allUsers.filter(user => user.role === UserRole.STUDENT && studentIds.has(user.id));
    }, [classInfo, classId]);

    const materials = useMemo(() => allMaterials.filter(m => m.classId === classId), [classId]);
    
    if (!classInfo) {
        return <Card title="Error"><p>Class not found.</p><Link to="/teacher/classes" className="text-primary hover:underline mt-4 inline-block">&larr; Back to all classes</Link></Card>;
    }

    const handleAssignFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newHomework: Homework = {
            id: `h_${new Date().getTime()}`,
            classId: classId!,
            title: hwTitle,
            instructions: hwInstructions,
            dueAt: new Date(hwDueDate).toISOString(),
            type: 'text',
        };
        setHomework(prev => [...prev, newHomework]);
        // Also create PENDING submissions for all students in roster
        const newSubmissions = roster.map(student => ({
            submissionId: `sub_${new Date().getTime()}_${student.id}`,
            homeworkId: newHomework.id,
            studentId: student.id,
            submittedAt: null,
            content: {},
            status: 'PENDING' as const,
        }));
        setSubmissions(prev => [...prev, ...newSubmissions]);

        setIsAssignModalOpen(false);
        setHwTitle('');
        setHwInstructions('');
        setHwDueDate('');
    };
    
    const openGradeModal = (submission: Submission) => {
        setCurrentSubmission(submission);
        setGrade(submission.grade?.toString() || '');
        setFeedback(submission.feedback || '');
        setIsGradeModalOpen(true);
    };

    const handleGradeFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSubmission) return;
        setSubmissions(prev => prev.map(s => 
            s.submissionId === currentSubmission.submissionId 
            ? { ...s, status: 'GRADED', grade: Number(grade), feedback: feedback }
            : s
        ));
        setIsGradeModalOpen(false);
        setCurrentSubmission(null);
    };

    const getStatusBadge = (status: Submission['status']) => {
        switch (status) {
            case 'PENDING': return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-warning/10 text-warning">{status}</span>;
            case 'SUBMITTED': return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary">{status}</span>;
            case 'GRADED': return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-secondary/10 text-secondary">{status}</span>;
        }
    };
    
    const currentStudentForGrading = allUsers.find(u => u.id === currentSubmission?.studentId);

    const tabs = ['Roster', 'Materials', 'Homework'];
    const tabClasses = (tabName: string) => 
        `px-4 sm:px-6 py-3 font-semibold rounded-t-lg cursor-pointer transition-colors duration-200 whitespace-nowrap ${
            activeTab === tabName ? 'bg-base-100 text-primary border-b-2 border-primary -mb-px' : 'bg-transparent text-text-secondary hover:text-primary'
        }`;

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <Link to="/teacher/classes" className="text-sm text-primary hover:underline mb-4 block">&larr; Back to all classes</Link>
                    <h2 className="text-3xl font-bold tracking-tight">{classInfo.title}</h2>
                    <p className="text-text-secondary capitalize">{ 'subject' in classInfo ? classInfo.subject : ''} / { 'studentId' in classInfo ? 'One-to-One' : 'Group'}</p>
                </Card>

                <div>
                    <div className="border-b border-slate-300 flex overflow-x-auto">
                        {tabs.map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={tabClasses(tab)}>{tab}</button>))}
                    </div>
                    <Card className="rounded-t-none min-h-[400px]">
                        {activeTab === 'Roster' && (
                            <div>Roster content...</div>
                        )}
                        {activeTab === 'Materials' && (
                             <div>Materials content...</div>
                        )}
                        {activeTab === 'Homework' && (
                             <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <h3 className="text-xl font-semibold text-neutral">Assigned Homework</h3>
                                    <button onClick={() => setIsAssignModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-secondary to-green-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">+ Assign Homework</button>
                                </div>
                                 {homework.length > 0 ? (
                                    <div className="space-y-6">
                                        {homework.map(hw => (
                                            <div key={hw.id}>
                                                <h4 className="font-bold text-lg text-neutral">{hw.title}</h4>
                                                <p className="text-sm text-text-secondary mb-2">Due: {new Date(hw.dueAt).toLocaleDateString()}</p>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm min-w-[400px]">
                                                        <thead className="bg-base-200/60">
                                                            <tr>
                                                                <th className="p-2 font-semibold text-text-secondary">Student</th>
                                                                <th className="p-2 font-semibold text-text-secondary">Status</th>
                                                                <th className="p-2 font-semibold text-text-secondary">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {roster.map(student => {
                                                                const submission = submissions.find(s => s.homeworkId === hw.id && s.studentId === student.id);
                                                                return (
                                                                    <tr key={student.id} className="border-b border-slate-200/75">
                                                                        <td className="p-2 font-medium text-neutral">{student.name}</td>
                                                                        <td className="p-2">{getStatusBadge(submission?.status || 'PENDING')}</td>
                                                                        <td className="p-2">
                                                                            {submission?.status === 'SUBMITTED' && <button onClick={() => openGradeModal(submission)} className="font-semibold text-primary hover:underline">Grade</button>}
                                                                            {submission?.status === 'GRADED' && <button onClick={() => openGradeModal(submission)} className="font-semibold text-secondary hover:underline">View Grade</button>}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-center text-text-secondary py-8">No homework assigned for this class yet.</p>}
                             </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* FIX: Moved form content inside the Modal component to pass it as the 'children' prop. */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign New Homework">
                <form onSubmit={handleAssignFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="hwTitle" className="block text-sm font-medium text-neutral">Title</label>
                        <input id="hwTitle" type="text" value={hwTitle} onChange={e => setHwTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div>
                        <label htmlFor="hwInstructions" className="block text-sm font-medium text-neutral">Instructions</label>
                        <textarea id="hwInstructions" value={hwInstructions} onChange={e => setHwInstructions(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
                    </div>
                    <div>
                        <label htmlFor="hwDueDate" className="block text-sm font-medium text-neutral">Due Date</label>
                        <input id="hwDueDate" type="datetime-local" value={hwDueDate} onChange={e => setHwDueDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                            Assign Homework
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} title={`Grade Submission: ${currentStudentForGrading?.name}`}>
                {currentSubmission && (
                    <form onSubmit={handleGradeFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral">Student's Submission</label>
                            <div className="mt-1 p-3 bg-base-200/50 rounded-lg border h-32 overflow-y-auto">
                                <p>{currentSubmission.content.text || "No text content."}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="grade" className="block text-sm font-medium text-neutral">Grade (out of 100)</label>
                                <input id="grade" type="number" value={grade} onChange={e => setGrade(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-neutral">Feedback</label>
                            <textarea id="feedback" value={feedback} onChange={e => setFeedback(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                            <button type="button" onClick={() => setIsGradeModalOpen(false)} className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">Save Grade</button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default TeacherClassDetail;