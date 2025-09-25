import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import * as api from "../../services/api";
import { Group, OneToOne, Homework, Submission, Session, User, Material } from "../../types";

interface ClassDetailState {
    type: "GROUP" | "ONE_TO_ONE";
    group?: Group;
    pair?: OneToOne;
}

interface HomeworkWithSubmissions extends Homework {
    submissions: Submission[];
}

type MaterialFormState = {
    title: string;
    type: "pdf" | "video";
    url: string;
};

type HomeworkFormState = {
    title: string;
    instructions: string;
    type: "text" | "pgn";
    dueAt: string;
};

const defaultMaterialForm: MaterialFormState = {
    title: "",
    type: "pdf",
    url: "",
};

const defaultHomeworkForm: HomeworkFormState = {
    title: "",
    instructions: "",
    type: "text",
    dueAt: "",
};

const formatDateTimeLocal = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    const offsetMinutes = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offsetMinutes * 60_000);
    return local.toISOString().slice(0, 16);
};

const toISOStringFromLocal = (value: string): string => new Date(value).toISOString();

const sortHomeworkAscending = (items: HomeworkWithSubmissions[]) =>
    [...items].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

const TeacherClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [classDetail, setClassDetail] = useState<ClassDetailState | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [homework, setHomework] = useState<HomeworkWithSubmissions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const [gradeError, setGradeError] = useState<string | null>(null);

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [materialForm, setMaterialForm] = useState<MaterialFormState>(defaultMaterialForm);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [materialSubmitting, setMaterialSubmitting] = useState(false);
    const [materialError, setMaterialError] = useState<string | null>(null);

    const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
    const [homeworkForm, setHomeworkForm] = useState<HomeworkFormState>(defaultHomeworkForm);
    const [editingHomework, setEditingHomework] = useState<HomeworkWithSubmissions | null>(null);
    const [homeworkSubmitting, setHomeworkSubmitting] = useState(false);
    const [homeworkError, setHomeworkError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClassDetail = async () => {
            if (!classId) return;
            try {
                setLoading(true);
                let detail: ClassDetailState | null = null;
                let lastError: Error | null = null;

                try {
                    const groupData = await api.getGroupById(classId);
                    detail = { type: "GROUP", group: groupData };
                } catch (groupError: any) {
                    lastError = groupError instanceof Error ? groupError : new Error(groupError?.message || "Unable to load class");
                    try {
                        const pairData = await api.getPairById(classId);
                        detail = { type: "ONE_TO_ONE", pair: pairData };
                        lastError = null;
                    } catch (pairError: any) {
                        lastError = pairError instanceof Error ? pairError : new Error(pairError?.message || "Unable to load class");
                    }
                }

                if (!detail) {
                    throw lastError ?? new Error("Class not found");
                }

                const [materialsData, homeworkData] = await Promise.all([
                    api.getMaterialsForClass(classId),
                    api.getHomeworkForClass(classId),
                ]);

                setClassDetail(detail);
                setMaterials(materialsData);
                setHomework(
                    homeworkData.map((hw) => ({
                        ...hw,
                        submissions: hw.submissions ?? [],
                    })),
                );
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load class details");
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetail();
    }, [classId]);
    const classTitle = classDetail?.type === "GROUP"
        ? classDetail.group?.title
        : classDetail?.pair?.title;

    const subject = classDetail?.type === "GROUP"
        ? classDetail.group?.subject
        : classDetail?.pair?.subject;

    const teacherName = classDetail?.type === "GROUP"
        ? classDetail.group?.teacher?.name
        : classDetail?.pair?.teacher?.name;

    const roster = useMemo((): User[] => {
        if (classDetail?.type === "GROUP") {
            return classDetail.group?.members ?? [];
        }
        if (classDetail?.type === "ONE_TO_ONE" && classDetail.pair?.student) {
            return [classDetail.pair.student];
        }
        return [];
    }, [classDetail]);

    const sessions: Session[] = useMemo(() => {
        if (classDetail?.type === "GROUP") {
            return classDetail.group?.sessions ?? [];
        }
        if (classDetail?.type === "ONE_TO_ONE") {
            return classDetail.pair?.sessions ?? [];
        }
        return [];
    }, [classDetail]);

    const resetMaterialForm = () => {
        setMaterialForm(defaultMaterialForm);
        setEditingMaterial(null);
        setMaterialError(null);
        setMaterialSubmitting(false);
    };

    const openMaterialModal = (material?: Material) => {
        if (material) {
            setMaterialForm({
                title: material.title,
                type: (material.type as "pdf" | "video") ?? "pdf",
                url: material.url,
            });
            setEditingMaterial(material);
        } else {
            setMaterialForm(defaultMaterialForm);
            setEditingMaterial(null);
        }
        setMaterialError(null);
        setIsMaterialModalOpen(true);
    };

    const closeMaterialModal = () => {
        setIsMaterialModalOpen(false);
        resetMaterialForm();
    };

    const handleMaterialSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!classId) return;

        try {
            setMaterialSubmitting(true);
            setMaterialError(null);

            const payload = {
                title: materialForm.title.trim(),
                type: materialForm.type,
                url: materialForm.url.trim(),
            };

            if (!payload.title || !payload.url) {
                setMaterialError("Please provide a title and URL.");
                setMaterialSubmitting(false);
                return;
            }

            let result: Material;
            if (editingMaterial) {
                result = await api.updateMaterial(editingMaterial.id, payload);
                setMaterials((prev) => prev.map((item) => (item.id === result.id ? result : item)));
            } else {
                result = await api.createMaterialForClass(classId, payload);
                setMaterials((prev) => [result, ...prev]);
            }

            closeMaterialModal();
        } catch (err: any) {
            setMaterialError(err.message || "Unable to save material.");
            setMaterialSubmitting(false);
        }
    };

    const handleMaterialDelete = async (materialId: string) => {
        if (!window.confirm("Remove this material?")) {
            return;
        }
        try {
            await api.deleteMaterial(materialId);
            setMaterials((prev) => prev.filter((item) => item.id !== materialId));
        } catch (err: any) {
            setMaterialError(err.message || "Unable to delete material.");
        }
    };

    const resetHomeworkForm = () => {
        setHomeworkForm(defaultHomeworkForm);
        setEditingHomework(null);
        setHomeworkError(null);
        setHomeworkSubmitting(false);
    };

    const openHomeworkModal = (item?: HomeworkWithSubmissions) => {
        if (item) {
            setHomeworkForm({
                title: item.title,
                instructions: item.instructions,
                type: (item.type as "text" | "pgn") ?? "text",
                dueAt: item.dueAt ? formatDateTimeLocal(item.dueAt) : "",
            });
            setEditingHomework(item);
        } else {
            setHomeworkForm(defaultHomeworkForm);
            setEditingHomework(null);
        }
        setHomeworkError(null);
        setIsHomeworkModalOpen(true);
    };

    const closeHomeworkModal = () => {
        setIsHomeworkModalOpen(false);
        resetHomeworkForm();
    };

    const handleHomeworkSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!classId) return;

        if (!homeworkForm.dueAt) {
            setHomeworkError("Please set a due date.");
            return;
        }

        try {
            setHomeworkSubmitting(true);
            setHomeworkError(null);

            const payload = {
                title: homeworkForm.title.trim(),
                instructions: homeworkForm.instructions.trim(),
                type: homeworkForm.type,
                dueAt: toISOStringFromLocal(homeworkForm.dueAt),
            };

            if (!payload.title || !payload.instructions) {
                setHomeworkError("Please provide a title and instructions.");
                setHomeworkSubmitting(false);
                return;
            }

            let result: Homework;
            if (editingHomework) {
                result = await api.updateHomeworkForClass(editingHomework.id, payload);
                setHomework((prev) => {
                    const updated = prev.map((item) =>
                        item.id === result.id
                            ? {
                                  ...result,
                                  submissions: result.submissions ?? item.submissions ?? [],
                              }
                            : item,
                    );
                    return sortHomeworkAscending(updated);
                });
            } else {
                result = await api.createHomeworkForClass(classId, payload);
                setHomework((prev) =>
                    sortHomeworkAscending([
                        ...prev,
                        {
                            ...result,
                            submissions: result.submissions ?? [],
                        },
                    ]),
                );
            }

            closeHomeworkModal();
        } catch (err: any) {
            setHomeworkError(err.message || "Unable to save homework.");
            setHomeworkSubmitting(false);
        }
    };

    const handleHomeworkDelete = async (homeworkId: string) => {
        if (!window.confirm("Remove this homework assignment?")) {
            return;
        }
        try {
            await api.deleteHomeworkForClass(homeworkId);
            setHomework((prev) => prev.filter((item) => item.id !== homeworkId));
        } catch (err: any) {
            setHomeworkError(err.message || "Unable to delete homework.");
        }
    };
    const openGradeModal = (submission: Submission) => {
        setCurrentSubmission(submission);
        setGrade(submission.grade?.toString() ?? "");
        setFeedback(submission.feedback ?? "");
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
                        submission.submissionId === updated.submissionId
                            ? {
                                  ...submission,
                                  grade: updated.grade,
                                  feedback: updated.feedback,
                                  status: updated.status,
                              }
                            : submission,
                    ),
                })),
            );
            setIsGradeModalOpen(false);
        } catch (err: any) {
            setGradeError(err.message || "Failed to grade submission");
        }
    };

    if (loading) {
        return <Card>Loading class...</Card>;
    }

    if (error || !classDetail) {
        return (
            <Card title="Error">
                <p>{error || "Class not found."}</p>
                <Link to="/teacher/classes" className="text-primary hover:underline mt-4 inline-block">
                    &larr; Back to all classes
                </Link>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <Link to="/teacher/classes" className="text-sm text-primary hover:underline mb-4 block">
                    &larr; Back to all classes
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{classTitle}</h2>
                <p className="text-text-secondary">{subject}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <p className="text-sm text-text-secondary">Teacher: {teacherName}</p>
                    <p className="text-sm text-text-secondary">
                        Meeting Days: {classDetail.type === "GROUP"
                            ? (classDetail.group?.meetingDays.length ? classDetail.group.meetingDays.join(", ") : "N/A")
                            : "Scheduled individually"}
                    </p>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-neutral tracking-tight">Roster</h3>
                        {classDetail.type === "GROUP" && (
                            <span className="text-sm text-text-secondary">
                                {roster.length} {roster.length === 1 ? "student" : "students"}
                            </span>
                        )}
                    </div>
                    <div className="mt-4 space-y-4">
                        {roster.length === 0 ? (
                            <p className="text-text-secondary">No students enrolled.</p>
                        ) : (
                            <ul className="space-y-3">
                                {roster.map((member) => (
                                    <li key={member.id} className="flex items-center gap-3">
                                        <img
                                            src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name.replace(" ", "+")}`}
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
                    </div>
                </Card>

                <Card className="lg:col-span-1">
                    <h3 className="text-xl font-semibold text-neutral tracking-tight mb-4">Upcoming Sessions</h3>
                    {sessions.length === 0 ? (
                        <p className="text-text-secondary">No sessions scheduled.</p>
                    ) : (
                        <ul className="space-y-3">
                            {sessions.map((session) => (
                                <li key={session.id} className="p-3 bg-base-200/60 rounded-lg">
                                    <p className="font-semibold text-neutral">{session.title}</p>
                                    <p className="text-sm text-text-secondary">
                                        {new Date(session.startsAt).toLocaleString(undefined, {
                                            dateStyle: "medium",
                                            timeStyle: "short",
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
            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-xl font-semibold text-neutral tracking-tight">Materials</h3>
                    <button
                        onClick={() => openMaterialModal()}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
                    >
                        + Add Material
                    </button>
                </div>
                <div className="mt-4">
                    {materialError && <p className="mb-3 text-sm text-error">{materialError}</p>}
                    {materials.length === 0 ? (
                        <p className="text-text-secondary">No materials uploaded for this class.</p>
                    ) : (
                        <ul className="space-y-3">
                            {materials.map((material) => (
                                <li key={material.id} className="flex flex-col gap-3 rounded-lg bg-base-200/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-neutral">{material.title}</p>
                                        <p className="text-sm text-text-secondary uppercase">{material.type}</p>
                                        <a
                                            href={material.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-sm font-semibold"
                                        >
                                            View
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openMaterialModal(material)}
                                            className="rounded-lg bg-base-300 px-3 py-1 text-sm font-semibold text-neutral transition hover:bg-base-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleMaterialDelete(material.id)}
                                            className="rounded-lg bg-error/10 px-3 py-1 text-sm font-semibold text-error transition hover:bg-error/20"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Card>

            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-xl font-semibold text-neutral tracking-tight">Homework</h3>
                    <button
                        onClick={() => openHomeworkModal()}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
                    >
                        + Assign Homework
                    </button>
                </div>
                <div className="mt-4">
                    {homeworkError && <p className="mb-3 text-sm text-error">{homeworkError}</p>}
                    {homework.length === 0 ? (
                        <p className="text-text-secondary">No homework assigned.</p>
                    ) : (
                        <div className="space-y-4">
                            {homework.map((hw) => (
                                <div key={hw.id} className="rounded-xl bg-base-200/60 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral">{hw.title}</h3>
                                            <p className="text-sm text-text-secondary">Due: {new Date(hw.dueAt).toLocaleString()}</p>
                                            <p className="mt-2 max-w-2xl text-sm text-text-secondary">{hw.instructions}</p>
                                        </div>
                                        <div className="flex flex-col items-start gap-2 sm:items-end">
                                            <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                                                {hw.type}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openHomeworkModal(hw)}
                                                    className="rounded-lg bg-base-300 px-3 py-1 text-sm font-semibold text-neutral transition hover:bg-base-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleHomeworkDelete(hw.id)}
                                                    className="rounded-lg bg-error/10 px-3 py-1 text-sm font-semibold text-error transition hover:bg-error/20"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-neutral uppercase tracking-wide mb-2">Submissions</h4>
                                        {hw.submissions && hw.submissions.length > 0 ? (
                                            <div className="space-y-3">
                                                {hw.submissions.map((submission: Submission) => (
                                                    <div key={submission.submissionId} className="flex flex-col gap-3 rounded-lg border border-base-200 bg-base-100 p-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="font-semibold text-neutral">Student ID: {submission.studentId}</p>
                                                            <p className="text-sm text-text-secondary">
                                                                Status: {submission.status}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {submission.status === "GRADED" && (
                                                                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-secondary/10 text-secondary">
                                                                    {submission.grade}%
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => openGradeModal(submission)}
                                                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary to-blue-400 text-white hover:shadow-lg transition"
                                                            >
                                                                {submission.status === "GRADED" ? "Update Grade" : "Grade"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-text-secondary">No submissions yet.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
            <Modal
                isOpen={isMaterialModalOpen}
                onClose={closeMaterialModal}
                title={editingMaterial ? "Update Material" : "Add Material"}
            >
                <form onSubmit={handleMaterialSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral" htmlFor="material-title">
                            Title
                        </label>
                        <input
                            id="material-title"
                            type="text"
                            value={materialForm.title}
                            onChange={(e) => setMaterialForm((prev) => ({ ...prev, title: e.target.value }))}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-neutral" htmlFor="material-type">
                                Type
                            </label>
                            <select
                                id="material-type"
                                value={materialForm.type}
                                onChange={(e) => setMaterialForm((prev) => ({ ...prev, type: e.target.value as "pdf" | "video" }))}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="pdf">PDF</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral" htmlFor="material-url">
                                URL
                            </label>
                            <input
                                id="material-url"
                                type="url"
                                value={materialForm.url}
                                onChange={(e) => setMaterialForm((prev) => ({ ...prev, url: e.target.value }))}
                                required
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                        </div>
                    </div>
                    {materialError && <p className="text-sm text-error">{materialError}</p>}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={closeMaterialModal}
                            className="rounded-lg bg-base-200 px-4 py-2 text-sm font-semibold text-neutral hover:bg-base-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={materialSubmitting}
                            className="rounded-lg bg-gradient-to-r from-primary to-blue-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {materialSubmitting ? "Saving..." : editingMaterial ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isHomeworkModalOpen}
                onClose={closeHomeworkModal}
                title={editingHomework ? "Update Homework" : "Assign Homework"}
            >
                <form onSubmit={handleHomeworkSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral" htmlFor="homework-title">
                            Title
                        </label>
                        <input
                            id="homework-title"
                            type="text"
                            value={homeworkForm.title}
                            onChange={(e) => setHomeworkForm((prev) => ({ ...prev, title: e.target.value }))}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral" htmlFor="homework-due">
                            Due Date
                        </label>
                        <input
                            id="homework-due"
                            type="datetime-local"
                            value={homeworkForm.dueAt}
                            onChange={(e) => setHomeworkForm((prev) => ({ ...prev, dueAt: e.target.value }))}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-neutral" htmlFor="homework-type">
                                Type
                            </label>
                            <select
                                id="homework-type"
                                value={homeworkForm.type}
                                onChange={(e) => setHomeworkForm((prev) => ({ ...prev, type: e.target.value as "text" | "pgn" }))}
                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                <option value="text">Text</option>
                                <option value="pgn">PGN</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral" htmlFor="homework-instructions">
                            Instructions
                        </label>
                        <textarea
                            id="homework-instructions"
                            value={homeworkForm.instructions}
                            onChange={(e) => setHomeworkForm((prev) => ({ ...prev, instructions: e.target.value }))}
                            required
                            rows={4}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    {homeworkError && <p className="text-sm text-error">{homeworkError}</p>}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={closeHomeworkModal}
                            className="rounded-lg bg-base-200 px-4 py-2 text-sm font-semibold text-neutral hover:bg-base-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={homeworkSubmitting}
                            className="rounded-lg bg-gradient-to-r from-primary to-blue-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {homeworkSubmitting ? "Saving..." : editingHomework ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isGradeModalOpen}
                onClose={() => setIsGradeModalOpen(false)}
                title={`Grade Submission: ${currentSubmission?.studentId ?? ""}`}
            >
                {currentSubmission && (
                    <form onSubmit={handleGradeFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral">Student submission</label>
                            <div className="mt-1 h-32 overflow-y-auto rounded-lg border bg-base-200/50 p-3">
                                <p>{currentSubmission.content.text || "No text submitted."}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
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

