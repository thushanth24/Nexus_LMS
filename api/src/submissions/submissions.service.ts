import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/index.js';
import { CreateSubmissionDto, GradeSubmissionDto } from './dto/index.js';
import { SubmissionStatus } from '../prisma-enums/index.js';

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

@Injectable()
export class SubmissionsService {
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

  async submit(studentId: string, createSubmissionDto: CreateSubmissionDto): Promise<SerializedSubmission> {
    const { homeworkId, content } = createSubmissionDto;

    const existingSubmission = await this.prisma.submission.findFirst({
      where: {
        homeworkId,
        studentId,
      },
    });

    const submittedAt = new Date();

    if (existingSubmission) {
      const updated = await this.prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          submittedAt,
          status: SubmissionStatus.SUBMITTED,
        },
      });

      return this.serializeSubmission(updated);
    }

    const created = await this.prisma.submission.create({
      data: {
        homework: { connect: { id: homeworkId } },
        student: { connect: { id: studentId } },
        content,
        submittedAt,
        status: SubmissionStatus.SUBMITTED,
      },
    });

    return this.serializeSubmission(created);
  }

  async grade(submissionId: string, gradeSubmissionDto: GradeSubmissionDto): Promise<SerializedSubmission> {
    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: gradeSubmissionDto.grade,
        feedback: gradeSubmissionDto.feedback || null,
        status: SubmissionStatus.GRADED,
      },
    });

    return this.serializeSubmission(updated);
  }
}
