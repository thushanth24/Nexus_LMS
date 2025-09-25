import { User, Session, Group, OneToOne, Homework, Submission, ChessPreset, Material } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
}

// Helper for making API calls
const api = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const token = localStorage.getItem('nexus-lms-token');
    const headers: Record<string, string> = {};

    const isFormData = options.body instanceof FormData;

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method ?? 'GET',
        headers,
        body: isFormData
            ? (options.body as FormData)
            : options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Something went wrong');
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
};

export interface InviteTeacherPayload {
    name: string;
    email: string;
    password: string;
    subjects: string[];
    timezone?: string;
    avatarUrl?: string | null;
}

export interface CreateStudentPayload {
    name: string;
    email: string;
    password: string;
    level?: string;
    timezone?: string;
    avatarUrl?: string | null;
}

export interface CreateGroupPayload {
    title: string;
    subject: string;
    teacherId: string;
    meetingDays: string[];
    cap: number;
    levelSpread: string[];
    durationMin?: number;
}

export interface GradeSubmissionPayload {
    grade: number;
    feedback: string;
}

export interface SubmitHomeworkPayload {
    homeworkId: string;
    content: { text?: string };
}

// --- AUTH ---
export const login = async (email: string, password: string): Promise<{ access_token: string }> => {
    const response = await api<{ access_token: string }>(`/auth/login`, {
        method: 'POST',
        body: { email, password },
    });
    localStorage.setItem('nexus-lms-token', response.access_token);
    return response;
};

export const getMe = async (): Promise<User> => api<User>('/auth/me');

// --- USERS ---
export const getTeachers = async (): Promise<User[]> => api<User[]>('/users/teachers');

export const inviteTeacher = async (payload: InviteTeacherPayload): Promise<User> =>
    api<User>('/users/teachers', { method: 'POST', body: payload });

export const getStudents = async (): Promise<User[]> => api<User[]>('/users/students');

export const createStudent = async (payload: CreateStudentPayload): Promise<User> =>
    api<User>('/users/students', { method: 'POST', body: payload });

// --- GROUPS ---
export const getGroups = async (): Promise<Group[]> => api<Group[]>('/groups');

export const getMyTeachingGroups = async (): Promise<Group[]> => api<Group[]>('/groups/teaching');

export const getMyEnrolledGroups = async (): Promise<Group[]> => api<Group[]>('/groups/enrolled');

export const createGroup = async (payload: CreateGroupPayload): Promise<Group> =>
    api<Group>('/groups', { method: 'POST', body: payload });

export const getGroupById = async (id: string): Promise<Group> => api<Group>(`/groups/${id}`);

// --- PAIRS ---
export const getMyTeachingPairs = async (): Promise<OneToOne[]> => api<OneToOne[]>('/pairs/teaching');

export const getMyEnrolledPairs = async (): Promise<OneToOne[]> => api<OneToOne[]>('/pairs/enrolled');

export const getPairById = async (id: string): Promise<OneToOne> => api<OneToOne>(`/pairs/${id}`);

// --- MATERIALS ---
export const getMaterialsForClass = async (classId: string): Promise<Material[]> =>
    api<Material[]>(`/materials/class/${classId}`);

// --- SESSIONS / SCHEDULE ---
export const getMySessions = async (): Promise<Session[]> => api<Session[]>('/schedule/my-sessions');

export const getSessionById = async (sessionId: string): Promise<Session> =>
    api<Session>(`/schedule/${sessionId}`);

// --- HOMEWORK & SUBMISSIONS ---
export const getHomeworkForClass = async (classId: string): Promise<Homework[]> =>
    api<Homework[]>(`/homework/class/${classId}`);

export const getMyHomework = async (): Promise<(Homework & { submissions: Submission[] })[]> =>
    api<(Homework & { submissions: Submission[] })[]>('/homework/me');

export const submitHomework = async (data: SubmitHomeworkPayload): Promise<Submission> =>
    api<Submission>('/submissions', { method: 'POST', body: data });

export const gradeSubmission = async (submissionId: string, data: GradeSubmissionPayload): Promise<Submission> =>
    api<Submission>(`/submissions/${submissionId}/grade`, { method: 'PATCH', body: data });

// --- CHESS ---
export const getChessPresets = async (): Promise<ChessPreset[]> => api<ChessPreset[]>('/chess/presets');


