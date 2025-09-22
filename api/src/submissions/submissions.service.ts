import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/index.js';
import { CreateSubmissionDto, GradeSubmissionDto } from './dto/index.js';
import { SubmissionStatus } from '../prisma-enums/index.js';

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
          content: JSON.stringify(createSubmissionDto.content), // Convert content to string
          submittedAt: new Date(),
          status: SubmissionStatus.SUBMITTED,
        },
      });
    } else {
      // If no submission exists, create a new one
      return this.prisma.submission.create({
        data: {
          homework: { connect: { id: createSubmissionDto.homeworkId } },
          student: { connect: { id: studentId } },
          content: JSON.stringify(createSubmissionDto.content), // Convert content to string
          submittedAt: new Date(),
          status: SubmissionStatus.SUBMITTED,
        },
      });
    }
  }

  async grade(submissionId: string, gradeSubmissionDto: GradeSubmissionDto) {
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: gradeSubmissionDto.grade,
        feedback: gradeSubmissionDto.feedback || null,
        status: SubmissionStatus.GRADED,
      },
    });
  }
}
