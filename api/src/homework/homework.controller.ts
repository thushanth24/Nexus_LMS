import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

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
