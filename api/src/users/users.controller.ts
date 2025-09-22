import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('teachers')
  @Roles(UserRole.ADMIN)
  findAllTeachers() {
    return this.usersService.findAllByRole(UserRole.TEACHER);
  }

  @Get('students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAllStudents() {
    return this.usersService.findAllByRole(UserRole.STUDENT);
  }
}
