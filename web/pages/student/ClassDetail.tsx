import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import allUsers from '../../data/users.js';
import allClasses from '../../data/classes.js';
import allMaterials from '../../data/materials.js';
import allHomework from '../../data/homework.js';
import allSubmissions from '../../data/submissions.js';
import { UserRole, Submission } from '../../types';

const StudentClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Homework');

    const classInfo = useMemo(() => {
        const group = allClasses.groups.find(g => g.id === classId);
        const oneToOne = allClasses.oneToOnes.find(o => o.id === classId);
        return group || oneToOne;
    }, [classId]);

    const teacher = useMemo(() => {
        if (!classInfo) return null;
        return allUsers.find(u => u.id === classInfo.teacherId);
    }, [classInfo]);

    const materials = useMemo(() => allMaterials.filter(m => m.classId === classId), [classId]);
    
    const homework = useMemo(() => {
        const classHomework = allHomework.filter(hw => hw.classId === classId);
        const mySubmissions = new Map(
            (allSubmissions as Submission[])
                .filter(s => s.studentId === user!.id)
                .map(s => [s.homeworkId, s])
        );
        return classHomework.map(hw => ({ ...hw, submission: mySubmissions.get(hw.id) }));
    }, [classId, user]);
    
    if (!classInfo || !user) {
        return <Card title="Error"><p>Class not found.</p><Link to="/student/classes" className="text-primary hover:underline mt-4 inline-block">&larr; Back to my classes</Link></Card>;
    }
    
    const getStatusBadge = (submission?: Submission) => {
        const status = submission?.status || 'PENDING';
        switch (status) {
            case 'PENDING': return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-warning/10 text-warning">{status}</span>;
            case 'SUBMITTED': return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary">{status}</span>;
            case 'GRADED': return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-secondary/10 text-secondary">{status}</span>;
            default: return null;
        }
    };
    
    const tabs = ['Materials', 'Homework'];
    const tabClasses = (tabName: string) => 
        `px-6 py-3 font-semibold rounded-t-lg cursor-pointer transition-colors duration-200 ${
            activeTab === tabName ? 'bg-base-100 text-primary border-b-2 border-primary -mb-px' : 'bg-transparent text-text-secondary hover:text-primary'
        }`;

    return (
        <div className="space-y-6">
            <Card>
                <Link to="/student/classes" className="text-sm text-primary hover:underline mb-4 block">&larr; Back to my classes</Link>
                <h2 className="text-3xl font-bold tracking-tight">{classInfo.title}</h2>
                <p className="text-text-secondary">{classInfo.subject}</p>
                <p className="text-sm text-text-secondary mt-2">Teacher: {teacher?.name || 'N/A'}</p>
            </Card>

            <div>
                <div className="border-b border-slate-300 flex space-x-2">
                    {tabs.map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={tabClasses(tab)}>{tab}</button>))}
                </div>
                <Card className="rounded-t-none min-h-[300px]">
                    {activeTab === 'Materials' && (
                        <div>
                            <h3 className="text-xl font-semibold text-neutral mb-4">Class Materials</h3>
                            {materials.length > 0 ? (
                                <div className="space-y-3">
                                    {materials.map(m => (
                                        <div key={m.id} className="p-4 bg-base-200/60 rounded-xl flex justify-between items-center">
                                            <span>{m.title} ({m.type})</span>
                                            <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Download</a>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-center text-text-secondary py-8">No materials available for this class yet.</p>}
                        </div>
                    )}
                    {activeTab === 'Homework' && (
                        <div>
                            <h3 className="text-xl font-semibold text-neutral mb-4">My Homework</h3>
                            {homework.length > 0 ? (
                                <div className="space-y-3">
                                    {homework.map(hw => (
                                        <div key={hw.id} className="p-4 bg-base-200/60 rounded-xl flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-neutral">{hw.title}</p>
                                                <p className="text-sm text-text-secondary">Due: {new Date(hw.dueAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                {getStatusBadge(hw.submission)}
                                                {hw.submission?.status === 'GRADED' && <span className="font-bold text-secondary">{hw.submission.grade}%</span>}
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
    );
};

export default StudentClassDetail;