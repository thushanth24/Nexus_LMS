import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number;

  @IsString()
  @IsNotEmpty()
  feedback: string;
}
