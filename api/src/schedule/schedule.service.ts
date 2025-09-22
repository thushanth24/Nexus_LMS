import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../prisma-enums.js';

@Injectable()
export class ScheduleService {
    constructor(private prisma: PrismaService) {}

    async findSessionsForUser(userId: string, role: UserRole) {
        const now = new Date();
        const commonWhere = {
            startsAt: {
                gte: now, // Only upcoming sessions
            },
        };

        if (role === UserRole.STUDENT) {
            return this.prisma.session.findMany({
                where: {
                    ...commonWhere,
                    attendees: {
                        some: { id: userId },
                    },
                },
                orderBy: { startsAt: 'asc' },
            });
        }

        if (role === UserRole.TEACHER) {
            // A bit more complex: find sessions for groups/pairs taught by this teacher
            return this.prisma.session.findMany({
                where: {
                    ...commonWhere,
                    OR: [
                        { group: { teacherId: userId } },
                        { pair: { teacherId: userId } },
                    ],
                },
                orderBy: { startsAt: 'asc' },
            });
        }
        
        // Admin gets all sessions
        if (role === UserRole.ADMIN) {
            return this.prisma.session.findMany({
                orderBy: { startsAt: 'asc' },
            });
        }

        return [];
    }
}
