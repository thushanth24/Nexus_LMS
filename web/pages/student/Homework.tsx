import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Homework, Submission } from '../../types';

type HomeworkWithSubmission = Homework & { submission?: Submission };
type FilterStatus = 'All' | 'Pending' | 'Submitted' | 'Graded';

const StudentHomework: React.FC = () => {
    const { user } = useAuth();
    const [homework, setHomework] = useState<HomeworkWithSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterStatus>('All');

    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [currentHomework, setCurrentHomework] = useState<HomeworkWithSubmission | null>(null);
    const [submissionText, setSubmissionText] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHomework = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const data = await api.getMyHomework();
                setHomework(
                    data.map((hw) => ({
                        ...hw,
                        submission: hw.submissions?.[0],
                    })),
                );
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch homework');
            } finally {
                setLoading(false);
            }
        };

        fetchHomework();
    }, [user]);

    const filteredHomework = useMemo(() => {
        if (filter === 'All') return homework;
        return homework.filter((hw) => {
            const status = hw.submission?.status || 'PENDING';
            return status === filter.toUpperCase();
        });
    }, [filter, homework]);

    const openSubmitModal = (hw: HomeworkWithSubmission) => {
        setCurrentHomework(hw);
        setSubmissionText(hw.submission?.content?.text || '');
        setSubmitError(null);
        setIsSubmitModalOpen(true);
    };

    const openFeedbackModal = (hw: HomeworkWithSubmission) => {
        setCurrentHomework(hw);
        setIsFeedbackModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentHomework) return;
        try {
            const updatedSubmission = await api.submitHomework({
                homeworkId: currentHomework.id,
                content: { text: submissionText },
            });

            setHomework((prev) =>
                prev.map((hw) =>
                    hw.id === currentHomework.id
                        ? { ...hw, submission: updatedSubmission }
                        : hw,
                ),
            );

            setIsSubmitModalOpen(false);
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to submit homework');
        }
    };

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

    const filterButtonClasses = (btnFilter: FilterStatus) =>
        `px-4 py-2 font-semibold rounded-lg transition-colors duration-200 ${
            filter === btnFilter
                ? 'bg-primary text-white shadow'
                : 'bg-transparent text-text-secondary hover:bg-primary/10 hover:text-primary'
        }`;

    return (
        <>
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-neutral">My Homework</h2>
                    <div className="flex flex-wrap justify-center gap-2 p-1 bg-base-200 rounded-xl md:flex-nowrap md:space-x-2">
                        <button onClick={() => setFilter('All')} className={filterButtonClasses('All')}>
                            All
                        </button>
                        <button onClick={() => setFilter('Pending')} className={filterButtonClasses('Pending')}>
                            Pending
                        </button>
                        <button onClick={() => setFilter('Submitted')} className={filterButtonClasses('Submitted')}>
                            Submitted
                        </button>
                        <button onClick={() => setFilter('Graded')} className={filterButtonClasses('Graded')}>
                            Graded
                        </button>
                    </div>
                </div>

                {loading && <p className="text-center py-12">Loading homework...</p>}
                {error && <p className="text-center text-error py-12">{error}</p>}

                {!loading && !error && (
                    <div className="space-y-4">
                        {filteredHomework.map((hw) => (
                            <div
                                key={hw.id}
                                className="p-4 my-2 bg-base-200/60 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center hover:bg-base-300/60 transition-colors duration-200"
                            >
                                <div>
                                    <p className="font-bold text-lg text-neutral">{hw.title}</p>
                                    <p className="text-sm text-text-secondary">Due: {new Date(hw.dueAt).toLocaleDateString()}</p>
                                </div>
                                <div className="self-end sm:self-center mt-3 sm:mt-0 flex items-center gap-4">
                                    {getStatusBadge(hw.submission)}
                                    <div className="flex gap-4">
                                        {hw.submission?.status === 'GRADED' && (
                                            <button
                                                onClick={() => openFeedbackModal(hw)}
                                                className="text-sm text-secondary hover:underline font-semibold"
                                            >
                                                View Feedback
                                            </button>
                                        )}
                                        {(hw.submission?.status === 'PENDING' || hw.submission?.status === 'SUBMITTED') && (
                                            <button
                                                onClick={() => openSubmitModal(hw)}
                                                className="text-sm text-primary hover:underline font-semibold"
                                            >
                                                {hw.submission?.status === 'SUBMITTED' ? 'Edit Submission' : 'Submit'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredHomework.length === 0 && (
                            <p className="text-center text-text-secondary py-12">No {filter !== 'All' ? filter.toLowerCase() : ''} homework.</p>
                        )}
                    </div>
                )}
            </Card>

            <Modal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title={currentHomework ? `Submit: ${currentHomework.title}` : 'Submit Homework'}
            >
                {currentHomework && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral">Instructions</label>
                            <p className="mt-1 text-sm text-text-secondary p-3 bg-base-200/50 rounded-lg border">
                                {currentHomework.instructions}
                            </p>
                        </div>
                        <div>
                            <label htmlFor="submissionText" className="block text-sm font-medium text-neutral">
                                Your Submission
                            </label>
                            <textarea
                                id="submissionText"
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                required
                                rows={8}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                            />
                        </div>
                        {submitError && <p className="text-error text-sm">{submitError}</p>}
                        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                            <button
                                type="button"
                                onClick={() => setIsSubmitModalOpen(false)}
                                className="px-4 py-2 bg-base-200 text-neutral font-semibold rounded-lg hover:bg-base-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                            >
                                Submit Homework
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                title={currentHomework ? `Feedback: ${currentHomework.title}` : 'Feedback'}
            >
                {currentHomework?.submission && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral">Grade</label>
                            <p className="text-4xl font-bold text-primary">{currentHomework.submission.grade ?? 0}/100</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral">Feedback from Teacher</label>
                            <div className="mt-1 p-3 bg-base-200/50 rounded-lg border">
                                <p>{currentHomework.submission.feedback || 'No feedback provided yet.'}</p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsFeedbackModalOpen(false)}
                                className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default StudentHomework;
