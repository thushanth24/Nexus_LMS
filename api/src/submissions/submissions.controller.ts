import { Controller, Post, Body, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

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
