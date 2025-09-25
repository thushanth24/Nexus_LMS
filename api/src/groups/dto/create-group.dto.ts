import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  subject: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  meetingDays: string[];

  @IsInt()
  @IsPositive()
  cap: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  levelSpread: string[];

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMin?: number;
}
