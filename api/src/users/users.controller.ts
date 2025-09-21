import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';

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
