import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import { Group, OneToOne, Homework, Submission, Session, User, Material } from '../../types';

interface ClassDetailState {
    type: 'GROUP' | 'ONE_TO_ONE';
    group?: Group;
    pair?: OneToOne;
}

interface HomeworkWithSubmissions extends Homework {
    submissions: Submission[];
}

const TeacherClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [classDetail, setClassDetail] = useState<ClassDetailState | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [homework, setHomework] = useState<HomeworkWithSubmissions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [gradeError, setGradeError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClassDetail = async () => {
            if (!classId) return;
            try {
                setLoading(true);
                let detail: ClassDetailState | null = null;
                let lastError: Error | null = null;

                try {
                    const groupData = await api.getGroupById(classId);
                    detail = { type: 'GROUP', group: groupData };
                } catch (groupError: any) {
                    lastError = groupError instanceof Error ? groupError : new Error(groupError?.message || 'Unable to load class');
                    try {
                        const pairData = await api.getPairById(classId);
                        detail = { type: 'ONE_TO_ONE', pair: pairData };
                        lastError = null;
                    } catch (pairError: any) {
                        lastError = pairError instanceof Error ? pairError : new Error(pairError?.message || 'Unable to load class');
                    }
                }

                if (!detail) {
                    throw lastError ?? new Error('Class not found');
                }

                const [materialsData, homeworkData] = await Promise.all([
                    api.getMaterialsForClass(classId),
                    api.getHomeworkForClass(classId),
                ]);

                setClassDetail(detail);
                setMaterials(materialsData);
                setHomework(homeworkData.map((hw) => ({
                    ...hw,
                    submissions: hw.submissions ?? [],
                })));
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load class details');
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetail();
    }, [classId]);

    const classTitle = classDetail?.type === 'GROUP'
        ? classDetail.group?.title
        : classDetail?.pair?.title;

    const subject = classDetail?.type === 'GROUP'
        ? classDetail.group?.subject
        : classDetail?.pair?.subject;

    const teacherName = classDetail?.type === 'GROUP'
        ? classDetail.group?.teacher?.name
        : classDetail?.pair?.teacher?.name;

    const roster = useMemo((): User[] => {
        if (classDetail?.type === 'GROUP') {
            return classDetail.group?.members ?? [];
        }
        if (classDetail?.type === 'ONE_TO_ONE' && classDetail.pair?.student) {
            return [classDetail.pair.student];
        }
        return [];
    }, [classDetail]);

    const sessions: Session[] = useMemo(() => {
        if (classDetail?.type === 'GROUP') {
            return classDetail.group?.sessions ?? [];
        }
        if (classDetail?.type === 'ONE_TO_ONE') {
            return classDetail.pair?.sessions ?? [];
        }
        return [];
    }, [classDetail]);

    const openGradeModal = (submission: Submission) => {
        setCurrentSubmission(submission);
        setGrade(submission.grade?.toString() ?? '');
        setFeedback(submission.feedback ?? '');
        setGradeError(null);
        setIsGradeModalOpen(true);
    };

    const handleGradeFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!currentSubmission) return;
        try {
            setGradeError(null);
            const updated = await api.gradeSubmission(currentSubmission.submissionId, {
                grade: Number(grade),
                feedback,
            });

            setHomework((prev) =>
                prev.map((hw) => ({
                    ...hw,
                    submissions: hw.submissions.map((submission) =>
                        submission.submissionId === updated.submissionId ? updated : submission,
                    ),
                })),
            );

            setIsGradeModalOpen(false);
            setCurrentSubmission(null);
        } catch (err: any) {
            setGradeError(err.message || 'Failed to save grade');
        }
    };

    if (loading) {
        return <Card>Loading class details...</Card>;
    }

    if (error || !classDetail || !classTitle || !subject) {
        return (
            <Card title="Error">
                <p>{error || 'Class not found.'}</p>
                <Link to="/teacher/classes" className="text-primary hover:underline mt-4 inline-block">
                    &larr; Back to all classes
                </Link>
            </Card>
        );
    }

    const sessionsByDate = sessions
        .map((session) => ({
            ...session,
            startsAtDate: new Date(session.startsAt),
        }))
        .sort((a, b) => a.startsAtDate.getTime() - b.startsAtDate.getTime());

    return (
        <>
            <Card>
                <Link to="/teacher/classes" className="text-sm text-primary hover:underline mb-4 block">
                    &larr; Back to all classes
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{classTitle}</h2>
                <p className="text-text-secondary">{subject}</p>
                <p className="text-sm text-text-secondary mt-2">Teacher: {teacherName || 'You'}</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Roster" className="lg:col-span-1">
                    {roster.length === 0 ? (
                        <p className="text-text-secondary">No students enrolled yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {roster.map((student) => (
                                <li key={student.id} className="flex items-center gap-3">
                                    <img
                                        src={student.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}`}
                                        alt={student.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-neutral">{student.name}</p>
                                        <p className="text-sm text-text-secondary">{student.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Upcoming Sessions" className="lg:col-span-2">
                    {sessionsByDate.length === 0 ? (
                        <p className="text-text-secondary">No sessions scheduled.</p>
                    ) : (
                        <ul className="space-y-3">
                            {sessionsByDate.map((session) => (
                                <li
                                    key={session.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-base-200/50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold text-neutral">{session.title}</p>
                                        <p className="text-sm text-text-secondary">
                                            {session.startsAtDate.toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/teacher/session/${session.id}`}
                                        className="mt-3 sm:mt-0 px-4 py-2 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transition"
                                    >
                                        Open session
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <Card title="Materials">
                {materials.length === 0 ? (
                    <p className="text-text-secondary">No materials uploaded yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {materials.map((material) => (
                            <li key={material.id} className="p-3 bg-base-200/60 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-neutral">{material.title}</p>
                                    <p className="text-sm text-text-secondary uppercase">{material.type}</p>
                                </div>
                                <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-semibold"
                                >
                                    View
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <Card title="Homework">
                {homework.length === 0 ? (
                    <p className="text-text-secondary">No homework assigned yet.</p>
                ) : (
                    <div className="space-y-4">
                        {homework.map((hw) => (
                            <div key={hw.id} className="p-4 bg-base-200/60 rounded-xl">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral">{hw.title}</h3>
                                        <p className="text-sm text-text-secondary">Due: {new Date(hw.dueAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        <p className="text-sm text-text-secondary mt-2 max-w-2xl">{hw.instructions}</p>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary uppercase">
                                        {hw.type}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-neutral uppercase tracking-wide mb-2">Submissions</h4>
                                    {hw.submissions.length === 0 ? (
                                        <p className="text-text-secondary text-sm">No submissions yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {hw.submissions.map((submission) => (
                                                <div
                                                    key={submission.submissionId}
                                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-base-100 rounded-lg border border-base-200"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-neutral">Student ID: {submission.studentId}</p>
                                                        <p className="text-sm text-text-secondary">
                                                            Status: {submission.status}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                                        {submission.status === 'GRADED' && (
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-md bg-secondary/10 text-secondary">
                                                                {submission.grade}%
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => openGradeModal(submission)}
                                                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary to-blue-400 text-white hover:shadow-lg transition"
                                                        >
                                                            {submission.status === 'GRADED' ? 'Update Grade' : 'Grade'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                isOpen={isGradeModalOpen}
                onClose={() => setIsGradeModalOpen(false)}
                title={`Grade Submission: ${currentSubmission?.studentId ?? ''}`}
            >
                {currentSubmission && (
                    <form onSubmit={handleGradeFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral">Student submission</label>
                            <div className="mt-1 p-3 bg-base-200/50 rounded-lg border h-32 overflow-y-auto">
                                <p>{currentSubmission.content.text || 'No text submitted.'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="grade" className="block text-sm font-medium text-neutral">
                                    Grade (out of 100)
                                </label>
                                <input
                                    id="grade"
                                    type="number"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    required
                                    min={0}
                                    max={100}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-neutral">Feedback</label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                required
                                rows={4}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                            />
                        </div>
                        {gradeError && <p className="text-error text-sm">{gradeError}</p>}
                        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                            <button
                                type="button"
                                onClick={() => setIsGradeModalOpen(false)}
                                className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                            >
                                Save Grade
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default TeacherClassDetail;
