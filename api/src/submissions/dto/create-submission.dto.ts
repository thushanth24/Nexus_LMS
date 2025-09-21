import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  homeworkId: string;

  @IsObject()
  @IsNotEmpty()
  content: { text?: string; fileUrl?: string };
}
