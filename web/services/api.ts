// Mocks for the API service layer
import { User, UserRole, Session, Group, Homework, Submission, ChessPreset } from '../types';
import usersData from '../data/users.js';
import classesDataRaw from '../data/classes.js';
import scheduleData from '../data/schedule.js';
import homeworkData from '../data/homework.js';
import submissionsData from '../data/submissions.js';
import chessPresetsData from '../data/chess-presets.js';

// Type the classes data structure
interface ClassesData {
    groups: Group[];
    oneToOnes: Array<Group & { studentId: string }>;
}

const classesData = classesDataRaw as unknown as ClassesData;

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

// --- CLASSES ---
export const getGroups = async (): Promise<Group[]> => {
    await sleep(200);
    // Combine both groups and one-to-one sessions into a single array
    return [...classesData.groups, ...classesData.oneToOnes];
};

export const getGroupById = async (id: string): Promise<Group | undefined> => {
    await sleep(200);
    const allGroups = [...classesData.groups, ...classesData.oneToOnes];
    return allGroups.find(c => c.id === id) as Group | undefined;
};

// --- SCHEDULE ---
export const getMySessions = async (): Promise<Session[]> => {
    await sleep(300);
    const me = await getMe();
    
    if (me.role === UserRole.TEACHER) {
        return (scheduleData as Session[]).filter(s => s.teacherId === me.id);
    } else if (me.role === UserRole.STUDENT) {
        return (scheduleData as Session[]).filter(s => s.attendees.includes(me.id));
    }
    
    return [];
};

// --- HOMEWORK & SUBMISSIONS ---
export const getHomeworkForClass = async (classId: string): Promise<Homework[]> => {
    await sleep(300);
    return (homeworkData as Homework[]).filter(h => h.classId === classId);
};

export const getMyHomework = async (): Promise<(Homework & { submissions: Submission[] })[]> => {
    await sleep(300);
    const me = await getMe();
    
    if (me.role === UserRole.TEACHER) {
        // For teachers, return all homework for their classes
        const allGroups = [...classesData.groups, ...classesData.oneToOnes];
        const myHomework = (homeworkData as Homework[]).filter(h => {
            const classData = allGroups.find(c => c.id === h.classId);
            return classData?.teacherId === me.id;
        });
        
        return myHomework.map(hw => ({
            ...hw,
            submissions: (submissionsData as Submission[]).filter(s => s.homeworkId === hw.id)
        }));
    } else {
        // For students, return their submitted homework
        const mySubmissions = (submissionsData as Submission[]).filter(s => s.studentId === me.id);
        return mySubmissions.map(sub => ({
            ...(homeworkData as Homework[]).find(h => h.id === sub.homeworkId)!,
            submissions: [sub]
        }));
    }
};

export const submitHomework = async (data: { homeworkId: string; content: { text?: string } }): Promise<{ success: boolean }> => {
    await sleep(300);
    // In a real app, this would make an API call
    return { success: true };
};

export const gradeSubmission = async (submissionId: string, data: { grade: number; feedback: string }): Promise<{ success: boolean }> => {
    await sleep(300);
    // In a real app, this would make an API call
    return { success: true };
};

// --- CHESS ---
export const getChessPresets = async (): Promise<ChessPreset[]> => {
    await sleep(200);
    return chessPresetsData as ChessPreset[];
};
