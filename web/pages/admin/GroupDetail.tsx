import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import * as api from '../../services/api';
import { Group, Material, Homework, Session, Submission } from '../../types';

interface GroupDetailData {
    group: Group;
    materials: Material[];
    homework: Homework[];
}

const AdminGroupDetail: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const [data, setData] = useState<GroupDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGroupDetail = async () => {
            if (!groupId) return;
            try {
                setLoading(true);
                const [group, materials, homework] = await Promise.all([
                    api.getGroupById(groupId),
                    api.getMaterialsForClass(groupId),
                    api.getHomeworkForClass(groupId),
                ]);
                setData({ group, materials, homework });
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load group details');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetail();
    }, [groupId]);

    if (loading) {
        return <Card>Loading group...</Card>;
    }

    if (error || !data) {
        return (
            <Card title="Error">
                <p>{error || 'Group not found.'}</p>
                <Link to="/admin/groups" className="text-primary hover:underline mt-4 inline-block">
                    &larr; Back to all groups
                </Link>
            </Card>
        );
    }

    const { group, materials, homework } = data;
    const sessions: Session[] = group.sessions ?? [];
    const members = group.members ?? [];

    return (
        <div className="space-y-6">
            <Card>
                <Link to="/admin/groups" className="text-sm text-primary hover:underline mb-4 block">
                    &larr; Back to all groups
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{group.title}</h2>
                <p className="text-text-secondary">{group.subject}</p>
                <p className="text-sm text-text-secondary mt-2">Teacher: {group.teacher?.name || group.teacherId}</p>
                <p className="text-sm text-text-secondary mt-1">
                    Meeting Days: {group.meetingDays.length > 0 ? group.meetingDays.join(', ') : 'N/A'}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                    Capacity: {group.currentSize}/{group.cap}
                </p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Roster" className="lg:col-span-1">
                    {members.length === 0 ? (
                        <p className="text-text-secondary">No students enrolled.</p>
                    ) : (
                        <ul className="space-y-3">
                            {members.map((member) => (
                                <li key={member.id} className="flex items-center gap-3">
                                    <img
                                        src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}`}
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-neutral">{member.name}</p>
                                        <p className="text-sm text-text-secondary">{member.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Upcoming Sessions" className="lg:col-span-1">
                    {sessions.length === 0 ? (
                        <p className="text-text-secondary">No sessions scheduled.</p>
                    ) : (
                        <ul className="space-y-3">
                            {sessions.map((session) => (
                                <li key={session.id} className="p-3 bg-base-200/60 rounded-lg">
                                    <p className="font-semibold text-neutral">{session.title}</p>
                                    <p className="text-sm text-text-secondary">
                                        {new Date(session.startsAt).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Attendees: {session.attendees.length}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <Card title="Materials">
                {materials.length === 0 ? (
                    <p className="text-text-secondary">No materials uploaded for this class.</p>
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
                    <p className="text-text-secondary">No homework assigned.</p>
                ) : (
                    <div className="space-y-4">
                        {homework.map((hw) => (
                            <div key={hw.id} className="p-4 bg-base-200/60 rounded-xl">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral">{hw.title}</h3>
                                        <p className="text-sm text-text-secondary">Due: {new Date(hw.dueAt).toLocaleString()}</p>
                                        <p className="text-sm text-text-secondary mt-2 max-w-2xl">{hw.instructions}</p>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary uppercase">{hw.type}</span>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-neutral uppercase tracking-wide mb-2">Submissions</h4>
                                    {hw.submissions && hw.submissions.length > 0 ? (
                                        <ul className="space-y-2">
                                            {hw.submissions.map((submission: Submission) => (
                                                <li key={submission.submissionId} className="p-3 bg-base-100 rounded-lg border border-base-200">
                                                    <p className="font-semibold text-neutral">Student ID: {submission.studentId}</p>
                                                    <p className="text-sm text-text-secondary">Status: {submission.status}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-text-secondary text-sm">No submissions yet.</p>
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

export default AdminGroupDetail;
