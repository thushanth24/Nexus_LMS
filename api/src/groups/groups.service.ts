import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UserRole } from '../prisma-enums.js';

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  level?: string | null;
  subjects?: string[];
  timezone?: string | null;
}

export interface SerializedGroupSession {
  id: string;
  classId: string;
  type: 'GROUP' | 'ONE_TO_ONE';
  title: string;
  teacherId: string;
  attendees: string[];
  startsAt: string;
  endsAt: string;
  isChessEnabled: boolean;
}

export interface SerializedGroup {
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  meetingDays: string[];
  durationMin: number;
  cap: number;
  levelSpread: string[];
  currentSize: number;
  teacher?: SanitizedUser;
  members?: SanitizedUser[];
  sessions?: SerializedGroupSession[];
}

interface SerializeOptions {
  includeTeacher?: boolean;
  includeMembers?: boolean;
  includeSessions?: boolean;
}

@Injectable()
export class GroupsService {
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

  private serializeGroup(group: any, options: SerializeOptions = {}): SerializedGroup {
    const memberCount =
      typeof group._count?.members === 'number'
        ? group._count.members
        : Array.isArray(group.members)
        ? group.members.length
        : 0;

    const serialized: SerializedGroup = {
      id: group.id,
      title: group.title,
      subject: group.subject,
      teacherId: group.teacherId,
      meetingDays: Array.isArray(group.meetingDays) ? group.meetingDays : [],
      durationMin: group.durationMin,
      cap: group.cap,
      levelSpread: Array.isArray(group.levelSpread) ? group.levelSpread : [],
      currentSize: memberCount,
    };

    if (options.includeTeacher && group.teacher) {
      serialized.teacher = this.sanitizeUser(group.teacher);
    }

    if (options.includeMembers && Array.isArray(group.members)) {
      serialized.members = group.members.map((member: any) => this.sanitizeUser(member));
    }

    if (options.includeSessions && Array.isArray(group.sessions)) {
      serialized.sessions = this.serializeSessions(group.sessions);
    }

    return serialized;
  }

  async findAll(): Promise<SerializedGroup[]> {
    const groups = await this.prisma.group.findMany({
      include: {
        _count: { select: { members: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return groups.map((group) => this.serializeGroup(group));
  }

  async findByTeacher(teacherId: string): Promise<SerializedGroup[]> {
    const groups = await this.prisma.group.findMany({
      where: { teacherId },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return groups.map((group) => this.serializeGroup(group));
  }

  async findByStudent(studentId: string): Promise<SerializedGroup[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        members: {
          some: { id: studentId },
        },
      },
      include: {
        _count: { select: { members: true } },
        teacher: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return groups.map((group) =>
      this.serializeGroup(group, { includeTeacher: true }),
    );
  }

  async findOneAuthorized(
    id: string,
    user: { userId: string; role: UserRole },
  ): Promise<SerializedGroup | null> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        teacher: true,
        members: true,
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

    if (!group) {
      return null;
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isTeacher = group.teacherId === user.userId;
    const isMember = Array.isArray(group.members)
      ? group.members.some((member: any) => member.id === user.userId)
      : false;

    if (!isAdmin && !isTeacher && !isMember) {
      throw new ForbiddenException('You do not have access to this group');
    }

    return this.serializeGroup(group, {
      includeTeacher: true,
      includeMembers: true,
      includeSessions: true,
    });
  }

  async create(dto: CreateGroupDto): Promise<SerializedGroup> {
    const group = await this.prisma.group.create({
      data: {
        title: dto.title,
        subject: dto.subject,
        teacher: {
          connect: { id: dto.teacherId },
        },
        meetingDays: dto.meetingDays,
        durationMin: dto.durationMin ?? 60,
        cap: dto.cap,
        levelSpread: dto.levelSpread,
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return this.serializeGroup(group);
  }
}
