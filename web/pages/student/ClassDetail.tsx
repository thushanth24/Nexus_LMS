import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import { Group, Homework, Material, OneToOne, Session, Submission } from '../../types';

type ClassDetailState =
    | { type: 'GROUP'; group: Group }
    | { type: 'ONE_TO_ONE'; pair: OneToOne };

type HomeworkWithSubmission = Homework & { submission?: Submission };

type MaterialTypeSummary = {
    label: string;
    count: number;
};

type HomeworkStatusSummary = {
    label: string;
    count: number;
};

type SummaryTileAccent = 'primary' | 'secondary' | 'neutral';

type SummaryTile = {
    label: string;
    value: string;
    description: string;
    accent: SummaryTileAccent;
};

const navigationItems = [
    { label: 'Overview', href: '#overview', active: true },
    { label: 'Materials', href: '#materials', active: false },
    { label: 'Assignments', href: '#assignments', active: false },
];

const formatMaterialTypeLabel = (type: string | undefined) => {
    if (!type) {
        return 'Resource';
    }

    const upper = type.toUpperCase();
    if (upper === 'PDF') {
        return 'Document';
    }

    if (upper === 'VIDEO') {
        return 'Video';
    }

    return upper;
};

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
            if (!classId || !user) {
                return;
            }

            try {
                setLoading(true);
                let detail: ClassDetailState | null = null;
                let lastError: Error | null = null;

                try {
                    const groupData = await api.getGroupById(classId);
                    detail = { type: 'GROUP', group: groupData };
                } catch (groupErr: any) {
                    lastError = groupErr instanceof Error
                        ? groupErr
                        : new Error(groupErr?.message || 'Unable to load class');

                    try {
                        const pairData = await api.getPairById(classId);
                        detail = { type: 'ONE_TO_ONE', pair: pairData };
                        lastError = null;
                    } catch (pairErr: any) {
                        lastError = pairErr instanceof Error
                            ? pairErr
                            : new Error(pairErr?.message || 'Unable to load class');
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

    const classTitle = useMemo(() => {
        if (!classDetail) {
            return '';
        }

        return classDetail.type === 'GROUP'
            ? classDetail.group.title
            : classDetail.pair.title;
    }, [classDetail]);

    const subject = useMemo(() => {
        if (!classDetail) {
            return '';
        }

        return classDetail.type === 'GROUP'
            ? classDetail.group.subject
            : classDetail.pair.subject;
    }, [classDetail]);

    const teacherName = useMemo(() => {
        if (!classDetail) {
            return '';
        }

        return classDetail.type === 'GROUP'
            ? classDetail.group.teacher?.name
            : classDetail.pair.teacher?.name;
    }, [classDetail]);

    const classTypeLabel = classDetail?.type === 'GROUP' ? 'Group class' : 'One-to-one coaching';

    const sessions: Session[] = useMemo(() => {
        if (!classDetail) {
            return [];
        }

        const classSessions = classDetail.type === 'GROUP'
            ? classDetail.group.sessions
            : classDetail.pair.sessions;

        return Array.isArray(classSessions) ? classSessions : [];
    }, [classDetail]);

    const upcomingSessions = useMemo(() => {
        const now = new Date();
        return sessions
            .filter((session) => new Date(session.startsAt) >= now)
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    }, [sessions]);

    const nextSession = upcomingSessions[0];

    const materialSummary: MaterialTypeSummary[] = useMemo(() => {
        const summaryMap: Record<string, number> = {};
        materials.forEach((material) => {
            const key = material.type.toLowerCase();
            summaryMap[key] = (summaryMap[key] ?? 0) + 1;
        });

        const entries = Object.entries(summaryMap)
            .sort(([, a], [, b]) => b - a)
            .map(([key, count]) => ({
                label: formatMaterialTypeLabel(key),
                count,
            }));

        return entries.length > 0
            ? entries
            : [{ label: 'Resources', count: 0 }];
    }, [materials]);

    const homeworkSummary: HomeworkStatusSummary[] = useMemo(() => {
        const summaryMap: Record<string, number> = {
            pending: 0,
            submitted: 0,
            graded: 0,
        };

        homework.forEach((hw) => {
            const status = hw.submission?.status?.toLowerCase() ?? 'pending';
            if (status in summaryMap) {
                summaryMap[status] += 1;
            } else {
                summaryMap.pending += 1;
            }
        });

        return [
            { label: 'Pending', count: summaryMap.pending },
            { label: 'Submitted', count: summaryMap.submitted },
            { label: 'Graded', count: summaryMap.graded },
        ];
    }, [homework]);

    const formatDateTime = (iso?: string | null) => {
        if (!iso) {
            return 'Not scheduled yet';
        }

        const value = new Date(iso);
        return value.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const formatDueDate = (iso: string) => {
        const value = new Date(iso);
        return value.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
    };

    const totalAssignments = homework.length;
    const submittedAssignments = homework.filter((hw) => hw.submission?.status === 'SUBMITTED').length;
    const gradedAssignments = homework.filter((hw) => hw.submission?.status === 'GRADED').length;
    const completedAssignments = submittedAssignments + gradedAssignments;
    const assignmentProgress = totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    const summaryTiles: SummaryTile[] = useMemo(() => {
        const nextSessionValue = nextSession
            ? formatDateTime(nextSession.startsAt)
            : 'Not scheduled';

        const topMaterialType = materialSummary[0];

        return [
            {
                label: 'Resources',
                value: String(materials.length),
                description: topMaterialType
                    ? `${topMaterialType.count} ${topMaterialType.label.toLowerCase()} available`
                    : 'Course assets ready to download',
                accent: 'primary',
            },
            {
                label: 'Assignments completed',
                value: `${completedAssignments}/${totalAssignments || 0}`,
                description: totalAssignments > 0
                    ? `${assignmentProgress}% of coursework submitted`
                    : 'No assignments yet',
                accent: 'secondary',
            },
            {
                label: 'Next session',
                value: nextSessionValue,
                description: teacherName
                    ? `Hosted by ${teacherName}`
                    : 'Awaiting tutor details',
                accent: 'neutral',
            },
        ];
    }, [assignmentProgress, completedAssignments, materials.length, materialSummary, nextSession, teacherName, totalAssignments]);

    if (loading) {
        return <Card>Loading class...</Card>;
    }

    if (error || !classDetail || !classTitle) {
        return (
            <Card title="Error">
                <p>{error || 'Class not found.'}</p>
                <Link to="/student/classes" className="mt-4 inline-block text-primary hover:underline">
                    &larr; Back to my classes
                </Link>
            </Card>
        );
    }

    const getStatusBadge = (submission?: Submission) => {
        const status = submission?.status || 'PENDING';

        switch (status) {
            case 'PENDING':
                return <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">Pending</span>;
            case 'SUBMITTED':
                return <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Submitted</span>;
            case 'GRADED':
                return <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Graded</span>;
            default:
                return null;
        }
    };

    const accentClasses: Record<SummaryTileAccent, string> = {
        primary: 'border-primary/20 bg-primary/10 text-primary',
        secondary: 'border-secondary/20 bg-secondary/10 text-secondary',
        neutral: 'border-base-200 bg-base-200/70 text-neutral',
    };

    return (
        <div className="space-y-5" id="overview">
            <Card className="border-base-200 bg-base-200/70 shadow-sm">
                <div className="space-y-4">
                    <nav className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <Link to="/student/dashboard" className="hover:text-primary">Dashboard</Link>
                        <span>&rsaquo;</span>
                        <Link to="/student/classes" className="hover:text-primary">My classes</Link>
                        <span>&rsaquo;</span>
                        <span className="text-gray-600">{classTitle}</span>
                    </nav>
                    <h1 className="text-3xl font-semibold text-neutral lg:text-4xl">{classTitle}</h1>
                </div>
            </Card>

            <Card className="border-base-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {navigationItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={item.active
                                ? 'rounded-lg border border-primary bg-primary/10 px-4 py-2 font-semibold text-primary'
                                : 'rounded-lg border border-base-200 px-4 py-2 text-gray-600 hover:border-primary/40 hover:text-primary'}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </Card>

            <Card className="border-base-200 shadow-sm">
                <div className="grid gap-4 md:grid-cols-3">
                    {summaryTiles.map((tile) => (
                        <div
                            key={tile.label}
                            className={`rounded-xl border px-4 py-3 shadow-sm ${accentClasses[tile.accent]}`}
                        >
                            <p className="text-xs uppercase tracking-wide">{tile.label}</p>
                            <p className="text-xl font-semibold">{tile.value}</p>
                            <p className="text-xs text-neutral/80">{tile.description}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-5">
                    <div id="materials">
                        <Card title="Course content" className="border-base-200 shadow-sm">
                            {materials.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-base-200 bg-base-200/40 px-4 py-8 text-center text-sm text-gray-500">
                                No materials available for this class yet.
                            </p>
                        ) : (
                                <ul className="space-y-3">
                                {materials.map((material) => (
                                    <li
                                        key={material.id}
                                        className="flex flex-col gap-3 rounded-lg border border-base-200 bg-white px-4 py-3 shadow-sm transition hover:border-primary/30 hover:-translate-y-0.5"
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-neutral">{material.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatMaterialTypeLabel(material.type)} &middot; Added {formatDateTime(material.createdAt)}
                                                </p>
                                            </div>
                                            <a
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                                            >
                                                Open resource
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        </Card>
                    </div>

                    <div id="assignments">
                        <Card title="Assignments" className="border-base-200 shadow-sm">
                            {totalAssignments > 0 && (
                                <div className="mb-5">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Progress</p>
                                <div className="mt-2 h-2 w-full rounded-full bg-base-200">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${assignmentProgress}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {completedAssignments} of {totalAssignments} assignments submitted or graded.
                                </p>
                            </div>
                        )}

                        {homework.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-base-200 bg-base-200/40 px-4 py-8 text-center text-sm text-gray-500">
                                No assignments have been released for this class yet.
                            </p>
                        ) : (
                                <ul className="space-y-3">
                                {homework.map((hw) => (
                                    <li
                                        key={hw.id}
                                        className="flex flex-col gap-3 rounded-lg border border-base-200 bg-white px-4 py-3 shadow-sm transition hover:border-secondary/30 hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-neutral">{hw.title}</p>
                                            <p className="text-xs text-gray-500">Due {formatDueDate(hw.dueAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(hw.submission)}
                                            {hw.submission?.status === 'GRADED' && (
                                                <span className="text-sm font-semibold text-secondary">{hw.submission.grade ?? 0}%</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        </Card>
                    </div>
                </div>

                <aside className="space-y-5">
                    <Card title="Class snapshot" className="border-base-200 shadow-sm">
                        <dl className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <dt>Class type</dt>
                                <dd className="font-semibold text-neutral">{classTypeLabel}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Tutor</dt>
                                <dd className="font-semibold text-neutral">{teacherName || 'To be confirmed'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Resources</dt>
                                <dd className="font-semibold text-neutral">{materials.length}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Assignments</dt>
                                <dd className="font-semibold text-neutral">{homework.length}</dd>
                            </div>
                        </dl>
                        <div className="mt-4 border-t border-base-200 pt-3">
                            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Resource breakdown</p>
                            <ul className="space-y-1 text-xs text-gray-600">
                                {materialSummary.map((summary) => (
                                    <li key={summary.label} className="flex justify-between">
                                        <span>{summary.label}</span>
                                        <span>{summary.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>

                    <Card title="Upcoming events" className="border-base-200 shadow-sm">
                        {upcomingSessions.length === 0 ? (
                            <p className="text-sm text-gray-500">No upcoming sessions scheduled yet.</p>
                        ) : (
                            <ul className="space-y-3 text-sm text-gray-600">
                                {upcomingSessions.slice(0, 3).map((session) => (
                                    <li key={session.id} className="rounded-lg border border-base-200 bg-base-200/40 px-3 py-2">
                                        <p className="font-semibold text-neutral">{session.title}</p>
                                        <p className="text-xs text-gray-500">Starts {formatDateTime(session.startsAt)}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link
                            to="/student/schedule"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                        >
                            View full schedule
                        </Link>
                    </Card>

                    <Card title="Assignment status" className="border-base-200 shadow-sm">
                        <ul className="space-y-2 text-sm text-gray-600">
                            {homeworkSummary.map((summary) => (
                                <li key={summary.label} className="flex items-center justify-between rounded-lg bg-base-200/40 px-3 py-2">
                                    <span>{summary.label}</span>
                                    <span className="font-semibold text-neutral">{summary.count}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title="Helpful links" className="border-base-200 shadow-sm">
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/student/homework" className="text-primary hover:underline">
                                    Go to homework area
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/progress" className="text-primary hover:underline">
                                    View progress report
                                </Link>
                            </li>
                        </ul>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

export default StudentClassDetail;
