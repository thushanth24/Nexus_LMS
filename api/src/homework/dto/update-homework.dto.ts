import { IsIn, IsISO8601, IsOptional, IsString } from "class-validator";

export class UpdateHomeworkDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  @IsIn(["text", "pgn"])
  type?: "text" | "pgn";

  @IsOptional()
  @IsString()
  @IsISO8601()
  dueAt?: string;
}
