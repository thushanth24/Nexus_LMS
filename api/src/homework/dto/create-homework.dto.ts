import { IsIn, IsISO8601, IsNotEmpty, IsString } from "class-validator";

export class CreateHomeworkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsString()
  @IsIn(["text", "pgn"])
  type: "text" | "pgn";

  @IsString()
  @IsISO8601()
  dueAt: string;
}
