import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('teachers')
  @Roles(UserRole.ADMIN)
  createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.usersService.createTeacher(createTeacherDto);
  }

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
