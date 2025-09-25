import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Group, OneToOne, Homework, Material, Submission } from '../../types';

interface ClassDetailState {
    type: 'GROUP' | 'ONE_TO_ONE';
    group?: Group;
    pair?: OneToOne;
}

type HomeworkWithSubmission = Homework & { submission?: Submission };

const StudentClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const { user } = useAuth();
    const [classDetail, setClassDetail] = useState<ClassDetailState | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [homework, setHomework] = useState<HomeworkWithSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!classId || !user) return;
            try {
                setLoading(true);
                let detail: ClassDetailState | null = null;
                let lastError: Error | null = null;

                try {
                    const groupData = await api.getGroupById(classId);
                    detail = { type: 'GROUP', group: groupData };
                } catch (groupErr: any) {
                    lastError = groupErr instanceof Error ? groupErr : new Error(groupErr?.message || 'Unable to load class');
                    try {
                        const pairData = await api.getPairById(classId);
                        detail = { type: 'ONE_TO_ONE', pair: pairData };
                        lastError = null;
                    } catch (pairErr: any) {
                        lastError = pairErr instanceof Error ? pairErr : new Error(pairErr?.message || 'Unable to load class');
                    }
                }

                if (!detail) {
                    throw lastError ?? new Error('Class not found');
                }

                const [materialsData, homeworkData] = await Promise.all([
                    api.getMaterialsForClass(classId),
                    api.getMyHomework(),
                ]);

                const filteredHomework = homeworkData
                    .filter((hw) => hw.classId === classId)
                    .map((hw) => ({
                        ...hw,
                        submission: hw.submissions?.[0],
                    }));

                setClassDetail(detail);
                setMaterials(materialsData);
                setHomework(filteredHomework);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load class details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [classId, user]);

    const classTitle = classDetail?.type === 'GROUP'
        ? classDetail.group?.title
        : classDetail?.pair?.title;

    const subject = classDetail?.type === 'GROUP'
        ? classDetail.group?.subject
        : classDetail?.pair?.subject;

    const teacherName = classDetail?.type === 'GROUP'
        ? classDetail.group?.teacher?.name
        : classDetail?.pair?.teacher?.name;

    if (loading) {
        return <Card>Loading class...</Card>;
    }

    if (error || !classDetail || !classTitle) {
        return (
            <Card title="Error">
                <p>{error || 'Class not found.'}</p>
                <Link to="/student/classes" className="text-primary hover:underline mt-4 inline-block">
                    &larr; Back to my classes
                </Link>
            </Card>
        );
    }

    const getStatusBadge = (submission?: Submission) => {
        const status = submission?.status || 'PENDING';
        switch (status) {
            case 'PENDING':
                return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-warning/10 text-warning">{status}</span>;
            case 'SUBMITTED':
                return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary">{status}</span>;
            case 'GRADED':
                return <span className="px-3 py-1 text-xs font-semibold rounded-md bg-secondary/10 text-secondary">{status}</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <Link to="/student/classes" className="text-sm text-primary hover:underline mb-4 block">
                    &larr; Back to my classes
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{classTitle}</h2>
                <p className="text-text-secondary">{subject}</p>
                <p className="text-sm text-text-secondary mt-2">Teacher: {teacherName || 'N/A'}</p>
            </Card>

            <Card title="Class Materials">
                {materials.length === 0 ? (
                    <p className="text-center text-text-secondary py-8">No materials available for this class yet.</p>
                ) : (
                    <div className="space-y-3">
                        {materials.map((material) => (
                            <div key={material.id} className="p-4 bg-base-200/60 rounded-xl flex justify-between items-center">
                                <span>{material.title} ({material.type})</span>
                                <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    View
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card title="My Homework">
                {homework.length === 0 ? (
                    <p className="text-center text-text-secondary py-8">No homework assigned for this class yet.</p>
                ) : (
                    <div className="space-y-3">
                        {homework.map((hw) => (
                            <div key={hw.id} className="p-4 bg-base-200/60 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-neutral">{hw.title}</p>
                                    <p className="text-sm text-text-secondary">Due: {new Date(hw.dueAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(hw.submission)}
                                    {hw.submission?.status === 'GRADED' && (
                                        <span className="font-bold text-secondary">{hw.submission.grade}%</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StudentClassDetail;
