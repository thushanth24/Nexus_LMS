import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class UpdateGroupMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  studentIds: string[];
}
