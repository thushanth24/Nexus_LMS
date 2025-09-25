import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import { Group, OneToOne, Session } from '../../types';

type ViewMode = 'GRID' | 'LIST';
type ClassTypeFilter = 'ALL' | 'GROUP' | 'ONE_TO_ONE';

type EnrolledClass = {
    id: string;
    title: string;
    subject: string;
    teacherName: string;
    type: 'GROUP' | 'ONE_TO_ONE';
    nextSession?: string | null;
};

const StudentClasses: React.FC = () => {
    const { user } = useAuth();
    const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('GRID');
    const [selectedType, setSelectedType] = useState<ClassTypeFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

    const formatNextSession = (iso?: string | null) => {
        if (!iso) {
            return 'Not scheduled yet';
        }

        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    useEffect(() => {
        const fetchClasses = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const [mySessions, groups, pairs] = await Promise.all([
                    api.getMySessions(),
                    api.getMyEnrolledGroups(),
                    api.getMyEnrolledPairs(),
                ]);

                const nextSessionByClass = new Map<string, Session>();
                mySessions.forEach((session: Session) => {
                    const current = nextSessionByClass.get(session.classId);
                    if (!current || new Date(session.startsAt) < new Date(current.startsAt)) {
                        nextSessionByClass.set(session.classId, session);
                    }
                });

                const mappedGroups = groups.map((g: Group) => ({
                    id: g.id,
                    title: g.title,
                    subject: g.subject,
                    teacherName: g.teacher?.name || 'N/A',
                    type: 'GROUP' as const,
                    nextSession: nextSessionByClass.get(g.id)?.startsAt ?? null,
                }));

                const mappedPairs = pairs.map((p: OneToOne) => ({
                    id: p.id,
                    title: p.title,
                    subject: p.subject,
                    teacherName: p.teacher?.name || 'N/A',
                    type: 'ONE_TO_ONE' as const,
                    nextSession: nextSessionByClass.get(p.id)?.startsAt ?? null,
                }));

                const combined = [...mappedGroups, ...mappedPairs].sort((a, b) => {
                    const aTime = a.nextSession ? new Date(a.nextSession).getTime() : Number.POSITIVE_INFINITY;
                    const bTime = b.nextSession ? new Date(b.nextSession).getTime() : Number.POSITIVE_INFINITY;

                    if (aTime !== bTime) {
                        return aTime - bTime;
                    }

                    return a.title.localeCompare(b.title);
                });

                setEnrolledClasses(combined);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch classes');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user]);

    const stats = useMemo(() => {
        const total = enrolledClasses.length;
        const groupsCount = enrolledClasses.filter((c) => c.type === 'GROUP').length;
        const oneToOneCount = enrolledClasses.filter((c) => c.type === 'ONE_TO_ONE').length;
        const upcomingCount = enrolledClasses.filter((c) => Boolean(c.nextSession)).length;
        const teacherCount = new Set(enrolledClasses.map((c) => c.teacherName)).size;

        return { total, groupsCount, oneToOneCount, upcomingCount, teacherCount };
    }, [enrolledClasses]);

    const heroClass = useMemo(() => {
        const upcoming = enrolledClasses.filter((c) => c.nextSession);
        if (upcoming.length === 0) {
            return null;
        }

        return upcoming.reduce((earliest, current) => {
            if (!earliest.nextSession) {
                return current;
            }

            return new Date(current.nextSession || 0).getTime() < new Date(earliest.nextSession).getTime()
                ? current
                : earliest;
        });
    }, [enrolledClasses]);

    const filteredClasses = useMemo(() => {
        return enrolledClasses
            .filter((c) => selectedType === 'ALL' || c.type === selectedType)
            .filter((c) => {
                if (!searchTerm.trim()) {
                    return true;
                }

                const term = searchTerm.trim().toLowerCase();
                return (
                    c.title.toLowerCase().includes(term) ||
                    c.subject.toLowerCase().includes(term) ||
                    c.teacherName.toLowerCase().includes(term)
                );
            })
            .filter((c) => !showUpcomingOnly || Boolean(c.nextSession));
    }, [enrolledClasses, selectedType, searchTerm, showUpcomingOnly]);

    const hasFiltersApplied = selectedType !== 'ALL' || Boolean(searchTerm.trim()) || showUpcomingOnly;
    const noResults = !loading && !error && filteredClasses.length === 0;

    const getTypeLabel = (type: 'GROUP' | 'ONE_TO_ONE') => (type === 'GROUP' ? 'Group Class' : 'One-to-One Coaching');

    const renderGridCard = (c: EnrolledClass) => {
        const sessionText = formatNextSession(c.nextSession);
        const badgeClasses = c.type === 'GROUP'
            ? 'bg-primary/10 text-primary'
            : 'bg-secondary/10 text-secondary';

        return (
            <Card
                key={`${c.id}-grid`}
                className="flex flex-col gap-4 shadow-xl border-base-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            >
                <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClasses}`}>
                        {getTypeLabel(c.type)}
                    </span>
                    <span className="text-xs text-gray-400">
                        {c.nextSession ? 'Upcoming session' : 'Scheduling soon'}
                    </span>
                </div>
                <div>
                    <h4 className="text-lg font-bold text-neutral">{c.title}</h4>
                    <p className="text-sm text-gray-500">{c.subject}</p>
                </div>
                <div className="flex flex-col gap-2 text-sm bg-base-200/40 rounded-xl p-4">
                    <span className="font-semibold text-neutral">Teacher: {c.teacherName}</span>
                    <span className="text-xs text-gray-500">Next session: {sessionText}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-base-200">
                    <div className="text-xs text-gray-400">Stay engaged to unlock new materials</div>
                    <Link
                        to={`/student/classes/${c.id}`}
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                    >
                        View Class &rarr;
                    </Link>
                </div>
            </Card>
        );
    };

    const renderListCard = (c: EnrolledClass) => {
        const sessionText = formatNextSession(c.nextSession);
        const badgeClasses = c.type === 'GROUP'
            ? 'bg-primary/10 text-primary'
            : 'bg-secondary/10 text-secondary';

        return (
            <Card
                key={`${c.id}-list`}
                className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-lg hover:shadow-xl transition-all duration-200"
            >
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClasses}`}>
                            {getTypeLabel(c.type)}
                        </span>
                        <span className="text-xs text-gray-400">Teacher: {c.teacherName}</span>
                    </div>
                    <h4 className="text-lg font-bold text-neutral">{c.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{c.subject}</p>
                </div>
                <div className="flex flex-col items-end gap-2 md:w-64">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Next session</p>
                    <p className="text-sm font-semibold text-neutral text-right">{sessionText}</p>
                    <Link
                        to={`/student/classes/${c.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Continue
                    </Link>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary to-blue-500 text-white border-none shadow-2xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                        <p className="uppercase text-xs tracking-widest text-white/70">Next on your calendar</p>
                        {loading ? (
                            <h2 className="text-3xl font-bold">Loading your classes...</h2>
                        ) : heroClass ? (
                            <>
                                <h2 className="text-3xl font-bold">{heroClass.title}</h2>
                                <p className="text-white/80">
                                    {heroClass.subject} - {heroClass.teacherName}
                                </p>
                                <p className="text-sm text-white/70">Starts {formatNextSession(heroClass.nextSession)}</p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold">No upcoming classes just yet</h2>
                                <p className="text-white/80">Once your next session is scheduled it will appear here.</p>
                            </>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/student/schedule"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-primary font-semibold shadow hover:bg-white"
                        >
                            View schedule
                        </Link>
                        <Link
                            to="/student/homework"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10"
                        >
                            Homework hub
                        </Link>
                        <Link
                            to="/student/progress"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10"
                        >
                            Track progress
                        </Link>
                        {heroClass && (
                            <Link
                                to={`/student/classes/${heroClass.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-primary font-semibold shadow hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Jump to class
                            </Link>
                        )}
                    </div>
                </div>
            </Card>

            <Card>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Total classes</p>
                        <p className="text-2xl font-bold text-neutral">{stats.total}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Group classes</p>
                        <p className="text-2xl font-bold text-primary">{stats.groupsCount}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">One-to-one</p>
                        <p className="text-2xl font-bold text-secondary">{stats.oneToOneCount}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Upcoming</p>
                        <p className="text-2xl font-bold text-neutral">{stats.upcomingCount}</p>
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Instructors</p>
                        <p className="text-2xl font-bold text-neutral">{stats.teacherCount}</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-4">
                        <div className="relative max-w-md flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by class, teacher, or subject"
                                className="w-full rounded-xl border border-base-200 bg-base-200/40 px-4 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">?</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { label: 'All', value: 'ALL' as ClassTypeFilter },
                                { label: 'Group', value: 'GROUP' as ClassTypeFilter },
                                { label: 'One-to-One', value: 'ONE_TO_ONE' as ClassTypeFilter },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedType(option.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                        selectedType === option.value
                                            ? 'bg-primary text-white shadow'
                                            : 'bg-base-200/60 text-neutral hover:bg-base-200'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm text-neutral">
                            <input
                                type="checkbox"
                                checked={showUpcomingOnly}
                                onChange={(event) => setShowUpcomingOnly(event.target.checked)}
                                className="h-4 w-4 rounded border-base-300 text-primary focus:ring-primary/30"
                            />
                            Upcoming only
                        </label>
                        <div className="flex items-center gap-2 rounded-xl bg-base-200/60 p-1">
                            <button
                                onClick={() => setViewMode('GRID')}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                    viewMode === 'GRID'
                                        ? 'bg-primary text-white shadow'
                                        : 'text-neutral hover:bg-base-200'
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('LIST')}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                    viewMode === 'LIST'
                                        ? 'bg-primary text-white shadow'
                                        : 'text-neutral hover:bg-base-200'
                                }`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>
                {hasFiltersApplied && (
                    <p className="mt-3 text-xs text-gray-400">
                        Showing {filteredClasses.length} of {enrolledClasses.length} classes
                    </p>
                )}
            </Card>

            <Card title="Class Library">
                {loading && (
                    <p className="text-center py-12 text-sm text-gray-500">Loading your classes...</p>
                )}
                {error && (
                    <p className="text-center py-12 text-sm text-error">Error: {error}</p>
                )}
                {!loading && !error && noResults && (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500">
                            {hasFiltersApplied
                                ? 'No classes match your filters yet. Try adjusting your search or filters.'
                                : 'You are not currently enrolled in any classes. New enrollments will appear here automatically.'}
                        </p>
                    </div>
                )}
                {!loading && !error && !noResults && (
                    viewMode === 'GRID' ? (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredClasses.map((c) => renderGridCard(c))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredClasses.map((c) => renderListCard(c))}
                        </div>
                    )
                )}
            </Card>
        </div>
    );
};

export default StudentClasses;
