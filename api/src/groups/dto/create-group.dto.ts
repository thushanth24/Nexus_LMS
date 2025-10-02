import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MeetingDayDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i, {
    message: 'day must be a valid day of the week (monday, tuesday, etc.)',
  })
  day: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:MM format (24-hour)',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:MM format (24-hour)',
  })
  endTime: string;
}

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
  @ValidateNested({ each: true })
  @Type(() => MeetingDayDto)
  meetingDays: MeetingDayDto[];

  @IsInt()
  @IsPositive()
  cap: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMin?: number;
}
