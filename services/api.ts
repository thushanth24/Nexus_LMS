// Mocks for the API service layer
import usersData from '../apps/web/src/data/users.js';
import classesData from '../apps/web/src/data/classes.js';
import scheduleData from '../apps/web/src/data/schedule.js';
import homeworkData from '../apps/web/src/data/homework.js';
import submissionsData from '../apps/web/src/data/submissions.js';
import chessPresetsData from '../apps/web/src/data/chess-presets.js';
import { User, UserRole, Session, Group, Homework, Submission, ChessPreset } from '../apps/web/src/types';

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- AUTH ---
export const login = async (email: string, password?: string): Promise<{ access_token: string }> => {
    await sleep(500); // Simulate network delay
    const user = (usersData as User[]).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
        // In our mock, we'll store the user's ID to retrieve in getMe
        localStorage.setItem('mock-user-id', user.id);
        return { access_token: `mock-token-for-${user.id}` };
    } else {
        throw new Error('User not found');
    }
};

export const getMe = async (): Promise<User> => {
    await sleep(300);
    const userId = localStorage.getItem('mock-user-id');
    const token = localStorage.getItem('nexus-lms-token');
    
    if (userId && token) {
        const user = (usersData as User[]).find(u => u.id === userId);
        if (user) {
            return user;
        }
    }
    throw new Error('Not authenticated');
};

// --- USERS ---
export const getTeachers = async (): Promise<User[]> => {
    await sleep(200);
    return (usersData as User[]).filter(u => u.role === UserRole.TEACHER);
};
export const getStudents = async (): Promise<User[]> => {
    await sleep(200);
    return (usersData as User[]).filter(u => u.role === UserRole.STUDENT);
};

// --- GROUPS ---
export const getGroups = async (): Promise<Group[]> => {
    await sleep(200);
    return classesData.groups as Group[];
};
export const getGroupById = async (id: string): Promise<Group | undefined> => {
    await sleep(200);
    return (classesData.groups as Group[]).find(g => g.id === id);
};

// --- SCHEDULE ---
export const getMySessions = async (): Promise<Session[]> => {
    await sleep(400);
    const userId = localStorage.getItem('mock-user-id');
    if (!userId) return [];

    const user = (usersData as User[]).find(u => u.id === userId);
    if (!user) return [];

    const allSessions = scheduleData as Session[];

    if (user.role === UserRole.ADMIN) {
        return allSessions;
    }
    if (user.role === UserRole.TEACHER) {
        return allSessions.filter(s => s.teacherId === userId);
    }
    if (user.role === UserRole.STUDENT) {
        return allSessions.filter(s => s.attendees.includes(userId));
    }
    return [];
};

// --- HOMEWORK & SUBMISSIONS ---
export const getHomeworkForClass = async (classId: string): Promise<Homework[]> => {
    await sleep(200);
    return (homeworkData as Homework[]).filter(hw => hw.classId === classId);
};
export const getMyHomework = async (): Promise<(Homework & { submissions: Submission[] })[]> => {
    await sleep(300);
    const userId = localStorage.getItem('mock-user-id');
    if (!userId) return [];
    
    // This is a simplified logic. A real API would know the student's classes.
    // We'll just return all homework and associate it with the student's submissions.
    return (homeworkData as Homework[]).map(hw => {
        const submission = (submissionsData as Submission[]).find(s => s.studentId === userId && s.homeworkId === hw.id);
        return { ...hw, submissions: submission ? [submission] : [] };
    });
};

export const submitHomework = async (data: { homeworkId: string; content: { text?: string } }): Promise<{ success: boolean }> => {
    await sleep(500);
    console.log("Mock submitting homework:", data);
    // This is a mock, so we won't persist the change.
    return { success: true };
};
export const gradeSubmission = async (submissionId: string, data: { grade: number; feedback: string }): Promise<{ success: boolean }> => {
    await sleep(500);
    console.log(`Mock grading submission ${submissionId}:`, data);
    // This is a mock, so we won't persist the change.
    return { success: true };
};

// --- CHESS ---
export const getChessPresets = async (): Promise<ChessPreset[]> => {
    await sleep(200);
    return chessPresetsData as ChessPreset[];
};