import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/index.js';
import { UserRole } from '../prisma-enums/index.js';

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
    return users.map(user => {
      delete user.password;
      return user;
    });
  }
}
