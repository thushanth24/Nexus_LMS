import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserRole } from "../prisma-enums.js";
import { CreateHomeworkDto } from "./dto/create-homework.dto.js";
import { UpdateHomeworkDto } from "./dto/update-homework.dto.js";

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

type AuthenticatedUser = { userId: string; role: UserRole };

type WritableClass = {
  type: "group" | "pair";
  id: string;
};

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  private parseContent(raw: unknown): Record<string, unknown> {
    if (raw == null) {
      return {};
    }

    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return { text: raw };
      }
    }

    if (typeof raw === "object") {
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
      type: typeof homework.type === "string" ? homework.type.toLowerCase() : homework.type,
      dueAt: homework.dueAt?.toISOString?.() ?? homework.dueAt,
      submissions: Array.isArray(homework.submissions)
        ? homework.submissions.map((submission) => this.serializeSubmission(submission))
        : [],
    };
  }

  private normalizeHomeworkType(type: "text" | "pgn"): "TEXT" | "PGN" {
    return type.toUpperCase() as "TEXT" | "PGN";
  }

  private async ensureWritableClass(
    classId: string,
    user: AuthenticatedUser,
  ): Promise<WritableClass> {
    const isAdmin = user.role === UserRole.ADMIN;

    const group = await this.prisma.group.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    });

    if (group) {
      if (!isAdmin && group.teacherId !== user.userId) {
        throw new ForbiddenException("You do not have permission to modify homework for this class");
      }
      return { type: "group", id: group.id };
    }

    const pair = await this.prisma.pair.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    });

    if (!pair) {
      throw new NotFoundException("Class not found");
    }

    if (!isAdmin && pair.teacherId !== user.userId) {
      throw new ForbiddenException("You do not have permission to modify homework for this class");
    }

    return { type: "pair", id: pair.id };
  }

  async findByClass(classId: string): Promise<SerializedHomework[]> {
    const homeworks = await this.prisma.homework.findMany({
      where: {
        OR: [{ groupId: classId }, { pairId: classId }],
      },
      include: {
        submissions: true,
      },
      orderBy: { dueAt: "asc" },
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
      orderBy: { dueAt: "asc" },
    });

    return homeworks.map((homework) => this.serializeHomework(homework));
  }

  async createForClass(
    classId: string,
    dto: CreateHomeworkDto,
    user: AuthenticatedUser,
  ): Promise<SerializedHomework> {
    const target = await this.ensureWritableClass(classId, user);

    const homework = await this.prisma.homework.create({
      data: {
        title: dto.title,
        instructions: dto.instructions,
        type: this.normalizeHomeworkType(dto.type),
        dueAt: new Date(dto.dueAt),
        groupId: target.type === "group" ? target.id : null,
        pairId: target.type === "pair" ? target.id : null,
      },
      include: {
        submissions: true,
      },
    });

    return this.serializeHomework(homework);
  }

  async updateHomework(
    homeworkId: string,
    dto: UpdateHomeworkDto,
    user: AuthenticatedUser,
  ): Promise<SerializedHomework> {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        submissions: true,
        group: { select: { id: true, teacherId: true } },
        pair: { select: { id: true, teacherId: true } },
      },
    });

    if (!homework) {
      throw new NotFoundException("Homework not found");
    }

    const classId = homework.group?.id ?? homework.pair?.id;

    if (!classId) {
      throw new NotFoundException("Associated class not found for this homework");
    }

    await this.ensureWritableClass(classId, user);

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    if (dto.instructions !== undefined) {
      data.instructions = dto.instructions;
    }

    if (dto.type !== undefined) {
      data.type = this.normalizeHomeworkType(dto.type);
    }

    if (dto.dueAt !== undefined) {
      data.dueAt = new Date(dto.dueAt);
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.homework.update({
        where: { id: homeworkId },
        data,
      });
    }

    const updated = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        submissions: true,
      },
    });

    if (!updated) {
      throw new NotFoundException("Homework not found after update");
    }

    return this.serializeHomework(updated);
  }

  async deleteHomework(homeworkId: string, user: AuthenticatedUser): Promise<void> {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        group: { select: { id: true, teacherId: true } },
        pair: { select: { id: true, teacherId: true } },
      },
    });

    if (!homework) {
      throw new NotFoundException("Homework not found");
    }

    const classId = homework.group?.id ?? homework.pair?.id;

    if (!classId) {
      throw new NotFoundException("Associated class not found for this homework");
    }

    await this.ensureWritableClass(classId, user);

    await this.prisma.homework.delete({ where: { id: homeworkId } });
  }
}
