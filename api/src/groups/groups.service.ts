import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.group.findMany({
            include: {
                teacher: { select: { name: true } },
                roster: { select: { id: true }}
            }
        });
    }

    findOne(id: string) {
        return this.prisma.group.findUnique({
            where: { id },
            include: {
                teacher: true,
                roster: true,
                sessions: true,
            }
        });
    }
}
