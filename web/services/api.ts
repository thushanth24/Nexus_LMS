import { User, Session, Group, Homework, Submission, ChessPreset } from '../types';

const API_BASE_URL = 'http://localhost:3000'; // Update this with your backend URL if different

// Helper for making API calls
const api = {
    get: async <T>(endpoint: string): Promise<T> => {
        const token = localStorage.getItem('nexus-lms-token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Something went wrong');
        }

        return response.json();
    },

    post: async <T>(endpoint: string, data: any): Promise<T> => {
        const token = localStorage.getItem('nexus-lms-token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Something went wrong');
        }

        return response.json();
    },
};

export interface InviteTeacherPayload {
    name: string;
    email: string;
    password: string;
    subjects: string[];
    timezone?: string;
    avatarUrl?: string | null;
}

// --- AUTH ---
export const login = async (email: string, password: string = 'demo123'): Promise<{ access_token: string }> => {
    try {
        const response = await api.post<{ access_token: string }>('/auth/login', { email, password });
        localStorage.setItem('nexus-lms-token', response.access_token);
        return response;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const getMe = async (): Promise<User> => {
    try {
        const user = await api.get<User>('/auth/me');
        return user;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
};

// --- USERS ---
export const getTeachers = async (): Promise<User[]> => {
    return api.get<User[]>('/users/teachers');
};

export const inviteTeacher = async (payload: InviteTeacherPayload): Promise<User> => {
    return api.post<User>('/users/teachers', payload);
};

export const getStudents = async (): Promise<User[]> => {
    return api.get<User[]>('/users/students');
};

// --- CLASSES ---
export const getGroups = async (): Promise<Group[]> => {
    return api.get<Group[]>('/groups');
};

export const getGroupById = async (id: string): Promise<Group> => {
    return api.get<Group>(`/groups/${id}`);
};

// --- SCHEDULE ---
export const getMySessions = async (): Promise<Session[]> => {
    return api.get<Session[]>('/schedule/my-sessions');
};

// --- HOMEWORK & SUBMISSIONS ---
export const getHomeworkForClass = async (classId: string): Promise<Homework[]> => {
    return api.get<Homework[]>(`/homework/class/${classId}`);
};

export const getMyHomework = async (): Promise<(Homework & { submissions: Submission[] })[]> => {
    return api.get<(Homework & { submissions: Submission[] })[]>('/homework/me');
};

export const submitHomework = async (data: { homeworkId: string; content: { text?: string } }): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>('/homework/submit', data);
};

export const gradeSubmission = async (submissionId: string, data: { grade: number; feedback: string }): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>(`/submissions/${submissionId}/grade`, data);
};

// --- CHESS ---
export const getChessPresets = async (): Promise<ChessPreset[]> => {
    return api.get<ChessPreset[]>('/chess/presets');
};
