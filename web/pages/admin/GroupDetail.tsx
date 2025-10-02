import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";
import { Group, Material, Homework, Session, Submission, User } from "../../types";

interface GroupDetailData {
    group: Group;
    materials: Material[];
    homework: Homework[];
}

const AdminGroupDetail: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const [data, setData] = useState<GroupDetailData | null>(null);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingTeacher, setUpdatingTeacher] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

    useEffect(() => {
        const fetchGroupDetail = async () => {
            if (!groupId) return;
            try {
                setLoading(true);
                const [group, materials, homework, teachersList, studentsList] = await Promise.all([
                    api.getGroupById(groupId),
                    api.getMaterialsForClass(groupId),
                    api.getHomeworkForClass(groupId),
                    api.getTeachers(),
                    api.getStudents(),
                ]);
                setData({ group, materials, homework });
                setTeachers(teachersList);
                setStudents(studentsList);
                setSelectedTeacherId(group.teacherId);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load group details");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetail();
    }, [groupId]);

    useEffect(() => {
        if (!actionMessage) {
            return;
        }

        const timeout = window.setTimeout(() => setActionMessage(null), 5000);
        return () => window.clearTimeout(timeout);
    }, [actionMessage]);

    const members = data?.group.members ?? [];
    const availableStudents = useMemo(
        () => students.filter(student => !members.some(member => member.id === student.id)),
        [students, members],
    );

    const sessions: Session[] = data?.group.sessions ?? [];

    const handleTeacherUpdate = async () => {
        if (!groupId) {
            return;
        }

        if (!selectedTeacherId) {
            setActionMessage({ type: "error", message: "Select a teacher to assign." });
            return;
        }

        if (data && selectedTeacherId === data.group.teacherId) {
            setActionMessage({ type: "error", message: "Select a different teacher to update." });
            return;
        }

        try {
            setUpdatingTeacher(true);
            const updatedGroup = await api.updateGroupTeacher(groupId, selectedTeacherId);
            setData(prev => (prev ? { ...prev, group: updatedGroup } : prev));
            setSelectedTeacherId(updatedGroup.teacherId);
            setActionMessage({ type: "success", message: "Teacher updated successfully." });
        } catch (err: any) {
            setActionMessage({ type: "error", message: err.message || "Failed to update teacher." });
        } finally {
            setUpdatingTeacher(false);
        }
    };

    const handleEnrollStudent = async () => {
        if (!groupId) {
            return;
        }

        if (!selectedStudentId) {
            setActionMessage({ type: "error", message: "Select a student to enroll." });
            return;
        }

        try {
            setEnrolling(true);
            const updatedGroup = await api.enrollStudentsToGroup(groupId, [selectedStudentId]);
            setData(prev => (prev ? { ...prev, group: updatedGroup } : prev));
            setSelectedStudentId("");
            setActionMessage({ type: "success", message: "Student enrolled successfully." });
        } catch (err: any) {
            setActionMessage({ type: "error", message: err.message || "Failed to enroll student." });
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenrollStudent = async (studentId: string) => {
        if (!groupId) {
            return;
        }

        try {
            setRemovingStudentId(studentId);
            const updatedGroup = await api.unenrollStudentsFromGroup(groupId, [studentId]);
            setData(prev => (prev ? { ...prev, group: updatedGroup } : prev));
            setActionMessage({ type: "success", message: "Student unenrolled successfully." });
        } catch (err: any) {
            setActionMessage({ type: "error", message: err.message || "Failed to unenroll student." });
        } finally {
            setRemovingStudentId(null);
        }
    };

    if (loading) {
        return <Card>Loading group...</Card>;
    }

    if (error || !data) {
        return (
            <Card title="Error">
                <p>{error || "Group not found."}</p>
                <Link to="/admin/groups" className="text-primary hover:underline mt-4 inline-block">
                    &larr; Back to all groups
                </Link>
            </Card>
        );
    }

    const { group, materials, homework } = data;
    const teacherOptions = teachers.map(teacher => (
        <option key={teacher.id} value={teacher.id}>
            {teacher.name}
        </option>
    ));

    return (
        <div className="space-y-6">
            {actionMessage && (
                <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                        actionMessage.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                >
                    {actionMessage.message}
                </div>
            )}

            <Card>
                <Link to="/admin/groups" className="text-sm text-primary hover:underline mb-4 block">
                    &larr; Back to all groups
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{group.title}</h2>
                <p className="text-text-secondary">{group.subject}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <p className="text-sm text-text-secondary">Teacher: {group.teacher?.name || "Unassigned"}</p>
                    <p className="text-sm text-text-secondary">
                        Meeting Days: {group.meetingDays && group.meetingDays.length > 0 
                            ? group.meetingDays.map(day => `${day.day} (${day.startTime}-${day.endTime})`).join(", ") 
                            : "N/A"}
                    </p>
                    <p className="text-sm text-text-secondary">Capacity: {group.currentSize}/{group.cap}</p>
                </div>

                <div className="mt-6 rounded-lg bg-base-200/60 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Assign Teacher</h3>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={selectedTeacherId}
                            onChange={e => setSelectedTeacherId(e.target.value)}
                            className="w-full rounded-lg border border-base-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Select a teacher</option>
                            {teacherOptions}
                        </select>
                        <button
                            onClick={handleTeacherUpdate}
                            disabled={!selectedTeacherId || selectedTeacherId === group.teacherId || updatingTeacher}
                            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {updatingTeacher ? "Updating..." : "Assign"}
                        </button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="Roster" className="lg:col-span-1">
                    <div className="space-y-4">
                        <div className="rounded-lg bg-base-200/60 p-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Enroll Students</h3>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <select
                                    value={selectedStudentId}
                                    onChange={e => setSelectedStudentId(e.target.value)}
                                    disabled={availableStudents.length === 0 || enrolling}
                                    className="w-full rounded-lg border border-base-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    <option value="">Select a student</option>
                                    {availableStudents.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleEnrollStudent}
                                    disabled={enrolling || !selectedStudentId}
                                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {enrolling ? "Enrolling..." : "Enroll"}
                                </button>
                            </div>
                            {availableStudents.length === 0 && (
                                <p className="mt-2 text-sm text-text-secondary">
                                    All students are currently enrolled or unavailable.
                                </p>
                            )}
                        </div>

                        {members.length === 0 ? (
                            <p className="text-text-secondary">No students enrolled.</p>
                        ) : (
                            <ul className="space-y-3">
                                {members.map(member => (
                                    <li key={member.id} className="flex items-start justify-between gap-3 rounded-lg bg-base-200/60 p-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name.replace(" ", "+")}`}
                                                alt={member.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold text-neutral">{member.name}</p>
                                                <p className="text-sm text-text-secondary">{member.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnenrollStudent(member.id)}
                                            disabled={removingStudentId === member.id}
                                            className="text-sm font-semibold text-error hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {removingStudentId === member.id ? "Removing..." : "Remove"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card>

                <Card title="Upcoming Sessions" className="lg:col-span-1">
                    {sessions.length === 0 ? (
                        <p className="text-text-secondary">No sessions scheduled.</p>
                    ) : (
                        <ul className="space-y-3">
                            {sessions.map(session => (
                                <li key={session.id} className="rounded-lg bg-base-200/60 p-3">
                                    <p className="font-semibold text-neutral">{session.title}</p>
                                    <p className="text-sm text-text-secondary">
                                        {new Date(session.startsAt).toLocaleString(undefined, {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </p>
                                    <p className="mt-1 text-xs text-text-secondary">Attendees: {session.attendees.length}</p>
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
                        {materials.map(material => (
                            <li key={material.id} className="flex items-center justify-between rounded-lg bg-base-200/60 p-3">
                                <div>
                                    <p className="font-semibold text-neutral">{material.title}</p>
                                    <p className="text-sm uppercase text-text-secondary">{material.type}</p>
                                </div>
                                <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-primary hover:underline"
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
                        {homework.map(hw => (
                            <div key={hw.id} className="rounded-xl bg-base-200/60 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral">{hw.title}</h3>
                                        <p className="text-sm text-text-secondary">Due: {new Date(hw.dueAt).toLocaleString()}</p>
                                        <p className="mt-2 max-w-2xl text-sm text-text-secondary">{hw.instructions}</p>
                                    </div>
                                    <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                                        {hw.type}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral">Submissions</h4>
                                    {hw.submissions && hw.submissions.length > 0 ? (
                                        <ul className="space-y-2">
                                            {hw.submissions.map((submission: Submission) => (
                                                <li key={submission.submissionId} className="rounded-lg border border-base-200 bg-base-100 p-3">
                                                    <p className="font-semibold text-neutral">Student ID: {submission.studentId}</p>
                                                    <p className="text-sm text-text-secondary">Status: {submission.status}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-text-secondary">No submissions yet.</p>
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
