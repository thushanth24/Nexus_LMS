import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface SerializedSubmission {
  submissionId: string;
  homeworkId: string;
  studentId: string;
  submittedAt: string | null;
  content: Record<string, unknown>;
  status: string;
  grade?: number | null;
  feedback?: string | null;
}

export interface SerializedHomework {
  id: string;
  classId: string;
  title: string;
  instructions: string;
  type: string;
  dueAt: string;
  submissions: SerializedSubmission[];
}

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  private parseContent(raw: unknown): Record<string, unknown> {
    if (raw == null) {
      return {};
    }

    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return { text: raw };
      }
    }

    if (typeof raw === 'object') {
      return raw as Record<string, unknown>;
    }

    return { value: raw } as Record<string, unknown>;
  }

  private serializeSubmission(submission: any): SerializedSubmission {
    return {
      submissionId: submission.id,
      homeworkId: submission.homeworkId,
      studentId: submission.studentId,
      submittedAt: submission.submittedAt ? submission.submittedAt.toISOString() : null,
      content: this.parseContent(submission.content),
      status: submission.status,
      grade: submission.grade ?? null,
      feedback: submission.feedback ?? null,
    };
  }

  private serializeHomework(homework: any): SerializedHomework {
    return {
      id: homework.id,
      classId: homework.groupId ?? homework.pairId ?? homework.id,
      title: homework.title,
      instructions: homework.instructions,
      type: typeof homework.type === 'string' ? homework.type.toLowerCase() : homework.type,
      dueAt: homework.dueAt?.toISOString?.() ?? homework.dueAt,
      submissions: Array.isArray(homework.submissions)
        ? homework.submissions.map((submission) => this.serializeSubmission(submission))
        : [],
    };
  }

  async findByClass(classId: string): Promise<SerializedHomework[]> {
    const homeworks = await this.prisma.homework.findMany({
      where: {
        OR: [{ groupId: classId }, { pairId: classId }],
      },
      include: {
        submissions: true,
      },
      orderBy: { dueAt: 'asc' },
    });

    return homeworks.map((homework) => this.serializeHomework(homework));
  }

  async findForStudent(studentId: string): Promise<SerializedHomework[]> {
    const homeworks = await this.prisma.homework.findMany({
      where: {
        OR: [
          { group: { members: { some: { id: studentId } } } },
          { pair: { studentId } },
        ],
      },
      include: {
        submissions: {
          where: { studentId },
        },
      },
      orderBy: { dueAt: 'asc' },
    });

    return homeworks.map((homework) => this.serializeHomework(homework));
  }
}
