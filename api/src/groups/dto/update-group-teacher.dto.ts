import { IsNotEmpty, IsString } from "class-validator";

export class UpdateGroupTeacherDto {
  @IsString()
  @IsNotEmpty()
  teacherId: string;
}
