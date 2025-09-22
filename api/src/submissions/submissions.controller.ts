import { Controller, Post, Body, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { SubmissionsService } from './submissions.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { GradeSubmissionDto } from './dto/grade-submission.dto.js';

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  create(@Request() req, @Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.submit(req.user.userId, createSubmissionDto);
  }

  @Patch(':id/grade')
  @Roles(UserRole.TEACHER)
  grade(@Param('id') id: string, @Body() gradeSubmissionDto: GradeSubmissionDto) {
    return this.submissionsService.grade(id, gradeSubmissionDto);
  }
}
