export enum UserRole {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT'
}

export interface User {
    id: string;
    role: UserRole;
    name: string;
    email: string;
    timezone?: string | null;
    subjects?: string[];
    level?: string | null;
    avatarUrl?: string | null;
}

export interface Group {
    id: string;
    title: string;
    subject: string;
    teacherId: string;
    meetingDays: string[];
    durationMin: number;
    currentSize: number;
    cap: number;
    levelSpread: string[];
    teacher?: User;
    members?: User[];
    sessions?: Session[];
}

export interface OneToOne {
    id: string;
    title: string;
    subject: string;
    teacherId: string;
    studentId: string;
    durationMin: number;
    teacher?: User;
    student?: User;
    sessions?: Session[];
}

export interface Session {
    id: string;
    classId: string;
    type: 'GROUP' | 'ONE_TO_ONE';
    title: string;
    teacherId: string;
    attendees: string[];
    startsAt: string;
    endsAt: string;
    isChessEnabled: boolean;
    classTitle?: string;
    attendeesDetails?: User[];
}

export interface Material {
    id: string;
    classId: string | null;
    title: string;
    type: 'pdf' | 'video';
    url: string;
    createdAt?: string;
}

export interface Homework {
    id: string;
    classId: string;
    title: string;
    type: 'text' | 'pgn';
    instructions: string;
    dueAt: string;
    submissions?: Submission[];
}

export interface Submission {
    submissionId: string;
    homeworkId: string;
    studentId: string;
    submittedAt: string | null;
    content: {
        text?: string;
        [key: string]: unknown;
    };
    status: 'SUBMITTED' | 'PENDING' | 'GRADED';
    grade?: number | null;
    feedback?: string | null;
}

export interface RubricScore {
    submissionId: string;
    by: string;
    items: {
        skill: string;
        score: number;
        note?: string;
    }[];
    total: number;
}

export interface ChessPreset {
    id: string;
    label: string;
    fen?: string;
    pgn?: string;
}
