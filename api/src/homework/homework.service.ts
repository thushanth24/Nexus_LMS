import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  findByClass(classId: string) {
    return this.prisma.homework.findMany({
      where: {
        OR: [{ groupId: classId }, { pairId: classId }],
      },
    });
  }

  findForStudent(studentId: string) {
    // Find all groups and pairs the student is in
    return this.prisma.homework.findMany({
        where: {
            OR: [
                { group: { members: { some: { id: studentId } } } },
                { pair: { studentId: studentId } },
            ]
        },
        include: {
            submissions: {
                where: { studentId: studentId }
            }
        }
    })
  }
}

