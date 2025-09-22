import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { HomeworkService } from './homework.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';

@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Get('my-class/:classId')
  @Roles(UserRole.TEACHER)
  findForClass(@Param('classId') classId: string) {
    return this.homeworkService.findByClass(classId);
  }

  @Get('my-homework')
  @Roles(UserRole.STUDENT)
  findMyHomework(@Request() req) {
    return this.homeworkService.findForStudent(req.user.userId);
  }
}
