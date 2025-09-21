import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async submit(studentId: string, createSubmissionDto: CreateSubmissionDto) {
    // Find if a submission already exists, if so, update it
    const existingSubmission = await this.prisma.submission.findFirst({
      where: {
        homeworkId: createSubmissionDto.homeworkId,
        studentId: studentId,
      },
    });

    if (existingSubmission) {
      return this.prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: createSubmissionDto.content,
          submittedAt: new Date(),
          status: SubmissionStatus.SUBMITTED,
        },
      });
    } else {
        // This case should ideally not happen if submissions are pre-created
        throw new NotFoundException('Submission record not found for this homework.');
    }
  }

  async grade(submissionId: string, gradeSubmissionDto: GradeSubmissionDto) {
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: gradeSubmissionDto.grade,
        feedback: gradeSubmissionDto.feedback,
        status: SubmissionStatus.GRADED,
      },
    });
  }
}
