import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../prisma-enums.js';
import {
  SanitizedUser,
  SerializedGroupSession,
} from '../groups/groups.service.js';

export interface SerializedPair {
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  studentId: string;
  durationMin: number;
  teacher?: SanitizedUser;
  student?: SanitizedUser;
  sessions?: SerializedGroupSession[];
}

interface SerializeOptions {
  includeTeacher?: boolean;
  includeStudent?: boolean;
  includeSessions?: boolean;
}

@Injectable()
export class PairsService {
  constructor(private prisma: PrismaService) {}

  private sanitizeUser(user: any): SanitizedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
      level: user.level ?? null,
      subjects: Array.isArray(user.subjects) ? user.subjects : [],
      timezone: user.timezone ?? null,
    };
  }

  private serializeSessions(sessions?: any[]): SerializedGroupSession[] {
    if (!Array.isArray(sessions)) {
      return [];
    }

    return sessions.map((session) => {
      const classId = session.groupId ?? session.pairId ?? session.id;
      const title =
        session.title ?? session.group?.title ?? session.pair?.title ?? 'Session';
      const teacherId =
        session.group?.teacherId ??
        session.pair?.teacherId ??
        session.teacherId ??
        '';

      return {
        id: session.id,
        classId,
        type: session.groupId ? 'GROUP' : 'ONE_TO_ONE',
        title,
        teacherId,
        attendees: Array.isArray(session.attendees)
          ? session.attendees.map((attendee: any) => attendee.id)
          : [],
        startsAt: session.startsAt instanceof Date
          ? session.startsAt.toISOString()
          : new Date(session.startsAt).toISOString(),
        endsAt: session.endsAt instanceof Date
          ? session.endsAt.toISOString()
          : new Date(session.endsAt).toISOString(),
        isChessEnabled: Boolean(session.isChessEnabled),
      };
    });
  }

  private serializePair(pair: any, options: SerializeOptions = {}): SerializedPair {
    const serialized: SerializedPair = {
      id: pair.id,
      title: pair.title,
      subject: pair.subject,
      teacherId: pair.teacherId,
      studentId: pair.studentId,
      durationMin: pair.durationMin,
    };

    if (options.includeTeacher && pair.teacher) {
      serialized.teacher = this.sanitizeUser(pair.teacher);
    }

    if (options.includeStudent && pair.student) {
      serialized.student = this.sanitizeUser(pair.student);
    }

    if (options.includeSessions && Array.isArray(pair.sessions)) {
      serialized.sessions = this.serializeSessions(pair.sessions);
    }

    return serialized;
  }

  async findByTeacher(teacherId: string): Promise<SerializedPair[]> {
    const pairs = await this.prisma.pair.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
    });

    return pairs.map((pair) => this.serializePair(pair));
  }

  async findByStudent(studentId: string): Promise<SerializedPair[]> {
    const pairs = await this.prisma.pair.findMany({
      where: { studentId },
      include: {
        teacher: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return pairs.map((pair) =>
      this.serializePair(pair, { includeTeacher: true }),
    );
  }

  async findOneAuthorized(
    id: string,
    user: { userId: string; role: UserRole },
  ): Promise<SerializedPair | null> {
    const pair = await this.prisma.pair.findUnique({
      where: { id },
      include: {
        teacher: true,
        student: true,
        sessions: {
          orderBy: { startsAt: 'asc' },
          include: {
            attendees: { select: { id: true } },
            group: { select: { title: true, teacherId: true } },
            pair: { select: { title: true, teacherId: true } },
          },
        },
      },
    });

    if (!pair) {
      return null;
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isTeacher = pair.teacherId === user.userId;
    const isStudent = pair.studentId === user.userId;

    if (!isAdmin && !isTeacher && !isStudent) {
      throw new ForbiddenException('You do not have access to this class');
    }

    return this.serializePair(pair, {
      includeTeacher: true,
      includeStudent: true,
      includeSessions: true,
    });
  }
}
