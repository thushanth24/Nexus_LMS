import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/index.js';
import { UserRole } from '../prisma-enums/index.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      delete user.password;
    }
    return user;
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAllByRole(role: UserRole) {
    const users = await this.prisma.user.findMany({ where: { role } });
    return users.map((user) => {
      delete user.password;
      return user;
    });
  }

  async createTeacher(data: CreateTeacherDto) {
    const existingUser = await this.findOneByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: UserRole.TEACHER,
        timezone: data.timezone ?? 'America/New_York',
        subjects: data.subjects ?? [],
        avatarUrl: data.avatarUrl ?? null,
      },
    });

    delete user.password;
    return user;
  }

  async createStudent(data: CreateStudentDto) {
    const existingUser = await this.findOneByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: UserRole.STUDENT,
        timezone: data.timezone ?? 'America/New_York',
        level: data.level ?? null,
        subjects: [],
        avatarUrl: data.avatarUrl ?? null,
      },
    });

    delete user.password;
    return user;
  }
}
