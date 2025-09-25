import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../prisma-enums.js';

export interface SerializedSessionAttendee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface SerializedSession {
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
  attendeesDetails?: SerializedSessionAttendee[];
}

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  private serializeSession(session: any): SerializedSession {
    const isGroupSession = Boolean(session.groupId);
    const relatedGroup = session.group;
    const relatedPair = session.pair;

    const classId = session.groupId ?? session.pairId ?? session.id;
    const teacherId = (isGroupSession ? relatedGroup?.teacherId : relatedPair?.teacherId) ?? '';
    const title =
      session.title ?? relatedGroup?.title ?? relatedPair?.title ?? 'Session';

    return {
      id: session.id,
      classId,
      type: isGroupSession ? 'GROUP' : 'ONE_TO_ONE',
      title,
      teacherId,
      attendees: Array.isArray(session.attendees)
        ? session.attendees.map((attendee) => attendee.id)
        : [],
      startsAt: session.startsAt.toISOString(),
      endsAt: session.endsAt.toISOString(),
      isChessEnabled: session.isChessEnabled,
    };
  }

  async findSessionsForUser(userId: string, role: UserRole): Promise<SerializedSession[]> {
    const now = new Date();
    const include = {
      attendees: {
        select: { id: true },
      },
      group: {
        select: { id: true, title: true, teacherId: true },
      },
      pair: {
        select: { id: true, title: true, teacherId: true },
      },
    } as const;

    if (role === UserRole.STUDENT) {
      const sessions = await this.prisma.session.findMany({
        where: {
          startsAt: { gte: now },
          attendees: {
            some: { id: userId },
          },
        },
        include,
        orderBy: { startsAt: 'asc' },
      });

      return sessions.map((session) => this.serializeSession(session));
    }

    if (role === UserRole.TEACHER) {
      const sessions = await this.prisma.session.findMany({
        where: {
          startsAt: { gte: now },
          OR: [
            { group: { teacherId: userId } },
            { pair: { teacherId: userId } },
          ],
        },
        include,
        orderBy: { startsAt: 'asc' },
      });

      return sessions.map((session) => this.serializeSession(session));
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        startsAt: { gte: now },
      },
      include,
      orderBy: { startsAt: 'asc' },
    });

    return sessions.map((session) => this.serializeSession(session));
  }

  async findOne(
    sessionId: string,
    user: { userId: string; role: UserRole },
  ): Promise<SerializedSession> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        attendees: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            title: true,
            teacherId: true,
            members: { select: { id: true } },
          },
        },
        pair: {
          select: {
            id: true,
            title: true,
            teacherId: true,
            studentId: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isTeacher =
      (session.group && session.group.teacherId === user.userId) ||
      (session.pair && session.pair.teacherId === user.userId);
    const isAttendee = session.attendees.some((attendee) => attendee.id === user.userId);
    const isPairStudent = session.pair?.studentId === user.userId;
    const isGroupMember = session.group?.members?.some((member) => member.id === user.userId) ?? false;

    if (!isAdmin && !isTeacher && !isAttendee && !isPairStudent && !isGroupMember) {
      throw new ForbiddenException('You do not have access to this session');
    }

    const serialized = this.serializeSession({
      ...session,
      attendees: session.attendees,
    });

    return {
      ...serialized,
      classTitle: session.group?.title ?? session.pair?.title ?? serialized.title,
      attendeesDetails: session.attendees.map((attendee) => ({
        id: attendee.id,
        name: attendee.name,
        email: attendee.email,
        role: attendee.role as UserRole,
        avatarUrl: attendee.avatarUrl ?? null,
      })),
    };
  }
}

